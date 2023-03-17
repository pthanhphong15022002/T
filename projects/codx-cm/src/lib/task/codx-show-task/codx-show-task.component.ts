import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { CacheService, FormModel } from 'codx-core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'codx-show-task',
  templateUrl: './codx-show-task.component.html',
  styleUrls: ['./codx-show-task.component.scss'],
})
export class CodxShowTaskComponent implements OnInit {
  @Input() dataSource: any;
  @Input() formModel: FormModel;

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

  clickMFTaskGroup(e: any, data?: any) {
    switch (e.functionID) {
      case 'SYS02':
        // this.deleteGroupTask(data);
        break;
      case 'SYS03':
        // this.openPopupTaskGroup(data, 'edit');
        break;
      case 'SYS04':
        // this.openPopupTaskGroup(data, 'copy');
        break;
      case 'DP08':
        // this.groupTaskID = data?.recID;
        // this.openTypeTask();
        break;
      case 'DP12':
        // this.viewTask(data,'G');
        break;
    }
  }

}
