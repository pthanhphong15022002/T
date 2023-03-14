import { Component, OnInit, Input } from '@angular/core';
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
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
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

}
