import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  NotificationsService,
  UrlUtil,
} from 'codx-core';
import { CodxTasksService } from '../codx-tasks.service';
import moment from 'moment';

@Component({
  selector: 'app-popup-update-status',
  templateUrl: './popup-update-status.component.html',
  styleUrls: ['./popup-update-status.component.css'],
})
export class PopupUpdateStatusComponent implements OnInit {
  comment: string = '';
  data: any;
  dialog: any;
  task: any;
  statusDisplay = '';
  timeStart: any;
  completed: any;
  completedOn: any;
  moreFunc: any;
  maxHoursControl: any;
  maxHours: any;
  updateControl: any;
  url: string;
  status: string;
  title: string = 'Cập nhật tình trạng công việc ';
  funcID: any;
  crrCompleted: any;
  isSave = true; // save luôn rồi trả về
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private tmSv: CodxTasksService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.funcID = this.data.funcID;
    this.task = JSON.parse(JSON.stringify(this.data?.taskAction));
    this.moreFunc = this.data.moreFunc;
    this.title = this.moreFunc.customName;
    this.maxHoursControl = this.data.maxHoursControl;
    this.maxHours = this.data.maxHours;
    this.updateControl = this.data.updateControl;
    this.url = this.moreFunc?.url;
    this.status = UrlUtil.getUrl('defaultValue', this.url);
    this.completedOn = moment(new Date()).toDate();
    this.isSave = dt?.data?.isSave ?? this.isSave;
  }

  ngOnInit(): void {
    if (this.task.estimated > 0) {
      this.completed = this.task.estimated;
    } else {
      this.timeStart = moment(
        new Date(
          this.task.startOn
            ? this.task.startOn
            : this.task.startDate
            ? this.task.startDate
            : this.task.createdOn
        )
      ).toDate();
      var time = (
        (this.completedOn.getTime() - this.timeStart.getTime()) /
        3600000
      ).toFixed(2);
      this.completed = Number.parseFloat(time).toFixed(2);
    }
    if (
      this.status == '90' &&
      this.maxHoursControl != '0' &&
      Number.parseFloat(this.completed) > Number.parseFloat(this.maxHours)
    ) {
      this.notiService.notifyCode('TM058', 0, [this.maxHours]); ///truyền có tham số
      return;
    }
    // this.crrCompleted = this.completed;
  }
  changeTime(data) {
    if (!data.data) return;
    this.completedOn = data.data.fromDate;
    if (this.completed <= 0) {
      var time = (
        (this.completedOn?.getTime() - this.timeStart.getTime()) /
        3600000
      ).toFixed(2);
      this.completed = Number.parseFloat(time).toFixed(2);
    }
    this.changeDetectorRef.detectChanges();
  }
  changeComment(data) {
    this.comment = data?.data;
  }
  changeEstimated(data) {
    if (!data.data) return;
    var num = data.data;
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
    this.completed = Number.parseFloat(num).toFixed(2);
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
    if (
      this.status == '90' &&
      this.maxHoursControl &&
      this.maxHoursControl != '0' &&
      Number.parseFloat(this.completed) > Number.parseFloat(this.maxHours)
    ) {
      this.notiService.notifyCode('TM058', 0, [this.maxHours]);
      return;
    }
    if (this.updateControl == '2') {
      if (this.comment == null || this.comment.trim() == '') {
        this.notiService.notifyCode('TM057');
        return;
      }
    }
    if (!this.isSave) {
      this.task.completedOn = this.completedOn;
      this.task.completed = this.completed;
      this.dialog.close({ task: this.task, comnent: this.comment });
      // this.notiService.notifyCode('TM009');
    } else
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
            this.dialog.close(res);
            this.notiService.notifyCode('TM009');
          } else {
            this.dialog.close();
            this.notiService.notifyCode('TM008');
          }
        });
  }
}
