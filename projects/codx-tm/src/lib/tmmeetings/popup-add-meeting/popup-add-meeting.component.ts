import { TmpMemo } from './../../models/task.model';
import {
  CO_Content,
  CO_MeetingTemplates,
} from './../../models/CO_MeetingTemplates.model';
import {
  CO_Meetings,
  CO_Resources,
  EP_BookingAttendees,
  EP_Boooking,
  TmpRoom,
} from './../../models/CO_Meetings.model';
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
  AlertConfirmInputConfig,
} from 'codx-core';
import moment from 'moment';
import { TemplateComponent } from '../template/template.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CheckBox, CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';
import { CodxTMService } from '../../codx-tm.service';

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
  isFullDay: boolean = false;
  beginHour = 0;
  beginMinute = 0;
  endHour = 0;
  endMinute = 0;
  startDate: any;
  endDate: any;
  action: any;
  linkURL = '';
  resources: CO_Resources[] = [];
  listUserID = [];
  template = new CO_MeetingTemplates();
  listRoles: any;
  idUserSelected: any;
  popover: any;
  dialog1: DialogRef;
  dialogPopupLink: DialogRef;
  fromDateSeconds: any;
  toDateSeconds: any;
  templateName: any;
  isCheckTask = true;
  isHaveFile = false;
  showLabelAttachment = false;
  titleAction = '';
  calendarID: string;
  startTimeWork: any;
  endTimeWork: any;
  dayOnWeeks = [];
  selectedDate: Date;
  listTime = [];
  gridViewSetup: any;
  timeBool = false;
  isMeetingDate = true;
  isRoom = false;
  startRoom: any;
  endRoom: any;
  listRoom: TmpRoom[] = [];
  location: any;
  reminder: any;
  fields: Object = { text: 'location', value: 'resourceID' };
  disabledProject = false ;
  listResources :string ='' ;
  constructor(
    private changDetec: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    private callFuncService: CallFuncService,
    private cache: CacheService,
    private tmSv: CodxTMService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.meeting = this.data;
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.action = dt.data[0];
    this.titleAction = dt.data[1];
    this.disabledProject = dt.data[2] ;
    this.listResources = dt?.data[3]
    this.functionID = this.dialog.formModel.funcID;

    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });

    this.api
      .callSv('CO', 'CO', 'MeetingsBusiness', 'IsCheckEpWithModuleLAsync')
      .subscribe((res) => {
        this.isRoom = res.msgBodyData[0];
      });

    if (this.action == 'add') {
      this.meeting.startDate = new Date();
    }
    this.selectedDate = moment(new Date(this.meeting.startDate))
      .set({ hour: 0, minute: 0, second: 0 })
      .toDate();
    this.getTimeParameter();
    // this.getTimeWork(new Date());

    // this.getTimeWork(this.selectedDate);

    if (this.action == 'add' || this.action == 'copy') {
      let listUser = this.user?.userID
      if(this.listResources) listUser += ";"+this.listResources
      this.getListUser(listUser);
    }
    this.cache.valueList('CO001').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnInit(): void {
    this.loadTime();
  }
  ngAfterViewInit(): void {
    if (this.action == 'add') {
      this.meeting.meetingType = '1';
      this.resources = [];
    } else if (this.action == 'edit') {
      // this.setTimeEdit();

      this.showLabelAttachment = this.meeting?.attachments > 0 ? true : false;
      this.resources = this.meeting.resources;
      if (this.resources?.length > 0) {
        this.resources.forEach((obj) => this.listUserID.push(obj.resourceID));
      }
    } else if (this.action == 'copy') {
      this.meeting.meetingType = '1';
      this.resources = [];
      // this.setTimeEdit();
    }
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

  loadTime() {
    this.api
      .execSv<any>('CO', 'CO', 'MeetingsBusiness', 'GetListTimeAsync')
      .subscribe((res) => {
        if (res) {
          this.listTime = res[0];
        }
      });
  }

  loadRoomAvailable(startDate, endDate) {
    this.api
      .callSv(
        'EP',
        'EP',
        'ResourcesBusiness',
        'GetListAvailableResourceAsync',
        ['1', startDate, endDate]
      )
      .subscribe((res) => {
        if (res.msgBodyData[0] && res.msgBodyData[0].length > 0) {
          var list = [];
          this.listRoom = [];
          list = res.msgBodyData[0];
          list.forEach((element) => {
            var lstR = [];
            if (this.listRoom && this.listRoom.length > 0) {
              this.listRoom.forEach((res) => {
                if (!lstR.includes(res.resourceID)) lstR.push(res.resourceID);
              });
            }
            if (!lstR.includes(element.resourceID)) {
              var re = new TmpRoom();
              re['resourceID'] = element.resourceID;
              re['location'] = element.resourceName;
              this.listRoom.push(re);
            }
          });
          this.changDetec.detectChanges();
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
        this.attachment?.clearData();
        if (res) {
          this.dialog.close(res.save);
          //Đặt cuộc họp sau khi thêm mới cuộc họp cần ktra lại xem có tích hợp module EP hay ko
          if(this.isRoom && this.meeting.location != null){
            this.bookingRoomEP(res.save);
          }
          this.tmSv
            .sendMailAlert(this.meeting.recID, 'TM_0023', this.functionID)
            .subscribe();
        } else this.dialog.close();
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        this.attachment?.clearData();
        this.dialog.close();
      });
  }
  ///cần 1 đống mess Code
  async onSave() {
    if (
      this.meeting.meetingName == null ||
      this.meeting.meetingName.trim() == ''
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['MeetingName']?.headerText + '"'
      );
      return;
    }

    if (this.meeting.meetingType == '1') {
      if (!this.meeting.fromDate ) {
        this.notiService.notifyCode(
          'SYS009',
          0,
          '"' + this.gridViewSetup['FromDate']?.headerText + '"'
        );
        return;
      }
      if (!this.meeting.toDate) {
        this.notiService.notifyCode(
          'SYS009',
          0,
          '"' + this.gridViewSetup['ToDate']?.headerText + '"'
        );
        return;
      }
    }
    if (this.isCheckStartEndTime(this.meeting.startDate)) {
      this.notiService.notifyCode('CO002');
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

    var re = Number(this.meeting.reminder);

    if (re < 0) {
      this.notiService.notify(
        'Vui lòng chỉ được nhập số lớn hơn hoặc bằng 0'
      );
      return;
    }

    if(re > 0){
      if (re % 1 != 0) {
        this.notiService.notify(
          'Vui lòng không nhập số lẻ'
        );
        return;
      }
    }


    if (this.meeting.fromDate >= this.meeting.toDate) {
      this.notiService.notifyCode('TM034');
      return;
    }
    // //Chưa có mssg code
    // if (this.isCheckFromToDate(this.meeting.toDate)) {
    //   this.notiService.notify(
    //     'Vui lòng chọn ngày kết thúc nhỏ hơn ngày hiện tại!'
    //   );
    //   return;
    // }
    this.listTime.forEach((res) => {
      var d1 = new Date(res.startDate).toLocaleDateString();
      var d2 = new Date(this.meeting.endDate).toLocaleDateString();
      if (d1 === d2) {
        var startTime =
          new Date(res.startDate).getHours() * 60 +
          new Date(res.startDate).getMinutes();
        var endTime =
          new Date(res.endDate).getHours() * 60 +
          new Date(res.endDate).getMinutes();

        var startDate =
          new Date(this.meeting.startDate).getHours() * 60 +
          new Date(this.meeting.startDate).getMinutes();
        var endDate =
          new Date(this.meeting.endDate).getHours() * 60 +
          new Date(this.meeting.endDate).getMinutes();

        if (
          (startTime <= startDate && startDate < endTime) ||
          (endDate > startTime && endDate <= endTime) ||
          (startTime >= startDate && endDate >= endTime)
        ) {
          this.timeBool = true;
          return;
        } else {
          this.timeBool = false;
        }
        if (this.timeBool) {
          return;
        }
      }
    });

    //confirm
    if (
      this.meeting.isOnline &&
      (!this.meeting.link || this.meeting.link.trim() == '')
    ) {
      this.notiService.alertCode('CO004').subscribe((res) => {
        if (res?.event && res?.event?.status == 'Y')
          this.confirmResourcesTrackEvent();
        else return;
      });
    } else this.confirmResourcesTrackEvent();

    //edit van kiem tra =>Nếu ok thì xóa để không nặng code
    // if (this.action === 'add' || this.action === 'copy') {
    //   this.tmSv
    //   .getResourcesTrackEvent(
    //     this.meeting.resources,
    //     this.meeting.startDate.toUTCString(),
    //     this.meeting.endDate.toUTCString()
    //   )
    //   .subscribe((res) => {
    //     if (res && res.length > 0) {
    //       var resource = '';
    //       res.forEach((element) => {
    //         resource += element.objectName + ', ';
    //       });
    //       if(resource != ''){
    //         resource = resource.substring(0,resource.length-2);
    //       }
    //       this.notiService
    //           .alertCode('TM063', null, ' "' + resource + '" ')
    //           .subscribe((x) => {
    //             if (x.event.status == 'N') {
    //               return;
    //             } else {
    //               this.save();
    //             }
    //           });
    //     }else{
    //       this.save();
    //     }
    //   });
    // } else {
    //   this.save();
    // }
  }
  //chuyển và làm gọn hàm gọi event của P
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
              if (x?.event && x?.event?.status == 'Y') this.save();
              else return;
            });
        } else {
          this.save();
        }
      });
  }

  async save() {
    if (this.attachment?.fileUploadList?.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          var countAttack = 0;
          countAttack = Array.isArray(res) ? res.length : 1;
          if (this.action === 'edit') {
            this.meeting.attachments += countAttack;
          } else {
            this.meeting.attachments = countAttack;
          }
          if (this.action === 'add' || this.action === 'copy') this.onAdd();
          else this.onUpdate();
        }
      });
    else {
      if (this.action === 'add' || this.action === 'copy') this.onAdd();
      else this.onUpdate();
    }
  }

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
      this.isMeetingDate = true;
      return false;
    } else {
      this.isMeetingDate = false;
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
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-person',
      text: 'Người tham gia',
      name: 'Resources',
    },
    { icon: 'icon-playlist_add_check', text: 'Mở rộng', name: 'Open' },
    { icon: 'icon-work_outline', text: 'Công việc review', name: 'Job' },
  ];

  setTitle(e: any) {
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
    //this.changDetec.detectChanges();
  }
  cbxChange(e) {
    this.meeting.location = e;
  }

  valueCbx(id, e) {
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
    this.setDate();
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
      this.selectedDate = moment(new Date(this.meeting.startDate))
        .set({ hour: 0, minute: 0, second: 0 })
        .toDate();
      // this.getTimeWork(this.selectedDate);
      this.setDate();
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
    if(this.isRoom){
      this.loadRoomAvailable(this.meeting.startDate, this.meeting.endDate);
    }
  }

  openPopupLink() {
    this.dialogPopupLink = this.callFuncService.openForm(
      this.addLink,
      '',
      500,
      10
    );
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
    this.meeting.link = this.linkURL;
  }

  valueChangeTags(e) {
    this.meeting.tags = e.data;
  }

  eventApply(e) {
    var listUserID = '';
    var listDepartmentID = '';
    var listUserIDByOrg = '';
    var type = 'U';
    e?.data?.forEach((obj) => {
      if (obj.objectType && obj.id) {
        type = obj.objectType;
        switch (obj.objectType) {
          case 'U':
            listUserID += obj.id + ';';
            break;
          case 'O':
          case 'D':
            listDepartmentID += obj.id + ';';
            break;
        }
      }
    });
    if (listUserID != '') {
      listUserID = listUserID.substring(0, listUserID.length - 1);
      this.valueUser(listUserID);
    }

    if (listDepartmentID != '')
      listDepartmentID = listDepartmentID.substring(
        0,
        listDepartmentID.length - 1
      );
    if (listDepartmentID != '') {
      this.tmSv
        .getListUserIDByListOrgIDAsync([listDepartmentID, type])
        .subscribe((res) => {
          if (res) {
            listUserIDByOrg += res;
            if (listUserID != '') listUserIDByOrg += ';' + listUserID;
            this.valueUser(listUserIDByOrg);
          }
        });
    }
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
    var arrUser = resource.split(';');
    this.listUserID = this.listUserID.concat(arrUser);
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(resource.split(';'))
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

  onDeleteUser(index, list: CO_Resources[] = null) {
    if (list == null) {
      if (
        this.meeting &&
        this.meeting.resources &&
        this.meeting.resources.length > 0
      ) {
        this.meeting.resources.splice(index, 1);
        this.listUserID.splice(index, 1);
        this.changDetec.detectChanges();

      } else {
        if (list && list.length > 0) {
          list.splice(index, 1);
          this.listUserID.splice(index, 1);
          //remove element from array
          this.changDetec.detectChanges();
        }
      }
    }
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
  }
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    if (
      this.action != 'edit' ||
      (this.action == 'edit' && !this.showLabelAttachment)
    )
      this.showLabelAttachment = this.isHaveFile;
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
          if (this.action === 'add') {
            this.reminder = param.Reminder;
            this.meeting.reminder = this.reminder;
          }
          this.calendarID = param.CalendarID;
          this.calendarID = this.calendarID != '' ? this.calendarID : 'STD'; //gan de tesst
          this.getTimeWork(new Date());
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
          if (this.action === 'add') {
            this.startTime = this.startTimeWork;
          }
          this.endTimeWork = this.startTimeWork
            ? this.endTimeWork
            : endShiftType1;
          if (this.action === 'add') {
            this.endTime = this.endTimeWork;
          }
          if (this.action != 'add') this.setTimeEdit();
        }
      });
  }

  //end
  bookingRoomEP(data) {
    //chuyển model meeting sang booking
    let booking = new EP_Boooking();
    booking.resourceID = data?.location;
    booking.status = data.status;
    booking.startDate = data.startDate;
    booking.endDate = data.endDate;
    booking.link = data.link;
    // booking.link2 = data.link2;
    booking.memo = data.memo;
    booking.online = data.online;
    booking.bookingOn = data.startDate;
    // booking.approveStatus = '1';
    booking.resourceType = '1';
    //cần kiểm tra lại mapping cho 2 field này
    booking.title = data.meetingName; // tiêu đề cuộc họp
    booking.reasonID = null;
    booking.refID = data.meetingID; //mã lí do cuộc họp
    //tạo ds người tham gia cho EP
    let bookingAttendees = [];
    data.resources.forEach((item) => {
      let attender = new EP_BookingAttendees();
      attender.userID = item.resourceID;
      attender.roleType = item.roleType;
      attender.userName = item.resourceName;
      // attender.optional = item.optional;
      // attender.status = item.status;
      bookingAttendees.push(attender);
    });
    this.api
      .execSv('EP', 'ERM.Business.EP', 'BookingsBusiness', 'AddEditItemAsync', [
        booking,
        true,
        bookingAttendees,
      ])
      .subscribe((res) => {
      });
  }
}
