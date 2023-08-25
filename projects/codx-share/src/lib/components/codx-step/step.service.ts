import { formatDate } from '@angular/common';
import {Injectable } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxService,
  DialogModel,
  FormModel,
  NotificationsService,
  SidebarModel,
  Util,
} from 'codx-core';
import { TM_Tasks } from '../codx-tasks/model/task.model';
import { AssignTaskModel } from '../../models/assign-task.model';
import { AssignInfoComponent } from '../assign-info/assign-info.component';
import { CodxTypeTaskComponent } from './codx-type-task/codx-type-task.component';
import { firstValueFrom } from 'rxjs';
import {
  DP_Instances_Steps,
  DP_Instances_Steps_TaskGroups,
  DP_Instances_Steps_Tasks,
} from 'projects/codx-dp/src/lib/models/models';
import { CodxAddGroupTaskComponent } from './codx-add-group-task/codx-add-group-task.component';
import { CodxAddTaskComponent } from './codx-add-stask/codx-add-task.component';
import { CodxAddBookingCarComponent } from '../codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { CodxCalendarService } from '../codx-calendar/codx-calendar.service';
import { PopupAddQuotationsComponent } from 'projects/codx-cm/src/lib/quotations/popup-add-quotations/popup-add-quotations.component';
import { AddContractsComponent } from 'projects/codx-cm/src/lib/contracts/add-contracts/add-contracts.component';
import { PopupAddMeetingComponent } from '../codx-tmmeetings/popup-add-meeting/popup-add-meeting.component';

