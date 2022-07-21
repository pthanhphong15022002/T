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
  funcID:any
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private tmSv: CodxTMService,
    private notiService: NotificationsService,
    private activedRouter : ActivatedRoute,
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
    this.url = this.moreFunc.url;
    this.status = UrlUtil.getUrl('defaultValue', this.url);
    this.completedOn = moment(new Date()).toDate();
    if(this.task.estimated > 0){
      this.completed=this.task.estimated
    }else{
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
  }
  changeTime(data) {
    if(!data.data)return ; 
    this.completedOn = data.data.fromDate;
    // this.estimated = moment(this.completedOn)
    //     .diff(moment(this.startDate), 'hours')
    if(this.completed<=0){
      var time = (((this.completedOn?.getTime() -this.timeStart.getTime())/3600000).toFixed(2));
      this.completed = Number.parseFloat(time);
    }
    this.changeDetectorRef.detectChanges();
  }
  changeEstimated(data) {
   
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
    this.comment = this.comment.trim();
    if (this.data.fieldValue == '2') {
      if (this.comment == '') return;
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
        if (res &&res.length >0) {
          // this.task.status = this.status;
          // this.task.completedOn = this.completedOn;
          // this.task.comment = this.comment;
          // this.task.completed = this.completed;
          // res.forEach(obj=>{
          //   this.dialog.dataService.update(obj).subscribe();
          // }) 
          this.dialog.close(res)
          this.notiService.notify('Cập nhật trạng thái thành công !');
        } else {
          this.notiService.notify(
            'Vui lòng thực hiện hết các công việc được phân công để thực hiện cập nhật tình trạng !'
          );
        }
      });
  }
}
