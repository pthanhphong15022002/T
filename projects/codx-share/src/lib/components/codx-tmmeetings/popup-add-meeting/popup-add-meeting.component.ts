import {
  AfterViewInit,
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
  CacheService,
  DialogModel,
} from 'codx-core';
import moment from 'moment';
import {
  CO_Meetings,
  CO_Permissions,
  EP_BookingAttendees,
  EP_Boooking,
  TmpRoom,
} from '../models/CO_Meetings.model';
import { CO_MeetingTemplates } from '../models/CO_MeetingTemplates.model';
import { CodxTMService } from 'projects/codx-tm/src/lib/codx-tm.service';
import { TemplateComponent } from '../template/template.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'lib-popup-add-meeting',
  templateUrl: './popup-add-meeting.component.html',
  styleUrls: ['./popup-add-meeting.component.css'],
})
export class PopupAddMeetingComponent implements OnInit, AfterViewInit {
  @Input() meeting = new CO_Meetings();
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('locationCBB') locationCBB: any;

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
  permissions: CO_Permissions[] = [];
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
  gridViewSetup: any;
  timeBool = false;
  isMeetingDate = true;
  isRoom = false;
  startRoom: any;
  endRoom: any;
  listRoom: TmpRoom[] = [];
  location: any;
  reminder: any;
  fields: Object = { text: 'resourceName', value: 'resourceID' };
  disabledProject = false;
  listPermissions: string = '';
  isClickSave = false;
  dataMeeting;
  dayStart: Date;
  preside: any;
  isOtherModule = false; //neu tu modele khac truyen vao
  defaultRoleA = '';
  viewOnly = false;
  isView: boolean = false;
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
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.defaultRoleA = this.user.userID;
    this.functionID = this.dialog.formModel.funcID;
    this.isOtherModule = dt?.data?.isOtherModule;
    this.meeting = this.isOtherModule
      ? dt?.data?.data
      : JSON.parse(JSON.stringify(dialog.dataService?.dataSelected));
    this.action = dt?.data?.action;
    this.titleAction = dt?.data?.titleAction;
    this.disabledProject = dt?.data?.disabledProject;
    this.listPermissions = dt?.data?.listPermissions;
    this.preside = dt?.data?.preside; // người chủ trì, please not edit !
    this.reminder = this.meeting.reminder;
    if (this.preside) this.defaultRoleA = this.preside;
    this.isView = dt?.data?.isView ?? false;
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

    if (this.action == 'add') {
      this.meeting.startDate = new Date();
    }
    this.selectedDate = moment(new Date(this.meeting.startDate))
      .set({ hour: 0, minute: 0, second: 0 })
      .toDate();
    this.getTimeParameter();
    // this.getTimeWork(new Date());

