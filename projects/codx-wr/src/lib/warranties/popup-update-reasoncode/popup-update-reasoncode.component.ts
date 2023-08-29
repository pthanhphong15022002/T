import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { WR_WorkOrderUpdates } from '../../_models-wr/wr-model.model';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { CodxWrService } from '../../codx-wr.service';

@Component({
  selector: 'lib-popup-update-reasoncode',
  templateUrl: './popup-update-reasoncode.component.html',
  styleUrls: ['./popup-update-reasoncode.component.css'],
})
export class PopupUpdateReasonCodeComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;

  data = new WR_WorkOrderUpdates();
  dialog: DialogRef;
  title = '';
  showLabelAttachment = false;
  isHaveFile = false;

  dateControl = false;
  commentControl = false;
  startTime: any = null;
  endTime: any = null;
  selectedDate: Date;
  beginHour = 0;
  beginMinute = 0;
  endHour = 0;
  endMinute = 0;
  startDate: any;
  endDate: any;
  edit = false;
  countFile = 0;
  countFileDelete = 0;
  gridViewSetup: any;
  countValidate = 0;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callFc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private wrSv: CodxWrService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    // this.data = JSON.parse(JSON.stringify(dialog.dataService?.dataSelected));
    this.title = dt?.data?.title;
    this.data.transID = dt?.data?.transID;
    this.data.engineerID = dt?.data?.engineerID;
    this.gridViewSetup = dt?.data?.gridViewSetup;
  }
  ngOnInit(): void {
    this.data.recID = Util.uid();
  }

  //#region save
  async onSave() {
    this.countValidate = this.wrSv.checkValidate(this.gridViewSetup, this.data);
    if (this.countValidate > 0) {
      return;
    }
    if (this.data.scheduleStart && this.data.scheduleEnd) {
      if(new Date(this.data.scheduleStart) < new Date()){
        this.notiService.notifyCode('WR003');
        return;
      }

      if (new Date(this.data.scheduleStart) > new Date(this.data.scheduleEnd)) {
        this.notiService.notifyCode('WR002');
        return;
      }
      this.data.scheduleTime =
        moment(this.data.scheduleStart).format('DD/MM/YYYY') +
        ' ' +
        this.startTime +
        ' - ' +
        this.endTime;
    }

    this.data.attachments = this.edit
      ? this.data.attachments + this.countFile - this.countFileDelete
      : this.countFile;
    if (this.attachment?.fileUploadList?.length > 0) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.updateReason();
        }
      });
    } else {
      this.updateReason();
    }
  }

  updateReason() {
    this.api
      .execSv<any>(
        'WR',
        'ERM.Business.WR',
        'WorkOrderUpdatesBusiness',
        'UpdateReasonCodeAsync',
        [this.data]
      )
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res);
          this.notiService.notifyCode('SYS007');
        }
      });
  }

  //#endregion

  async valueChange(e) {
    this.data[e?.field] = e?.data;
    if (e?.field == 'statusCode') {
      this.dateControl = e?.component?.itemsSelected[0]?.DateControl;
      if (this.dateControl) {
        this.gridViewSetup.ScheduleStart.isRequire = true;
        this.gridViewSetup.ScheduleEnd.isRequire = true;
        this.data.scheduleStart = new Date(new Date().getTime() + 3600000);
        this.data.scheduleEnd = new Date(
          this.data.scheduleStart.getTime() + 3600000
        );
        this.selectedDate = moment(new Date(this.data?.scheduleStart))
          .set({ hour: 0, minute: 0, second: 0 })
          .toDate();
        this.setTimeEdit();
      } else {
        this.data.scheduleStart = null;
        this.data.scheduleEnd = null;
        this.data.scheduleTime = '';
        this.gridViewSetup.ScheduleStart.isRequire = false;
        this.gridViewSetup.ScheduleEnd.isRequire = false;
      }
      this.commentControl = e?.component?.itemsSelected[0]?.CommentControl;
      if (this.commentControl) {
        this.gridViewSetup.Comment.isRequire = true;
        this.data.comment = e?.component?.itemsSelected[0]?.Comment;
      } else {
        this.gridViewSetup.Comment.isRequire = false;
        this.data.comment = '';
      }
      if (e?.data) {
        let wordOrder = await firstValueFrom(
          this.api.execSv<any>(
            'WR',
            'ERM.Business.WR',
            'WorkOrderUpdatesBusiness',
            'GetWorkOrderUpdateByStatusCodeAsync',
            [this.data?.statusCode, this.data.transID]
          )
        );
        if (wordOrder != null) {
          this.data.recID = wordOrder?.recID;
          this.data.attachments = wordOrder?.attachments ?? 0;
          this.edit = true;
        } else {
          this.data.recID = Util.uid();
          this.data.attachments = 0;
          this.countFile = 0;
          this.edit = false;
        }
      }
    }
    this.detectorRef.detectChanges();
  }

  //#region date schedule

  setTimeEdit() {
    var getStartTime = new Date(this.data?.scheduleStart);
    var current =
      this.padTo2Digits(getStartTime.getHours()) +
      ':' +
      this.padTo2Digits(getStartTime.getMinutes());
    this.startTime = current;
    var getEndTime = new Date(this.data?.scheduleEnd);
    var current1 =
      this.padTo2Digits(getEndTime.getHours()) +
      ':' +
      this.padTo2Digits(getEndTime.getMinutes());
    this.endTime = current1;

    this.detectorRef.detectChanges();
  }

  padTo2Digits(num) {
    return String(num).padStart(2, '0');
  }
  valueDateChange(event: any) {
    if (this.data.scheduleStart != event?.data?.fromDate) {
      this.data.scheduleStart = event?.data?.fromDate;
      this.selectedDate = moment(new Date(this.data.scheduleStart))
        .set({ hour: 0, minute: 0, second: 0 })
        .toDate();
      this.setDate();
    }
  }

  valueStartTimeChange(event: any) {
    this.startTime = event.data.fromDate;
    // this.fullDayChangeWithTime();
    // this.isFullDay = false;
    this.setDate();
    this.detectorRef.detectChanges();
  }

  valueEndTimeChange(event: any) {
    this.endTime = event.data.toDate;
    // this.fullDayChangeWithTime();
    // this.isFullDay = false;
    this.setDate();
    this.detectorRef.detectChanges();
  }

  setDate() {
    if (this.startTime != null && this.endTime != null) {
      if (this.startTime) {
        this.beginHour = parseInt(this.startTime.split(':')[0]);
        this.beginMinute = parseInt(this.startTime.split(':')[1]);
        if (this.selectedDate) {
          if (!isNaN(this.beginHour) && !isNaN(this.beginMinute)) {
            this.startDate = new Date(
              this.selectedDate.setHours(this.beginHour, this.beginMinute, 0)
            );
            if (this.startDate) {
              this.data.scheduleStart = this.startDate;
            }
          }
        }
      }
      if (this.endTime) {
        this.endHour = parseInt(this.endTime.split(':')[0]);
        this.endMinute = parseInt(this.endTime.split(':')[1]);
        if (this.selectedDate) {
          if (!isNaN(this.endHour) && !isNaN(this.endMinute)) {
            this.endDate = new Date(
              this.selectedDate.setHours(this.endHour, this.endMinute, 0)
            );
            if (this.endDate) {
              this.data.scheduleEnd = this.endDate;
            }
          }
        }
      }
      this.detectorRef.detectChanges();
    }
  }
  //#endregion

  //#region file

  addFile(e) {
    this.attachment.uploadFile();
  }
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) {
      if (e > 0) {
        this.countFile = e;
      }

      this.isHaveFile = true;
    } else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  fileDelete(e) {
    if (e) {
      this.countFileDelete = e.length;
    }
    console.log(e);
  }

  fileAdded(e) {
    if (e?.data) {
      this.countFile = e?.data.length;
    }
  }
  //#endregion
}
