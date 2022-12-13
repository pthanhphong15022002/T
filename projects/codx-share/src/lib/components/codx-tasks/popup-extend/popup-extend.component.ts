import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
} from '@angular/core';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  NotificationsService,
  UrlUtil,
} from 'codx-core';
import moment from 'moment';
import { CodxTasksService } from '../codx-tasks.service';
import { TM_TaskExtends } from '../model/task.model';

@Component({
  selector: 'lib-popup-extend',
  templateUrl: './popup-extend.component.html',
  styleUrls: ['./popup-extend.component.css'],
})
export class PopupExtendComponent implements OnInit, AfterViewInit {
  title = 'Gia hạn thời gian thực hiện';
  data: any;
  taskExtend = new TM_TaskExtends();
  dialog: any;
  task: any;
  funcID: any;
  extendDate: any;
  moreFunc: any;
  url: any;
  nameApprover: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private tmSv: CodxTasksService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.funcID = this.data.funcID;
    this.title = this.data?.moreFunc?.customName;
    this.taskExtend = JSON.parse(JSON.stringify(this.data?.data));
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  changeTime(data) {
    // if (!data.field || !data.data) return;
    this.taskExtend[data.field] = data.data?.fromDate;
  }

  valueChange(e) {
    this.taskExtend.reason = e?.data;
  }

  saveData() {
    if (
      moment(new Date(this.taskExtend.dueDate)).toDate() >
      moment(new Date(this.taskExtend.extendDate)).toDate()
    ) {
      this.notiService.notifyCode('TM022');
      return;
    }
    if (this.taskExtend.reason == null || this.taskExtend.reason.trim() == '') {
      this.notiService.notifyCode('TM019');
      return;
    }
    //goi hàm luu data
    this.api
      .execSv<any>('TM', 'TM', 'TaskBusiness', 'ExtendTaskAsync', [
        this.funcID,
        this.taskExtend,
      ])
      .subscribe((res) => {
        if (res && res.length) {
          this.dialog.close(res);
          this.notiService.notifyCode('TM064');
        } else {
          this.dialog.close();
        }
      });
  }
}
