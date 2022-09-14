import {
  CO_Content,
  CO_MeetingTemplates,
} from './../../models/CO_MeetingTemplates.model';
import { CO_Meetings, CO_Resources } from './../../models/CO_Meetings.model';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  CallFuncService,
  CacheService,
} from 'codx-core';
import moment from 'moment';
import { TemplateComponent } from '../template/template.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-popup-add-meeting',
  templateUrl: './popup-add-meeting.component.html',
  styleUrls: ['./popup-add-meeting.component.css'],
})
export class PopupAddMeetingComponent implements OnInit, AfterViewInit {
  @Input() meeting = new CO_Meetings();
  @ViewChild('addLink', { static: true }) addLink;
  @ViewChild('attachment') attachment: AttachmentComponent;

  crrEstimated: any;
  startTime: any = null;
  endTime: any = null;
  dialog: any;
  user: any;
  param: any;
  functionID: string;
  title = '';
  titleLink = 'Link cuộc họp';
  showPlan = true;
  data: any;
  readOnly = false;
  isFullDay: boolean;
  beginHour = 0;
  beginMinute = 0;
  endHour = 0;
  endMinute = 0;
  startDate: any;
  endDate: any;
  action: any;
  linkURL = '';
  resources: CO_Resources[] = [];
  template = new CO_MeetingTemplates();
  listRoles: any;
  idUserSelected: any;
  popover: any;
  dialog1: DialogRef;
  fromDateSeconds: any;
  toDateSeconds: any;
  templateName: any;
  isCheckTask = true;
  selectedDate = new Date();
  isHaveFile = false;
  showLabelAttachment = false;
  titleAction = '';
  calendarID: string;
  startTimeWork: any;
  endTimeWork: any;
  dayOnWeeks = [];

