import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, FormModel } from 'codx-core';
import { TM_Tasks } from '../../models/TM_Tasks.model';
import { PopupViewTaskResourceComponent } from '../popup-view-task-resource/popup-view-task-resource.component';

@Component({
  selector: 'app-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss']
})
export class ViewDetailComponent implements OnInit {
  data: any;
  dialog: any;
  active = 1;
  @Input() formModel?: FormModel;
  @Input() itemSelected?: any
  @Input() param?: any
  @Output() clickMoreFunction = new EventEmitter<any>();
  constructor(
    private api: ApiHttpService,
    private callfc : CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
  }

  ngOnInit(): void {
  }

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({e:e,data:dt})
  }
  openViewListTaskResource(data){
    this.dialog = this.callfc.openForm(
      PopupViewTaskResourceComponent,
      '',
      400,
      500,
      '',
      [data,this.formModel.funcID]
    );
  }

}
