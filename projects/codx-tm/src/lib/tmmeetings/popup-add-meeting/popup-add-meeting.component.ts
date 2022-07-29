import { CO_Meetings, Resources } from './../../models/CO_Meetings.model';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  CallFuncService,
} from 'codx-core';
import moment from 'moment';

@Component({
  selector: 'lib-popup-add-meeting',
  templateUrl: './popup-add-meeting.component.html',
  styleUrls: ['./popup-add-meeting.component.css'],
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
  title = '';
  showPlan = true;
  data: any;
  isFullDay: boolean;
  beginHour = 0;
  beginMinute = 0;
  endHour = 0;
  endMinute = 0;
  startDate: any;
  endDate: any;
  action: any;
  linkURL = '';
  resources: Resources[] = [];

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
    // if (this.meeting.startDate) {
    //   this.selectedDate = this.meeting.startDate;
    // }
  }

  ngOnInit(): void {
    //  this.openFormMeeting()
    if (this.action == 'add') {
      this.title = 'Thêm họp định kì';
      this.meeting.meetingType = '1';
    } else if (this.action == 'edit') {
      this.title = 'Chỉnh sửa họp định kì';
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
    if (this.action == 'add') {
      op.method = 'AddMeetingsAsync';
      op.className = 'MeetingsBusiness';
      data = [this.meeting, this.functionID];
    } else if (this.action == 'edit') {
      op.method = 'UpdateMeetingsAsync';
      op.className = 'MeetingsBusiness';
      data = [this.meeting];
    }

    op.data = data;
    return true;
  }

  onAdd() {
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

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.update) {
          this.dialog.dataService.setDataSelected(res.update[0]);
        }
      });
    this.dialog.close();
  }

  onSave() {
    if (this.action === 'add') return this.onAdd();
    return this.onUpdate();
  }

  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-playlist_add_check',
      text: 'Người tham gia',
      name: 'Resources',
    },
    { icon: 'icon-playlist_add_check', text: 'Mở rộng', name: 'Open' },
  ];

  setTitle(e: any) {
    if (this.action == 'add') {
      this.title = 'Thêm ' + e;
    } else if (this.action == 'edit') {
      this.title = 'Sửa ' + e;
    }
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
      if (event?.field === 'resources') {
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
    if (this.selectedDate) this.meeting[event.field] = this.selectedDate;
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
            this.meeting.endDate = this.endDate;
          }
        }
        console.log(this.endDate);
      }
      if (this.beginHour >= this.endHour) {
        if (this.beginMinute >= this.endMinute)
          this.notiService.notify('Thời gian không hợp lệ!', 'error');
      }
    }
  }

  openPopupLink() {
    this.callFuncService.openForm(this.addLink, '', 500, 300);
  }

  changeLink(event) {
    this.linkURL = event.data;
    if (this.linkURL) this.meeting.link = this.linkURL;
  }

  valueChangeTags(e) {
    this.meeting.tags = e.data;
  }

  eventApply(e) {
    console.log(e);
    var resourceID = '';
    e?.data?.forEach((element) => {
      resourceID += element.id + ';';
    });
    if (resourceID != '') {
      resourceID = resourceID.substring(0, resourceID.length - 1);
    }
    this.valueUser(resourceID);
    if (this.resources != null) this.meeting.resources = this.resources;
  }

  valueUser(resourceID) {
    if (resourceID != '') {
      if (this.meeting.resources != null) {
        var user = this.meeting.resources;
        var array = resourceID.split(';');
        var id = '';
        var arrayNew = [];
        user.forEach((e) => {
          id += e.resourceID + ';';
        });
        if (id != '') {
          id = id.substring(0, id.length - 1);

          array.forEach((element) => {
            if (!id.split(';').includes(element)) arrayNew.push(element);
          });
        }
        if (arrayNew.length > 0) {
          resourceID = arrayNew.join(';');
          id += ';' + resourceID;
          this.getListUser(resourceID);
        }
      } else {
        this.getListUser(resourceID);
      }
    }
  }

  getListUser(resource) {
    while (resource.includes(' ')) {
      resource = resource.replace(' ', '');
    }
    this.api
      .execSv<any>(
        'CO',
        'ERM.Business.CO',
        'MeetingsBusiness',
        'GetListUserAsync',
        resource
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var tmpResource = new Resources();
            tmpResource.resourceID = emp?.userID;
            tmpResource.resourceName = emp?.userName;
            tmpResource.positionName = emp?.positionName;
            tmpResource.roleType = 'R';
            this.meeting.resources.push(tmpResource);
          }
        }
      });
  }

  onDeleteUser(item) {
    this.meeting.resources.splice(item, 1); //remove element from array
    this.changDetec.detectChanges();
  }
}
