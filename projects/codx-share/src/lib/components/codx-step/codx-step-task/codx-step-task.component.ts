import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, FormModel, NotificationsService, SidebarModel, Util } from 'codx-core';

import { firstValueFrom } from 'rxjs';
import { CodxTypeTaskComponent } from '../codx-type-task/codx-type-task.component';
import { CodxAddTaskComponent } from '../codx-add-stask/codx-add-task.component';
import { TM_Tasks } from '../../codx-tasks/model/task.model';
import { AssignTaskModel } from '../../../models/assign-task.model';
import { AssignInfoComponent } from '../../assign-info/assign-info.component';
import { DP_Instances_Steps_Tasks } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'codx-step-task',
  templateUrl: './codx-step-task.component.html',
  styleUrls: ['./codx-step-task.component.scss']
})
export class CodxStepTaskComponent implements OnInit, OnChanges {
  @Input() formModel: FormModel;
  @Input() stepId: any;
  @Input() dataSources: any;
  @Input() isLockSuccess = false;
  @Input() isSaveProgress = true;
  @Input() isShowMore = true;
  @Input() isShowButton = true;
  @Input() isShowFile = true;
  @Input() isShowComment = true;
  @Input() typeProgress = 1;

  @Input() isOnlyView = false;
  @Input() isEditTimeDefault = true;
  @Input() isUpdateProgressGroup = true;

  @Output() valueChangeProgress = new EventEmitter<any>();
  id = ''
  currentStep: any;
  isUpdate;
  user: any;
  dateFomat = 'dd/MM/yyyy';
  dateTimeFomat = 'HH:mm - dd/MM/yyyy';
  isRoleAll = false;
  listTaskType = [];
  listTask = [];
  listGroupTask = [];
  grvMoreFunction: FormModel;

