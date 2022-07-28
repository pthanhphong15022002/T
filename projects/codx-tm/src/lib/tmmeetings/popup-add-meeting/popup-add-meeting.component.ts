import { CO_Meetings } from './../../models/CO_Meetings.model';
import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService, CallFuncService } from 'codx-core';
import moment from 'moment';

@Component({
  selector: 'lib-popup-add-meeting',
  templateUrl: './popup-add-meeting.component.html',
  styleUrls: ['./popup-add-meeting.component.css']
})
export class PopupAddMeetingComponent implements OnInit {
  @Input() meeting = new CO_Meetings();
  @ViewChild('addLink', { static: true }) addLink;

  crrEstimated: any;
  startTime: any = null;
  endTime: any = null;
  dialog: any;
  user: any;
  param: any;
  functionID: string;
  title = ''
  showPlan = true;
  data: any;
  isFullDay: false;
  beginHour = 0;
  beginMinute = 0;
  endHour = 0;
  endMinute = 0;
  startDate: any;
  endDate: any;
  action: any;
  linkURL = '';
  resources = [];

  selectedDate = new Date();
  constructor(
    private changDetec: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    private callFuncService: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    // this.getParam() ;
    this.data = dialog.dataService!.dataSelected;
    this.meeting = this.data;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.action = dt.data;
    this.functionID = this.dialog.formModel.funcID;
    if (this.meeting.startDate) {
      this.selectedDate = this.meeting.startDate;
    }
  }

  ngOnInit(): void {
    //  this.openFormMeeting()
    if(this.action === 'add'){
      this.title = 'Thêm họp định kì'
      this.meeting.meetingType = '1';
    }
    this.isFullDay = false;
  }
  getParam(callback = null) {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleAsync',
        'CO_Meetings'
      )
      .subscribe((res) => {
        if (res) {
          this.param = JSON.parse(res.dataValue);
          return callback && callback(true);
        }
      });
  }

  beforeSave(op) {
    var data = [];
    if (this.action === 'add') {
      op.method = 'AddMeetingsAsync';
      op.className = 'MeetingsBusiness';
      data = [
        this.meeting,
        this.functionID,
      ];
    }

    op.data = data;
    return true;
  }

  onSave() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.save) {
          this.dialog.dataService.setDataSelected(res.save);
          this.dialog.dataService.afterSave.next(res);
          this.changDetec.detectChanges();
        }
      });
    this.dialog.close();
  }

  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-playlist_add_check', text: 'Người tham gia', name: 'Resources' },
    { icon: 'icon-playlist_add_check', text: 'Mở rộng', name: 'Open' },

  ];

  setTitle(e: any) {
    this.title = 'Thêm ' + e;
    this.changDetec.detectChanges();
  }


  valueChange(event) {
    if (event?.field == 'day') {
      this.isFullDay = event.data;
      if (this.isFullDay) {
        this.startTime = '00:00';
        this.endTime = '23:59';
      } else {
        this.endTime = null;
        this.startTime = null;
      }
    } else if (event?.field) {
      if (event?.field === 'resourceID') {
        this.meeting.resources = event.data[0];
      } else {
        if (event.data instanceof Object) {
          this.meeting[event.field] = event.data.value;
        } else {
          this.meeting[event.field] = event.data;
        }
      }
    }
    this.changDetec.detectChanges();
  }

  // valueTime(e) {
  //   if (!e.field || e.data == null) return;
  //   this.meeting[e.field] = e.data?.fromDate;
  //   if (e.field == 'startDate' || e.field == 'endDate') {
  //     let hour = (e.data.fromdate as Date).getHours();
  //     let minutes = (e.data.fromdate as Date).getMinutes();
  //     this.meeting.startDate = new Date(this.selectedDate.setHours(hour, minutes, 0, 0));

  //     this.endDate = new Date(this.selectedDate.getTime());

  //     this.meeting.endDate = new Date(this.endDate.setHours(hour, minutes, 0, 0));
  //     console.log(this.meeting.startDate);
  //     console.log(this.meeting.endDate);

  //   } 
    
  // }

  valueDateChange(event: any) {
    this.selectedDate = event.data.fromDate;
    if(this.selectedDate)
      this.meeting[event.field] = this.selectedDate;
    this.setDate();
  }

  valueStartTimeChange(event: any) {
    this.startTime = event.data.fromDate;
    this.isFullDay = false;
    this.setDate();
  }

  valueEndTimeChange(event: any) {
    this.endTime = event.data.toDate;
    this.isFullDay = false;
    this.setDate();
  }

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
        console.log(this.startDate);
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
            this.meeting.endDate = this.endDate
          }
        }
        console.log(this.endDate);
      }
      if (this.beginHour >= this.endHour) {
        if(this.beginMinute >= this.endMinute)
          this.notiService.notify('Thời gian không hợp lệ!', 'error');
      }
    }
  }

  openPopupLink() {
    this.callFuncService.openForm(this.addLink, '', 500, 300);
  }

  changeLink(event) {
    this.linkURL = event.data;
    if(this.linkURL)
      this.meeting.link = this.linkURL;
  }

  valueChangeTags(e) {
    this.meeting.tags = e.data
  }

  eventApply(e){
    console.log(e);
    var listUserID = '';
    e?.data?.forEach((obj) => {
      switch (obj.objectType) {
        case 'U':
          listUserID += obj.id + ';';
          break;        
      }
    });
    if (listUserID != '')
      listUserID = listUserID.substring(0, listUserID.length - 1);
    
    this.resources = listUserID.split(';');
    
  }
}
