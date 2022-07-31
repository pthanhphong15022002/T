import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { TM_TaskExtends, TM_Tasks } from '../../models/TM_Tasks.model';

@Component({
  selector: 'lib-popup-extend',
  templateUrl: './popup-extend.component.html',
  styleUrls: ['./popup-extend.component.css']
})
export class PopupExtendComponent implements OnInit {
  
  title ='Gia hạn thời gian thực hiện'
  data: any;
  taskExtend = new TM_TaskExtends
  dialog: any;
  task: any;
  funcID :any
  extendDate:any

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.funcID = this.data.funcID
    this.task = this.data.data ;
    if(this.task.createdBy!=this.task.owner) this.taskExtend.extendApprover = this.task.createdBy ;
    else  this.taskExtend.extendApprover = this.task.VerifyBy ;
    this.taskExtend.dueDate = this.task.dueDate ;
  }

  ngOnInit(): void {
  }

  changeTime(e){

  }

  valueChange(e){

  }

  saveData(){}

}