  taskType: any;
  frmModelInstancesGroup:FormModel;
  frmModelInstancesTask:FormModel;

  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };

  constructor(
    private callfc: CallFuncService,
    private notiService: NotificationsService,
    private cache: CacheService,
    private authStore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
  ) {
    this.user = this.authStore.get();
    this.id = Util.uid();
  }

  async ngOnInit(): Promise<void> {
    this.grvMoreFunction = await this.getFormModel('DPT040102');
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTaskType = res?.datas;
      }
    });
    this.frmModelInstancesGroup = {
      entityName: 'DP_Instances_Steps_TaskGroups',
      formName: 'DPInstancesStepsTaskGroups',
      gridViewName: 'grvDPInstancesStepsTaskGroups',
    };
    this.frmModelInstancesTask = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      funcID: 'DPT040102',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.grvMoreFunction = await this.getFormModel('DPT040102');
    await this.getStepById(this.stepId);
    if(this.isLockSuccess){
      await this.removeSuccess();
    }
  }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = {}
    formModel['formName'] = f?.formName;
    formModel['gridViewName'] = f?.gridViewName;
    formModel['entityName'] = f?.entityName;
    formModel['funcID'] = functionID;
    return formModel;
  }

  removeSuccess() {
    if (this.listGroupTask?.length > 0) {
      for (let i = 0; i < this.listGroupTask.length;) {
        if (this.listGroupTask[i]?.task?.length > 0) {
          for (let j = 0; j < this.listGroupTask[i]?.task.length;) {
            let task = this.listGroupTask[i]?.task[j];
            if (task?.progress == 100) {
              this.listGroupTask[i]?.task.splice(j, 1)
            } else {
              ++j
            }
          }
        }
        if (this.listGroupTask[i]?.progress == 100 && this.listGroupTask[i]?.task?.length == 0) {
          this.listGroupTask?.splice(i, 1);
        }else {
          i++
        }
      }
    }
  }

  async getStepById(stepId: string) {
    if (this.stepId) {
      this.currentStep = await firstValueFrom(this.api.exec<any>('DP', 'InstanceStepsBusiness', 'GetStepByIdAsync', stepId));
    } else {
      this.currentStep = JSON.parse(JSON.stringify(this.dataSources));
    }
    const taskGroupList = this.currentStep?.tasks.reduce((group, product) => {
      const { taskGroupID } = product;
      group[taskGroupID] = group[taskGroupID] ?? [];
      group[taskGroupID].push(product);
      return group;
    }, {});
    const taskGroupConvert = this.currentStep['taskGroups'].map((taskGroup) => {
      let task = taskGroupList[taskGroup['refID']] ?? [];
      return {
        ...taskGroup,
        task: task.sort((a, b) => a['indexNo'] - b['indexNo']),
      };
    });
    this.currentStep['taskGroups'] = taskGroupConvert;
    this.listGroupTask = this.currentStep['taskGroups'];
    if (this.currentStep['taskGroups']?.length > 0 || this.currentStep['tasks']?.length > 0) {
      let taskGroup = {};
      taskGroup['task'] =
        taskGroupList['null']?.sort((a, b) => a['indexNo'] - b['indexNo']) ||
        [];
      taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
      this.listGroupTask.push(taskGroup);
    }
    this.listTask = this.currentStep['tasks'];
  }

  toggleTask(e, idGroup) {
    let elementGroup = document.getElementById(idGroup.toString());
    // let elementGroup = document.querySelector('#' + this.id + '#' + idGroup.toString() );
    let children = e.currentTarget.children[0];
    let isClose = elementGroup.classList.contains('hiddenTask');
    if (isClose) {
      elementGroup.classList.remove('hiddenTask');
      elementGroup.classList.add('showTask');
      children.classList.remove('icon-add');
      children.classList.add('icon-horizontal_rule');
    } else {
      elementGroup.classList.remove('showTask');
      elementGroup.classList.add('hiddenTask');
      children.classList.remove('icon-horizontal_rule');
      children.classList.add('icon-add');
    }
  }

  checRoleTask(data, type) {
    return (
      data.roles?.some(
        (element) =>
          element?.objectID == this.user.userID && element.roleType == type
      ) || false
    );
  }

  getIconTask(task) {
    let color = this.listTaskType?.find((x) => x.value === task.taskType);
    return color?.icon;
  }
  getColor(task) {
    let color = this.listTaskType?.find((x) => x.value === task.taskType);
    return { 'background-color': color?.color };
  }

  checkExitsParentID(taskList, task): string {
    if (task?.requireCompleted) {
      return 'text-red';
    }
    let check = 'd-none';
    if (task['groupTaskID']) {
      taskList?.forEach((taskItem) => {
        if (taskItem['parentID']?.includes(task['refID'])) {
          check = 'text-orange';
        }
      });
    } else {
      this.listTask?.forEach((taskItem) => {
        if (taskItem['parentID']?.includes(task['refID'])) {
          check = 'text-orange';
        }
      });
    }
    return check;
  }

  getRole(task, type) {
    let role = task?.roles.find((role) => role.roleType == 'O') || task?.roles[0];
    return type == "ID" ? role?.objectID : role?.objectName;
  }

  changeProgress(event) {
    if (event) {  
      this.updateProgress(event)
      this.valueChangeProgress.emit(event);
    }
  }

  updateProgress(event){
    if (event.type == 'P') {//step
      this.currentStep['progress'] = event?.progressStep;
    } else if (event.type == 'G') { // group
      this.listGroupTask?.forEach(group => {
        if (group.recID == event.groupTaskID) {
          group['progress'] = event.progressGroupTask;
        }
      });
      if (event.isUpdate) {
        this.currentStep['progress'] = event?.progressStep;
      }
    } else {//task
      this.listGroupTask?.forEach(group => {
        if (group.refID == event.groupTaskID) {
          group?.task?.forEach(task => {
            if (task.recID == event.taskID) {
              task['progress'] = event.progressTask;
            }
          });
          if (event.isUpdate) {
            group['progress'] = event.progressGroupTask;
          }
        }
      });
      if (event.isUpdate) {
        this.currentStep['progress'] = event?.progressStep;
      }
    }
  }  

  async drop(event: CdkDragDrop<string[]>, data = null, isParent = false) {
  }

  // more functions
  async changeDataMFTask(event, task, groupTask) {
    if (event != null) {
      let isGroup = false;
      let isTask = false;
      if (!this.isRoleAll) {
        isGroup = this.checRoleTask(groupTask, 'O');
        if (!isGroup) {
          isTask = this.checRoleTask(task, 'O');
        }
      }
      event.forEach((res) => {
        switch (res.functionID) {
          case 'SYS02': //xóa
            if (!(!task?.isTaskDefault && (this.isRoleAll || isGroup) && this.isOnlyView)) {
              res.disabled = true;
            }
            break;
          case 'SYS03': //sửa
            if (!this.isOnlyView) {
              res.disabled = true;
            } else {
              if (!(this.isRoleAll || isGroup || isTask)) {
                res.disabled = true;
              } else {
                if (task?.isTaskDefault && !this.isEditTimeDefault) {
                  res.disabled = true;
                }
              }
            }
            break;
          case 'SYS04': //copy
            if (!((this.isRoleAll || isGroup) && this.isOnlyView)) {
              res.disabled = true;
            }
            break;
          case 'SYS003': //đính kèm file
            if (!task?.isTaskDefault && !this.isOnlyView) {
              res.isblur = true;
            }
            break;
          case 'DP20': // tiến độ
            if (!((this.isRoleAll || isGroup || isTask) && this.isOnlyView)) {
              res.isblur = true;
            }
            break;
          case 'DP13': //giao việc
            if (!(task?.createTask && this.isOnlyView && (this.isRoleAll || isGroup || isTask))) {
              res.isblur = true;
            }
            break;
          case 'DP12':
            res.disabled = true;
            break;
          case 'DP08':
            res.disabled = true;
            break;
        }
      });
    }
  }

  async changeDataMFGroupTask(event, group) {
    if (event != null) {
      let isGroup = false;
      if (!this.isRoleAll) {
        isGroup = this.checRoleTask(group, 'O');
      }
      event.forEach((res) => {
        switch (res.functionID) {
          case 'DP13':
          case 'DP07':
            res.disabled = true;
            break;
          case 'SYS02': //xóa
            if (!(!group?.isTaskDefault && (this.isRoleAll ||isGroup ) && this.isOnlyView)) {
              res.disabled = true;
            }
            break;
          case 'SYS04': //copy
            if (!this.isRoleAll || !this.isOnlyView) {
              res.disabled = true;
            }
            break;
          case 'SYS03': //sửa
            if (!this.isOnlyView) {
              res.disabled = true;
            } else {
              if (!(this.isRoleAll || isGroup)) {
                res.disabled = true;
              } else {
                if (group?.isTaskDefault && !this.isEditTimeDefault) {
                  res.disabled = true;
                }
              }
            }
            break;
          case 'SYS003': //đính kèm file
            if (group?.isTaskDefault && !this.isOnlyView) {
              res.isblur = true;
            }
            break;
          case 'DP08': // thêm công việc
            if (!((this.isRoleAll || isGroup) && this.isOnlyView)) {
              res.isblur = true;
            }
            break;
          case 'DP20': // tiến độ
            if (!(this.isUpdateProgressGroup && (this.isRoleAll || isGroup) && this.isOnlyView)) {
              res.isblur = true;
            }
            break;
        }
      });
    }
  }

  clickMFTask(e: any, groupTask: any, task?: any) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteTask(task);
        break;
      case 'SYS03'://edit
        this.editTask(task);
        break;
      case 'SYS04': //copy
        this.copyTask(task);
        // this.addTask(groupTask);
        break;
      case 'DP07': // view
        this.viewTask(task);
        break;
      case 'DP13': //giao viec
        this.assignTask(e.data, task);
        break;
      case 'DP20': // tien do
        // this.openUpdateProgress(task);
        break;
    }
  }

  clickMFTaskGroup(e: any, data?: any) {
    // switch (e.functionID) {
    //   case 'SYS02':
    //     this.deleteGroupTask(data);
    //     break;
    //   case 'SYS03':
    //     this.openPopupTaskGroup(data, 'edit');
    //     break;
    //   case 'SYS04':
    //     this.openPopupTaskGroup(data, 'copy');
    //     break;
    //   case 'DP08':
    //     this.groupTaskID = data?.refID;
    //     this.openTypeTask();
    //     break;
    //   case 'DP12':
    //     this.viewTask(data, 'G');
    //     break;
    //   case 'DP20':
    //     this.openUpdateProgress(data);
    //     break;
    // }
  }

  //task
  async chooseTypeTask() {
    let popupTypeTask = this.callfc.openForm(CodxTypeTaskComponent, '', 400, 400);
    let dataOutput = await firstValueFrom(popupTypeTask.closed);
    return dataOutput?.event?.value ? dataOutput?.event : null;
  }

  async addTask(groupID){
    this.taskType = await this.chooseTypeTask();
    let task = new DP_Instances_Steps_Tasks();
    task['taskType'] = this.taskType;
    task['stepID'] = this.currentStep?.recID;
    task['progress'] = 0;
    task['taskGroupID'] = groupID || null;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;

    let taskOutput = await this.openPopupTask('add',task);
    console.log(taskOutput);
    
  }

  async editTask(task){
    if(task){
      let taskEdit = JSON.parse(JSON.stringify(task));
      this.taskType = this.listTaskType.find(type => type.value == taskEdit?.taskType)
      let taskOutput = await this.openPopupTask('edit',taskEdit);
    }
  }
  
  async copyTask(task){
    if(task){
      let taskCopy = JSON.parse(JSON.stringify(task));
      taskCopy.recID = Util.uid();
      taskCopy.refID = Util.uid();
      task['isTaskDefault'] = false;
      this.taskType = this.listTaskType.find(type => type.value == taskCopy?.taskType)
      let taskOutput = await this.openPopupTask('copy',taskCopy);

      if(taskOutput?.event.task){
        let data = taskOutput?.event;
        this.currentStep?.tasks?.push(data.task);
        this.currentStep['progress'] = data.progressStep;
        let group = this.listGroupTask.find(group => group.refID == data.task.taskGroupID);
        if(group){
          group?.task.push(data.task);
          group['progress'] = data.progressGroup;
        }
      }
    }
  }
   
  deleteTask(task){
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.api.exec<any>(
          'DP',
          'InstanceStepsBusiness',
          'DeleteTaskStepAsync',
          task
        ).subscribe(data => {
          if(data){
            let indexTask = this.currentStep?.tasks?.findIndex(taskFind => taskFind.recID == task.recID);
            let group = this.listGroupTask.find(group => group.refID == task.taskGroupID);
            let indexTaskGroup = -1;
            if(group?.task?.length > 0){
              indexTaskGroup = group?.task?.findIndex(taskFind => taskFind.recID == task.recID);
            }
            if(indexTask >= 0){
              this.currentStep?.tasks?.splice(indexTask,1);
            }
            if(indexTaskGroup >= 0){
              group?.task?.splice(indexTaskGroup,1);
            }            
            if(group){
              group['progress'] = data[0];
            }
            this.currentStep['progress'] = data[1];
          }
        })
      }
    })
   
  }

  async openPopupTask(action, dataTask) {
    let dataInput = {
      action,
      taskType: this.taskType,
      step: this.currentStep,
      listGroup: this.listGroupTask,
      dataTask: dataTask || {},
      listTask: this.listTask,
      isEditTimeDefault:this.currentStep?.leadtimeControl,
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
    let popupTask = this.callfc.openSide(CodxAddTaskComponent, dataInput, option);
    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    return dataPopupOutput;
  }
   //giao viec
   assignTask(moreFunc, data) {
    var task = new TM_Tasks();
    task.taskName = data.taskName;
    task.refID = data?.recID;
    task.refType = 'DP_Instance';
    task.dueDate = data?.endDate;
    let assignModel: AssignTaskModel = {
      vllRole: 'TM001',
      title: moreFunc.customName,
      vllShare: 'TM003',
      task: task,
    };
    let option = new SidebarModel();
    option.FormModel = this.frmModelInstancesTask;
    option.Width = '550px';
    var dialogAssign = this.callfc.openSide(
      AssignInfoComponent,
      assignModel,
      option
    );
    dialogAssign.closed.subscribe((e) => {
      var doneSave = false;
      if (e && e.event != null) {
        doneSave = true;
      }
      // this.saveAssign.emit(doneSave);
    });
  }
  //group task
  addGroupTask(){

  }

  // view
  viewTask(data){

  }
}
