import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  FormModel,
  NotificationsService,
  SidebarModel,
  Util,
} from 'codx-core';
import {
  DP_Activities,
  DP_Activities_Roles,
  DP_Instances_Steps_Tasks,
} from 'projects/codx-dp/src/lib/models/models';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { CodxAddTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-add-stask/codx-add-task.component';
import { UpdateProgressComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-progress/codx-progress.component';
import { CodxTypeTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-type-task/codx-type-task.component';
import { CodxViewTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-view-task/codx-view-task.component';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';
import { AssignTaskModel } from 'projects/codx-share/src/lib/models/assign-task.model';
import { TM_Tasks } from 'projects/codx-tm/src/lib/models/TM_Tasks.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() customerID: string;
  @Input() owner: string;
  @Input() isPause = false;
  @Input() entityName = '';
  @Output() saveAssign = new EventEmitter<any>(); 
  activitie: DP_Activities = new DP_Activities();
  listActivitie: DP_Activities[] = [];
  taskType;
  listTaskType = [];
  grvMoreFunction: FormModel;
  isNoData = false;
  titleName = '';
  vllData;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private stepService: StepService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.customerID) {
      this.getActivities();
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
      .exec<any>('DP', 'InstanceStepsBusiness', 'GetActivitiesAsync', [
        this.customerID,
      ])
      .subscribe((res) => {
        if (res?.length > 0) {
          this.listActivitie = res;
          this.isNoData = false;
        } else {
          this.listActivitie = [];
          this.isNoData = true;
        }
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

  getRole(task, type) {
    let role =
      task?.roles.find((role) => role.roleType == 'O') || task?.roles[0];
    return type == 'ID' ? role?.objectID : role?.objectName;
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
        switch (res.functionID) {
          case 'SYS02': //xóa
            break;
          case 'SYS03': //sửa
            break;
          case 'SYS04': //copy
            break;
          case 'DP25':
          case 'DP20':
          case 'DP26':
          case 'SYS003': //đính kèm file
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
            res.disabled = true;
            break;
          case 'DP13': //giao việc
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
          case 'DP24':
            if (task.taskType != 'M'){
              res.disabled = true;
            }else{
              task?.status == '1' && (res.isblur = true);
            } 
            break;

          case 'DP27': // đặt xe
            if (task?.taskType != 'B' ||(task?.taskType == 'B' && task?.actionStatus == '2')){
              res.disabled = true;
            }else{
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
            if (task?.status != '1') {
              res.disabled = true;
            }
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
      // case 'DP24': // tạo lịch họp
      //   this.createMeeting(task);
      //   break;
      // case 'SYS004':
      //   this.sendMail();
      //   break;
      case 'DP27':
        await this.stepService.addBookingCar(true);
        break;
      case 'DP31':
        this.startActivitie(task);
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
    let task = new DP_Instances_Steps_Tasks();
    task['progress'] = 0;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;
    task['taskType'] = this.taskType?.value;

    let taskOutput = await this.openPopupTask('add', task);
    if (taskOutput?.event) {
      let data = taskOutput?.event;
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
      this.activitie.objectID = this.customerID;
      this.activitie.status = '1';
      this.api
        .exec<any>('DP', 'InstanceStepsBusiness', 'AddActivitiesAsync', [
          this.activitie,this.entityName
        ])
        .subscribe((res) => {
          if (res) {
            this.listActivitie.push(res);
            this.isNoData = false;
            this.notiService.notifyCode('SYS006');
            this.detectorRef.detectChanges();
          }
        });
    }
  }

  async editTask(task) {
    this.getTypeTask(task);
    let taskOutput = await this.openPopupTask('edit', task);
    if (taskOutput?.event) {
      if (!taskOutput?.event?.objectID) {
        task['objectID'] = this.customerID;
      }
      this.api
        .exec<any>('DP', 'InstanceStepsBusiness', 'EditActivitiesAsync', [
          taskOutput?.event, this.entityName
        ])
        .subscribe((res) => {
          if (res) {
            let index = this.listActivitie?.findIndex(
              (activitie) => activitie.recID == res.recID
            );
            this.listActivitie?.splice(index, 1, res);
            this.notiService.notifyCode('SYS007');
            this.detectorRef.detectChanges();
          }
        });
    }
  }
  deleteTask(task) {
    if (!task?.recID) {
      return;
    }
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.api
          .exec<any>('DP', 'InstanceStepsBusiness', 'DeleteActivitiesAsync', [
            task?.recID,this.entityName
          ])
          .subscribe((res) => {
            if (res) {
              let index = this.listActivitie?.findIndex(
                (activitie) => activitie.recID == task.recID
              );
              this.listActivitie?.splice(index, 1);
              this.notiService.notifyCode('SYS008');
              this.detectorRef.detectChanges();
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
    delete dataCopy?.id;
    dataCopy['modifiedOn'] = null;
    dataCopy['modifiedBy'] = null;

    let taskOutput = await this.openPopupTask('copy', dataCopy);
    if (taskOutput?.event) {
      let data = taskOutput?.event;
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
      this.activitie.objectID = this.customerID;
      this.activitie.status = '1';

      this.api
        .exec<any>('DP', 'InstanceStepsBusiness', 'AddActivitiesAsync', [this.activitie])
        .subscribe((res) => {
          if (res) {
            this.listActivitie.push(res);
            this.notiService.notifyCode('SYS006');
            this.detectorRef.detectChanges();
          }
        });
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
      { isShowGroup: false }
    );
    let dataOutput = await firstValueFrom(popupTypeTask.closed);
    if (dataOutput?.event?.value) {
      this.taskType = dataOutput?.event;
      this.addTask();
    }
  }
  async openPopupTask(action, dataTask, groupTaskID = null) {
    let dataInput = {
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
      owner: this.owner,
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
    if (this.isPause) {
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
          'InstanceStepsBusiness',
          'UpdateProgressActivitiesAsync',
          data
        )
        .subscribe((res) => {
          if (res) {
            task.progress = dataPopupOutput?.event?.progressTask;
            task.status = task.progress == 100 ? "3" : "2";
            this.listActivitie;
            this.notiService.notifyCode('SYS007');
            this.detectorRef.detectChanges();
          }
        });
    }
    return dataPopupOutput;
  }
  //#endregion

  //#region view
  viewTask(data, type) {
    if (data) {
      let frmModel: FormModel = {
        entityName: 'DP_Instances_Steps_Tasks',
        formName: 'DPInstancesStepsTasks',
        gridViewName: 'grvDPInstancesStepsTasks',
      };
      //a thao laasy refID
      let listRefIDAssign = '';
      switch (type) {
        case 'T':
          listRefIDAssign = data.recID;
          break;
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
  //#endregion
  
  startActivitie(activitie) {
    if (activitie?.taskType == 'Q') {
      //báo giá
      this.stepService.addQuotation();
    } else if (activitie?.taskType == 'CO') {
      // hợp đồng
      this.stepService.openPopupContract('add');
    }
    this.api
      .exec<any>('DP', 'InstanceStepsBusiness', 'StartActivitiesAsync', [
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

  setNameTypeTask(taskType){
    let type = this.listTaskType?.find(task => task?.value == taskType);
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
    task.refType = 'DP_Instances_Steps_Tasks';
    task.dueDate = data?.endDate;
    task.sessionID = this.customerID;
    let dataReferences = [
      {
        recIDReferences: data.recID,
        refType: 'DP_Instances_Steps_Tasks',
        createdOn: data.createdOn,
        memo: data.taskName,
        createdBy: data.createdBy,
      },
    ];
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
            'InstanceStepsBusiness',
            'UpdatedAssignedStepTasksAsync',
            [data.stepID, data.recID]
          )
          .subscribe();
      }
      this.saveAssign.emit(doneSave);
    });
  }
  //#endregion
}
