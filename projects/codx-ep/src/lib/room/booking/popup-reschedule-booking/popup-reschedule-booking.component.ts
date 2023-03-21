import { CodxEpService } from './../../../codx-ep.service';
import {
  Component,
  OnInit,
  Optional,
  ChangeDetectorRef,
  Injector,
  ViewChild,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { APICONSTANT } from '@shared/constant/api-const';
import { Resource } from '../../../models/resource.model';

@Component({
  selector: 'popup-reschedule-booking',
  templateUrl: './popup-reschedule-booking.component.html',
  styleUrls: ['./popup-reschedule-booking.component.css'],
})
export class PopupRescheduleBookingComponent
  extends UIComponent
  implements OnInit
{
  @ViewChild('cusCBB') cusCBB: any;
  bookingOn: any;
  dialogRef: any;
  title = '';
  data: any;
  startTime: any = null;
  endTime: any = null;
  isFullDay: boolean = false;
  calendarID: string;
  startTimeWork: any;
  endTimeWork: any;
  dayOnWeeks = [];
  selectedDate: Date;
  beginHour = 0;
  beginMinute = 0;
  endHour = 0;
  endMinute = 0;
  startDate: any;
  endDate: any;
  funcID: any;
  comment = '';
  showAllResource = false;
  formModel: any;
  headerText: any;
  calendarStartTime: string;
  calendarEndTime: string;
  bookingOnValid: boolean;
  note: any;
  constructor(
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private codxEpService: CodxEpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialogRef = dialog;
    this.data = { ...dialogData.data[0] };
    this.formModel = dialogData.data[1];
    this.dialogRef.formModel = this.formModel;
    this.headerText = dialogData.data[2];
    this.bookingOn = new Date(this.data.bookingOn);
    let tmpStart = new Date(this.data?.startDate);
    let tmpEnd = new Date(this.data?.endDate);
    this.startTime =
      ('0' + tmpStart.getHours()).toString().slice(-2) +
      ':' +
      ('0' + tmpStart.getMinutes()).toString().slice(-2);
    this.endTime =
      ('0' + tmpEnd.getHours()).toString().slice(-2) +
      ':' +
      ('0' + tmpEnd.getMinutes()).toString().slice(-2);
  }

  onInit(): void {
    this.getResourceForCurrentTime();
    this.api
      .callSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleAsync',
        'EPRoomParameters'
      )
      .subscribe((res) => {
        if (res) {
          this.calendarID = JSON.parse(
            res.msgBodyData[0].dataValue
          )?.CalendarID;
          if (this.calendarID) {
            this.api
              .exec<any>(
                APICONSTANT.ASSEMBLY.BS,
                APICONSTANT.BUSINESS.BS.CalendarWeekdays,
                'GetDayShiftAsync',
                [this.calendarID]
              )
              .subscribe((res) => {
                res.forEach((day) => {
                  if (day?.shiftType == '1') {
                    let tmpstartTime = day?.startTime.split(':');
                    this.calendarStartTime =
                      tmpstartTime[0] + ':' + tmpstartTime[1];
                  } else if (day?.shiftType == '2') {
                    let tmpEndTime = day?.endTime.split(':');
                    this.calendarEndTime = tmpEndTime[0] + ':' + tmpEndTime[1];
                  }
                  if (
                    this.startTime == this.calendarStartTime &&
                    this.endTime == this.calendarEndTime
                  ) {
                    this.isFullDay = true;
                  } else {
                    this.isFullDay = false;
                  }
                });
              });
          } else {
            this.api
              .execSv(
                'SYS',
                'ERM.Business.SYS',
                'SettingValuesBusiness',
                'GetByModuleAsync',
                'Calendar'
              )
              .subscribe((res: any) => {
                if (res) {
                  let tempStartTime = JSON.parse(
                    res.dataValue
                  )[0]?.StartTime.split(':');
                  this.calendarStartTime =
                    tempStartTime[0] + ':' + tempStartTime[1];

                  let endTime = JSON.parse(res.dataValue)[1]?.EndTime.split(
                    ':'
                  );
                  this.calendarEndTime = endTime[0] + ':' + endTime[1];
                  if (
                    this.startTime == this.calendarStartTime &&
                    this.endTime == this.calendarEndTime
                  ) {
                    this.isFullDay = true;
                  } else {
                    this.isFullDay = false;
                  }
                }
              });
          }
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  //#region save

  onSave() {
    if (!this.bookingOnCheck()) {
      this.notificationsService.notifyCode('EP001');
      return;
    }
    if (this.data.startDate < new Date()) {
      this.notificationsService.notifyCode('EP001');
      return;
    }
    if (!this.validateStartEndTime(this.startTime, this.endTime)) {
      this.notificationsService.notifyCode('EP002');
      return;
    }
    this.codxEpService
      .rescheduleBooking(this.data, this.note)
      .subscribe((res) => {
        if (res) {
          this.notificationsService.notifyCode('SYS034');
          this.dialogRef && this.dialogRef.close(this.data);
        } else {
          this.dialogRef.close();
        }
      });
  }
  //#region check dieu kien khi add data
  valueAllDayChange(event) {
    if (event?.data == true) {
      this.startTime = this.calendarStartTime;
      this.endTime = this.calendarEndTime;
      this.changeDetectorRef.detectChanges();
    }
  }

  valueBookingOnChange(evt: any) {}
  changeNote(evt: any) {
    if (evt) {
      this.note = evt?.data;
    }
  }
  bookingOnCheck() {
    let selectDate = new Date(this.data.bookingOn);
    let tmpCrrDate = new Date();
    this.data.startDate = new Date(
      selectDate.getFullYear(),
      selectDate.getMonth(),
      selectDate.getDate(),
      this.data.startDate.getHours(),
      this.data.startDate.getMinutes(),
      0,
      0
    );
    this.data.endDate = new Date(
      selectDate.getFullYear(),
      selectDate.getMonth(),
      selectDate.getDate(),
      this.data.endDate.getHours(),
      this.data.endDate.getMinutes(),
      0,
      0
    );
    let crrDate = new Date(
      tmpCrrDate.getFullYear(),
      tmpCrrDate.getMonth(),
      tmpCrrDate.getDate(),
      0,
      0,
      0,
      0
    );
    if (
      new Date(
        selectDate.getFullYear(),
        selectDate.getMonth(),
        selectDate.getDate(),
        0,
        0,
        0,
        0
      ) < crrDate
    ) {
      this.bookingOnValid = true;
      return false;
    } else {
      this.bookingOnValid = false;
      this.changeDetectorRef.detectChanges();
      return true;
    }
  }
  fullDayChangeWithTime() {
    if (
      this.startTime == this.calendarStartTime &&
      this.endTime == this.calendarEndTime
    ) {
      this.isFullDay = true;
    } else {
      this.isFullDay = false;
    }
    this.changeDetectorRef.detectChanges();
  }
  valueStartTimeChange(event: any) {
    if (event?.data) {
      this.startTime = event.data.fromDate;
      this.fullDayChangeWithTime();
      this.changeDetectorRef.detectChanges();
    }
    if (!this.validateStartEndTime(this.startTime, this.endTime)) {
      return;
    }
  }
  valueEndTimeChange(event: any) {
    if (event?.data) {
      this.endTime = event.data.toDate;
      this.fullDayChangeWithTime();
      this.changeDetectorRef.detectChanges();
    }
    if (!this.validateStartEndTime(this.startTime, this.endTime)) {
      return;
    }
  }

  validateStartEndTime(startTime: any, endTime: any) {
    if (startTime != null && endTime != null) {
      let tempStartTime = startTime.split(':');
      let tempEndTime = endTime.split(':');
      let tmpDay = new Date(this.data.bookingOn);

      this.data.startDate = new Date(
        tmpDay.getFullYear(),
        tmpDay.getMonth(),
        tmpDay.getDate(),
        tempStartTime[0],
        tempStartTime[1],
        0
      );

      this.data.endDate = new Date(
        tmpDay.getFullYear(),
        tmpDay.getMonth(),
        tmpDay.getDate(),
        tempEndTime[0],
        tempEndTime[1],
        0
      );

      if (this.data.startDate >= this.data.endDate) {
        let tmpStartT = new Date(this.data.startDate);
        let tmpEndH = tmpStartT.getHours();
        let tmpEndM = tmpStartT.getMinutes();
        if (tmpEndM < 30) {
          tmpEndM = 30;
        } else {
          tmpEndH = tmpEndH + 1;
          tmpEndM = 0;
        }
        this.data.endDate = new Date(
          tmpStartT.getFullYear(),
          tmpStartT.getMonth(),
          tmpStartT.getDate(),
          tmpEndH,
          tmpEndM,
          0,
          0
        );
        this.endTime =
          ('0' + tmpEndH.toString()).slice(-2) +
          ':' +
          ('0' + tmpEndM.toString()).slice(-2);
      }
      this.changeDetectorRef.detectChanges();
    }

    this.getResourceForCurrentTime();
    return true;
  }

  cbbResource = [];
  fields: Object = { text: 'resourceName', value: 'resourceID' };
  cbbResourceName: string;
  getResourceForCurrentTime() {
    if (this.data.startDate && this.data.endDate) {
      this.codxEpService
        .getAvailableResources(
          '1',
          this.data.startDate,
          this.data.endDate,
          this.data.recID,
          this.showAllResource
        )
        .subscribe((res: any) => {
          if (res) {
            this.cbbResource = [];
            Array.from(res).forEach((item: any) => {
              let tmpRes = new Resource();
              tmpRes.resourceID = item.resourceID;
              tmpRes.resourceName = item.resourceName;
              tmpRes.capacity = item.capacity;
              tmpRes.equipments = item.equipments;
              this.cbbResource.push(tmpRes);
            });
            let resourceStillAvailable = false;
            if (this.data.resourceID != null) {
              this.cbbResource.forEach((item) => {
                if (item.resourceID == this.data.resourceID) {
                  resourceStillAvailable = true;
                }
              });
              if (!resourceStillAvailable) {
                this.data.resourceID = null;
                //this.tmplstDevice = [];
                this.cusCBB.value = null;
              } else {
                this.cbxResourceChange(this.data.resourceID);
                this.cusCBB.value = this.data.resourceID;
              }
            }

            this.detectorRef.detectChanges();
          }
        });
    }
  }
  cbxResourceChange(evt: any) {
    if (evt) {
      this.data.resourceID = evt;
      let selectResource = this.cbbResource.filter((obj) => {
        return obj.resourceID == evt;
      });
      if (selectResource) {
        //this.roomCapacity = selectResource[0].capacity;
        //this.tmplstDevice = [];
        // if (
        //   selectResource[0].equipments &&
        //   selectResource[0].equipments.length > 0
        // ) {
        //   selectResource[0].equipments.forEach((item) => {
        //     let tmpDevice = new Device();
        //     tmpDevice.id = item.equipmentID;
        //     if (this.tmplstDeviceEdit.length > 0) {
        //       this.tmplstDeviceEdit.forEach((oldItem) => {
        //         if (oldItem.id == tmpDevice.id) {
        //           tmpDevice.isSelected = oldItem.isSelected;
        //           tmpDevice.createdOn = oldItem.createdOn;
        //           tmpDevice.createdBy = oldItem.createdBy;
        //         }
        //       });
        //     }
        //     this.vllDevices.forEach((vlItem) => {
        //       if (tmpDevice.id == vlItem.value) {
        //         tmpDevice.text = vlItem.text;
        //         tmpDevice.icon = vlItem.icon;
        //       }
        //     });
        //     this.tmplstDevice.push(tmpDevice);
        //   });
        // }
      }
      this.detectorRef.detectChanges();
    }
  }

  showAllResourceChange(evt: any) {
    if (evt != null) {
      this.showAllResource = evt;
      this.getResourceForCurrentTime();
      this.detectorRef.detectChanges();
    }
  }
}
