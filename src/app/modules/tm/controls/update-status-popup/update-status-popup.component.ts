import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { CodxService, DialogData, NotificationsService, UrlUtil } from 'codx-core';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TmService } from '@modules/tm/tm.service';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private tmSv: TmService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: Dialog,
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    
  }

  ngOnInit(): void {
    this.task = this.data.taskAction;
    this.moreFunc = this.data.moreFunc;
    this.url = this.moreFunc.url;
    this.status = UrlUtil.getUrl(
      "defaultValue",
      this.url,
    );
    this.completedOn = moment(new Date()).toDate();
    this.startDate = moment(new Date(this.task.startDate)).toDate();
    this.estimated = moment(this.completedOn).diff(
      moment(this.startDate),
      'hours'
    );
  }
  changeTime(data) {
    this.completedOn = data.data;
    this.estimated = moment(this.completedOn).diff(
      moment(this.startDate),
      'hours'
    );
    this.changeDetectorRef.detectChanges();
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
          this.dialog.hide(this.task);
          this.notiService.notify('Cập nhật trạng thái thành công !');
        } else {
          this.notiService.notify(
            'Vui lòng thực hiện hết các công việc được phân công để thực hiện cập nhật tình trạng !'
          );
        }
      });
  }

  // displayStatus(status){
  //    switch (status)  {
  //     case "9":
  //     this.statusDisplay = "Hoàn tất" ;
  //     break;
  //     case "2":
  //     this.statusDisplay = "Đang thực hiện" ;
  //     break;
  //     case "5":
  //     this.statusDisplay = "Hoãn lại" ;
  //     break;
  //     case "8":
  //     this.statusDisplay = "Hủy" ;
  //     break;
  //    }
  // }
}
