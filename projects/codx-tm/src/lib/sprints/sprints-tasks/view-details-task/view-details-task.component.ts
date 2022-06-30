import { Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-view-details-task',
  templateUrl: './view-details-task.component.html',
  styleUrls: ['./view-details-task.component.css']
})
export class ViewDetailsTaskComponent implements OnInit {

  data: any;
  dialog: any;
  active = 1;
  @Input() formModel?: FormModel;
  @Input() itemSelected ?: any
  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
  }

  ngOnInit(): void {
  }


}

