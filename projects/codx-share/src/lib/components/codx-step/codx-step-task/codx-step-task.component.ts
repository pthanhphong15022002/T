import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, FormModel, NotificationsService, SidebarModel, Util } from 'codx-core';

import { firstValueFrom } from 'rxjs';
import { CodxTypeTaskComponent } from '../codx-type-task/codx-type-task.component';
import { CodxAddTaskComponent } from '../codx-add-stask/codx-add-task.component';
import { TM_Tasks } from '../../codx-tasks/model/task.model';
import { AssignTaskModel } from '../../../models/assign-task.model';
import { AssignInfoComponent } from '../../assign-info/assign-info.component';
import { DP_Instances_Steps_TaskGroups, DP_Instances_Steps_Tasks } from 'projects/codx-dp/src/lib/models/models';
import { CodxAddGroupTaskComponent } from '../codx-add-group-task/codx-add-group-task.component';
import { UpdateProgressComponent } from '../codx-progress/codx-progress.component';

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
  @Input() isDeepCopy = true;
  @Input() typeProgress = 1;

  @Input() isOnlyView = true;
  @Input() isEditTimeDefault = true;
  @Input() isUpdateProgressGroup = true;
  @Input() isRoleAll = true;
  @Output() valueChangeProgress = new EventEmitter<any>();
  id = ''
  currentStep: any;
  isUpdate;
  user: any;
  dateFomat = 'dd/MM/yyyy';
  dateTimeFomat = 'HH:mm - dd/MM/yyyy';
  listTaskType = [];
  listTask = [];
  listGroupTask = [];
  grvMoreFunction: FormModel;

  taskType: any;
  frmModelInstancesGroup:FormModel;
  frmModelInstancesTask:FormModel;

  isOpenPopupProgress = false;
  dataPopupProgress:any;

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
      this.currentStep = this.isDeepCopy ? JSON.parse(JSON.stringify(this.dataSources)) : this.dataSources;
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
    // this.currentStep['taskGroups'] = taskGroupConvert;
    this.listGroupTask = taskGroupConvert;
    if (taskGroupList['null']) {
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

  // changeProgress(event) {
  //   if (event) {  
  //     this.updateProgress(event)
  //     this.valueChangeProgress.emit(event);
  //   }
  // }

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
        this.openPopupUpdateProgress(task,'T');
        break;
    }
  }

  clickMFTaskGroup(e: any, group: any) {
    switch (e.functionID) {
      case 'SYS02': //delete
        this.deleteGroupTask(group);
        break;
      case 'SYS03': //edit
        this.editGroupTask(group);
        break;
      case 'SYS04': //copy
        this.copyGroupTask(group);
        break;
      case 'DP08': //them task
        // this.groupTaskID = group?.refID;
        // this.openTypeTask();
        break;
      case 'DP12':
        // this.viewTask(group, 'G');
        break;
      case 'DP20': //Progress
      this.openPopupUpdateProgress(group,'T');
        break;
    }
  }
  //task
  async chooseTypeTask() {
    let popupTypeTask = this.callfc.openForm(CodxTypeTaskComponent, '', 400, 400);
    let dataOutput = await firstValueFrom(popupTypeTask.closed);
    return dataOutput?.event?.value ? dataOutput?.event : null;
  }

  async addTask(groupID){
    this.taskType = await this.chooseTypeTask();
    if(!this.taskType) return;
    let task = new DP_Instances_Steps_Tasks();
    task['taskType'] = this.taskType?.value;
    task['stepID'] = this.currentStep?.recID;
    task['progress'] = 0;
    task['taskGroupID'] = groupID || null;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;

    let taskOutput = await this.openPopupTask('add',task);
    if(taskOutput?.event.task){
      let data = taskOutput?.event;
      let groupData = this.currentStep?.taskGroups.find(group => group.refID == data.task.taskGroupID);
      let group = this.listGroupTask.find(group => group.refID == data.task.taskGroupID);
      
      if(group){
        group?.task?.push(data.task)
        group['progress'] = JSON.parse(JSON.stringify(data.progressGroup)) ;
      }       
      if(groupData){
        groupData['progress'] = data.progressGroup;
      }
      this.currentStep?.tasks?.push(data.task);      
      this.currentStep['progress'] = data?.progressStep;
      this.changeDetectorRef.detectChanges();
    }
    
  }

  async editTask(task){
    if(task){
      let taskEdit = JSON.parse(JSON.stringify(task));
      this.taskType = this.listTaskType.find(type => type.value == taskEdit?.taskType)
      let taskOutput = await this.openPopupTask('edit',taskEdit);
      if(taskOutput?.event.task){
        let data = taskOutput?.event;
        let group = this.listGroupTask.find(group => group.refID == data.task.taskGroupID);
        let indexTask = this.currentStep?.tasks?.findIndex(taskFind => taskFind.recID == task.recID);
        if(group){
          let index = group?.task?.findIndex(taskFind => taskFind.recID == task.recID);
          if(index >=0){
            group?.task?.splice(index,1,data?.task);
          }
        }
        if(indexTask >= 0){
          this.currentStep?.tasks?.splice(indexTask,1,data?.task);
        }
        
      }
    }
  }
  
  async copyTask(task){
    if(task){
      let taskCopy = JSON.parse(JSON.stringify(task));
      taskCopy.recID = Util.uid();
      taskCopy.refID = Util.uid();
      taskCopy['progress'] = 0;
      taskCopy['isTaskDefault'] = false;
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
            let groupData = this.currentStep?.taskGroups?.find(group => group.refID == task.taskGroupID);
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
            if(groupData){
              groupData['progress'] = data[0];
            }
            this.currentStep['progress'] = data[1];
          }
        })
      }
    })
   
  }

  async openPopupTask(action, dataTask, groupTaskID = null) {
    let dataInput = {
      action,
      taskType: this.taskType,
      step: this.currentStep,
      listGroup: this.listGroupTask,
      dataTask: dataTask || {},
      listTask: this.listTask,
      isEditTimeDefault:this.currentStep?.leadtimeControl,
      groupTaskID, // trường hợp chọn thêm từ nhóm
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
  async addGroupTask(){
    let taskGroup = new DP_Instances_Steps_TaskGroups();
    taskGroup.recID = Util.uid();
    taskGroup.refID = Util.uid();
    taskGroup['isTaskDefault'] = false;
    taskGroup['progress'] = 0;
    taskGroup['stepID'] = this.currentStep['recID'];

    let taskBeforeIndex = -1;
    for(let i = this.listGroupTask?.length -1; i >= 0 ; i--){
      if(this.listGroupTask[i]?.recID){
        taskBeforeIndex = i;
        break;
      }
    }
    if(taskBeforeIndex >=0 ){
      taskGroup['startDate'] = this.listGroupTask[taskBeforeIndex]?.endDate || this.currentStep?.startDate;
      taskGroup['indexNo'] = taskBeforeIndex + 1;
    }
    let taskOutput = await this.openPopupGroup('add',taskGroup);
    if(taskOutput?.event.groupTask){
      let data = taskOutput?.event;
      this.currentStep?.taskGroups?.push(data.groupTask);
      this.listGroupTask.splice(taskBeforeIndex + 1,0,data.groupTask)
      this.currentStep['progress'] = data.progressStep;
    }
  }

  async copyGroupTask(group){
    if(group){
      let groupCopy = JSON.parse(JSON.stringify(group));
      let taskBeforeIndex = -1;
      for(let i = this.listGroupTask?.length -1; i >= 0 ; i--){
        if(this.listGroupTask[i]?.recID){
          taskBeforeIndex = i;
          break;
        }
      }
      if(taskBeforeIndex >=0 ){
        groupCopy['startDate'] = this.listGroupTask[taskBeforeIndex]?.endDate || this.currentStep?.startDate;
        groupCopy['endDate'] = null;
        groupCopy['indexNo'] = taskBeforeIndex + 1;
      }
      groupCopy['isTaskDefault'] = false;
      let taskOutput = await this.openPopupGroup('copy',groupCopy);                
      if(taskOutput?.event.groupTask){
        let data = taskOutput?.event;
        this.currentStep?.taskGroups?.push(data.groupTask);
        this.currentStep.tasks = data?.listTask?.lenght > 0 ? [...this.currentStep?.tasks,...data?.listTask] : this.currentStep.tasks;
        let groupCopyView = JSON.parse(JSON.stringify(data.groupTask));
        groupCopyView['task'] = data?.listTask || [];
        this.listGroupTask.splice(taskBeforeIndex + 1,0,groupCopyView);
        this.currentStep['progress'] = data.progressStep;
      }
    }
  }
  async editGroupTask(group){
    if(group){
      let groupEdit = JSON.parse(JSON.stringify(group));
      let task = groupEdit?.task || [];
      delete groupEdit?.task;
      let groupOutput = await this.openPopupGroup('edit',groupEdit);

      if(groupOutput?.event.groupTask){
        let data = groupOutput?.event;
        let index = this.currentStep?.taskGroups?.findIndex(groupFind => groupFind.recID == data?.groupTask?.recID);
        let indexView = this.listGroupTask?.findIndex(groupFind => groupFind.recID == data?.groupTask?.recID);
        if(index >= 0 && indexView >= 0){
          this.currentStep?.taskGroups?.splice(index,1,data?.groupTask);
          group['endDate'] = data?.groupTask?.endDate;
          group['modifiedOn'] = data?.groupTask?.modifiedOn;
          group['modifiedBy'] = data?.groupTask?.modifiedBy;
          group['durationDay'] = data?.groupTask?.durationDay;
          group['durationHour'] = data?.groupTask?.durationHour;
          if(!group?.isTaskDefault){
            group['taskGroupName'] = data?.groupTask?.taskGroupName;
            group['memo'] = data?.groupTask?.memo;
          }
          // let groupView = JSON.parse(JSON.stringify(data?.groupTask));
          // groupView['task'] = task;
          // this.listGroupTask?.splice(indexView,1,groupView)
        }
      }
    }
  }
  deleteGroupTask(group){
    if(!group.recID && !group.stepID) return;
    let data = [group.recID,group.stepID]
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.api.exec<any>(
          'DP',
          'InstanceStepsBusiness',
          'DeleteGroupTaskStepAsync',
          data
        ).subscribe(res => {
          if(res){
            let index = this.currentStep?.taskGroups?.findIndex(groupFind => groupFind.recID == group.recID);
            let indexView = this.listGroupTask?.findIndex(groupFind => groupFind.recID == group.recID);
            if(index >= 0 && indexView >= 0){
              this.currentStep?.taskGroups?.splice(index,1); 
              this.listGroupTask?.splice(indexView,1); 
            }
            if(this.currentStep?.tasks?.length > 0){
              for(let i = 0; i < this.currentStep?.tasks?.length; ){
                if(this.currentStep?.tasks[i]?.taskGroupID == group?.refID){
                  this.currentStep?.tasks.splice(i,1);
                }else{
                  i++;
                }
              }
            }
          }else{

          }
        })
      }
    })
  }

  async openPopupGroup(action, group) {
    let dataInput = {
      action,
      step: this.currentStep,
      dataGroup: group || {},
      isEditTimeDefault:this.currentStep?.leadtimeControl,
    };
    let popupTask = this.callfc.openForm(
      CodxAddGroupTaskComponent,'',
      500,
      500,
      '', 
      dataInput);

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    return dataPopupOutput;
  }
  // view
  viewTask(data){

  }
  async openPopupUpdateProgress(data, type){
    let dataInput = {
      data,
      type,
      step: this.currentStep,
    };
    let popupTask = this.callfc.openForm(
      UpdateProgressComponent,'',
      550, 400,
      '', 
      dataInput);

    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    let dataProgress = dataPopupOutput?.event;
    if(dataProgress){
      if(dataProgress?.type == 'T'){
        data.progress = dataProgress?.progressTask;
        data.note = dataProgress?.note;
        data.actualEnd = dataProgress?.actualEnd;
        if(dataProgress?.isUpdate){
          
        }
      }
      if(dataProgress?.type == 'G'){
        data.progress = dataProgress?.progressGroupTask;
      }
      if(dataProgress?.type == 'P'){
        data.progress = dataProgress?.progressStep;
      }
    }    
    return dataPopupOutput;
  }
}
