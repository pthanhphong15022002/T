import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
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
  startDate: any;
  estimated: any;
  completedOn: any;
  moreFunc: any;
  url: string;
  status: string;
  title: string = 'Cập nhật tình trạng công việc ';

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
  }

  ngOnInit(): void {
    this.task = this.data.taskAction;
    this.moreFunc = this.data.moreFunc;
    this.url = this.moreFunc.url;
    this.status = UrlUtil.getUrl('defaultValue', this.url);
    this.completedOn = moment(new Date()).toDate();
    if(this.task.startDate)
    this.startDate = moment(new Date(this.task.startDate)).toDate();else  this.startDate = moment(new Date(this.task.createdOn)).toDate();
    this.estimated = moment(this.completedOn).diff(
      moment(this.startDate),
      'hours'
    ).toFixed(1);
  }
  changeTime(data) {
    this.completedOn = data.data.fromDate;
    this.estimated = moment(this.completedOn)
        .diff(moment(this.startDate), 'hours')
        .toFixed(1);
    this.changeDetectorRef.detectChanges();
  }
  changeEstimated(data) {
    // var num = Number.parseInt(data.data)
    // if (data.data && num) {
    //   this.task[data.field] = data.data;
    //   var estimated = num * 3600000;
    //   var timeComplete = this.task.completedOn.getTime() + estimated;
    //   this.task.completedOn = moment(new Date(timeComplete)).toDate();
    // }else{
    //   //  this.notiService.notifyCode("can cai code o day đang gan tam")
    //   this.notiService.notify("Giá trị nhập vào không phải là 1 số !")
    // }
    // this.changeDetectorRef.detectChanges();
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'SetStatusTaskAsync';
    data = [
      this.task.taskID,
      this.status,
      this.completedOn,
      this.estimated,
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
        this.task.taskID,
        this.status,
        this.completedOn,
        this.estimated,
        this.comment
      )
      .subscribe((res) => {
        if (res) {
          this.task.status = this.status;
          this.task.completedOn = this.completedOn;
          this.task.comment = this.comment;
          this.task.completed = this.estimated;
          this.dialog.close();
          this.notiService.notify('Cập nhật trạng thái thành công !');
        } else {
          this.notiService.notify(
            'Vui lòng thực hiện hết các công việc được phân công để thực hiện cập nhật tình trạng !'
          );
        }
      });
  }
}