@Injectable({
  providedIn: 'root',
})
export class StepService {
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private cache: CacheService,
    private calendarService: CodxCalendarService,
    private codxService: CodxService,
  ) {}

  formModelStep: FormModel = {
    entityName: 'DP_Instances_Steps_Tasks',
    formName: 'DPInstancesStepsTasks',
    gridViewName: 'grvDPInstancesStepsTasks',
  };
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };

  //#region common
  capitalizeFirstLetter(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  isValidPhoneNumber(phoneNumber) {
    var phonePattern = /^(09|03|07|08|05)\d{8}$/;
    return phonePattern.test(phoneNumber);
  }

  formatDate(date, format) {
    const currentDate = new Date(date);
    let dayCustom = formatDate(currentDate, format, 'en-US');
    return dayCustom;
  }

  compareDates(date1, date2, type = 's') {
    date1 = new Date(date1);
    date2 = new Date(date2);
    if (type === 'h') {
      date1.setHours(0, 0, 0, 0);
      date2.setHours(0, 0, 0, 0);
    } else if (type === 'm') {
      date1.setMinutes(0, 0, 0);
      date2.setMinutes(0, 0, 0);
    } else {
      date1.setSeconds(0, 0);
      date2.setSeconds(0, 0);
    }
    if (date1.getTime() === date2.getTime()) {
      return 0;
    } else if (date1.getTime() < date2.getTime()) {
      return -1;
    } else {
      return 1;
    }
  }

  async getFormModel(formModel: FormModel) {
    let listHeaderText = {};
    if (formModel) {
      let header = await firstValueFrom(
        this.cache.gridViewSetup(formModel?.formName, formModel?.gridViewName)
      );
      if (header) {
        for (let key in header) {
          if (header[key]) {
            let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
            listHeaderText[keyConvert] = header[key]['headerText'];
          }
        }
      }
    }
    return listHeaderText;
  }

  checkRequire(require = [], data, headerText) {
    let message = [];
    if (require?.length > 0) {
      for (let key of require) {
        if (
          (typeof data[key] === 'string' && !data[key].toString()?.trim()) ||
          !data[key] ||
          data[key]?.length === 0 ||
          data[key].toString()?.trim() == 'Invalid Date'
        ) {
          message.push(headerText[key]);
        }
      }
    }
    if (message.length > 0) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + message.join(', ') + ' " '
      );
      return true;
    }
    return false;
  }

  async getNameFunctionID(functionID) {
    let textMore = '';
    let moreFunction = await firstValueFrom(
      this.cache.moreFunction('CoDXSystem', null)
    );
    if (moreFunction) {
      let more = moreFunction.find((f) => f.functionID == functionID);
      textMore = more ? more?.customName : '';
    }
    return textMore;
  }

  //#endregion

  checkTaskLink(task, step) {
    let check = true;
    let tasks = step?.tasks;
    if (task?.parentID && tasks?.length > 0) {
      //check công việc liên kết hoàn thành trước
      let taskName = '';
      let listID = task?.parentID.split(';');
      listID?.forEach((item) => {
        let taskFind = tasks?.find((task) => task.refID == item);
        if (taskFind?.progress != 100) {
          check = false;
          taskName = taskFind?.taskName;
        }
      });
      if (!check) {
        this.notiService.notifyCode('DP023', 0, "'" + taskName + "'");
      }
    }
    return check;
  }

  checkUpdateProgress(
    dataUpdate,
    type,
    step,
    isRoleAll,
    isOnlyView,
    isUpdateProgressGroup,
    isUpdateProgressStep,
    user
  ) {
    if (isOnlyView) {
      if (type == 'P') {
        return isUpdateProgressStep && isRoleAll ? true : false;
      } else if (type == 'G') {
        let isGroup = false;
        if (!isRoleAll) {
          isGroup = this.checRoleTask(dataUpdate, 'O', user);
        }
        return isUpdateProgressGroup && (isRoleAll || isGroup) ? true : false;
      } else {
        // if(dataUpdate?.status == "1"){
        //   return false;
        // }
        let isGroup = false;
        let isTask = false;
        if (!isRoleAll) {
          let group = step?.taskGroups?.find(
            (g) => g.refID == dataUpdate?.taskGroupID
          );
          isGroup = group ? this.checRoleTask(group, 'O', user) : false;
          if (!isGroup) {
            isTask = this.checRoleTask(dataUpdate, 'O', user);
          }
        }
        return isRoleAll || isGroup || isTask ? true : false;
      }
    }
    return false;
  }

  checRoleTask(data, type, user) {
    let check =
      data?.roles?.some(
        (element) =>
          element?.objectID == user.userID && element.roleType == type
      ) || false;
    return check;
  }
  //setDeFault
  getDefault(funcID, entityName,id = null) {
    return this.api.execSv<any>(
      'CO',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName,id]
    );
  }

  assignTask(moreFunc, stepTask, instanceStep) {
    if (stepTask?.assigned == '1') {
      this.notiService.notify('tesst kiem tra da giao task');
      return;
    }
    var task = new TM_Tasks();
    task.taskName = stepTask.taskName;
    task.refID = stepTask?.recID;
    task.refType = 'DP_Instances_Steps_Tasks';
    task.dueDate = stepTask?.endDate;
    task.sessionID = instanceStep?.instanceID;
    let dataReferences = [
      {
        recIDReferences: stepTask.recID,
        refType: 'DP_Instances_Steps_Tasks',
        createdOn: stepTask.createdOn,
        memo: stepTask.taskName,
        createdBy: stepTask.createdBy,
      },
    ];
    let assignModel: AssignTaskModel = {
      vllRole: 'TM001',
      title: moreFunc.customName,
      vllShare: 'TM003',
      task: task,
    };

    let option = new DialogModel();
    option.FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      funcID: 'DPT040102',
      gridViewName: 'grvDPInstancesStepsTasks',
    };

    var dialogAssign = this.callfc.openForm(
      AssignInfoComponent,
      '',
      600,
      800,
      '',
      assignModel,
      '',
      option
    );

    dialogAssign.closed.subscribe((e) => {
      var doneSave = false;
      if (e && e.event != null) {
        doneSave = true;
        this.api
          .execSv<any>(
            'DP',
            'DP',
            'InstanceStepsBusiness',
            'UpdatedAssignedStepTasksAsync',
            [stepTask.stepID, stepTask.recID]
          )
          .subscribe();
      }
      return doneSave;
    });
  }

  async chooseTypeTask(isAddGroup = true) {
    let popupTypeTask = this.callfc.openForm(
      CodxTypeTaskComponent,
      '',
      450,
      580,
      '',
      { isShowGroup: isAddGroup }
    );
    let dataOutput = await firstValueFrom(popupTypeTask.closed);
    let type = dataOutput?.event ? dataOutput?.event : null;
    return type;
  }

  async addGroupTask(instanceStep: DP_Instances_Steps) {
    let taskGroup = new DP_Instances_Steps_TaskGroups();
    taskGroup.recID = Util.uid();
    taskGroup.refID = Util.uid();
    taskGroup['isTaskDefault'] = false;
    taskGroup['progress'] = 0;
    taskGroup['stepID'] = instanceStep?.recID;

    let listGroup = instanceStep?.taskGroups?.sort(
      (a, b) => a['indexNo'] - b['indexNo']
    );
    let taskBeforeIndex = listGroup?.length;

    if (taskBeforeIndex) {
      taskBeforeIndex -= 1;
      taskGroup['startDate'] =
        listGroup[taskBeforeIndex]?.endDate || instanceStep?.startDate;
      taskGroup['indexNo'] = taskBeforeIndex + 1;
    }
    let groupOutput = await this.openPopupGroup('add', taskGroup, instanceStep);
    return groupOutput;
  }

  async openPopupGroup(action, group, instanceStep) {
    let dataInput = {
      action,
      step: instanceStep,
      dataGroup: group || {},
      isEditTimeDefault: instanceStep?.leadtimeControl,
    };
    let popupTask = this.callfc.openForm(
      CodxAddGroupTaskComponent,
      '',
      500,
      500,
      '',
      dataInput
    );

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    let groupOutput = dataPopupOutput?.event ? dataPopupOutput?.event : null;
    return groupOutput;
  }

  async addTask(taskType, instanceStep, groupID) {
    let task = new DP_Instances_Steps_Tasks();
    task['taskType'] = taskType?.value;
    task['stepID'] = instanceStep?.recID;
    task['progress'] = 0;
    task['taskGroupID'] = groupID || null;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;

    let taskOutput = await this.openPopupTask(
      'add',
      taskType,
      instanceStep,
      task,
      groupID
    );
    return taskOutput;
  }

  async openPopupTask(
    action,
    taskType,
    instanceStep,
    dataTask,
    groupTaskID = null
  ) {
    let dataInput = {
      action,
      taskType: taskType,
      step: instanceStep,
      listGroup: instanceStep?.taskGroups,
      dataTask: dataTask || {},
      listTask: instanceStep?.tasks,
      isEditTimeDefault: instanceStep?.leadtimeControl,
      groupTaskID, // trường hợp chọn thêm từ nhóm
    };
    let frmModel: FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };

    let opt = new DialogModel();
    opt.FormModel = frmModel;
    let popupTask = this.callfc.openForm(
      CodxAddTaskComponent,
      '',
      600,
      800,
      '',
      dataInput,
      '',
      opt
    );
    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    let taskOutput = dataPopupOutput?.event ? dataPopupOutput?.event : null;
    return taskOutput;
  }

  async addBookingCar(isOpenSide = false) {
    let addCarTitle = await firstValueFrom(this.cache.functionList('EPT21'));
    let title = addCarTitle ? addCarTitle?.customName?.toString() : '';

    this.calendarService.getFormModel('EPT21').then((res) => {
      let carFM = res;
      let carFG = this.codxService.buildFormGroup(
        carFM?.formName,
        carFM?.gridViewName
      );
      let popupBookingCar;

      if (isOpenSide) {
        let option = new SidebarModel();
        option.FormModel = carFM;
        option.Width = '800px';
        popupBookingCar = this.callfc.openSide(
          CodxAddBookingCarComponent,
          [carFG?.value, 'SYS01', title, null, null, false],
          option
        );
      } else {
        let opt = new DialogModel();
        opt.FormModel = carFM;
        popupBookingCar = this.callfc.openForm(
          CodxAddBookingCarComponent,
          '',
          800,
          800,
          '',
          [carFG?.value, 'SYS01', title, null, null, false],
          '',
          opt
        );
      }

      popupBookingCar.closed.subscribe((e) => {
        console.log('-------------', e);
      });
    });
  }

  addQuotation() {
    let quotation;
    this.getDefault('CM0202', 'CM_Quotations', 'quotationsID').subscribe((res) => {
      if (res) {
        let data = res.data;
        data['_uuid'] = data['quotationsID'] ?? Util.uid();
        data['idField'] = 'quotationsID';
        quotation = data;
        if (!quotation.quotationsID) {
          this.api
            .execSv<any>(
              'SYS',
              'AD',
              'AutoNumbersBusiness',
              'GenAutoNumberAsync',
              ['CM0202', 'CM_Quotations', 'QuotationsID']
            )
            .subscribe((id) => {
              quotation.quotationID = id;
              this.openPopup(quotation, 'add',);
            });
        } else this.openPopup(quotation, 'add');
      }
    });
  }

  openPopup(res, action,titleAction = '') {
    res.versionNo = res.versionNo ?? 'V1';
    res.revision = res.revision ?? 0;
    res.versionName = res.versionNo + '.' + res.revision;
    res.status = res.status ?? '0';
    res.exchangeRate = res.exchangeRate ?? 1;
    res.totalAmt = res.totalAmt ?? 0;
    res.currencyID = res.currencyID ?? 'VND';

    let formModel: FormModel = {
      entityName: 'CM_Quotations',
      formName: 'CMQuotations',
      gridViewName: 'grvCMQuotations',
      funcID: 'CM0202',
    };
    var obj = {
      data: res,
      disableRefID: false,
      action: 'add',
      headerText: titleAction,
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.FormModel = formModel;
    let dialog = this.callfc.openForm(
      PopupAddQuotationsComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      option
    );
  }

  async openPopupContract(action, contract?) {
    let data = {
      action,
      contract: contract || null,
      // account: this.account,
      type: 'task',
    };
    let formModel: FormModel = {
      entityName: 'CM_Contracts',
      entityPer: 'CM_Contracts',
      formName: 'CMContracts',
      funcID: 'CM0204',
      gridViewName: 'grvCMContracts',
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 1010;
    option.FormModel = formModel;
    let popupContract = this.callfc.openForm(
      AddContractsComponent,
      '',
      null,
      null,
      '',
      data,
      '',
      option
    );
    let dataPopupOutput = await firstValueFrom(popupContract.closed);
    return dataPopupOutput;
  }

  async createMeeting(data, titleAction) {
    this.getDefault('TMT0501', 'CO_Meetings')
      .subscribe(async (res) => {
        if (res && res?.data) {
          let meeting = res.data;
          meeting['_uuid'] = meeting['meetingID'] ?? Util.uid();
          meeting['idField'] = 'meetingID';
          meeting.meetingName = data?.taskName;
          meeting.meetingType = '1';
          meeting.refID = data.recID;
          meeting.refType = 'DP_Instances_Steps_Tasks';
          meeting.meetingType = '1';
          meeting.reminder = Number.isNaN(data.reminders)
            ? 0
            : Number.parseInt(data.reminders);
          let option = new SidebarModel();
          option.Width = '800px';
          option.zIndex = 1011;
          let formModel = new FormModel();

          let preside;
          let participants;
          let listPermissions = '';
          if (data?.roles?.length > 0) {
            preside = data?.roles.filter((x) => x.roleType == 'O')[0]?.objectID;
            if (preside) listPermissions += preside;
            participants = data?.roles.filter((x) => x.roleType == 'P');
            if (participants?.length) {
              let userIDPar = await this.getListUserIDByOther(participants);
              if (userIDPar?.length > 0) {
                let idxPre = userIDPar.findIndex((x) => x == preside);
                if (idxPre != -1) userIDPar.splice(idxPre, 1);
                listPermissions += ';' + userIDPar.join(';');
              }
            }
          }

          this.cache.functionList('TMT0501').subscribe((f) => {
            if (f) {
              this.cache.gridView(f.gridViewName).subscribe((res) => {
                this.cache
                  .gridViewSetup(f.formName, f.gridViewName)
                  .subscribe((grvSetup) => {
                    if (grvSetup) {
                      formModel.funcID = 'TMT0501';
                      formModel.entityName = f.entityName;
                      formModel.formName = f.formName;
                      formModel.gridViewName = f.gridViewName;
                      option.FormModel = formModel;
                      option.Width = '800px';
                      let obj = {
                        action: 'add',
                        titleAction: titleAction,
                        disabledProject: false,
                        preside: preside,
                        data: meeting,
                        listPermissions: listPermissions,
                        isOtherModule: true,
                      };
                      let dialog = this.callfc.openSide(
                        PopupAddMeetingComponent,
                        obj,
                        option
                      );
                      dialog.closed.subscribe((e) => {
                        if (e?.event) {
                          data.actionStatus = '2';
                          this.notiService.notifyCode(
                            'E0322',
                            0,
                            '"' + titleAction + '"'
                          );
                        }
                      });
                    }
                  });
              });
            }
          });
        }
      });
  }
  
  async getListUserIDByOther(list = []) {
    let lstUserID = [];
    if (list != null && list.length > 0) {
      lstUserID = list
        .filter((x) => x.objectType == 'U' || x.objectType == '1')
        .map((x) => x.objectID);
      //org
      let listO = list
        .filter((x) => x.objectType == 'O')
        .map((x) => x.objectID);

      if (listO?.length > 0) {
        let userIDO = await firstValueFrom(this.getListUserIDBy(listO, 'O'));
        if (userIDO?.length > 0) {
          const set = new Set(lstUserID.concat(userIDO));
          lstUserID = [...set];
        }
      }
      // dep
      let listD = list
        .filter((x) => x.objectType == 'D')
        .map((x) => x.objectID);

      if (listD?.length > 0) {
        let userIDD = await firstValueFrom(this.getListUserIDBy(listD, 'D'));
        if (userIDD?.length > 0) {
          let set = new Set(lstUserID.concat(userIDD));
          lstUserID = [...set];
        }
      }

      let listP = list
        .filter((x) => x.objectType == 'P')
        .map((x) => x.objectID);
      // positon
      if (listP?.length > 0) {
        let userIDP = await firstValueFrom(this.getListUserIDBy(listP, 'P'));
        if (userIDP?.length > 0) {
          let set = new Set(lstUserID.concat(userIDP));
          lstUserID = [...set];
        }
      }

      // Role
      let listR = list
        .filter((x) => x.objectType == 'R')
        .map((x) => x.objectID);

      if (listR?.length > 0) {
        let userIDR = await firstValueFrom(this.getListUserIDByRoleID(listR));
        if (userIDR?.length > 0) {
          let set = new Set(lstUserID.concat(userIDR));
          lstUserID = [...set];
        }
      }
    }
    return lstUserID;
  }

  getListUserIDBy(lstId, type) {
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetListUserIDByListODPIDAsync',
      [lstId, type]
    );
  }

  getListUserIDByRoleID(id) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetListUserByRoleIDAsync',
      [id]
    );
  }
}
