import { CO_Meetings } from './../../models/CO_Meetings.model';
import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
} from 'codx-core';
import moment from 'moment';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'lib-popup-reschedule-meeting',
  templateUrl: './popup-reschedule-meeting.component.html',
  styleUrls: ['./popup-reschedule-meeting.component.css'],
})
export class PopupRescheduleMeetingComponent implements OnInit {
  meeting = new CO_Meetings();
  dialog: any;
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
  constructor(
    private api: ApiHttpService,
    private changDetec: ChangeDetectorRef,
    private notiService: NotificationsService,
    private tmSv: CodxTMService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = dt.data;
    this.meeting = JSON.parse(JSON.stringify(this.data.data));
    this.funcID = this.data.funcID;
    this.title = this.data.title;
    this.selectedDate = moment(new Date(this.meeting.startDate))
      .set({ hour: 0, minute: 0, second: 0 })
      .toDate();
    this.getTimeParameter();
  }

  ngOnInit(): void {}

  //#region save
  onSave(){
    if (this.isCheckStartEndTime(this.meeting.startDate)) {
      this.notiService.notify(' "Giờ" họp phải lớn hơn "Giờ" hiện tại !');
      return;
    }

    if (this.checkDateMeeting() == false) {
      this.notiService.notifyCode('CO002');
      return;
    }
    if (this.validateStartEndTime(this.startTime, this.endTime) == false) {
      this.notiService.notifyCode('CO002');
      return;
    }
    this.confirmResourcesTrackEvent();
  }
  //#endgion