    // this.getTimeWork(this.selectedDate);
    this.api
      .callSv('CO', 'CO', 'MeetingsBusiness', 'IsCheckEpWithModuleLAsync')
      .subscribe((res) => {
        this.isRoom = res.msgBodyData[0];
      });
    if (this.action == 'add' || this.action == 'copy') {
      let listUser = this.defaultRoleA;

      if (this.listPermissions) {
        if (!this.listPermissions.split(';').includes(listUser))
          listUser += ';' + this.listPermissions;
        else listUser = this.listPermissions;
      }
      this.getListUser(listUser);
    }
    this.cache.valueList('CO001').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
    // this.loadRoomAvailable(this.meeting.startDate, this.meeting.endDate);
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    if (this.action == 'add') {
      this.meeting.meetingType = '1';
      this.permissions = [];
    } else if (this.action == 'edit') {
      // this.setTimeEdit();

      this.showLabelAttachment = this.meeting?.attachments > 0 ? true : false;
      this.permissions = this.meeting.permissions;
      if (this.permissions?.length > 0) {
        this.permissions.forEach((obj) => this.listUserID.push(obj.objectID));
      }
    } else if (this.action == 'copy') {
      this.meeting.meetingType = '1';
      this.permissions = [];
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



  loadRoomAvailable() {
    this.api
      .execSv<any>(
        'EP',
        'EP',
        'ResourcesBusiness',
        'GetListAvailableResourceAsync',
        [
          '1',
          this.meeting.startDate,
          this.meeting.endDate,
          this.meeting.recID,
          false,
        ]
      )
      .subscribe((res) => {
        if (res) {
          var list = res;
          this.listRoom = [];
          Array.from(res).forEach((item: any) => {
            let tmpRes = new TmpRoom();
            tmpRes.resourceID = item.resourceID;
            tmpRes.resourceName = item.resourceName;
            this.listRoom.push(tmpRes);
          });
          if (this.meeting.location != null) {
            var check = this.listRoom.some(
              (x) => x.resourceID == this.meeting.location
            );
            if (!check) {
              this.meeting.location = null;
              this.locationCBB.value = null;
            } else {
              this.cbxChange(this.meeting.location);
              this.locationCBB.value = this.meeting.location;
            }
          }
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
      data = [this.meeting, this.functionID];
    } else if (this.action == 'edit') {
      op.method = 'UpdateMeetingsAsync';
      op.className = 'MeetingsBusiness';
      data = [this.meeting, this.lstDelete];
    }

    op.data = data;
    return true;
  }

  onAdd() {
    if (!this.isOtherModule) {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option), 0)
        .subscribe((res) => {
          this.attachment?.clearData();
          if (res) {
            this.dialog.close(res.save);
            //Đặt cuộc họp sau khi thêm mới cuộc họp cần ktra lại xem có tích hợp module EP hay ko
            if (this.isRoom && this.meeting.location != null) {
              this.bookingRoomEP(res.save);
            }
          } else this.dialog.close();
        });
    } else {
      //Gọi từ module thiết lập lịch
      this.api
        .exec('CO', 'MeetingsBusiness', 'AddMeetingsAsync', [
          this.meeting,
          'TMT0501',
        ])
        .subscribe((res: any) => {
          this.attachment?.clearData();
          if (res) {
            if (this.isRoom && this.meeting.location != null) {
              this.bookingRoomEP(res);
            }
            this.dialog.close(res);
            this.notiService.notifyCode('SYS006');
          } else{
            this.dialog.close();
            this.notiService.notifyCode('SYS023');
          }
        });
    }
  }

  onUpdate() {
    if (!this.isOtherModule) {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option))
        .subscribe((res) => {
          this.attachment?.clearData();
          this.dialog.close(res.update);
        });
    } else {
      this.api
        .exec('CO', 'MeetingsBusiness', 'UpdateMeetingsAsync', [
          this.meeting,
          this.lstDelete,
        ])
        .subscribe((res) => {
          this.attachment?.clearData();
          this.dialog.close(res);
          this.notiService.notifyCode('SYS007');
        });
    }
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
    if (this.isCheckStartEndTime(this.meeting.startDate)) {
      this.notiService.notifyCode('CO002');
      return;
    }

    if (this.checkDateMeeting() == false) {
      this.notiService.notifyCode('CO002');
      return;
    }
    if (this.validateStartEndTime(this.startTime, this.endTime) == false) {
      this.notiService.notifyCode('TM036');
      return;
    }
    if (this.meeting.meetingType == '1') {
      if (!this.meeting.fromDate) {
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

    // var re = Number(this.meeting.reminder);
    // if (re < 0) {
    //   this.notiService.notify('Vui lòng chỉ được nhập số lớn hơn hoặc bằng 0');
    //   return;
    // }

    // if (re > 0) {
    //   if (re % 1 != 0) {
    //     this.notiService.notify('Vui lòng không nhập số lẻ');
    //     return;
    //   }
    // }

    if (this.meeting.fromDate >= this.meeting.toDate) {
      this.notiService.notifyCode('TM034');
      return;
    }

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
  }
  //chuyển và làm gọn hàm gọi event của P
  confirmResourcesTrackEvent() {
    this.tmSv
      .getResourcesTrackEvent(
        this.meeting.meetingID,
        this.meeting.permissions,
        this.meeting.startDate,
        this.meeting.endDate
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
    if (this.isClickSave) return;
    this.isClickSave = true;
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
      if (startTime < now) return true;
      else return false;
    } else return false;
  }

  isCheckFromToDate(toDate) {
    var to = new Date(toDate);
    if (to >= new Date()) return true;
    else return false;
  }

  validateStartEndTime(startTime: any, endTime: any) {
    let beginHour = parseInt(startTime.split(':')[0]);
    let beginMinute = parseInt(startTime.split(':')[1]);

    let endHour = parseInt(endTime.split(':')[0]);
    let endMinute = parseInt(endTime.split(':')[1]);

    if (beginHour >= endHour) {
      if (beginMinute >= endMinute) return false;
    }

    return true;
  }
  //#endregion
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    {
      icon: 'icon-person',
      text: 'Người tham gia',
      name: 'Permissions',
    },
    { icon: 'icon-playlist_add_check', text: 'Mở rộng', name: 'Open' },
  ];

