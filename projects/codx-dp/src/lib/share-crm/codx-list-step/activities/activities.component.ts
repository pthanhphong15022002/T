import {
  Input,
  Output,
  OnInit,
  OnChanges,
  Component,
  EventEmitter,
  SimpleChanges,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  Util,
  AuthStore,
  FormModel,
  CacheService,
  SidebarModel,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  DialogModel,
  TenantStore,
} from 'codx-core';
import {
  DP_Activities,
  DP_Activities_Roles,
  DP_Instances_Steps_Tasks,
} from 'projects/codx-dp/src/lib/models/models';
import { firstValueFrom } from 'rxjs';
import { TM_Tasks } from 'projects/codx-tm/src/lib/models/TM_Tasks.model';
import { AssignTaskModel } from 'projects/codx-share/src/lib/models/assign-task.model';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { ActivatedRoute } from '@angular/router';
import { ExportData } from 'projects/codx-share/src/lib/models/ApproveProcess.model';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { Location } from '@angular/common';
import { StepService } from 'projects/codx-dp/src/lib/share-crm/codx-step/step.service';
import { CodxTypeTaskComponent } from 'projects/codx-dp/src/lib/share-crm/codx-step/codx-step-common/codx-type-task/codx-type-task.component';
import { CodxAddTaskComponent } from 'projects/codx-dp/src/lib/share-crm/codx-step/codx-popup-task/codx-add-task.component';
import { UpdateProgressComponent } from 'projects/codx-dp/src/lib/share-crm/codx-step/codx-progress/codx-progress.component';
import { CodxViewTaskComponent } from 'projects/codx-dp/src/lib/share-crm/codx-step/codx-view-task/codx-view-task.component';
import { CodxViewApproveComponent } from 'projects/codx-dp/src/lib/share-crm/codx-step/codx-step-common/codx-view-approve/codx-view-approve.component';
import { CodxCmService } from 'projects/codx-cm/src/projects';
@Component({
  selector: 'activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
})
export class ActivitiesComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() objectID: string;
  @Input() isPause = false;
  @Input() isAdmin = false;
  @Input() entityName = '';
  @Input() ownerInstance: string;

  @Input() customerName: string;
  @Input() dealName: string;
  @Input() contractName: string;
  @Input() leadName: string;
  @Input() activitiAdd;
  @Input() applyFor;

  @Input() sessionID = ''; // session giao việc
  @Input() formModelAssign: FormModel; // formModel của giao việc

  @Output() saveAssign = new EventEmitter<any>();
  activitie: DP_Activities = new DP_Activities();
  user;
  vllData;
  taskType;
  titleName = '';
  dataTooltipDay;
  isNoData = false;
  listTaskType = [];
  grvMoreFunction: FormModel;
  listActivitie: DP_Activities[] = [];
  isLoad = false;
  taskApproval: DP_Activities;
  funcID = '';
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private authstore: AuthStore,
    private stepService: StepService,
    private codxCommonService: CodxCommonService,
    private callFunc: CallFuncService,
    private codxCmService: CodxCmService,
    private notiService: NotificationsService,
    private codxShareService: CodxShareService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private location: Location,
    private tenantStore: TenantStore
  ) {
    this.user = this.authstore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.objectID) {
      this.isLoad = true;
      this.isNoData = false;
      this.listActivitie = [];
      this.getActivities();
    }
    if (changes?.activitiAdd && changes?.activitiAdd?.currentValue) {
      let task = changes?.activitiAdd?.currentValue?.task;
      this.listActivitie.push(task);
      this.isNoData = false;
      this.notiService.notifyCode('SYS006');
      this.changeDetectorRef.markForCheck();
    }
  }

  async ngOnInit(): Promise<void> {
    this.grvMoreFunction = await this.getFormModel('DPT040102');
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTaskType = res?.datas;
      }
    });
    this.cache.valueList('DP048').subscribe((res) => {
      if (res.datas) {
        this.vllData = res?.datas;
      }
    });
  }

  ngAfterViewInit(): void {}

  //#region get data
  getActivities(): void {
    this.api
      .exec<any>('DP', 'ActivitiesBusiness', 'GetActivitiesAsync', [
        this.objectID,
      ])
      .subscribe((res) => {
        if (res?.length > 0) {
          this.isPause;
          if (this.isAdmin) {
            this.listActivitie = res;
          } else {
            this.listActivitie = res?.filter(
              (activitie) => activitie.owner == this.user?.userID
            );
          }
          this.isNoData = false;
        } else {
          this.listActivitie = [];
          this.isNoData = true;
        }
        this.isLoad = false;
      });
  }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = {};
    formModel['formName'] = f?.formName;
    formModel['gridViewName'] = f?.gridViewName;
    formModel['entityName'] = f?.entityName;
    formModel['funcID'] = functionID;
    return formModel;
  }

  getRoleName(task) {
    let role =
      task?.roles.find((role) => role.objectID == task?.owner) ||
      task?.roles[0];
    return role?.objectName;
  }

  getTypeTask(task) {
    this.taskType = this.listTaskType.find(
      (type) => type.value == task?.taskType
    );
  }
  //#endregion

  //#region mode function
  async changeDataMFTask(event, task) {
    if (event != null) {
      event.forEach((res) => {
        res.isbookmark = false;
        switch (res.functionID) {
          case 'SYS02': //xóa
          case 'SYS03': //sửa
          case 'SYS04': //copy
            res.disabled = task?.approveStatus == '3';
            break;
          case 'DP25':
          case 'DP26':
          case 'SYS003': //đính kèm file
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
            res.disabled = true;
            break;
          case 'DP13': //giao việc
            if (task?.approveStatus == '3') {
              res.disabled = true;
            }
            if (!task?.createTask) {
              res.isblur = true;
            }
            break;
          case 'DP12':
            res.disabled = true;
            break;
          case 'DP08':
            res.disabled = true;
            break;
          //tajo cuoc hop
          case 'DP24': //Tạo cuộc họp
            if (task.taskType != 'M' || task?.actionStatus == '2') {
              res.disabled = true;
            } else if (task?.status == '1') {
              res.isblur = true;
            }
            break;
          case 'DP27': // đặt xe
            if (
              task?.taskType != 'B' ||
              (task?.taskType == 'B' && task?.actionStatus == '2')
            ) {
              res.disabled = true;
            } else {
              task?.status == '1' && (res.isblur = true);
            }
            break;
          case 'DP28': // Cập nhật
            if (['B', 'M'].includes(task.taskType)) {
              this.convertMoreFunctions(event, res, task.taskType);
              if (task?.actionStatus != '2') res.disabled = true;
            } else {
              res.disabled = true;
            }
            break;
          case 'DP29': // Hủy
            if (['B', 'M'].includes(task.taskType)) {
              this.convertMoreFunctions(event, res, task.taskType);
              if (task?.actionStatus != '2') res.disabled = true;
            } else {
              res.disabled = true;
            }
            break;
          case 'DP30': //Khôi phục
            res.disabled = true;
            break;
          case 'DP31': //Bắt đầu
            if (task?.status != '1' || task?.approveStatus == '3') {
              res.disabled = true;
            }
            break;
          case 'DP20': // tiến độ
            if (
              task?.approveStatus == '3' ||
              (task?.status == '3' && !task?.startDate && !task?.endDate)
            ) {
              res.disabled = true;
            }
            break;
          case 'DP32': // gởi duyệt
            res.disabled =
              !task?.approveRule ||
              (task?.approveRule && ['3', '5'].includes(task?.approveStatus));
            break;
          case 'DP33': // hủy duyệt
            res.disabled = !(task?.approveRule && task?.approveStatus == '3');
            break;
        }
      });
    }
  }
  async clickMFTask(e: any, task?: any) {
    this.titleName = e.text;
    switch (e.functionID) {
      case 'SYS02':
        this.deleteTask(task);
        break;
      case 'SYS03': //edit
        this.editTask(task);
        break;
      case 'SYS04': //copy
        this.copyTask(task);
        break;
      case 'DP07': // view
        this.viewTask(task, task?.taskType || 'T');
        break;
      case 'DP13': //giao viec
        this.assignTask(e.data, task);
        break;
      case 'DP20': // tien do
        this.openPopupUpdateProgress(task, 'T');
        break;
      case 'DP24': // tạo lịch họp
        this.createMeeting(task);
        break;
      case 'DP27':
        await this.stepService.addBookingCar(true);
        break;
      case 'DP31':
        this.startActivitie(task);
        break;
      case 'DP32':
        this.approvalTrans(task);
        break;
      case 'DP33':
        this.cancelApprover(task);
        break;
    }
  }
  convertMoreFunctions(listMore, more, type) {
    let functionID = type == 'B' ? 'DP27' : 'DP24';
    let moreFind = listMore?.find((m) => m.functionID == functionID);
    let text = more?.text + ' ' + moreFind?.text?.toString()?.toLowerCase();
    more.text = text;
  }
  //#endregion

  //#region CRUD
  async addTask() {
    if (this.taskType?.value == 'Q') {
      this.stepService.addQuotation('add', 'Thêm', null, null, null);
      this.stepService.popupClosedSubject.subscribe((res) => {
        let task = res;
        if (task) {
          let dataSave = { task: task };
          this.save(dataSave);
        }
      });
    } else if (this.taskType?.value == 'CO') {
      let data = { action: 'add', type: 'task', customerID: this.objectID };
      let taskContract = await this.stepService.openPopupTaskContract(
        data,
        'add',
        null,
        null,
        null,
        true
      );
      let dataSave = { task: taskContract };
      this.save(dataSave);
    } else if (this.taskType?.value == 'E') {
      this.handelMail(null, 'add');
    } else {
      let data = {
        action: 'add',
        taskType: this.taskType,
        isSave: false,
        type: 'activitie',
        ownerInstance: this.ownerInstance,
      };
      let task = await this.stepService.openPopupCodxTask(data, 'right');
      this.save(task);
    }
  }

  save(data) {
    if (data?.task) {
      let isAddTask = data?.isAddTask;
      let isCreateMeeting = data?.isCreateMeeting;
      let task = data?.task;
      this.copyData(task, this.activitie);
      let rolesTask = task?.roles;
      let roles: DP_Activities_Roles[] = [];
      if (rolesTask?.length > 0) {
        rolesTask.forEach((element) => {
          let role = new DP_Activities_Roles();
          this.copyData(element, role);
          roles.push(role);
        });
      }
      this.activitie.roles = roles;
      this.activitie.objectID = this.objectID;
      this.activitie.objectType = this.entityName;
      this.api
        .exec<any>('DP', 'ActivitiesBusiness', 'AddActivitiesAsync', [
          this.activitie,
          this.entityName,
          isCreateMeeting,
          isAddTask,
        ])
        .subscribe((res) => {
          if (res) {
            this.listActivitie.push(res);
            this.isNoData = false;
            this.notiService.notifyCode('SYS006');
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  async editTask(task) {
    let taskEdit = JSON.parse(JSON.stringify(task));
    this.getTypeTask(taskEdit);
    if (this.taskType?.value == 'E') {
      this.handelMail(task, 'edit');
    } else if (this.taskType?.value == 'Q') {
      this.stepService.addQuotation('edit', 'Chỉnh sửa', null, null, null);
      this.stepService.popupClosedSubject.subscribe((res) => {
        let task = res;
        if (task) {
          let dataSave = { task: task };
          this.save(dataSave);
        }
      });
    } else if (this.taskType?.value == 'CO') {
      let data = { action: 'edit', type: 'task' };
      let taskContract = await this.stepService.openPopupTaskContract(
        data,
        'edit',
        null,
        null,
        null,
        true
      );
      let dataSave = { task: taskContract };
      this.api
        .exec<any>('DP', 'ActivitiesBusiness', 'EditActivitiesAsync', [
          taskContract,
          this.entityName,
        ])
        .subscribe((res) => {
          if (res) {
            let index = this.listActivitie?.findIndex(
              (activitie) => activitie.recID == res.recID
            );
            this.listActivitie?.splice(index, 1, res);
            this.notiService.notifyCode('SYS007');
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      let taskOutput = await this.openPopupTask('edit', taskEdit);
      if (taskOutput?.event) {
        if (!taskOutput?.event?.objectID) {
          task['objectID'] = this.objectID;
        }
        this.api
          .exec<any>('DP', 'ActivitiesBusiness', 'EditActivitiesAsync', [
            taskOutput?.event?.task,
            this.entityName,
          ])
          .subscribe((res) => {
            if (res) {
              let index = this.listActivitie?.findIndex(
                (activitie) => activitie.recID == res.recID
              );
              this.listActivitie?.splice(index, 1, res);
              this.notiService.notifyCode('SYS007');
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    }
  }
  deleteTask(task) {
    if (!task?.recID) {
      return;
    }
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.api
          .exec<any>('DP', 'ActivitiesBusiness', 'DeleteActivitiesAsync', [
            task?.recID,
            this.entityName,
          ])
          .subscribe((res) => {
            if (res) {
              let index = this.listActivitie?.findIndex(
                (activitie) => activitie.recID == task.recID
              );
              this.listActivitie?.splice(index, 1);
              this.notiService.notifyCode('SYS008');
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    });
  }
  async copyTask(task) {
    let dataCopy = JSON.parse(JSON.stringify(task));
    this.getTypeTask(dataCopy);
    dataCopy['refID'] = Util.uid();
    dataCopy['recID'] = Util.uid();
    dataCopy['progress'] = 0;
    dataCopy['isTaskDefault'] = false;
    // dataCopy['status'] = '1';
    delete dataCopy?.id;
    dataCopy['modifiedOn'] = null;
    dataCopy['modifiedBy'] = null;
    if (this.taskType?.value == 'E') {
      this.handelMail(task, 'copy');
    } else {
      let taskOutput = await this.openPopupTask('copy', dataCopy);
      let data = taskOutput?.event?.task;
      let isAddTask = taskOutput?.event?.isAddTask;
      let isCreateMeeting = taskOutput?.event?.isCreateMeeting;
      if (data) {
        this.copyData(data, this.activitie);
        let rolesTask = data?.roles;
        let roles: DP_Activities_Roles[] = [];
        if (rolesTask?.length > 0) {
          rolesTask.forEach((element) => {
            let role = new DP_Activities_Roles();
            this.copyData(element, role);
            roles.push(role);
          });
        }
        this.activitie.roles = roles;
        this.activitie.objectID = this.objectID;
        this.api
          .exec<any>('DP', 'ActivitiesBusiness', 'AddActivitiesAsync', [
            this.activitie,
            this.entityName,
            isCreateMeeting,
            isAddTask,
          ])
          .subscribe((res) => {
            if (res) {
              this.listActivitie.push(res);
              this.notiService.notifyCode('SYS006');
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    }
  }

  //#endregion

  //#region open popup
  async chooseTypeTask() {
    let popupTypeTask = this.callFunc.openForm(
      CodxTypeTaskComponent,
      '',
      450,
      580,
      '',
      { typeDisableds: ['G', 'F'] }
    );
    let dataOutput = await firstValueFrom(popupTypeTask.closed);
    if (dataOutput?.event?.value) {
      this.taskType = dataOutput?.event;
      this.addTask();
    }
  }
  async openPopupTask(action, dataTask, groupTaskID = null) {
    let dataInput = {
      type: 'activitie',
      action,
      titleName: this.titleName,
      taskType: this.taskType,
      step: null,
      listGroup: null,
      dataTask: dataTask || {},
      listTask: null,
      isEditTimeDefault: null,
      groupTaskID, // trường hợp chọn thêm từ nhóm
      isSave: false,
      isStart: true,
      ownerInstance: this.ownerInstance,
    };
    let frmModel: FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1011;
    option.FormModel = frmModel;
    let popupTask = this.callFunc.openSide(
      CodxAddTaskComponent,
      dataInput,
      option
    );
    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    return dataPopupOutput;
  }

  async openPopupUpdateProgress(task, type) {
    if (this.isPause || !(task?.startDate && task?.endDate)) {
      return;
    }
    let dataInput = {
      data: task,
      type,
      step: null,
      isSave: false,
      isUpdateParent: false,
    };
    let popupTask = this.callFunc.openForm(
      UpdateProgressComponent,
      '',
      550,
      400,
      '',
      dataInput
    );

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    if (dataPopupOutput?.event) {
      let data = {
        recID: dataPopupOutput?.event?.taskID,
        note: dataPopupOutput?.event?.note,
        progress: dataPopupOutput?.event?.progressTask,
        actualEnd: dataPopupOutput?.event?.actualEnd,
      };
      this.api
        .exec<any>(
          'DP',
          'InstancesStepsBusiness',
          'UpdateProgressActivitiesAsync',
          data
        )
        .subscribe((res) => {
          if (res) {
            task.progress = dataPopupOutput?.event?.progressTask;
            task.status = task.progress == 100 ? '3' : '2';
            task.actualEnd = res?.actualEnd;
            task.actualStart = res?.actualStart;
            task.note = res?.note;
            this.listActivitie;
            this.notiService.notifyCode('SYS007');
            this.changeDetectorRef.markForCheck();
          }
        });
    }
    return dataPopupOutput;
  }
  //#endregion

  //#region view
  viewTask(data, type) {
    if (data?.objectLinked && data?.taskType == 'CO') {
      this.viewDetailContract(data);
      return;
    } else {
      if (data) {
        let frmModel: FormModel = {
          entityName: 'DP_Instances_Steps_Tasks',
          formName: 'DPInstancesStepsTasks',
          gridViewName: 'grvDPInstancesStepsTasks',
        };
        //a thao laasy refID
        let listRefIDAssign = '';
        switch (type) {
          case 'G':
            if (data.task?.length > 0) {
              let arrRecIDTask = data.task.map((x) => x.recID);
              listRefIDAssign = arrRecIDTask.join(';');
            }
            break;
          case 'P':
            if (data.taskGroup?.length > 0) {
              if (data.taskGroup?.task?.length > 0) {
                let arrRecIDTask = data.taskGroup.task.map((x) => x.recID);
                if (listRefIDAssign && listRefIDAssign.trim() != '')
                  listRefIDAssign += ';' + arrRecIDTask.join(';');
                else listRefIDAssign = arrRecIDTask.split(';');
              }
              //thieu cong task ngooai mai hoir thuan de xets
            }
            break;
          default:
            listRefIDAssign = data.recID;
            break;
        }

        let listData = {
          type,
          value: data,
          step: null,
          isRoleAll: true,
          isUpdate: true,
          isOnlyView: true,
          isUpdateProgressGroup: false,
          listRefIDAssign: listRefIDAssign,
          instanceStep: null,
          isActivitie: true,
          sessionID: this.sessionID, // session giao việc
          formModelAssign: this.formModelAssign, // formModel của giao việc
          customerName: this.customerName,
          dealName: this.dealName,
          contractName: this.contractName,
          leadName: this.leadName,
        };
        let option = new SidebarModel();
        option.Width = '550px';
        option.zIndex = 1011;
        option.FormModel = frmModel;
        let dialog = this.callFunc.openSide(
          CodxViewTaskComponent,
          listData,
          option
        );
        dialog.closed.subscribe(async (dataOuput) => {
          // if (dataOuput?.event?.dataProgress) {
          //   this.handelProgress(data, dataOuput?.event?.dataProgress);
          // }
          // if(dataOuput?.event?.task || dataOuput?.event?.group){
          //   await this.getStepById();
          // }
        });
      }
    }
  }
  viewDetailContract(task) {
    if (task?.objectLinked) {
      const url1 = this.location.prepareExternalUrl(this.location.path());
      const parser = document.createElement('a');
      parser.href = url1;
      const domain = parser.origin;

      let tenant = this.tenantStore.get().tenant;
      let url = `${domain}/${tenant}/cm/contracts/CM0206?predicate=RecID=@0&dataValue=${task?.objectLinked}`;
      window.open(url, '_blank');
      return;
    } else {
      this.notiService.notify('Không tìm thấy hợp đồng', '3');
    }
  }
  //#endregion

  startActivitie(activitie) {
    // if (activitie?.taskType == 'Q') {
    //   //báo giá
    //   this.stepService.addQuotation();
    // } else if (activitie?.taskType == 'CO') {
    //   // hợp đồng
    //   this.stepService.openPopupContract('add');
    // }
    this.api
      .exec<any>('DP', 'InstancesStepsBusiness', 'StartActivitiesAsync', [
        activitie?.recID,
      ])
      .subscribe((res) => {
        if (res) {
          let index = this.listActivitie?.findIndex(
            (x) => x.recID == res.recID
          );
          if (index >= 0) {
            this.listActivitie?.splice(index, 1, res);
            this.notiService.notifyCode('SYS007');
          } else {
          }
        } else {
        }
      });
  }

  copyData(datacopy, data) {
    if (datacopy && data) {
      for (let key in datacopy) {
        data[key] = datacopy[key];
      }
    }
  }

  setNameTypeTask(taskType) {
    let type = this.listTaskType?.find((task) => task?.value == taskType);
    return type?.text;
  }
  //#region giao việc
  assignTask(moreFunc, data) {
    if (data?.assigned == '1') {
      this.notiService.notify('tesst kiem tra da giao task');
      return;
    }
    let frmModelInstancesTask = {
      funcID: 'DPT040102',
      formName: 'DPInstancesStepsTasks',
      entityName: 'DP_Instances_Steps_Tasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };

    var task = new TM_Tasks();
    task.taskName = data.taskName;
    task.refID = data?.recID;
    task.refType = 'DP_Activities'; //'DP_Instances_Steps_Tasks';
    task.dueDate = data?.endDate;
    task.sessionID = this.objectID;
    // let dataReferences = [
    //   {
    //     recIDReferences: data.recID,
    //     refType: 'DP_Activities', //'DP_Instances_Steps_Tasks',
    //     createdOn: data.createdOn,
    //     memo: data.taskName,
    //     createdBy: data.createdBy,
    //   },
    // ];
    let assignModel: AssignTaskModel = {
      vllRole: 'TM001',
      title: moreFunc.customName,
      vllShare: 'TM003',
      task: task,
    };
    let option = new SidebarModel();
    option.FormModel = frmModelInstancesTask;
    option.Width = '550px';
    var dialogAssign = this.callFunc.openSide(
      AssignInfoComponent,
      assignModel,
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
            [data.stepID, data.recID]
          )
          .subscribe();
      }
      this.saveAssign.emit(doneSave);
    });
  }
  //#endregion
  createMeeting(task) {
    this.stepService.createMeeting(task, this.titleName);
  }
  openTooltip(popup, data) {
    this.dataTooltipDay = data;
    popup.open();
  }

  //#region duyet

  approvalTrans(task: DP_Activities) {
    if (task?.approveRule && task?.recID) {
      this.api
        .execSv<any>(
          'ES',
          'ES',
          'CategoriesBusiness',
          'GetByCategoryIDTypeAsync',
          [task?.recID, 'DP_Activities', null]
        )
        .subscribe((res) => {
          if (!res) {
            this.notiService.notifyCode('ES028');
            return;
          } else {
            let exportData: ExportData = {
              funcID: this.funcID,
              recID: task?.recID,
              data: null,
            };
            this.release(task, res, exportData);
          }
        });
    } else {
      this.notiService.notifyCode('DP040');
    }
  }

  release(data: any, category: any, exportData = null) {
    this.taskApproval = data;
    this.codxCommonService.codxReleaseDynamic(
      'DP',
      data,
      category,
      'DP_Activities',
      'DPT07',
      data?.taskName,
      this.releaseCallback.bind(this),
      null,
      null,
      'DP_Activities',
      null,
      null,
      exportData
    );
  }

  releaseCallback(res: any, t: any = null) {
    if (res?.msgCodeError) this.notiService.notify(res?.msgCodeError);
    else {
      this.taskApproval.approvedBy = this.user?.userID;
      this.taskApproval.approveStatus = res?.returnStatus || '3';
      this.taskApproval = null;
      this.moreDefaut = JSON.parse(JSON.stringify(this.moreDefaut));
      this.changeDetectorRef.markForCheck();
    }
  }
  //Huy duyet
  cancelApprover(task) {
    this.notiService.alertCode('ES016').subscribe((x) => {
      if (x.event.status == 'Y') {
        this.codxCmService
          .getESCategoryByCategoryID(task?.recID)
          .subscribe((res: any) => {
            if (res) {
              this.codxCommonService
                .codxCancel('DP', task?.recID, 'DP_Activities', null, null)
                .subscribe((res2: any) => {
                  if (res2?.msgCodeError)
                    this.notiService.notify(res?.msgCodeError);
                  else {
                    task.approveStatus = res2?.returnStatus || '0';
                    this.moreDefaut = JSON.parse(
                      JSON.stringify(this.moreDefaut)
                    );
                    this.changeDetectorRef.markForCheck();
                  }
                });
            } else {
              this.notiService.notifyCode('SYS021');
            }
          });
      }
    });
  }

  openFormApprover(task) {
    this.taskApproval = task;
    this.callFunc.openForm(CodxViewApproveComponent, '', 500, 550, '', {
      categoryID: task?.recID,
      type: '2',
      stepsTasks: task,
    });
  }

  handelMail(activitie: DP_Activities, action) {
    activitie = activitie
      ? JSON.parse(JSON.stringify(activitie))
      : new DP_Activities();
    let data = {
      formGroup: null,
      templateID: activitie?.reference || null,
      showIsTemplate: true,
      showIsPublish: true,
      showSendLater: true,
      files: null,
      isAddNew: action == 'edit' ? false : true,
      saveIsTemplate: action == 'edit' ? false : true,
      notSendMail: true,
    };

    let popEmail = this.callFunc.openForm(
      CodxEmailComponent,
      '',
      800,
      screen.height,
      '',
      data
    );
    popEmail.closed.subscribe((res) => {
      if (res && res?.event) {
        let mail = res?.event;
        if (action === 'add' || action === 'copy') {
          if (activitie?.id) {
            delete activitie.id;
          }
          activitie.refID = Util.uid();
          activitie.recID = Util.uid();
          activitie.status = '1';
          activitie.progress = 0;
          activitie.assigned = '0';
          activitie.dependRule = '0';
          activitie.approveStatus = '1';
          activitie.approveStatus = '1';
          activitie.isTaskDefault = false;
          activitie.taskType = 'E';

          activitie.taskName = mail?.subject || this.taskType?.text;
          activitie.durationDay = 1;
          activitie.reference = mail?.recID;
          activitie.memo = mail?.message;

          if (mail?.isSendMail) {
            activitie.actualEnd = new Date();
            activitie.status = '3';
            activitie.progress = 100;
          } else {
            activitie.startDate = new Date();
            activitie.endDate = new Date();
            activitie.endDate.setDate(activitie.startDate.getDate() + 1);
            activitie.status = '1';
            activitie.progress = 0;
          }
          this.setRole(activitie);
          activitie.objectID = this.objectID;
          activitie.objectType = this.entityName;
          this.api
            .exec<any>('DP', 'ActivitiesBusiness', 'AddActivitiesAsync', [
              activitie,
              this.entityName,
            ])
            .subscribe((res) => {
              if (res) {
                this.listActivitie.push(res);
                this.isNoData = false;
                this.notiService.notifyCode('SYS006');
                this.changeDetectorRef.markForCheck();
              }
            });
        } else {
          activitie.taskName = mail?.subject || 'Email';
          activitie.memo = mail?.message;
          this.api
            .exec<any>('DP', 'ActivitiesBusiness', 'EditActivitiesAsync', [
              activitie,
              this.entityName,
            ])
            .subscribe((res) => {
              if (res) {
                let index = this.listActivitie?.findIndex(
                  (activitie) => activitie.recID == res.recID
                );
                this.listActivitie?.splice(index, 1, res);
                this.notiService.notifyCode('SYS007');
                this.changeDetectorRef.markForCheck();
              }
            });
        }
        this.changeDetectorRef.markForCheck();
      }
    });
  }
  setRole(task) {
    let role = new DP_Activities_Roles();
    role.recID = Util.uid();
    role.objectName = this.user?.userName;
    role.objectID = this.user?.userID;
    role.createdOn = new Date();
    role.createdBy = this.user?.userID;
    role.roleType = 'O';
    role.objectType = this.user?.objectType;
    task.owner = role.objectID;
    task.roles = [role];
    return role;
  }
  //#endregion
}