  //#region Kiểm tra resources có trùng lịch hay không
  confirmResourcesTrackEvent() {
    this.tmSv
      .getResourcesTrackEvent(
        this.meeting.meetingID,
        this.meeting.resources,
        this.meeting.startDate.toUTCString(),
        this.meeting.endDate.toUTCString()
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          var resource = '';
          res.forEach((element) => {
            resource += element.objectName + ', ';
          });
          if (resource != '') {
            resource = resource.substring(0, resource.length - 2);
          }
          this.notiService
            .alertCode('TM063', null, ' "' + resource + '" ')
            .subscribe((x) => {
              if (x?.event && x?.event?.status == 'Y') {
                this.onUpdate();
              }
              else return;
            });
        } else {
          this.onUpdate();
        }
      });

  }

  onUpdate(){
    this.tmSv.UpdateDateMeeting(this.meeting.meetingID, this.meeting.startDate, this.meeting.endDate, this.funcID, this.comment).subscribe(res=>{
      if(res){
        this.dialog.close(res);
        //chưa có mssgcode dời lịch
        this.notiService.notify('Cập nhật thành công');
        this.tmSv.changeBookingDateTime(this.meeting.recID, this.meeting.startDate.toUTCString(), this.meeting.endDate.toUTCString())
        this.tmSv.sendMailAlert(this.meeting.recID, 'TM_0023', this.funcID).subscribe();
        //dời phòng bên EP
        // this.api.execSv(
        //   'EP',
        //   'ERM.Business.EP',
        //   'BookingsBusiness',
        //   'ChangeBookingDateTimeAsync',
        //   [this.meeting.recID, this.meeting.startDate.toUTCString(), this.meeting.endDate.toUTCString()]
        // ).subscribe(res=>{});
      }else
        this.dialog.close();
    })
  }
  //#endregion

  //#region check dieu kien khi add meeting

  checkDateMeeting() {
    let selectDate = new Date(this.meeting.startDate);
    let tmpCrrDate = new Date();
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
      return false;
    } else {
      this.changDetec.detectChanges();
      return true;
    }
  }

  isCheckStartEndTime(startDate) {
    var d1 = new Date().toLocaleDateString();
    var d2 = new Date(startDate).toLocaleDateString();
    if (d1 == d2) {
      var startTime =
        new Date(startDate).getHours() * 60 + new Date(startDate).getMinutes();
      var now = new Date().getHours() * 60 + new Date().getMinutes();
      if (startTime <= now) return true;
      else return false;
    } else return false;
  }

  isCheckFromToDate(toDate) {
    var to = new Date(toDate);
    if (to >= new Date()) return true;
    else return false;
  }

  validateStartEndTime(startTime: any, endTime: any) {
    if (startTime != null && endTime != null) {
      let tempStartTime = startTime.split(':');
      let tempEndTime = endTime.split(':');
      let tmpDay = this.meeting.startDate;

      this.meeting.startDate = new Date(
        tmpDay.getFullYear(),
        tmpDay.getMonth(),
        tmpDay.getDate(),
        tempStartTime[0],
        tempStartTime[1],
        0
      );

      this.meeting.endDate = new Date(
        tmpDay.getFullYear(),
        tmpDay.getMonth(),
        tmpDay.getDate(),
        tempEndTime[0],
        tempEndTime[1],
        0
      );

      if (this.meeting.startDate >= this.meeting.endDate) {
        let tmpStartT = new Date(this.meeting.startDate);
        let tmpEndH = tmpStartT.getHours();
        let tmpEndM = tmpStartT.getMinutes();
        if (tmpEndM < 30) {
          tmpEndM = 30;
        } else {
          tmpEndH = tmpEndH + 1;
          tmpEndM = 0;
        }
        this.meeting.endDate = new Date(
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
      this.changDetec.detectChanges();
    }
    return true;
  }
  //#endregion

  //#region event
  valueDateChange(event: any) {
    this.meeting[event.field] = event.data.fromDate;
    if (event.field == 'startDate') {
      this.selectedDate = moment(new Date(this.meeting.startDate))
        .set({ hour: 0, minute: 0, second: 0 })
        .toDate();
      this.getTimeWork(this.selectedDate);
      this.setDate();
    }
  }

  fullDayChangeWithTime() {
    if (
      this.startTime == this.startTimeWork &&
      this.endTime == this.endTimeWork
    ) {
      this.isFullDay = true;
    } else {
      this.isFullDay = false;
    }
    this.changDetec.detectChanges();
  }

  valueStartTimeChange(event: any) {
    this.startTime = event.data.fromDate;
    this.fullDayChangeWithTime();
    // this.isFullDay = false;
    this.setDate();
    this.changDetec.detectChanges();
  }

  valueEndTimeChange(event: any) {
    this.endTime = event.data.toDate;
    this.fullDayChangeWithTime();

    // this.isFullDay = false;
    this.setDate();
    this.changDetec.detectChanges();
  }

  valueChangeCheckFullDay(e) {
    this.isFullDay = e.data;
    if (this.isFullDay) {
      this.startTime = this.startTimeWork;
      this.endTime = this.endTimeWork;
    } else {
      this.endTime = null;
      this.startTime = null;
    }
    this.setDate();
  }

  valueChange(data) {
    if (data?.data) {
      this.comment = data?.data ? data?.data : '';
    }
    this.changDetec.detectChanges;
  }
  //#endregion

  //region time work
  setDate() {
    if (this.startTime) {
      this.beginHour = parseInt(this.startTime.split(':')[0]);
      this.beginMinute = parseInt(this.startTime.split(':')[1]);
      if (this.selectedDate) {
        if (!isNaN(this.beginHour) && !isNaN(this.beginMinute)) {
          this.startDate = new Date(
            this.selectedDate.setHours(this.beginHour, this.beginMinute, 0)
          );
          if (this.startDate) {
            this.meeting.startDate = this.startDate;
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
            this.meeting.endDate = this.endDate;
          }
        }
      }
      if (this.beginHour >= this.endHour) {
        if (this.beginMinute >= this.endMinute)
          this.notiService.notifyCode('TM036');
      }
    }
  }

  getTimeParameter() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleWithCategoryAsync',
        ['TMParameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          var param = JSON.parse(res.dataValue);
          this.calendarID = param.CalendarID;
          this.calendarID = this.calendarID != '' ? this.calendarID : 'STD'; //gan de tesst
          this.getTimeWork(
            moment(new Date(this.meeting.startDate))
              .set({ hour: 0, minute: 0, second: 0 })
              .toDate()
          );
        }
      });
  }

  getTimeWork(date) {
    this.api
      .execSv<any>(
        'BS',
        'ERM.Business.BS',
        'CalendarWeekdaysBusiness',
        'GetDayShiftAsync',
        [this.calendarID]
      )
      .subscribe((data) => {
        if (data) {
          this.dayOnWeeks = data;
          var current_day = date.getDay();
          var endShiftType1 = '';
          var starrShiftType2 = '';
          for (var i = 0; i < this.dayOnWeeks.length; i++) {
            var day = this.dayOnWeeks[i];
            if (day.shiftType == '1') {
              this.startTimeWork = day.startTime;
              endShiftType1 = day.endTime;
            }
            if (day.shiftType == '2') {
              this.endTimeWork = day.endTime;
              starrShiftType2 = day.startTime;
            }
          }

          this.startTimeWork = this.startTimeWork
            ? this.startTimeWork
            : starrShiftType2;
          this.endTimeWork = this.endTimeWork
            ? this.endTimeWork
            : endShiftType1;

          this.setTimeEdit();
        }
      });
  }

  setTimeEdit() {
    var getStartTime = new Date(this.meeting.startDate);
    var current =
      this.padTo2Digits(getStartTime.getHours()) +
      ':' +
      this.padTo2Digits(getStartTime.getMinutes());
    this.startTime = current;
    var getEndTime = new Date(this.meeting.endDate);
    var current1 =
      this.padTo2Digits(getEndTime.getHours()) +
      ':' +
      this.padTo2Digits(getEndTime.getMinutes());
    this.endTime = current1;
    if (
      this.startTime == this.startTimeWork &&
      this.endTime == this.endTimeWork
    ) {
      this.isFullDay = true;
    }
    if (this.meeting.fromDate)
      this.meeting.fromDate = moment(new Date(this.meeting.fromDate)).toDate();
    if (this.meeting.toDate)
      this.meeting.toDate = moment(new Date(this.meeting.toDate)).toDate();
    this.changDetec.detectChanges();
  }

  padTo2Digits(num) {
    return String(num).padStart(2, '0');
  }

  //end
}
