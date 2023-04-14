import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, FormModel, NotificationsService } from 'codx-core';
import { CodxDpService } from 'projects/codx-dp/src/public-api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'codx-task',
  templateUrl: './codx-task.component.html',
  styleUrls: ['./codx-task.component.scss']
})
export class CodxTaskComponent implements OnInit{
  @Input() formModel: FormModel;
  @Input() stepId: any;
  @Input() dataSources: any;
  currentStep: any;
  isUpdate;
  user: any;
  dateFomat = 'dd/MM/yyyy';
  dateTimeFomat = 'HH:mm - dd/MM/yyyy';
  isRoleAll = false;
  listTypeTask = [];
  taskList = [];
  taskGroupList = [];
  

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
    private dpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
  ) {
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    this.getStepById(this.stepId);

    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
   
  }

  async getStepById(stepId: string){
    if(this.stepId){
      this.currentStep = await firstValueFrom(this.api.exec<any>('DP','InstanceStepsBusiness','GetStepByIdAsync',stepId));
    }else{
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
    this.taskGroupList = this.currentStep['taskGroups'];
    if (this.currentStep['taskGroups']?.length > 0 || this.currentStep['tasks']?.length > 0) {
      let taskGroup = {};
      taskGroup['task'] =
        taskGroupList['null']?.sort((a, b) => a['indexNo'] - b['indexNo']) ||
        [];
      taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
      this.taskGroupList.push(taskGroup);
    }
    this.taskList = this.currentStep['tasks'];
  }

  toggleTask(e, id) {
    let elementGroup = document.getElementById('group' + id.toString());
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
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return color?.icon;
  }
  getColor(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
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
      this.taskList?.forEach((taskItem) => {
        if (taskItem['parentID']?.includes(task['refID'])) {
          check = 'text-orange';
        }
      });
    }
    return check;
  }

  getObjectIdRole(task, group) {
    if (task?.taskType != 'M' && group) {
      let objectId =
        task?.roles.find((role) => role?.roleType == 'P')['objectID'] ||
        task?.roles[0]?.objectID;
      return objectId;
    } else {
      let objectId =
        task?.roles.find((role) => role?.roleType == 'O')['objectID'] ||
        task?.roles[0]?.objectID;
      return objectId;
    }
  }
  getObjectNameRole(task, group) {
    if (task?.taskType != 'M' && group) {
      let objectName =
        task?.roles.find((role) => role?.roleType == 'P')['objectName'] ||
        task?.roles[0]?.objectName;
      return objectName;
    } else {
      let objectName =
        task?.roles.find((role) => role?.roleType == 'O')['objectName'] ||
        task?.roles[0]?.objectName;
      return objectName;
    }
  }

  changeProgress(event){
    console.log(event);
    return
    if(event){
      if(event.type == 'P'){//step
        this.currentStep['progress'] = event?.progressStep;
      }else if(event.type == 'G'){ // group
        this.taskGroupList?.forEach(group => {
          if(group.recID == event.groupTaskID){
            group['progress'] = event.progressGroupTask;
          }
        });      
        if(event.isUpdate){
          this.currentStep['progress'] = event?.progressStep;
        }
      }else{//task
        this.taskGroupList?.forEach(group => {
          if(group.recID == event.groupTaskID){
            group?.task?.forEach(task => {
              if(task.recID == event.taskID){
                task['progress'] = event.progressTask;
              }
            });
            if(event.isUpdate){
              group['progress'] = event.progressGroupTask;
            }
          }
        });
        if(event.isUpdate){
          this.currentStep['progress'] = event?.progressStep;
        }
      }
    }
  }

  clickMFTaskGroup(e: any, data?: any) {
    switch (e.functionID) {
      // case 'SYS02':
      //   this.deleteGroupTask(data);
      //   break;
      // case 'SYS03':
      //   this.openPopupTaskGroup(data, 'edit');
      //   break;
      // case 'SYS04':
      //   this.openPopupTaskGroup(data, 'copy');
      //   break;
      // case 'DP08':
      //   this.groupTaskID = data?.refID;
      //   this.openTypeTask();
      //   break;
      // case 'DP12':
      //   this.viewTask(data, 'G');
      //   break;
      // case 'DP20':
      //   this.openUpdateProgress(data);
      //   break;
    }
  }

  // async changeDataMFTask(event, task, groupTask) {
  //   if (event != null) {
  //     let isGroup = false;
  //     let isTask = false;
  //     if (!this.isRoleAll) {
  //       isGroup = this.checRoleTask(groupTask, 'O');
  //       if (!isGroup) {
  //         isTask = this.checRoleTask(task, 'O');
  //       }
  //     }
  //     event.forEach((res) => {
  //       switch (res.functionID) {
  //         case 'SYS02'://xóa
  //           if (task?.isTaskDefault || (!this.isRoleAll && !isGroup)) {
  //             res.disabled = true;
  //           }
  //           break;
  //         case 'DP13'://sửa
  //         case 'SYS03'://sửa
  //           if (!this.leadtimeControl || (!this.isRoleAll && !isGroup &&  !isTask)){
  //             res.disabled = true;
  //           }
  //           break;          
  //         case 'SYS04'://copy
  //           if (!this.isRoleAll && !isGroup){
  //             res.disabled = true;
  //           }
  //           break;   
  //         case 'SYS003'://đính kèm file
  //           if (!this.leadtimeControl || (!this.isRoleAll && !isGroup &&  !isTask)){
  //             res.isblur = true;
  //           }
  //           break;         
  //         case 'DP20':// tiến độ
  //           if (!this.isRoleAll && !isGroup && !isTask){
  //             res.isblur = true;
  //           }
  //           break;
  //         case 'DP12':
  //           res.disabled = true;
  //           break;
  //         case 'DP08':
  //           res.disabled = true;
  //           break;
  //       }
  //     });
  //   }
  // }
  // async changeDataMFGroupTask(event, group) {
  //   if (event != null) {
  //     let isGroup = false;
  //     if (!this.isRoleAll) {
  //       isGroup = this.checRoleTask(group, 'O');
  //     }
  //     event.forEach((res) => {
  //       switch (res.functionID) {
  //         case "DP13":
  //         case 'DP07':
  //           res.disabled = true;
  //           break;
  //         case 'SYS02':
  //           if (group?.isTaskDefault || (!this.isRoleAll && !isGroup)) {
  //             res.disabled = true;
  //           }
  //           break;
  //         case 'SYS04'://copy
  //           if (!this.isRoleAll){
  //             res.disabled = true;
  //           }
  //           break; 
  //         case 'SYS03'://sửa
  //           if (!this.leadtimeControl || !(this.isRoleAll || isGroup)){
  //             res.disabled = true;
  //           }
  //           break;  
  //         case 'SYS003'://đính kèm file
  //           if (!this.leadtimeControl || !(this.isRoleAll || isGroup)){
  //             res.isblur = true;
  //           }
  //           break;  
  //         case 'DP08':// thêm công việc
  //           if (!this.isRoleAll && !isGroup){
  //             res.isblur = true;
  //           }
  //           break;        
  //         case 'DP20':// tiến độ
  //           if (!this.progressTaskGroupControl || (!this.isRoleAll && !isGroup)){
  //             res.isblur = true;
  //           }
  //           break;
  //       }
  //     });
  //   }
  // }

  async drop(event: CdkDragDrop<string[]>, data = null, isParent = false) {
    // if (event.previousContainer === event.container) {
    //   if (event.previousIndex == event.currentIndex) return;
    //   if (data && isParent) {
    //     moveItemInArray(data, event.previousIndex, event.currentIndex);
    //     await this.changeValueDrop(data, 'indexNo');
    //     await this.updateDropDrap('parent');
    //   } else {
    //     moveItemInArray(
    //       event.container.data,
    //       event.previousIndex,
    //       event.currentIndex
    //     );
    //     await this.changeValueDrop(event.container.data, 'indexNo');
    //     await this.updateDropDrap('child');
    //   }
    // } else {
    //   let groupTaskIdOld = '';
    //   if (event.previousContainer.data.length > 0) {
    //     groupTaskIdOld =
    //       event.previousContainer.data[event.previousIndex]['taskGroupID'];
    //     event.previousContainer.data[event.previousIndex]['taskGroupID'] =
    //       data?.recID;
    //   }
    //   transferArrayItem(
    //     event.previousContainer.data,
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex
    //   );
    //   this.calculateProgressStep();
    //   await this.changeValueDrop(
    //     event.previousContainer.data,
    //     'indexNo',
    //     groupTaskIdOld,
    //     true
    //   );
    //   await this.changeValueDrop(
    //     event.container.data,
    //     'indexNo',
    //     groupTaskIdOld,
    //     true
    //   );
    //   await this.updateDropDrap('all');
    // }
  }
}
