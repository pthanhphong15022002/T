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
import { CodxTasksService } from '../codx-tasks.service';
import { TM_TaskExtends, TM_Tasks } from '../model/task.model';

@Component({
  selector: 'lib-popup-confirm',
  templateUrl: './popup-confirm.component.html',
  styleUrls: ['./popup-confirm.component.css'],
})
export class PopupConfirmComponent implements OnInit, AfterViewInit {
  data: any;
  dialog: any;
  task: TM_Tasks = new TM_Tasks();
  taskExtends: TM_TaskExtends = new TM_TaskExtends();
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
    private tmSv: CodxTasksService,
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
    if (this.action == 'extend') {
      this.taskExtends = JSON.parse(JSON.stringify(this.data?.data));
      this.task[this.fieldDefault] = this.valueDefault;
      this.taskExtends.status = this.task[this.fieldDefault];
    } else {
      this.task = JSON.parse(JSON.stringify(this.data?.data));
      this.task[this.fieldDefault] = this.valueDefault;
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

  // valueSelected(data) {
  //   if (data.data) {
  //     this.task.confirmStatus = data?.data;
  //   }
  // }

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
      (this.task.confirmComment == null ||
        this.task.confirmComment.trim() == '')
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
          this.notiService.notifyCode('SYS007');
          if (this.task.confirmStatus == '2') {
            this.tmSv.sendAlertMail(this.task?.recID, 'TM_0006', this.funcID).subscribe();
          } else if (this.task.confirmStatus == '3') {
            this.tmSv.sendAlertMail(this.task?.recID, 'TM_0007', this.funcID).subscribe();
          }
        } else this.dialog.close();
      });
  }

  //#region extendStatus
  saveExtendStatus() {
    // var valueDefault = UrlUtil.getUrl('defaultValue', moreFunc.url);
    if (this.taskExtends.status == '5') {
      this.api
        .execSv<any>(
          'TM',
          'TM',
          'TaskBusiness',
          'GetTaskParentByTaskIDAsync',
          this.taskExtends.taskID
        )
        .subscribe((res) => {
          if (res) {
            if (res.dueDate < this.taskExtends.extendDate) {
              this.notiService.alertCode('TM059').subscribe((confirm) => {
                if (confirm?.event && confirm?.event?.status == 'Y') {
                  this.actionExtends();
                }
              });
            } else this.actionExtends();
          }
        });
    } else this.actionExtends();
  }
  actionExtends() {
    this.api
      .execSv<any>('TM', 'TM', 'TaskExtendsBusiness', 'ExtendStatusTaskAsync', [
        this.funcID,
        this.taskExtends.taskID,
        this.taskExtends.status,
        this.comment,
      ])
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res);
          this.notiService.notifyCode('SYS007');
          this.tmSv
            .getRecIDTaskByIdAsync(this.taskExtends.taskID)
            .subscribe((data) => {
              if (data) {
                if (this.taskExtends.status == '5') {
                  this.tmSv.sendAlertMail(data, 'TM_0006', this.funcID).subscribe();
                } else if (this.taskExtends.status == '4') {
                  this.tmSv.sendAlertMail(data, 'TM_0006', this.funcID).subscribe();
                }
              }
            });
        } else this.dialog.close();
      });
  }

  //#endregion

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
        if (res && res?.length > 0) {
          this.dialog.close(res[0]);
          this.notiService.notifyCode('SYS007');
          if (this.task.approveStatus == '5') {
            this.tmSv.sendAlertMail(this.task.recID, 'TM_0009', this.funcID).subscribe();
          } else if (this.task.approveStatus == '4') {
            this.tmSv.sendAlertMail(this.task.recID, 'TM_0011', this.funcID).subscribe();
          } else if (this.task.approveStatus == '2') {
            this.tmSv.sendAlertMail(this.task.recID, 'TM_0010', this.funcID).subscribe();
          }
        } else this.dialog.close();
      });
  }

  saveVerifyStatus() {
    this.task.verifyComment = this.comment;
    if (
      this.task.verifyStatus == '3' &&
      (this.task.verifyComment == null || this.task.verifyComment.trim() == '')
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
          this.notiService.notifyCode('SYS007');
          if (this.task.verifyStatus == '2') {
            this.tmSv.sendAlertMail(this.task?.recID, 'TM_0016', this.funcID).subscribe();
          } else if (this.task.verifyStatus == '3') {
            this.tmSv.sendAlertMail(this.task?.recID, 'TM_0017', this.funcID).subscribe();
          }
          //this.notiService.notify('Duyệt công việc thành công !');
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