  constructor(
    private changDetec: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    private callFuncService: CallFuncService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.getTimeParameter();
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.meeting = this.data;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.action = dt.data[0];
    this.titleAction = dt.data[1];
    this.functionID = this.dialog.formModel.funcID;

    if (this.action == 'add') {
      this.meeting.meetingType = '1';
      this.meeting.startDate = moment(new Date())
        .set({ hour: 0, minute: 0, second: 0 })
        .toDate();

      this.resources = [];
    } else if (this.action == 'edit') {
      this.setTimeEdit();
      this.resources = this.meeting.resources;
    } else if (this.action == 'copy') {
      this.meeting.meetingType = '1';
      this.resources = [];
      this.setTimeEdit();
    }
    if (this.action == 'add' || this.action == 'copy') {
      this.getListUser(this.user.userID);
    }
    this.getTimeWork(
      moment(new Date(this.meeting.startDate))
        .set({ hour: 0, minute: 0, second: 0 })
        .toDate()
    );

    this.cache.valueList('CO001').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        console.log(res.datas);
        this.listRoles = res.datas;
      }
    });
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    if (this.meeting.templateID) {
      this.api
        .execSv<any>(
          'CO',
          'CO',
          'MeetingTemplatesBusiness',
          'GetTemplateByMeetingAsync',
          this.meeting.templateID
        )
        .subscribe((res) => {
          if (res) {
            this.template = res;
            this.templateName = this.template.templateName;
          }
        });
    }
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
  }

  padTo2Digits(num) {
    return String(num).padStart(2, '0');
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
    if (this.action == 'add' || this.action == 'copy') {
      op.method = 'AddMeetingsAsync';
      op.className = 'MeetingsBusiness';
      this.meeting.meetingType = '1';
      // data = [this.meeting,this.functionID];
      data = [this.meeting];
    } else if (this.action == 'edit') {
      op.method = 'UpdateMeetingsAsync';
      op.className = 'MeetingsBusiness';
      //  data = [this.meeting,this.functionID];
      data = [this.meeting];
    }

    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        this.attachment.clearData();
        if (res) {
          this.dialog.close([res.save]);
        } else this.dialog.close();
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        this.attachment.clearData();
        this.dialog.close();
      });
  }

  async onSave() {
    if (
      this.meeting.meetingName == null ||
      this.meeting.meetingName.trim() == ''
    ) {
      this.notiService.notify('Tên cuộc họp không được để trống !');
      return;
    }
    if (this.meeting.startDate <= new Date()) {
      this.notiService.notify('Thời gian diễn ra cuộc họp phải lớn hơn thời gian hiện tại');
      return;
    }
    if (this.meeting.endDate <= new Date()) {
      this.notiService.notify('Thời gian kết thúc cuộc họp phải lớn hơn thời gian hiện tại !');
      return;
    }
    if (this.meeting.meetingType == '1') {
      if (!this.meeting.fromDate || !this.meeting.toDate) {
        this.notiService.notify('Thời gian review không được để trống !');
        return;
      }
      if (this.meeting.fromDate <= new Date()) {
        this.notiService.notify('Vui lòng nhập thời gian bắt đầu review phải lớn hơn ngày hiện tại !');
        return;
      }

      if (this.meeting.toDate <= new Date()) {
        this.notiService.notify('Vui lòng nhập thời gian kết thức review phải lớn hơn ngày hiện tại !');
        return;
      }
      // if (this.meeting.toDate <= this.meeting.fromDate) {
      //   this.notiService.notifyCode('CO007');
      //   return;
      // }
    }
    if (this.attachment.fileUploadList.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.meeting.attachments = Array.isArray(res) ? res.length : 1;
          if (this.action === 'add' || this.action === 'copy') this.onAdd();
          else this.onUpdate();
        }
      });
    else {
      if (this.action === 'add' || this.action === 'copy') this.onAdd();
      else this.onUpdate();
    }
  }

  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-playlist_add_check',
      text: 'Người tham gia',
      name: 'Resources',
    },
    { icon: 'icon-playlist_add_check', text: 'Mở rộng', name: 'Open' },
    { icon: 'icon-playlist_add_check', text: 'Công việc review', name: 'Job' },
  ];

  setTitle(e: any) {
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
    this.changDetec.detectChanges();
  }

  valueCbx(id, e) {
    console.log(e);
    this.meeting.resources.forEach((res) => {
      if (res.resourceID == id) res.taskControl = e.data;
    });
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
    this.setDate() ;
  }

  valueChange(event) {
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

  changeMemo(event: any) {
    if (event.field) {
      this.meeting[event.field] = event?.data ? event?.data : '';
    }
  }

  valueDateChange(event: any) {
    this.meeting[event.field] = event.data.fromDate;
    if (event.field == 'startDate') {
      this.getTimeWork(this.meeting.startDate);
    }
    // var now = Date.now();
    // if (event.field == 'startDate' || event.field == 'endDate') {
    //   this.selectedDate = event.data.fromDate;
    //   this.meeting[event.field] = this.selectedDate;
    //   // var startDate = this.selectedDate.getTime();
    //   // if (startDate - now < 0) {
    //   //   this.notiService.notifyCode(
    //   //     'Vui lòng chọn "Ngày" lớn hơn hoặc bằng ngày hiện tại'
    //   //   );
    //   // } else {
    //   //   if (this.selectedDate) this.meeting[event.field] = this.selectedDate;
    //   // }
    // } else {
    //   var date = event.data.fromDate;

    //   if (event.field == 'fromDate') {

    //     var fromSeconds = date.getTime();
    //     this.fromDateSeconds = fromSeconds;
    //     if (now - this.fromDateSeconds < 0) {
    //       this.notiService.notifyCode(
    //         'Vui lòng chọn "Ngày bắt đầu" nhỏ hơn ngày hiện tại'
    //       );
    //     } else if (this.toDateSeconds - this.fromDateSeconds < 0) {
    //       this.notiService.notifyCode(
    //         'Vui lòng chọn "Ngày kết thúc" lớn hơn ngày bắt đầu'
    //       );
    //     } else {
    //       this.meeting.fromDate = event.data.fromDate;
    //     }
    //   }
    //   if (event.field == 'toDate') {
    //     var toSeconds = date.getTime();
    //     this.toDateSeconds = toSeconds;
    //     if (now - this.toDateSeconds < 0) {
    //       this.notiService.notifyCode(
    //         'Vui lòng chọn "Ngày kết thúc" nhỏ hơn ngày hiện tại'
    //       );
    //     } else {
    //       if (this.toDateSeconds - this.fromDateSeconds < 0) {
    //         this.notiService.notifyCode(
    //           'Vui lòng chọn "Ngày kết thúc" lớn hơn ngày bắt đầu'
    //         );
    //       } else {
    //         this.meeting.toDate = event.data.fromDate;
    //       }
    //     }
    //   }
    // }
  }

  valueStartTimeChange(event: any) {
    this.startTime = event.data.fromDate;
    // this.isFullDay = false;
    this.setDate();
  }

  valueEndTimeChange(event: any) {
    this.endTime = event.data.toDate;
    // this.isFullDay = false;
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
          this.notiService.notifyCode('TM036');
      }
    }
  }

  openPopupLink() {
    this.callFuncService.openForm(this.addLink, '', 500, 10);
  }

  openPopupTemplate(item: any) {
    this.dialog1 = this.callFuncService.openForm(
      TemplateComponent,
      '',
      1200,
      700,
      '',
      item
    );
    this.dialog1.closed.subscribe((e) => {
      if (e?.event) {
        console.log(e);
        this.meeting.templateID = e.event;
        if (this.meeting.templateID) {
          this.api
            .execSv<any>(
              'CO',
              'CO',
              'MeetingTemplatesBusiness',
              'GetTemplateByMeetingAsync',
              this.meeting.templateID
            )
            .subscribe((res) => {
              if (res) {
                this.template = res;
                this.templateName = this.template.templateName;
              }
            });
        }
      }
    });
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
  }

  valueUser(resourceID) {
    if (resourceID != '') {
      if (this.resources != null) {
        var user = this.resources;
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
            var tmpResource = new CO_Resources();
            if (emp.userID == this.user.userID) {
              tmpResource.resourceID = emp?.userID;
              tmpResource.resourceName = emp?.userName;
              tmpResource.positionName = emp?.positionName;
              tmpResource.roleType = 'A';
              tmpResource.taskControl = true;
              this.resources.push(tmpResource);
            } else {
              tmpResource.resourceID = emp?.userID;
              tmpResource.resourceName = emp?.userName;
              tmpResource.positionName = emp?.positionName;
              tmpResource.roleType = 'P';
              tmpResource.taskControl = true;
              this.resources.push(tmpResource);
            }
            this.meeting.resources = this.resources;
          }
        }
      });
  }

  onDeleteUser(item) {
    const index: number = this.resources.indexOf(item);
    if (index !== -1) {
      this.resources.splice(index, 1);
    }
    this.changDetec.detectChanges();
  }

  showPopover(p, userID) {
    if (this.popover) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }

  selectRoseType(idUserSelected, value) {
    this.meeting.resources.forEach((res) => {
      if (res.resourceID == idUserSelected) res.roleType = value;
    });
    this.changDetec.detectChanges();

    this.popover.close();
  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }

  fileAdded(e) {
    console.log(e);
  }
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    if (this.action != 'edit') this.showLabelAttachment = this.isHaveFile;
  }
  //region time work
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
          var day_name = '';
          switch (current_day) {
            case 0:
              day_name = 'Chủ nhật';
              break;
            case 1:
              day_name = 'Thứ 2';
              break;
            case 2:
              day_name = 'Thứ 3';
              break;
            case 3:
              day_name = 'Thứ 4';
              break;
            case 4:
              day_name = 'Thứ 5';
              break;
            case 5:
              day_name = 'Thứ 6';
              break;
            case 6:
              day_name = 'Thứ 7';
          }
          // this.dayOnWeeks.forEach((day) => {
          //   if (day_name == day.note && day.shiftType == '1') {
          //     return this.startTimeWork = day.startTime.substring(0, 5);
          //   }
          // });
          // this.dayOnWeeks.forEach((day) => {
          //   if (day_name == day.note && day.shiftType == '2') {
          //    return  this.endTimeWork = day.endTime.substring(0, 5);
          //   }
          // });
          for (var i = 0; i < this.dayOnWeeks.length; i++) {
            var day = this.dayOnWeeks[i];
            if (day_name == day.note && day.shiftType == '1') {
              this.startTimeWork = day.startTime.substring(0, 5);
            }
            if (day_name == day.note && day.shiftType == '2') {
              this.endTimeWork = day.endTime.substring(0, 5);
            }
          }
        }
      });
  }

  //end
}
