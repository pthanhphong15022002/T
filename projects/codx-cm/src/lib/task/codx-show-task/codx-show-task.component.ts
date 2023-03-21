import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CacheService, CallFuncService, FormModel, SidebarModel } from 'codx-core';
import { firstValueFrom } from 'rxjs';
import { PopupTaskComponent } from '../popup-task/popup-task.component';

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
  ) {}

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
    if (data && !data['isSuccessStep'] && !data['isFailStep']) {
      console.log(data?.tasks);
      
      const taskGroupList = data?.tasks?.reduce((group, product) => {
        const { taskGroupID } = product;
        group[taskGroupID] = group[taskGroupID] ?? [];
        group[taskGroupID].push(product);
        return group;
      }, {});
      const taskGroupConvert = data['taskGroups'].map((taskGroup) => {
        return {
          ...taskGroup,
          task: taskGroupList[taskGroup['recID']] ?? [],
        };
      });
      data['taskGroups'] = taskGroupConvert;
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
        this.handleTask('edit',typeTask, data);
        break;
      case 'SYS04':
        typeTask = data.taskType;
        this.handleTask('copy', data);
        break;
      // case 'DP07':
      //   jobType = data.taskType;
      //   this.viewTask(task);
      //   break;
    }
  }

  handleTask(action: string, typeTask: string, data?: any,) {
    let roleOld;
    let taskGroupIdOld = '';
    let taskInput = {};
    if (action === 'add') {
      // this.popupJob.close();
    } else if (action === 'copy') {
      taskInput = JSON.parse(JSON.stringify(data));
    } else {
      taskGroupIdOld = data['taskGroupID'];
      roleOld = JSON.parse(JSON.stringify(data['roles']));
      taskInput = JSON.parse(JSON.stringify(data));
    }

    let listData = {
      action,
      typeTask,
      step: this.dataSource,
      listGrooup: this.dataSource['taskGroups'],
      dataInput: taskInput || {},
      listTask: this.dataSource['tasks'],
      // this.listFileTask,
    };
    var functionID = 'DPT0206'; //id tuy chojn menu ne
    this.cache.functionList(functionID).subscribe((f) => {
      this.cache.gridViewSetup(f.formName, f.gridViewName).subscribe((grv) => {
        let option = new SidebarModel();
        let formModel = this.grvMoreFunction;
        formModel.formName = f.formName;
        formModel.gridViewName = f.gridViewName;
        formModel.entityName = f.entityName;
        formModel.funcID = functionID;
        option.FormModel = formModel;
        option.Width = '550px';
        option.zIndex = 1001;
        let dialog = this.callfc.openSide(PopupTaskComponent, listData, option);

        dialog.closed.subscribe((e) => {
        //   if (e?.event) {
        //     let taskData = e?.event?.data;
        //     if (e.event?.status === 'add' || e.event?.status === 'copy') {
        //       let index = this.taskGroupList.findIndex(
        //         (group) => group.recID == taskData.taskGroupID
        //       );
        //       if (this.taskGroupList?.length == 0 && index < 0) {
        //         let taskGroupNull = new DP_Steps_TaskGroups();
        //         taskGroupNull['task'] = [];
        //         taskGroupNull['recID'] = null; // group task rỗng để kéo ra ngoài
        //         this.taskGroupList.push(taskGroupNull);
        //         this.taskGroupList[0]['task']?.push(taskData);
        //       } else {
        //         this.taskGroupList[index]['task']?.push(taskData);
        //       }
        //       this.taskList?.push(taskData);
        //       this.addRole(taskData['roles'][0]);
        //     } else {
        //       for (const key in taskData) {
        //         data[key] = taskData[key];
        //       }
        //       data['modifiedOn'] = new Date();
        //       data['modifiedBy'] = this.userId;
        //       if (data?.taskGroupID != taskGroupIdOld) {
        //         this.changeGroupTaskOfTask(data, taskGroupIdOld);
        //       }
        //       this.addRole(data['roles'][0], roleOld[0]);
        //     }
        //     let check = this.listStepEdit.some(id => id == taskData?.stepID)
        //     if(!check){
        //       this.listStepEdit.push(taskData?.stepID);
        //     }
        //     this.sumTimeStep();
        //   }
        });
        // this.groupTaskID = null;
      });
    });
  }

}
