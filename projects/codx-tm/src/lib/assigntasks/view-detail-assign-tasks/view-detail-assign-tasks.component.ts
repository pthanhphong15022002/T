import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-view-detail-assign-tasks',
  templateUrl: './view-detail-assign-tasks.component.html',
  styleUrls: ['./view-detail-assign-tasks.component.css']
})
export class ViewDetailAssignTasksComponent implements OnInit {

  data: any;
  dialog: any;
  active = 1;
  @Input() formModel?: FormModel;
  @Input() itemSelected?: any
  @Output() clickMoreFunction = new EventEmitter<any>();
  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
  }

  ngOnInit(): void {
  }

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({e:e,data:dt})
  }

}
