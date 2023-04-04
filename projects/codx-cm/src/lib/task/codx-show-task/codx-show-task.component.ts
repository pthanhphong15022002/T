import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CacheService, CallFuncService, DialogRef, FormModel, SidebarModel } from 'codx-core';
import { firstValueFrom } from 'rxjs';
import { PopupTaskComponent } from '../popup-task/popup-task.component';
import { PopupTypeTaskComponent } from 'projects/codx-dp/src/lib/dynamic-process/popup-add-dynamic-process/step-task/popup-type-task/popup-type-task.component';
import { PopupAddStaskComponent } from 'projects/codx-dp/src/lib/instances/instance-detail/stages-detail/popup-add-stask/popup-add-stask.component';

@Component({
  selector: 'codx-show-task',
  templateUrl: './codx-show-task.component.html',
  styleUrls: ['./codx-show-task.component.scss'],
})
export class CodxShowTaskComponent implements OnInit {
  @Input() dataSource: any;
  @Input() formModel: FormModel;
  @Output() clickMF = new EventEmitter<any>();
  data: any;
  popupJob: DialogRef;
  jobType: any;
  dateFomat = 'dd/MM/yyyy';
  dateTimeFomat = 'HH:mm - dd/MM/yyyy';
  listTypeTask = [];
  grvMoreFunction: FormModel;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  constructor(
    private cache: CacheService,
    private callfc: CallFuncService,
  ) {
    if(this.dataSource && !this.dataSource['taskGroups']){
      this.dataSource['taskGroups'] = [];
    }
  }

  async ngOnInit(){
    this.grvMoreFunction = await this.getFormModel('DPT0402');
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes?.dataSource?.currentValue) {
      let data = await firstValueFrom(this.cache.valueList('DP004'));
      this.listTypeTask = data['datas'];
      await this.groupByTask(this.dataSource); 
    }
  }

  getIconTask(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return color?.icon;
  }
  getColor(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.taskType);
    return { 'background-color': color?.color };
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

   async groupByTask(data) {  
      // console.log(data?.tasks); 
      // const taskGroupList = data?.tasks?.reduce((group, product) => {
      //   const { taskGroupID } = product;
      //   group[taskGroupID] = group[taskGroupID] ?? [];
      //   group[taskGroupID].push(product);
      //   return group;
      // }, {});
      // const taskGroupConvert = data['taskGroups'].map((taskGroup) => {
      //   return {
      //     ...taskGroup,
      //     task: taskGroupList[taskGroup['recID']] ?? [],
      //   };
      // });
      // data['taskGroups'] = taskGroupConvert;

      if (this.dataSource['taskGroups']?.length > 0 || this.dataSource['tasks']?.length > 0) {
        let taskGroup = {};
        taskGroup['task'] = this.dataSource['tasks']?.sort((a, b) => a['indexNo'] - b['indexNo']) || [];
        taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
        this.dataSource['taskGroups'].push(taskGroup);
      }
  }

  // clickMFTaskGroup(e: any, data?: any) {
  //   switch (e.functionID) {
  //     case 'SYS02':
  //       // this.deleteGroupTask(data);
  //       break;
  //     case 'SYS03':
  //       // this.openPopupTaskGroup(data, 'edit');
  //       break;
  //     case 'SYS04':
  //       // this.openPopupTaskGroup(data, 'copy');
  //       break;
  //     case 'DP08':
  //       // this.groupTaskID = data?.recID;
  //       // this.openTypeTask();
  //       break;
  //     case 'DP12':
  //       // this.viewTask(data,'G');
  //       break;
  //   }
  // }

  clickMFTask(event,data) {
    let typeTask = '';
    switch (event?.functionID) {
      case 'SYS02':
        // this.deleteTask(taskList, task);
        break;
      case 'SYS03':
        if (data.taskType) {
          typeTask = this.listTypeTask.find(
            (type) => type.value === data.taskType
          );
        }
        this.handleTask(null,'edit');
        break;
      case 'SYS04':
        typeTask = data.taskType;
        this.handleTask(data, 'copy');
        break;
      // case 'DP07':
      //   jobType = data.taskType;
      //   this.viewTask(task);
      //   break;
    }
  }

  openPopupTaskGroup(){

  }

  openTypeTask() {
    this.popupJob = this.callfc.openForm(PopupTypeTaskComponent, '', 400, 400);
    this.popupJob.closed.subscribe(async (value) => {
      if (value?.event && value?.event?.value) {
        this.jobType = value?.event;
        this.handleTask(null, 'add');
      }
    });
  }

  handleTask(data?: any, status?: string) {
    let taskGroupIdOld = '';
    let frmModel: FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
    if (!data) {
      this.popupJob.close();
    } else {
      taskGroupIdOld = data['taskGroupID'];
    }
    let dataTransmit =
      status == 'copy' ? JSON.parse(JSON.stringify(data)) : data;
    let listData = {
      status,
      taskType: this.jobType,
      parentID: this.dataSource?.recID,
      listGroup: [],
      stepTaskData: dataTransmit || {},
      taskList: [],
      stepName: '',
      groupTaskID: '',
      leadtimeControl: false,
    };
    console.log(this.dataSource);
    
    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1001;
    option.FormModel = frmModel;
    let dialog = this.callfc.openSide(PopupTaskComponent, listData, option);

    // dialog.closed.subscribe(async (e) => {
    //   this.groupTaskID = null; //set lại
    //   if (e?.event) {
    //     let taskData = e?.event?.data;
    //     if (e.event?.status === 'add' || e.event?.status === 'copy') {
    //       let groupTask = this.taskGroupList?.find(
    //         (x) => x.refID === taskData.taskGroupID
    //       );
    //       let role = new DP_Instances_Steps_Tasks_Roles();
    //       this.setRole(role);
    //       taskData['roles'] = [role];
    //       taskData['createdOn'] = new Date();
    //       taskData['modifiedOn'] = null;
    //       taskData['modifiedBy'] = null;
    //       taskData['indexNo'] = groupTask ? groupTask['task']?.length : 1;
    //       let progress = await this.calculateProgressTaskGroup(taskData, 'add');
    //       this.dpService
    //         .addTask([taskData, progress?.average])
    //         .subscribe((res) => {
    //           if (res) {
    //             this.notiService.notifyCode('SYS006');
    //             let index = this.taskGroupList.findIndex(
    //               (task) => task.refID == taskData.taskGroupID
    //             );
    //             if (index < 0) {
    //               let taskGroup = new DP_Instances_Steps_TaskGroups();
    //               taskGroup['task'] = [];
    //               taskGroup['recID'] = null; // group task rỗng để kéo ra ngoài
    //               this.taskGroupList.push(taskGroup);
    //               this.taskGroupList[0]['task'].push(taskData);
    //             } else {
    //               this.taskGroupList[index]['task'].push(taskData);
    //             }
    //             this.taskList.push(taskData);
    //             this.taskGroupList[progress?.indexGroup]['progress'] =
    //               progress?.average; // cập nhật tiến độ của cha
    //             this.calculateProgressStep();
    //             this.saveAssign.emit(true);
    //           }
    //         });
    //     } else {
    //       taskData['modifiedOn'] = new Date();
    //       this.dpService.updateTask(taskData).subscribe((res) => {
    //         if (res) {
    //           if (taskData?.taskGroupID != taskGroupIdOld) {
    //             this.changeGroupTask(taskData, taskGroupIdOld);
    //             this.notiService.notifyCode('SYS007');
    //             this.saveAssign.emit(true);
    //           }
    //         }
    //       });
    //     }
    //   }
    // });
  }

}
