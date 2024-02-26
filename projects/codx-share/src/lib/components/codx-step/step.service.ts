import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
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
import { CodxTypeTaskComponent } from './codx-step-common/codx-type-task/codx-type-task.component';
import { Subject, firstValueFrom } from 'rxjs';
import {
  DP_Instances_Steps,
  DP_Instances_Steps_TaskGroups,
  DP_Instances_Steps_Tasks_Roles,
} from 'projects/codx-dp/src/lib/models/models';
import { CodxAddGroupTaskComponent } from './codx-popup-group/codx-add-group-task.component';
import { CodxAddTaskComponent } from './codx-popup-task/codx-add-task.component';
import { CodxAddBookingCarComponent } from '../codx-booking/codx-add-booking-car/codx-add-booking-car.component';
import { PopupAddQuotationsComponent } from 'projects/codx-cm/src/lib/quotations/popup-add-quotations/popup-add-quotations.component';
import { AddContractsComponent } from 'projects/codx-cm/src/lib/contracts/add-contracts/add-contracts.component';
import { PopupAddMeetingComponent } from '../codx-tmmeetings/popup-add-meeting/popup-add-meeting.component';
import { CodxBookingService } from '../codx-booking/codx-booking.service';

@Injectable({
  providedIn: 'root',
})
export class StepService {
  public popupClosedSubject: Subject<any> = new Subject<any>();
  formModelAssignDefault: FormModel = {
    funcID: 'DPT04',
    entityName: 'DP_Instances',
    formName: 'DPInstances',
    gridViewName: 'grvDPInstances',
  };
  user;
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService,
    private callFunc: CallFuncService,
    private cache: CacheService,
    private bookingService: CodxBookingService,
    private codxService: CodxService,
    private authStore: AuthStore
  ) {
    this.user = this.authStore.get();
  }

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

  minusDate(dateBig: Date, dateSmall: Date, typeReturn: string) {
    if (!(dateBig instanceof Date) || !(dateSmall instanceof Date)) {
      return 0;
    }
    const millisecondsBig = dateBig.getTime();
    const millisecondsSmall = dateSmall.getTime();
    const milliseconds = millisecondsBig - millisecondsSmall;
    switch (typeReturn) {
      case 'seconds':
        return milliseconds / 1000 || 0;
      case 'minutes':
        return milliseconds / (1000 * 60) || 0;
      case 'hours':
        return milliseconds / (1000 * 60 * 60) || 0;
      case 'days':
        return milliseconds / (1000 * 60 * 60 * 24) || 0;
      default:
        return milliseconds || 0;
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

  //#region popup

  //#endregion

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
          isGroup = dataUpdate?.owner == user.userID;
        }
        return isUpdateProgressGroup && (isRoleAll || isGroup) ? true : false;
      } else {
        let isGroup = false;
        let isTask = false;
        if (!isRoleAll) {
          let group = step?.taskGroups?.find(
            (g) => g.refID == dataUpdate?.taskGroupID
          );
          isGroup = group ? group?.owner == user.userID : false;
          if (!isGroup) {
            isTask = dataUpdate?.owner == user.userID;
          }
        }
        return isRoleAll || isGroup || isTask ? true : false;
      }
    }
    return false;
  }

  getDefault(service, funcID, entityName, id = null) {
    return this.api.execSv<any>(
      service,
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [funcID, entityName, id]
    );
  }

  assignTask(
    moreFunc,
    stepTask,
    instanceStep,
    sessionID = null,
    formModelAssign = null
  ) {
    if (stepTask?.assigned == '1') {
      this.notiService.notify('tesst kiem tra da giao task');
      return;
    }
    var task = new TM_Tasks();
    task.taskName = stepTask.taskName;
    task.refID = stepTask?.recID;
    task.refType = 'DP_Instances_Steps_Tasks';
    task.dueDate = stepTask?.endDate;
    task.sessionID = sessionID ?? instanceStep?.instanceID;
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
    option.FormModel = formModelAssign ?? this.formModelAssignDefault;

    var dialogAssign = this.callFunc.openForm(
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
            'InstancesStepsBusiness',
            'UpdatedAssignedStepTasksAsync',
            [stepTask.stepID, stepTask.recID]
          )
          .subscribe();
      }
      return doneSave;
    });
  }

  async chooseTypeTask(typeDisableds: string[]) {
    let popupTypeTask = this.callFunc.openForm(
      CodxTypeTaskComponent,
      '',
      450,
      580,
      '',
      { typeDisableds }
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
    let popupTask = this.callFunc.openForm(
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

  async addBookingCar(isOpenSide = false) {
    let addCarTitle = await firstValueFrom(this.cache.functionList('EPT21'));
    let title = addCarTitle ? addCarTitle?.customName?.toString() : '';

    this.bookingService.getFormModel('EPT21').then((res) => {
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
        popupBookingCar = this.callFunc.openSide(
          CodxAddBookingCarComponent,
          [carFG?.value, 'SYS01', title, null, null, false],
          option
        );
      } else {
        let opt = new DialogModel();
        opt.FormModel = carFM;
        popupBookingCar = this.callFunc.openForm(
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

  async createMeeting(data, titleAction) {
    this.getDefault('CO', 'TMT0501', 'CO_Meetings').subscribe(async (res) => {
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
                    let dialog = this.callFunc.openSide(
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
  getOneQuotation(id) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'QuotationsBusiness',
      'GetOneAsync',
      [id]
    );
  }
  getOneContract(id) {
    return this.api.execSv<any>(
      'CM',
      'ERM.Business.CM',
      'ContractsBusiness',
      'GetOneAsync',
      [id]
    );
  }

  async openPopupTaskContract(
    data,
    action,
    task,
    stepID,
    groupTaskID,
    isStartIns
  ) {
    if (task) {
      task = JSON.parse(JSON.stringify(task));
    } else {
      if (action == 'add') {
        task = task ? task : {};
        task.recID = Util.uid();
        task.refID = Util.uid();
        task.status = '1';
        task.progress = 0;
        task.taskType = 'CO';
        task.stepID = stepID;
        task.taskGroupID = groupTaskID;
        task.isTaskDefault = false;
        task.dependRule = '0';
        task.assigned = '0';
        task.approveStatus = '1';
        // task.objectLinked = contract?.recID;
      } else if (action == 'copy') {
        task = JSON.parse(JSON.stringify(task));
        task.recID = Util.uid();
        task.refID = Util.uid();
        task.status = '1';
        task.progress = 0;
        task.fieldID = null;
        task.dependRule = '0';
        task.parentID = null;
        task.isTaskDefault = false;
        task.requireCompleted = false;
        task.approvedBy = null;
        task.assigned = '0';
        task.approveStatus = '1';
        // task.objectLinked = contract?.recID;
      }
    }

    let quotationID = task?.objectLinked;
    if ((action == 'edit' || action == 'copy') && quotationID) {
      let contractData = await firstValueFrom(this.getOneContract(quotationID));
      if (contractData) {
        data = {
          ...data,
          contract: contractData,
          stepsTasks: task,
          isStartIns,
        };
      } else {
        this.notiService.notify('Hợp đồng không tồn tại', '3');
        return;
      }
    } else {
      data = { ...data, stepsTasks: task, isStartIns };
    }

    let contractOuput = await this.openPopupContract(data);
    let contract = contractOuput?.event;
    if (contract) {
      task.objectLinked = contract?.recID;
      task.owner = contract?.owner;
      let minus = this.minusDate(task.endDate, task.startDate, 'hours');
      task.durationDay = minus ? minus % 24 : 0;
      task.durationHour = minus ? Math.floor(minus / 24) : 0;

      if (contract?.permissions?.length > 0) {
        let roles = contract?.permissions?.map((x) => {
          let role = new DP_Instances_Steps_Tasks_Roles();
          role['recID'] = Util.uid();
          role['objectName'] = x?.objectName;
          role['objectID'] = x?.objectID;
          role['createdOn'] = x?.createdOn;
          role['createdBy'] = x?.createdBy;
          role['roleType'] = 'O';
          role['objectType'] = x?.objectType;
          role['taskID'] = task?.recID;
          return role;
        });
        task.roles = roles;
      } else {
        task.roles = [];
        let role = new DP_Instances_Steps_Tasks_Roles();
        role['recID'] = Util.uid();
        role['objectName'] = this.user?.userName;
        role['objectID'] = this.user?.userID;
        role['createdOn'] = new Date();
        role['createdBy'] = this.user?.userID;
        role['roleType'] = 'O';
        role['objectType'] = this.user?.objectType;
        role['taskID'] = task?.recID;
        task.roles.push(role);
      }
      return task;
    } else {
      return null;
    }
  }

  async openPopupContract(data) {
    //data = {action, type,recIDContract?, projectID?, contract?}
    let formModel: FormModel = {
      entityName: 'CM_Contracts',
      entityPer: 'CM_Contracts',
      formName: 'CMContracts',
      funcID: 'CM0204',
      gridViewName: 'grvCMContracts',
    };
    let option = new SidebarModel();
    option.Width = '800px';
    option.zIndex = 1000;
    option.FormModel = formModel;
    await firstValueFrom(
      this.cache.gridViewSetup('CMContracts', 'grvCMContracts')
    );
    let popupContract = this.callFunc.openSide(
      AddContractsComponent,
      data,
      option
    );
    let dataPopupOutput = await firstValueFrom(popupContract.closed);
    return dataPopupOutput;
  }

  async openPopupCodxTask(data, location) {
    //default => data = {action,taskType,isSave,type: 'calendar'|'step'|'activitie'|'instance'|'group'};
    let frmModel: FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
    let dataPopupOutput;
    let popupAddTask;
    if (location == 'right') {
      let option = new SidebarModel();
      option.Width = '550px';
      option.zIndex = 1010;
      option.FormModel = frmModel;
      popupAddTask = this.callFunc.openSide(CodxAddTaskComponent, data, option);
    } else {
      let opt = new DialogModel();
      opt.FormModel = frmModel;
      popupAddTask = this.callFunc.openForm(
        CodxAddTaskComponent,
        '',
        600,
        800,
        '',
        data,
        '',
        opt
      );
    }
    dataPopupOutput = await firstValueFrom(popupAddTask.closed);
    let taskOutput = dataPopupOutput?.event ? dataPopupOutput?.event : null;
    return taskOutput;
    // popupAddTask.closed.subscribe(res => {
    //   this.popupClosedSubject.next(res);
    // });
    // return this.popupClosedSubject.asObservable();
  }

  async addQuotation(action, titleAction, task, stepID, groupTaskID) {
    let quotationID = task?.objectLinked;
    if ((action == 'edit' || action == 'copy') && quotationID) {
      this.getOneQuotation(quotationID).subscribe((res) => {
        if (res) {
          let quotation = res;
          if (action == 'edit') {
            this.openPopupQuotation(
              quotation,
              action,
              titleAction,
              task,
              stepID,
              groupTaskID
            );
          } else {
            quotation['_uuid'] = quotation['quotationsID'] ?? Util.uid();
            quotation['idField'] = 'quotationsID';
            quotation.versionNo = quotation.versionNo ?? 'V1';
            quotation.revision = quotation.revision ?? 0;
            quotation.versionName =
              quotation.versionNo + '.' + quotation.revision;
            quotation.status = quotation.status ?? '0';
            quotation.exchangeRate = quotation.exchangeRate ?? 1;
            quotation.totalAmt = quotation.totalAmt ?? 0;
            quotation.currencyID = quotation.currencyID ?? 'VND';
            this.openPopupQuotation(
              action,
              quotation,
              titleAction,
              task,
              stepID,
              groupTaskID
            );
          }
        } else {
          this.notiService.notifyCode('Báo giá không tồn tại');
        }
      });
    } else {
      this.getDefault(
        'CM',
        'CM0202',
        'CM_Quotations',
        'quotationsID'
      ).subscribe((res) => {
        if (res) {
          let quotation = res.data;
          quotation['_uuid'] = quotation['quotationsID'] ?? Util.uid();
          quotation['idField'] = 'quotationsID';
          quotation.versionNo = quotation.versionNo ?? 'V1';
          quotation.revision = quotation.revision ?? 0;
          quotation.versionName =
            quotation.versionNo + '.' + quotation.revision;
          quotation.status = quotation.status ?? '0';
          quotation.exchangeRate = quotation.exchangeRate ?? 1;
          quotation.totalAmt = quotation.totalAmt ?? 0;
          quotation.currencyID = quotation.currencyID ?? 'VND';
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
                this.openPopupQuotation(
                  action,
                  quotation,
                  titleAction,
                  task,
                  stepID,
                  groupTaskID
                );
              });
          } else {
            this.openPopupQuotation(
              action,
              quotation,
              titleAction,
              task,
              stepID,
              groupTaskID
            );
          }
        }
      });
    }
  }

  openPopupQuotation(
    action,
    quotation,
    titleAction,
    task,
    stepID,
    groupTaskID
  ) {
    let formModel: FormModel = {
      entityName: 'CM_Quotations',
      formName: 'CMQuotations',
      gridViewName: 'grvCMQuotations',
      funcID: 'CM0202',
    };
    var obj = {
      data: quotation,
      disableRefID: false,
      action,
      headerText: titleAction,
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.FormModel = formModel;
    this.cache
      .gridViewSetup('CMQuotations', 'grvCMQuotations')
      .subscribe((res) => {
        let dialog = this.callFunc.openForm(
          PopupAddQuotationsComponent,
          '',
          null,
          null,
          '',
          obj,
          '',
          option
        );
        dialog.closed.subscribe((e) => {
          if (e?.event) {
            let quotatision = e?.event;
            if (action == 'add') {
              task = task ? task : {};
              task.recID = Util.uid();
              task.refID = Util.uid();
              task.status = '1';
              task.progress = 0;
              task.taskType = 'Q';
              task.stepID = stepID;
              task.taskGroupID = groupTaskID;
              task.isTaskDefault = false;
              task.dependRule = '0';
              task.assigned = '0';
              task.approveStatus = '1';
              task.objectLinked = quotatision?.recID;
            } else if (action == 'copy') {
              task = JSON.parse(JSON.stringify(task));
              task.recID = Util.uid();
              task.refID = Util.uid();
              task.status = '1';
              task.progress = 0;
              task.fieldID = null;
              task.dependRule = '0';
              task.parentID = null;
              task.isTaskDefault = false;
              task.requireCompleted = false;
              task.approvedBy = null;
              task.assigned = '0';
              task.approveStatus = '1';
              task.objectLinked = quotatision?.recID;
            } else if (action == 'edit') {
              task = JSON.parse(JSON.stringify(task));
            }
            task.taskName = quotatision?.quotationName;
            task.owner = this.user?.userID;
            task.startDate = Date.parse(quotatision?.createdOn)
              ? quotatision?.createdOn
              : new Date();
            task.endDate = Date.parse(quotatision?.deadline)
              ? quotatision?.deadline
              : null;
            let minus = this.minusDate(task.endDate, task.startDate, 'hours');
            task.durationDay = minus ? minus % 24 : 0;
            task.durationHour = minus ? Math.floor(minus / 24) : 0;
            task.roles = [];
            let role = new DP_Instances_Steps_Tasks_Roles();
            role['recID'] = Util.uid();
            role['objectName'] = this.user?.userName;
            role['objectID'] = this.user?.userID;
            role['createdOn'] = new Date();
            role['createdBy'] = this.user?.userID;
            role['roleType'] = 'O';
            role['objectType'] = this.user?.objectType;
            role['taskID'] = task?.recID;
            task.roles.push(role);
            this.popupClosedSubject.next(task);
            this.popupClosedSubject.asObservable();
          }
        });
      });
  }

  //get dataSource
  getDataSource(
    data,
    instanceID,
    entityName = null,
    recIDParent = null
  ): Promise<string> {
    return new Promise<string>((resolve, rejects) => {
      let methol = 'GetDataSourceExportTaskAsync';
      let className = 'ContractsBusiness';
      let service = 'CM';
      let request = [instanceID, data.objectLinked];
      switch (data.taskType) {
        case 'CO':
          className = 'ContractsBusiness';
          break;
        case 'Q':
          className = 'QuotationsBusiness';
          break;
        case 'F':
          if (entityName != null && recIDParent != null) {
            className = this.getClassName(entityName);
            methol = 'GetDataSourceExportAsync';
            request = recIDParent;
          } else {
            service = 'DP';
            className = 'InstancesBusiness';
            //Data version
            methol = 'GetDatasVersionFieldAsync';
            request = [instanceID, data.stepID, data.recID];
            // methol = 'GetDatasByInstanceIDAsync';
            //request = [instanceID];
          }
          break;
        default:
          return resolve('');
          break;
      }
      this.api
        .execSv<any>(service, service, className, methol, request)
        .subscribe((str) => {
          let dataSource = '';
          if (str) {
            if (
              data.taskType == 'F' &&
              entityName == null &&
              recIDParent == null
            ) {
              dataSource = str;
            } else {
              if (str?.length > 0) {
                dataSource = '[' + str[0] + ']';
                if (str[1]) {
                  let datas = str[1];
                  if (datas && datas.includes('[{')) datas = datas.substring(2);
                  let fix = str[0];
                  fix = fix.substring(1, fix.length - 1);
                  dataSource = '[{ ' + fix + ',' + datas;
                }
              }
            }
          }
          resolve(dataSource);
        });
    });
  }

  getClassName(entityName) {
    let className = '';
    switch (entityName) {
      case 'CM_Deals':
        className = 'DealsBusiness';
        break;
      case 'CM_Cases':
        className = 'CasesBusiness';
        break;
      case 'CM_Leads':
        className = 'LeadsBusiness';
        break;
      case 'CM_Contracts':
        className = 'ContractsBusiness';
        break;
      case 'CM_Campaigns':
        className = 'CampaignsBusiness';
        break;
    }
    return className;
  }
  //end

  async addTaskCM(dataParent, entityName) {
    let typeCM;
    let instanceID;
    let isStart;
    let isActivitie;
    let applyFor;
    switch (entityName) {
      case 'CM_Deals':
        instanceID = dataParent?.refID;
        isStart = dataParent?.status != '1';
        isActivitie = false;
        applyFor = '1';
        typeCM = '5';
        break;
      case 'CM_Leads':
        instanceID = dataParent?.applyProcess ? dataParent?.refID : null;
        isStart = dataParent?.status != '1';
        isActivitie = !dataParent?.applyProcess;
        applyFor = '5';
        typeCM = '3';
        break;
      case 'CM_Cases':
        instanceID = dataParent?.refID;
        isStart = dataParent?.status != '1';
        isActivitie = false;
        applyFor = dataParent?.caseType == '1' ? '2' : ' 3';
        typeCM = '9';
        break;
      case 'CM_Customers':
        instanceID = null;
        isStart = true;
        isActivitie = true;
        applyFor = '5';
        typeCM = '1';
        break;
      case 'CM_Contracts':
        instanceID = dataParent?.applyProcess ? dataParent?.refID : null;
        isStart = dataParent?.status != '1';
        isActivitie = !dataParent?.applyProcess;
        applyFor = '4';
        typeCM = '7';
        break;
    }

    let typeTask = await this.chooseTypeTask(['G', 'F']);
    if (typeTask) {
      let data = {
        typeCM,
        isStart,
        instanceID,
        type: 'cm',
        isActivitie,
        isSave: true,
        action: 'add',
        taskType: typeTask,
        objectID: dataParent?.recID,
        objectType: 'CM_Contracts',
        ownerInstance: dataParent?.owner,
        dataParentTask: {
          applyFor: '4',
          parentTaskID: dataParent?.recID,
        },
      };

      return await this.openPopupCodxTask(data, 'right');
    }
  }

  getESCategoryByCategoryIDType(categoryID, category, refID = null) {
    return this.api.execSv<any>(
      'ES',
      'ES',
      'CategoriesBusiness',
      'GetByCategoryIDTypeAsync',
      [categoryID, category, refID]
    );
  }
}
