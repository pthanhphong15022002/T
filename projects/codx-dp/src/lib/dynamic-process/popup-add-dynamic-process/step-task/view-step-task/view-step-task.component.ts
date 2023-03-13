import { Component, OnInit, Optional } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { DP_Steps_Tasks } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-view-job',
  templateUrl: './view-step-task.component.html',
  styleUrls: ['./view-step-task.component.scss'],
})
export class ViewJobComponent implements OnInit {
  title = '';
  dialog!: DialogRef;
  dataInput = {}; //format về như vậy {recID,name,startDate,type, roles, durationHour, durationDay,parentID }
  type = '';
  listOwner = [];
  listDataInput = [];
  listTypeTask = [];
  listDataLink = [];

  frmModel: FormModel = {};
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    public sanitizer: DomSanitizer,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.type = dt?.data?.value?.type;
    this.dataInput = dt?.data?.value;
    this.listDataInput = dt?.data?.listValue;
    this.getModeFunction();
  }

  ngOnInit(): void {
    this.listOwner = this.dataInput['roles'] || [];
    if (this.dataInput['parentID']) {
      this.listDataInput?.forEach((task) => {
        if (this.dataInput['parentID']?.includes(task.refID)) {
          this.listDataLink.push(task);
        }
      });
    }
    if (this.dataInput['type'] == 'G') {
      this.listDataLink = this.listDataInput?.filter(
        (data) =>
          data['taskGroupID'] && data['taskGroupID'] == this.dataInput['refID']
      );
    }
    this.cache.valueList('DP035').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
        let type = res.datas.find((x) => x.value === this.type);
        this.title = type['text'];
      }
    });
  }

  getModeFunction() {
    var functionID = 'DPT0206';
    this.cache.functionList(functionID).subscribe((f) => {
      this.cache.gridViewSetup(f.formName, f.gridViewName).subscribe((grv) => {
        this.frmModel['formName'] = f.formName;
        this.frmModel['gridViewName'] = f.gridViewName;
        this.frmModel['entityName'] = f.entityName;
        this.frmModel['funcID'] = functionID;
      });
    });
  }

  getIconTask(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.type);
    return color?.icon;
  }

  getColor(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.type);
    return { 'background-color': color?.color };
  }
  getColorTile(task) {
    let color = this.listTypeTask?.find((x) => x.value === task.type);
    return { 'border-left': '3px solid' + color?.color };
  }
}
