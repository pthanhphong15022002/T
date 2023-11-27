import { firstValueFrom } from 'rxjs';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  FormatvaluePipe,
  NotificationsService,
} from 'codx-core';
import { WR_WorkOrderUpdates } from '../../_models-wr/wr-model.model';
import { CodxWrService } from '../../codx-wr.service';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import moment from 'moment';

@Component({
  selector: 'lib-popup-update-reasoncode',
  templateUrl: './popup-update-reasoncode.component.html',
  styleUrls: ['./popup-update-reasoncode.component.css'],
  providers: [FormatvaluePipe],
})
export class PopupUpdateReasonCodeComponent implements OnInit, AfterViewInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('inputParent') inputParent: CodxInputComponent;

  data = new WR_WorkOrderUpdates();
  dialog: DialogRef;
  dataWorkOrder: any;
  title = '';
  showLabelAttachment = false;
  isHaveFile = false;

  dateControl = '';
  commentControl = '';
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
  createdBy: any;
  lstTimeVll = [];
  lstUsers = [];
  scheduleTime: any;
  parentID: any;
  dataParentID: any;
  action = '';
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callFc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private wrSv: CodxWrService,
    private cache: CacheService,
    private format: FormatvaluePipe,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.title = dt?.data?.title;
    this.data.transID = dt?.data?.transID;
    this.data.engineerID = dt?.data?.engineerID;
    this.createdBy = dt?.data?.createdBy;
    this.action = dt?.data?.action;
    this.gridViewSetup = JSON.parse(JSON.stringify(dt?.data?.gridViewSetup));
  }

  ngOnInit(): void {
    this.parentID = null;
    if (this.action != 'edit') {
      this.defaultTime(0, '0');
    }
    if (
      this.data != null &&
      this.data?.statusCode != null &&
      this.data?.statusCode?.trim() != ''
    ) {
      this.api
        .execSv<any>(
          'WR',
          'ERM.Business.WR',
          'StatusCodesBusiness',
          'GetOneAsync',
          [this.data?.statusCode]
        )
        .subscribe((res) => {
          if (res) {
            this.dateControl = res?.dateControl;
            this.dataParentID = res?.comment;
            this.parentID = res?.parentID;
            this.setTimeEdit();
          }
        });
    }
  }

  ngAfterViewInit(): void {
    this.cache.valueList('WR007').subscribe((res) => {
      if (res && res?.datas) {
        this.lstTimeVll = res?.datas ?? [];
      }
    });

    let lstIds = [];
    if (this.createdBy) {
      lstIds.push(this.createdBy);
    }

    if (this.data?.engineerID != null && this.data?.engineerID?.trim() != '') {
      lstIds.push(this.data?.engineerID);
    }
    if (lstIds != null && lstIds.length > 0) {
      this.api
        .execSv<any>(
          'SYS',
          'ERM.Business.AD',
          'UsersBusiness',
          'GetUserByIDAsync',
          [lstIds]
        )
        .subscribe((res) => {
          if (res) {
            this.lstUsers = res;
          }
        });
    }

    this.detectorRef.detectChanges();
  }

  //#region save
  async onSave() {
    this.setStartAndEndTime();
    this.countValidate = this.wrSv.checkValidate(this.gridViewSetup, this.data);
    if (this.countValidate > 0) {
      return;
    }
    if (this.data.startDate) {
      if (new Date(this.data.startDate).getDate() < new Date().getDate()) {
        this.notiService.notifyCode('WR003');
        return;
      }
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
    let method = this.action == 'edit' ? 'UpdateAsync' : 'SaveAsync';
    this.api
      .execSv<any>(
        'WR',
        'ERM.Business.WR',
        'WorkOrderUpdatesBusiness',
        method,
        [this.data]
      )
      .subscribe((res) => {
        if (res) {
          this.dialog.close(res);
          this.notiService.notifyCode('SYS007');
        }
      });
  }

  async setStartAndEndTime() {
    if (this.data?.startDate && this.data?.endDate) {
      this.data.scheduleTime =
        this.dateControl == '1'
          ? this.startTime + ' - ' + this.endTime
          : this.endTime;

      const startDate = new Date(this.data.startDate);
      const endDate = new Date(this.data.endDate);
      this.data.scheduleStart = JSON.parse(JSON.stringify(startDate));
      this.data.scheduleEnd = JSON.parse(JSON.stringify(endDate));
      if (this.dateControl == '0') {
        this.data.scheduleStart = null;
        this.data.scheduleEnd = null;
      }
    }
  }

  //#endregion
  valueChangeParent(e) {
    if (e?.data != null && e?.data?.trim() != '') {
      this.dataParentID = e?.data;
      this.setComment(
        e?.component?.itemsSelected[0]?.Comment,
        e?.component?.itemsSelected[0]?.CommentControl
      );
      this.detectorRef.detectChanges();
    }
  }
  async valueChange(e) {
    this.data[e?.field] = e?.data;
    if (e?.field == 'statusCode') {
      if (e?.data != null && e?.data?.trim() != '') {
        this.dataParentID = e?.component?.itemsSelected[0]?.Comment;
        this.parentID = e?.component?.itemsSelected[0]?.ParentID;
        this.data.comment = null;
        this.dateControl = e?.component?.itemsSelected[0]?.DateControl;
        if (this.dateControl) {
          this.defaultTime(
            e?.component?.itemsSelected[0]?.Leadtime,
            this.dateControl
          );
        }
        this.setComment(
          e?.component?.itemsSelected[0]?.Comment,
          e?.component?.itemsSelected[0]?.CommentControl
        );
        if(this.inputParent && this.inputParent?.ComponentCurrent){
          this.inputParent.ComponentCurrent?.setValue(this.dataParentID);
        }
      }
    }
    this.detectorRef.detectChanges();
  }


  setSchedule() {
    let timeList = this.lstTimeVll ?? [];
    let currentDate = new Date();
    const currentTime = new Date();
    const currentHour = currentTime.getHours() * 100 + currentTime.getMinutes();
    let closestStartTime = null;
    let scheduleTime = null;
    for (const hourItem of timeList) {
      const timeRange = hourItem?.text?.split(' - ');
      const startTime = timeRange[0].replace('h', '').replace('h', '');
      if (parseInt(startTime) >= currentHour) {
        closestStartTime = hourItem?.value;
        scheduleTime = hourItem?.text;
        break;
      }
    }

    if (!closestStartTime) {
      currentDate.setDate(currentDate.getDate() + 1);

      closestStartTime = timeList[0]?.value;
      scheduleTime = timeList[0]?.text;
    }
    this.data.startDate = currentDate;
    this.data.scheduleTime = closestStartTime;
    this.scheduleTime = scheduleTime;
    if (this.form) this.form?.formGroup?.patchValue(this.data);
  }

  setComment(comment, commentControl) {
    let commentRep = comment;

    if (comment != null && comment?.trim() != '') {
      let indx = -1;

      if (commentControl == '1') {
        if (
          this.data?.engineerID != null &&
          this.data?.engineerID?.trim() != ''
        ) {
          indx = this.lstUsers.findIndex(
            (x) => x.userID == this.data?.engineerID
          );
          if (indx != -1) {
            commentRep = commentRep.replace(
              '{0}',
              this.lstUsers[indx]?.userName
            );
          } else {
            commentRep = commentRep.replace('{0}', this.data?.engineerID);
          }
        }
      } else {
        if (this.createdBy != null && this.createdBy?.trim() != '') {
          indx = this.lstUsers.findIndex((x) => x.userID == this.createdBy);
          if (indx != -1) {
            commentRep = commentRep.replace(
              '{0}',
              this.lstUsers[indx]?.userName
            );
          } else {
            commentRep = commentRep.replace('{0}', this.createdBy);
          }
        }
      }

      if (this.startTime && this.endTime) {
        this.data.scheduleTime =
          this.dateControl == '1'
            ? this.startTime + ' - ' + this.endTime
            : this.endTime;
        commentRep = commentRep.replace('{1}', this.data.scheduleTime);
      }

      if (this.data.startDate) {
        let date = moment(new Date(this.data.startDate)).format('DD/MM/YYYY');
        commentRep = commentRep.replace('{2}', date);
      }
    }
    this.data.comment = commentRep;
  }

  //#region date schedule
  defaultTime(leadTime, dateControl) {
    const dateNow = new Date();
    const minutes = dateNow.getMinutes();
    const remainder = minutes % 30;
    const minutesToAdd = remainder === 0 ? 0 : 30 - remainder;
    dateNow.setMinutes(minutes + minutesToAdd);

    this.data.startDate = dateNow;
    let dateEnd = JSON.parse(JSON.stringify(this.data.startDate));
    this.data.endDate = new Date(dateEnd);
    if (dateControl == '1') {
      const parseLeadTime =
        parseFloat(leadTime) > 0 ? parseFloat(leadTime) : 30;
      this.data.endDate.setMinutes(minutes + minutesToAdd + parseLeadTime);
    }
    this.setTimeEdit();
  }

  setTimeEdit() {
    this.selectedDate = moment(new Date(this.data?.startDate))
      .set({ hour: 0, minute: 0, second: 0 })
      .toDate();
    var getStartTime = new Date(this.data?.startDate);
    var current =
      this.padTo2Digits(getStartTime.getHours()) +
      ':' +
      this.padTo2Digits(getStartTime.getMinutes());
    this.startTime = current;
    var getEndTime = new Date(this.data?.endDate);
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
    if (this.data.startDate != event?.data?.fromDate) {
      this.data.startDate = event?.data?.fromDate;
      this.selectedDate = moment(new Date(this.data.startDate))
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
              this.data.startDate = this.startDate;
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
              this.data.endDate = this.endDate;
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