  setTitle(e: any) {
    this.title =
      this.titleAction + ' ' + e.charAt(0).toLocaleLowerCase() + e.slice(1);
    //this.changDetec.detectChanges();
  }
  cbxChange(e) {
    if (this.meeting.location != e) this.meeting.location = e;
  }

  valueCbx(id, e) {
    this.meeting.permissions.forEach((res) => {
      if (res.objectID == id) res.taskControl = e.data;
    });
  }
  valueChangeCheckFullDay(e) {
    if (e?.data == true) {
      this.startTime = this.startTimeWork;
      this.endTime = this.endTimeWork;
    }
    this.setDate();
    this.changDetec.detectChanges();
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
    if (event?.field === 'permissions') {
      this.meeting.permissions = event.data[0];
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
    if (this.meeting[event.field] != event?.data?.fromDate) {
      this.meeting[event.field] = event?.data?.fromDate;
      if (event.field == 'startDate') {
        if (
          moment(new Date(this.meeting.startDate))
            .set({ hour: 0, minute: 0, second: 0 })
            .toDate() != this.dayStart
        ) {
          this.dayStart = moment(new Date(this.meeting.startDate))
            .set({ hour: 0, minute: 0, second: 0 })
            .toDate();
          this.selectedDate = moment(new Date(this.meeting.startDate))
            .set({ hour: 0, minute: 0, second: 0 })
            .toDate();
          this.setDate();
        }
      }
    }
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
              this.meeting.startDate = this.startDate;
            }
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
    }
    if (this.isRoom) {
      this.loadRoomAvailable();
    }

