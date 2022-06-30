import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-mwp-view-detail',
  templateUrl: './mwp-view-detail.component.html',
  styleUrls: ['./mwp-view-detail.component.css']
})
export class MwpViewDetailComponent implements OnInit {
  data: any;
  dialog: any;
  active = 1;
  dataValue = '1';
  isFinishLoad = false;
  countOwner = 0;
  objectAssign: any;
  objectState: any;
  user: any;
  predicate = 'Owner=@0';

  @Input() formModel?: FormModel;
  @Input() itemSelected?: any
  @Output() clickMoreFunction = new EventEmitter<any>();
  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) { }

  ngOnInit(): void {
  }

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({e:e,data:dt})
  }

  tabStatus(st: string) {
    switch (st) {
      case '1':
        // this.data = this.listviewAdd?.data;
        if (this.data != null) this.itemSelected = this.data[0];

        break;
      case '9':
        //this.data = this.listviewCompleted?.data;
        if (this.data != null) this.itemSelected = this.data[0];
        break;
      case '5':
        //  this.data = this.listviewPostpone?.data;
        if (this.data != null) this.itemSelected = this.data[0];
        break;
      case '8':
        // this.data = this.listviewRefuse?.data;
        if (this.data != null) this.itemSelected = this.data[0];
        break;
      default:
        break;
    }
    this.dataValue = st;
    if (this.itemSelected != null) {
      this.loadDetailTask(this.itemSelected);
      this.isFinishLoad = true;
    } else this.isFinishLoad = false;
  }

  loadDetailTask(task) {
    this.objectAssign = '';
    this.objectState = '';
    if (task.category == '3' || task.category == '4') {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetTaskByParentIDAsync',
          [task?.recID]
        )
        .subscribe((res) => {
          if (res && res.length > 0) {
            this.countOwner = res.length;
            let objectId = res[0].owner;
            let objectState = res[0].status;
            for (let i = 1; i < res?.length; i++) {
              objectId += ';' + res[i].owner;
              objectState += ';' + res[i].status;
            }
            this.objectAssign = objectId;
            this.objectState = objectState;
          }
        });
    } else {
      this.countOwner = 1;
    }
    
  }
}
