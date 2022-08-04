import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, NotificationsService, UrlUtil } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { TM_TaskExtends, TM_Tasks } from '../../models/TM_Tasks.model';

@Component({
  selector: 'lib-popup-extend',
  templateUrl: './popup-extend.component.html',
  styleUrls: ['./popup-extend.component.css']
})
export class PopupExtendComponent implements OnInit, AfterViewInit {
  
  title ='Gia hạn thời gian thực hiện'
  data: any;
  taskExtend = new TM_TaskExtends
  dialog: any;
  task: any;
  funcID :any
  extendDate:any
  moreFunc: any
  url:any ;
  nameApprover: any ;
  
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
    this.taskExtend = this.data.data ;
    // if(this.task.createdBy!=this.task.owner) this.taskExtend.extendApprover = this.task.createdBy ;
    // else  this.taskExtend.extendApprover = this.task.verifyBy ;
    // this.api.execSv<any>('SYS','AD','UsersBusiness','GetUserAsync',[this.taskExtend.extendApprover]).subscribe(res=>{
    //   if(res)this.nameApprover = res.userName
    // })
    // this.taskExtend.dueDate = this.task.dueDate ;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  changeTime(e){

  }

  valueChange(e){

  }

  saveData(){
    if(this.taskExtend.dueDate > this.taskExtend.extendDate){
      this.notiService.notifyCode("TM022")
      return ;
    }
    if(this.taskExtend.reason==null || this.taskExtend.reason.trim()==""){
      this.notiService.notifyCode("TM019")
      return ;
    }

    //goi hàm luu data 
  }

}