    this.changDetec.detectChanges();
  }

  openPopupLink(addLink) {
    let option = new DialogModel();
    option.FormModel = this.dialog.formModel;
    option.zIndex = 3000;
    this.dialogPopupLink = this.callFuncService.openForm(
      addLink,
      '',
      500,
      300,
      ''
    );
    this.dialogPopupLink.closed.subscribe((res: any) => {
      if (res?.event?.attendee != null || res?.event?.owner != null) {
        this.meeting.link = res?.event?.attendee;
        this.meeting.link2 = res?.event?.owner;
        this.changDetec.detectChanges();
      }
    });
  }

  openPopupLinkOnline() {}

  openPopupTemplate(item: any) {
    let option = new DialogModel();
    option.zIndex = 2000;
    this.dialog1 = this.callFuncService.openForm(
      TemplateComponent,
      '',
      1200,
      700,
      '',
      item,
      '',
      option
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
    var listPositionID = '';
    var listEmployeeID = '';
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
          case 'RP':
          case 'P':
            listPositionID += obj.id + ';';
            break;
          case 'RE':
            listEmployeeID += obj.id + ';';
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
    if (listEmployeeID != '') {
      listEmployeeID = listEmployeeID.substring(0, listEmployeeID.length - 1);
      this.tmSv
        .getListUserIDByListEmployeeID(listEmployeeID)
        .subscribe((res) => {
          if (res && res.length > 0) {
            this.valueUser(res);
          }
        });
    }
    if (listPositionID != '') {
      listPositionID = listPositionID.substring(0, listPositionID.length - 1);
      this.tmSv
        .getListUserIDByListPositionsID(listPositionID)
        .subscribe((res) => {
          if (res && res.length > 0) {
            if (!res[1]) this.notiService.notifyCode('TM066');
            this.valueUser(res[0]);
          } else this.notiService.notifyCode('TM066');
        });
    }
  }

  valueUser(resourceID) {
    if (resourceID != '') {
      if (this.permissions != null && this.permissions.length > 0) {
        var user = this.permissions;
        var array = resourceID.split(';');
        var id = '';
        var arrayNew = [];
        user.forEach((e) => {
          id += e.objectID + ';';
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
        'EmployeesBusiness_Old',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(resource.split(';'))
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var tmpResource = new CO_Permissions();
            if (emp.userID == this.defaultRoleA) {
              tmpResource.objectID = emp?.userID;
              tmpResource.objectName = emp?.userName;
              tmpResource.positionName = emp?.positionName;
              tmpResource.roleType = 'A';
              tmpResource.taskControl = true;
              tmpResource.objectType = 'U';
              this.setPermissions(tmpResource, 'A');
              this.permissions.push(tmpResource);
            } else {
              tmpResource.objectID = emp?.userID;
              tmpResource.objectName = emp?.userName;
              tmpResource.positionName = emp?.positionName;
              tmpResource.roleType = 'P';
              tmpResource.taskControl = true;
              tmpResource.objectType = 'U';
              this.setPermissions(tmpResource, 'P');

              this.permissions.push(tmpResource);
            }
            this.meeting.permissions = this.permissions;
          }
        }
      });
  }

  setPermissions(tmpResource: CO_Permissions, roleType) {
    if (roleType == 'A') {
      tmpResource.full = true;
      tmpResource.read = true;
      tmpResource.create = true;
      tmpResource.update = true;
      tmpResource.assign = true;
      tmpResource.delete = true;
      tmpResource.share = true;
      tmpResource.upload = true;
      tmpResource.download = true;
    } else if (roleType == 'S') {
      tmpResource.download = true;
      tmpResource.update = true;
      tmpResource.read = true;
    } else {
      tmpResource.read = true;
      tmpResource.download = true;
    }
  }

  lstDelete = [];
  checkDeleteUser(item){
    if(item?.roleType == 'A'){
      return false;
    }
    return true;
  }
  onDeleteUser(index, list: CO_Permissions[] = null) {
    if (list == null) {
      if (
        this.meeting &&
        this.meeting.permissions &&
        this.meeting.permissions.length > 0
      ) {
        var tmp = this.meeting.permissions[index];
        var check = this.lstDelete?.some((x) => x.objectID == tmp.objectID);

        if (!check) {
          this.lstDelete.push(tmp);
        }
        this.meeting.permissions.splice(index, 1);
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

  // checkDelete(index){
  //   if(this.user.userID === this.resources[index].resourceID || this.resources[index].roleType == "A")
  //     return false;
  //   return false
  // }

  showPopover(p, userID) {
    if (this.popover || this.isView) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }

  selectRoseType(idUserSelected, value) {
    //thay doi theo mail ngay 05/05/2023 + clean
    if (value == 'A') {
      let idxRoleA = this.meeting.permissions.findIndex(
        (x) => x.roleType == 'A'
      );
      if (
        idxRoleA != -1 &&
        this.meeting.permissions[idxRoleA] != idUserSelected
      ) {
        this.meeting.permissions[idxRoleA].roleType = 'P';
        this.meeting.permissions[idxRoleA].objectType = 'U';
        this.setPermissions(this.meeting.permissions[idxRoleA], 'P');
      }
    }
    let idxSelected = this.meeting.permissions.findIndex(
      (x) => x.objectID == idUserSelected
    );
    if (idxSelected != -1) {
      this.meeting.permissions[idxSelected].roleType = value;
      this.meeting.permissions[idxSelected].objectType = 'U';
      this.setPermissions(this.meeting.permissions[idxSelected], value);
    }

    // this.meeting.permissions.forEach((res) => {
    //   if (res.objectID == idUserSelected) {
    //     res.roleType = value;
    //     res.objectType = "U";
    //     this.setPermissions(res, value);
    //   }
    // });
    this.changDetec.detectChanges();

    this.popover.close();
  }

  addFile(evt: any) {
    this.attachment.uploadFile();
  }

  fileAdded(e) {}
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
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
          if (this.action === 'add' && !this.reminder) {
            this.reminder = param.Reminder;
            this.meeting.reminder = this.reminder;
          }
          this.calendarID = param.CalendarID;
          this.calendarID = this.calendarID != '' ? this.calendarID : 'STD'; //gan de tesst
          this.getTimeWork(new Date());
          this.loadRoomAvailable();
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
              this.startTimeWork =
                day.startTime.length == 5
                  ? day.startTime
                  : day.startTime.slice(0, 5);
              endShiftType1 =
                day.endTime == 5 ? day.endTime : day.endTime.slice(0, 5);
            }
            if (day.shiftType == '2') {
              this.endTimeWork =
                day.endTime == 5 ? day.endTime : day.endTime.slice(0, 5);
              starrShiftType2 =
                day.startTime.length == 5
                  ? day.startTime
                  : day.startTime.slice(0, 5);
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
    booking.approval = '1';
    booking.reminder = data.reminder;
    //cần kiểm tra lại mapping cho 2 field này
    booking.title = data.meetingName; // tiêu đề cuộc họp
    booking.reasonID = null;
    booking.refID = data.recID; //mã lí do cuộc họp
    //tạo ds người tham gia cho EP
    let bookingAttendees = [];
    data.permissions.forEach((item) => {
      let attender = new EP_BookingAttendees();
      attender.userID = item.objectID;
      attender.roleType = item.roleType;
      attender.userName = item.objectName;
      // attender.optional = item.optional;
      // attender.status = item.status;
      bookingAttendees.push(attender);
    });
    this.api
      .execSv('EP', 'ERM.Business.EP', 'BookingsBusiness', 'SaveAsync', [
        booking,
        true,
        bookingAttendees,
      ])
      .subscribe((res) => {});
  }
}
