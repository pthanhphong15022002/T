
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
import { CodxBookingService } from '../codx-booking.service';
import { Resource } from '../codx-booking.model';

@Component({
  selector: 'codx-reschedule-booking-room',
  templateUrl: './codx-reschedule-booking-room.component.html',
  styleUrls: ['./codx-reschedule-booking-room.component.css'],
})
export class CodxRescheduleBookingRoomComponent
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
  showAllResource = true;
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
    private codxBookingService: CodxBookingService,
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
    this.codxBookingService
      .getDataValueOfSettingAsync("EPParameters", null, '1')
      .subscribe((res: string) => {
        if (res) {
          let epSetting = JSON.parse(res);
          this.calendarID = epSetting?.CalendarID;
          if (this.calendarID) {
            this.codxBookingService
              .getCalendarWeekdays(this.calendarID)
              .subscribe((cal: any) => {
                if (cal) {
                  Array.from(cal).forEach((day:any) => {
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
                }
              });
          }
        }
      });  
    
  }

  //#region save

  onSave() {
    this.bookingOnCheck();   
    this.validateStartEndTime(this.startTime, this.endTime); 
    if ( this.data.startDate ==null || this.data.endDate ==null || this.data.startDate >= this.data.endDate) {
      this.notificationsService.notifyCode('EP002');
      return;
    }
    this.codxBookingService
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
    this.validateStartEndTime(this.startTime, this.endTime);
  }
  valueEndTimeChange(event: any) {
    if (event?.data) {
      this.endTime = event.data.toDate;
      this.fullDayChangeWithTime();
      this.changeDetectorRef.detectChanges();
    }
    this.validateStartEndTime(this.startTime, this.endTime);
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
      this.changeDetectorRef.detectChanges();
    }

    return true;
  }

  cbbResource = [];
  fields: Object = { text: 'resourceName', value: 'resourceID' };
  cbbResourceName: string;
  getResourceForCurrentTime() {
    if (this.data.startDate && this.data.endDate) {
      this.codxBookingService
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
      this.detectorRef.detectChanges();
    }
  }
  showAllResourceChange(show:any){

  }
}
