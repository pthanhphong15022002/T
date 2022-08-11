import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import {
  ApiHttpService,
  CodxService,
  DialogData,
  DialogRef,
  NotificationsService,
  UrlUtil,
} from 'codx-core';
import * as moment from 'moment';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'app-update-status-popup',
  templateUrl: './update-status-popup.component.html',
  styleUrls: ['./update-status-popup.component.scss'],
})
export class UpdateStatusPopupComponent implements OnInit {
  comment: string = '';
  data: any;
  dialog: any;
  task: any;
  statusDisplay = '';
  timeStart: any;
  completed: any;
  completedOn: any;
  moreFunc: any;
  url: string;
  status: string;
  title: string = 'Cập nhật tình trạng công việc ';
  funcID: any
  crrCompleted: any
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
  }

  ngOnInit(): void {
    this.task = this.data.taskAction;
    this.moreFunc = this.data.moreFunc;
    this.title = this.moreFunc.customName ;
    this.url = this.moreFunc.url;
    this.status = UrlUtil.getUrl('defaultValue', this.url);
    this.completedOn = moment(new Date()).toDate();
    if (this.task.estimated > 0) {
      this.completed = this.task.estimated
    } else {
      this.timeStart = moment(
        new Date(
          this.task.startOn
            ? this.task.startOn
            : (this.task.startDate
              ? this.task.startDate : this.task.createdOn)
        )
      ).toDate();
      var time = (
        (this.completedOn.getTime() - this.timeStart.getTime()) /
        3600000
      ).toFixed(2);
      this.completed = Number.parseFloat(time).toFixed(2);
    }
    // this.crrCompleted = this.completed;
  }
  changeTime(data) {
    if (!data.data) return;
    this.completedOn = data.data.fromDate;
    if (this.completed <= 0) {
      var time = (((this.completedOn?.getTime() - this.timeStart.getTime()) / 3600000).toFixed(2));
      this.completed = Number.parseFloat(time).toFixed(2);
    }
    this.changeDetectorRef.detectChanges();
  }
  changeComment(data){
    this.comment = data?.data ;
  }
  changeEstimated(data) {
    if (!data.data) return;
    var num = Number.parseFloat(data.data);
    // if (!num) {
    //   //  this.notiService.notifyCode("can cai code o day đang gan tam")
    //   this.notiService.notify('Giá trị nhập vào không phải là 1 số !');
    //   this.completed = this.crrCompleted >0 ? this.crrCompleted : 0;
    //    this.changeDetectorRef.detectChanges();
    //   return;
    // }
    if (num < 0) {
      this.notiService.notifyCode('TM033');
      this.completed = this.crrCompleted > 0 ? this.crrCompleted : 0;
      this.changeDetectorRef.detectChanges();
      return;
    }
    this.completed = num.toFixed(2)
    // this.crrCompleted = this.completed;
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'SetStatusTaskAsync';
    data = [
      this.task.taskID,
      this.status,
      this.completedOn,
      this.completed,
      this.comment,
    ];
  }
  saveData() {
    if (this.data?.maxHoursControl != '0' && this.completed > this.data?.maxHours) {
      this.notiService.notifyCode('TM058')  ///truyền có tham số
      return;
     }  
    if (this.data.updateControl == '2') {
      if (this.comment==null || this.comment.trim() == ''){
         this.notiService.notifyCode("TM057")
       
      } 
    }
    this.tmSv
      .setStatusTask(
        this.funcID,
        this.task.taskID,
        this.status,
        this.completedOn,
        this.completed,
        this.comment
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          this.dialog.close(res)
          this.notiService.notifyCode('TM009');
        } else {
          this.dialog.close()
          this.notiService.notifyCode('TM008');
        }
      });
  }
}
