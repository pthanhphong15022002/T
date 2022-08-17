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
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'lib-popup-confirm',
  templateUrl: './popup-confirm.component.html',
  styleUrls: ['./popup-confirm.component.css'],
})
export class PopupConfirmComponent implements OnInit, AfterViewInit {
  data: any;
  dialog: any;
  task: any;
  taskExtends: any;
  url: string;
  status: string;
  title: string = 'Xác nhận ';
  funcID: any;
  moreFunc: any;
  vllConfirm = 'TM009';
  fieldDefault = '';
  valueDefault = '';
  fieldComment = 'ConfirmComment';
  defautComment = 'Bình luận';
  comment = '';
  action = 'confirm';

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
    this.funcID = this.data.funcID;
    this.vllConfirm = this.data.vll;
   
    this.action = this.data?.action;
    this.fieldComments();
    this.moreFunc = this.data.moreFunc;
    this.title = this.moreFunc.customName;
    this.url = this.moreFunc.url;
    var fieldDefault = UrlUtil.getUrl('defaultField', this.url);
    this.fieldDefault =
      fieldDefault.charAt(0).toLocaleLowerCase() + fieldDefault.slice(1);
    this.valueDefault = UrlUtil.getUrl('defaultValue', this.url);
    if(this.action=='extend') {
      this.taskExtends = this.data?.data;
      this.taskExtends[this.fieldDefault] = this.valueDefault 
    }
    else {this.task = this.data?.data;
      this.task[this.fieldDefault] = this.valueDefault 
    }
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {}

  valueChange(data) {
    if (data?.data) {
      this.comment = data?.data ? data?.data : '';
    }
    this.changeDetectorRef.detectChanges;
  }

  valueSelected(data) {
    if (data.data) {
      this.task.confirmStatus = data?.data;
    }
  }

  saveData() {
    switch (this.action) {
      case 'confirm':
        this.saveConfirmStatus();
        break;
      case 'extend':
        this.saveExtendStatus();
        break;
      case 'approve':
        this.saveApproveStatus();
        break;
      case 'verify':
        this.saveVerifyStatus();
        break;
      default:
        break;
    }
  }

  saveConfirmStatus() {
    this.task.confirmComment = this.comment;
    if (
      this.task.confirmStatus == '3' &&
      (this.task.confirmComment ==null || this.task.confirmComment.trim() == '')
    ) {
      this.notiService.notifyCode('TM019');
      return;
    }
    ///xu ly save
    this.api
      .execSv<any>('TM', 'TM', 'TaskBusiness', 'ConfirmStatusTaskAsync', [
        this.funcID,
        this.task.taskID,
        this.task.confirmStatus,
        this.task.confirmComment,
      ])
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res);
          this.notiService.notify('Xác nhận công việc thành công !');
          // this.notiService.notifyCode(" 20K của Hảo :))") ;
        } else this.dialog.close();
      });
  }

  saveExtendStatus() {
    this.api
      .execSv<any>('TM', 'TM', 'TaskExtendsBusiness', 'ExtendStatusTaskAsync', [
        this.taskExtends.taskID,
        this.taskExtends.extendStatus,
        this.comment,
      ])
      .subscribe((res) => {
        if (res) {
          if(res.extendStatus=='5'){
            this.taskExtends.task.dueDate = res.extendDate ;
            this.taskExtends.task.extends = this.taskExtends.task.extends + 1 ;
          }
          this.taskExtends.task.extendStatus = res.extendStatus ;
          this.taskExtends.extendComment =  this.comment,
          this.dialog.close(this.taskExtends);
          this.notiService.notify('Duyệt gia hạn công việc thành công !');
          // this.notiService.notifyCode(" 20K của Hảo :))") ;
        } else this.dialog.close();
      });
  }

  saveApproveStatus() {
    // this.task.approveComment = this.comment;
    ///xu ly save
    this.api
    .execSv<any>('TM', 'TM', 'TaskBusiness', 'ApproveStatusTaskAsync', [
        this.funcID,
        this.task.taskID,
        this.task.approveStatus,
        this.comment,
      ])
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res);
          this.notiService.notify('Đánh giá kết quả công việc thành công !');
          // this.notiService.notifyCode(" 20K của Hảo :))") ;
        } else this.dialog.close();
      });
  }

  saveVerifyStatus() {
    this.task.verifyComment = this.comment;
    if (
      this.task.verifyStatus == '3' &&
      (this.task.verifyComment ==null || this.task.verifyComment.trim() == '')
    ) {
      this.notiService.notifyCode('TM019');
      return;
    }
    ///xu ly save
    this.api
      .execSv<any>('TM', 'TM', 'TaskBusiness', 'VerifyStatusTaskAsync', [
        this.funcID,
        this.task.taskID,
        this.task.verifyStatus,
        this.comment,
      ])
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res);
          this.notiService.notify('Duyệt công việc thành công !');
          // this.notiService.notifyCode(" 20K của Hảo :))") ;
        } else this.dialog.close();
      });
  }

  fieldComments() {
    switch (this.action) {
      case 'confirm':
        this.fieldComment = 'ConfirmComment';
        break;
      case 'extend':
        this.fieldComment = 'ExtendComment';
        break;
      case 'approve':
        this.fieldComment = 'ApproveComment';
        break;
      case 'verify':
        this.fieldComment = 'VerifyComment';
        break;
    }
  }
}
