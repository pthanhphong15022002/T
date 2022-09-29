import { Subscriber } from 'rxjs';
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  AuthService,
  CacheService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEpService, ModelPage } from '../../../codx-ep.service';
import { Equipments } from '../../../models/equipments.model';

export class Device {
  id;
  text = '';
  isSelected = false;
  icon = '';
}

@Component({
  selector: 'popup-add-booking-room',
  templateUrl: './popup-add-booking-room.component.html',
  styleUrls: ['./popup-add-booking-room.component.scss'],
})
export class PopupAddBookingRoomComponent extends UIComponent {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('addLink', { static: true }) addLink;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('form') form: any;

  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Input() data!: any;
  fGroupAddBookingRoom: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  modelPage: ModelPage;

  tempAtender: {
    userId: string;
    userName: string;
    roleType: string;
    status: string;
    objectType: string;
    optional: boolean;
    modifiedOn: string;
  };
  dataUserCbb: any = new Array();
  attendeesList = [];
  tmpAttendeesList = [];
  grvBookingRoom: any;
  peopleAttend = [];
  tempArray = [];
  curUser: any;
  hostUser: any;
  hostUserId: any;
  lstUser = [];
  lstUserOptional = [];
  lstStationery = [];
  strStationery: string;
  vllDevices = [];
  lstDeviceRoom = [];
  isAfterRender = false;
  chosenDate = null;
  CbxName: any;
  link = '';
  attObjectID: any;
  attQuantity: any;
  startTime: any = null;
  endTime: any = null;
  tmpStartDate: any;
  tmpEndDate: any;
  isFullDay = false;
  resource!: any;
  beginHour = 0;
  beginMinute = 0;
  endHour = 24;
  endMinute = 59;
  isPopupCbb = true;
  tempDate = new Date();
  // subHeaderText = 'Đặt phòng họp';
  // titleAction = 'Thêm mới';
  tmpTitle = '';
  title = '';
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabGeneralInfo',
      subName: 'Thông tin chung',
      subText: 'Thông tin chung',
    },
    {
      icon: 'icon-person_outline',
      text: 'Người tham dự',
      name: 'tabPeopleInfo',
      subName: 'Thành viên tham gia',
      subText: 'Thành viên tham gia',
    },
    {
      icon: 'icon-layers',
      text: 'Văn phòng phẩm',
      name: 'tabStationery',
      subName: 'VPP của buổi họp',
      subText: 'VPP của buổi họp',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
      subName: 'Thông tin tham chiếu',
      subText: 'Thông tin tham chiếu',
    },
  ];
  lstEquipment = [];
  funcID: string;
  isAdd = false;
  range: any;
  isSaveSuccess = false;
  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private codxEpService: CodxEpService,
    private authService: AuthService,
    private cacheService: CacheService,
    private apiHttpService: ApiHttpService,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.tmpTitle = dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    this.funcID = this.formModel.funcID;
  }

  onInit(): void {
    this.initForm();
    this.cacheService.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        this.lstDeviceRoom.push(device);
      });

      if (!this.isAdd && this.data?.equipments != null) {
        this.data?.equipments.forEach((equip) => {
          let tmpDevice = new Device();
          tmpDevice.id = equip.equipmentID;
          tmpDevice.isSelected = equip.isPicked;
          this.lstDeviceRoom.forEach((vlDevice) => {
            if (tmpDevice.id == vlDevice.id) {
              tmpDevice.text = vlDevice.text;
              tmpDevice.icon = vlDevice.icon;
            }
          });
          this.tmplstDevice.push(tmpDevice);
        });
      }
      //this.tmplstDevice = JSON.parse(JSON.stringify(this.tmplstDevice));
    });
    if (this.data) {
      if (this.data.hours == 24) {
        this.isFullDay = true;
      } else {
        this.isFullDay = false;
      }

      if (this.isAdd) {
        this.data.attendees = 1;
        this.link = null;
        this.data.bookingOn = new Date();
        this.endTime = null;
        this.startTime = null;
      }
      if (!this.isAdd) {
        if (this.data?.hours == 24) {
          this.isFullDay = true;
          this.detectorRef.detectChanges();
        }
        let tmpStartTime = new Date(this.data?.startDate);
        let tmpEndTime = new Date(this.data?.endDate);
        this.startTime =
          ('0' + tmpStartTime.getHours()).toString().slice(-2) +
          ':' +
          ('0' + tmpStartTime.getMinutes()).toString().slice(-2);
        this.endTime =
          ('0' + tmpEndTime.getHours()).toString().slice(-2) +
          ':' +
          ('0' + tmpEndTime.getMinutes()).toString().slice(-2);
      }
    }
    if (this.isAdd) {
      let people = this.authService.userValue;
      this.tempAtender = {
        userId: people.userID,
        userName: people.userName,
        status: '1',
        objectType: 'AD_Users',
        roleType: '1',
        optional: false,
        modifiedOn: this.setStatusTime(new Date()),
      };
      this.curUser = this.tempAtender;
      this.detectorRef.detectChanges();
    }

    if (!this.isAdd) {
      this.apiHttpService
        .callSv(
          'EP',
          'ERM.Business.EP',
          'BookingAttendeesBusiness',
          'GetAsync',
          [this.data.recID]
        )
        .subscribe((res) => {
          if (res) {
            this.peopleAttend = res.msgBodyData[0];
            this.peopleAttend.forEach((people) => {
              this.tempAtender = {
                userId: people.userID,
                userName: people.userName,
                status: people.status,
                objectType: 'AD_Users',
                roleType: people.roleType,
                optional: people.optional,
                modifiedOn: this.setStatusTime(people.modifiedOn),
              };
              if (
                this.tempAtender.userId != this.authService.userValue.userID
              ) {
                this.attendeesList.push(this.tempAtender);
              }
              if (
                this.tempAtender.userId == this.authService.userValue.userID
              ) {
                this.curUser = this.tempAtender;
              } else if (people.optional == false) {
                this.lstUser.push(this.tempAtender);
              } else {
                this.lstUserOptional.push(this.tempAtender);
              }
            });
            this.detectorRef.detectChanges();
          }
        });

      this.apiHttpService
        .callSv('EP', 'ERM.Business.EP', 'BookingItemsBusiness', 'GetAsync', [
          this.data.recID,
        ])
        .subscribe((res) => {
          if (res) {
            res.msgBodyData[0].forEach((stationery) => {
              let order: {
                id: string;
                quantity: number;
                text: string;
                objectType: string;
                objectName: string;
              } = {
                id: stationery.itemID,
                text: stationery.itemName,
                quantity: stationery.quantity,
                objectType: undefined,
                objectName: undefined,
              };
              this.lstStationery.push(order);
            });
            this.detectorRef.detectChanges();
          }
        });
    }
  }

  initForm() {
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        if (item) {
          this.fGroupAddBookingRoom = item;
          this.isAfterRender = true;
          this.fGroupAddBookingRoom.patchValue(item);
        }
      });
    this.detectorRef.detectChanges();
  }
  ngAfterViewInit(): void {    
  }

  setStatusTime(modifiedOn: any) {
    let dateSent = new Date(modifiedOn);
    let currentDate = new Date();
    var day = Math.floor(
      (Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ) -
        Date.UTC(
          dateSent.getFullYear(),
          dateSent.getMonth(),
          dateSent.getDate()
        )) /
        (1000 * 60 * 60 * 24)
    ).toString();
    if (day != '0') {
      return day + ' ngày trước';
    } else if (currentDate.getHours() - dateSent.getHours() > 1) {
      var hour = currentDate.getHours() - dateSent.getHours();
      return hour + ' giờ trước';
    } else {
      return 'Gần đây';
    }
  }

  beforeSave(option: any) {
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [
      itemData,
      this.isAdd,
      this.tmpAttendeesList,
      null,
      this.lstStationery,
    ];
    return true;
  }

  onSaveForm() {
    this.data.requester = this.authService?.userValue?.userName;
    this.fGroupAddBookingRoom.patchValue(this.data);
    if (this.fGroupAddBookingRoom.invalid == true) {
      this.codxEpService.notifyInvalid(
        this.fGroupAddBookingRoom,
        this.formModel
      );
    }
    if (this.tmpEndDate - this.tmpStartDate <= 0) {
      this.notificationsService.notifyCode('EP003');
    }
    if (this.startTime && this.endTime) {
      let hours = parseInt(
        ((this.endTime - this.startTime) / 1000 / 60 / 60).toFixed()
      );
      if (!isNaN(hours) && hours > 0) {
        this.data.hours = hours;
      }
    }

    this.tmplstDevice.forEach((element) => {
      let tempEquip = new Equipments();
      tempEquip.equipmentID = element.id;
      tempEquip.createdBy = this.authService.userValue.userID;
      tempEquip.isPicked = element.isSelected;
      this.lstEquipment.push(tempEquip);
    });

    let tmpBookingOn = new Date(this.data?.bookingOn);
    this.data.category = '1';
    this.data.status = '1';
    this.data.resourceType = '1';
    this.data.equipments = this.lstEquipment;
    this.data.requester = this.curUser.userName;
    this.data.startDate = new Date(
      tmpBookingOn.getFullYear(),
      tmpBookingOn.getMonth(),
      tmpBookingOn.getDate(),
      this.tmpStartDate.getHours(),
      this.tmpStartDate.getMinutes(),
      0
    );
    this.data.endDate = new Date(
      tmpBookingOn.getFullYear(),
      tmpBookingOn.getMonth(),
      tmpBookingOn.getDate(),
      this.tmpEndDate.getHours(),
      this.tmpEndDate.getMinutes(),
      0
    );

    this.attendeesList.forEach((item) => {
      this.tmpAttendeesList.push(item);
    });
    this.tmpAttendeesList.push(this.curUser);

    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe(async (res) => {
        if (res.save || res.update) {
          this.attObjectID =
            res.save != null ? res.save.recID : res.update.recID;
          this.attQuantity =
            res.save != null ? res.save.attachments : res.update.attachments;

          if (this.attObjectID && this.attQuantity > 0) {
            this.attachment.objectId = this.attObjectID;
            (await this.attachment.saveFilesObservable()).subscribe(
              (item2: any) => {
                if (item2?.status == 0) {
                  this.fileAdded(item2);
                }
              }
            );
          }
          this.dialogRef && this.dialogRef.close();
        } else {
          this.notificationsService.notifyCode('E0011');
          return;
        }
      });
  }
  UpdateAttendeesList() {
    this.attendeesList = [];
    if (this.lstUser.length > 0 && this.lstUserOptional.length > 0) {
      this.lstUser.forEach((item) => {
        this.attendeesList.push(item);
      });
      this.lstUserOptional.forEach((item) => {
        this.attendeesList.push(item);
      });
    } else if (this.lstUser.length > 0 && this.lstUserOptional.length == 0) {
      this.lstUser.forEach((item) => {
        this.attendeesList.push(item);
      });
    } else if (this.lstUserOptional.length > 0 && this.lstUser.length == 0) {
      this.lstUserOptional.forEach((item) => {
        this.attendeesList.push(item);
      });
    }
    this.attendeesList.forEach((item) => {
      if (item.userId == this.curUser.userId) {
        this.attendeesList.splice(this.attendeesList.indexOf(item), 1);
      }
    });
    this.data.attendees = this.attendeesList.length + 1;
    this.detectorRef.detectChanges();
  }
  valueCbxUserChange(event?) {
    this.lstUser = [];
    this.attendeesList = [];
    event.data.dataSelected.forEach((people) => {
      this.tempAtender = {
        userId: people.dataSelected.UserID,
        userName: people.dataSelected.UserName,
        status: '1',
        objectType: 'AD_Users',
        roleType: '3',
        optional: false,
        modifiedOn: this.setStatusTime(new Date()),
      };

      this.lstUser.push(this.tempAtender);
    });

    if (this.lstUser.length > 0 && this.lstUserOptional.length > 0) {
      for (let i = 0; i < this.lstUser.length; ++i) {
        for (let j = 0; j < this.lstUserOptional.length; ++j) {
          if (this.lstUser[i].userId == this.lstUserOptional[j].userId) {
            this.lstUserOptional.splice(j, 1);
          }
        }
      }
    }
    this.UpdateAttendeesList();
    this.detectorRef.detectChanges();
  }
  valueCbxUserOptionalChange(event?) {
    this.lstUserOptional = [];
    this.attendeesList = [];
    event.data.dataSelected.forEach((people) => {
      this.tempAtender = {
        userId: people.id,
        userName: people.text,
        status: '1',
        objectType: 'AD_Users',
        roleType: '3',
        optional: true,
        modifiedOn: this.setStatusTime(new Date()),
      };

      this.lstUserOptional.push(this.tempAtender);
    });
    for (let i = 0; i < this.lstUserOptional.length; ++i) {
      for (let j = 0; j < this.lstUser.length; ++j) {
        if (this.lstUserOptional[i].userId == this.lstUser[j].userId) {
          this.lstUser.splice(j, 1);
        }
      }
    }
    this.UpdateAttendeesList();
    this.detectorRef.detectChanges();
  }
  valueCbxStationeryChange(event?) {
    this.lstStationery = [];
    event.data.dataSelected.forEach((item) => {
      let tempStationery: {
        id: string;
        quantity: number;
        text: string;
        objectType: string;
        objectName: string;
      } = {
        id: item.id,
        quantity: this.data?.attendees,
        text: item.text,
        objectName: item.objectName,
        objectType: item.objectType,
      };
      this.lstStationery.push(tempStationery);
    });
    this.detectorRef.detectChanges();
  }

  valueQuantityChange(event?) {
    this.lstStationery.forEach((item) => {
      if (item.id == event?.field) {
        item.quantity = event?.data;
      }
    });
  }

  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.data['field'] = event.data.value;
      } else {
        this.data['field'] = event.data;
      }
    }
    this.detectorRef.detectChanges();
  }

  valueAllDayChange(event) {
    if (event?.field == 'day') {
      this.isFullDay = event.data;
      if (this.isFullDay) {
        this.startTime = '00:00';
        this.endTime = '23:59';
        this.data.hours = 24;
      } else {
        this.endTime = null;
        this.startTime = null;
      }
    }
    this.detectorRef.detectChanges();
  }
  valueCbxRoomChange(event?) {
    if (event?.data != null && event?.data != '') {
      this.tmplstDevice = [];
      var cbxRoom = event.component.dataService.data;
      cbxRoom.forEach((element) => {
        if (element.ResourceID == event.data) {
          element.Equipments.forEach((item) => {
            let tmpDevice = new Device();
            tmpDevice.id = item.EquipmentID;
            tmpDevice.isSelected = false;
            this.vllDevices.forEach((vlItem) => {
              if (tmpDevice.id == vlItem.value) {
                tmpDevice.text = vlItem.text;
              }
            });
            this.tmplstDevice.push(tmpDevice);
          });
        }
      });
    }
    this.detectorRef.detectChanges();
  }
  closeForm() {
    this.initForm();
    this.closeEdit.emit();
  }
  setTitle(e: any) {
    this.title = this.tmpTitle;
    this.detectorRef.detectChanges();
  }
  lstDevices = [];
  tmplstDevice = [];

  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 420);
    this.detectorRef.detectChanges();
  }

  valueDateChange(event: any) {
    if (event.data) {
      this.data.bookingOn = event.data;
      let selectTime = new Date(this.data.bookingOn);
      let crrTime = new Date();
      if (selectTime.getDate() < crrTime.getDate()) {
        this.notificationsService.notifyCode('EP003');
        return;
      }
    }
  }

  buttonClick(e: any) {
    //console.log(e);
  }
  valueStartTimeChange(event: any) {
    if (event?.field == 'startTime') {
      this.startTime = event.data.fromDate;
      this.isFullDay = false;
      this.beginHour = parseInt(this.startTime.split(':')[0]);
      this.beginMinute = parseInt(this.startTime.split(':')[1]);
      if (this.data?.bookingOn) {
        if (!isNaN(this.beginHour) && !isNaN(this.beginMinute)) {
          let tmpDay = new Date(this.data?.bookingOn);
          this.tmpStartDate = new Date(
            tmpDay.getFullYear(),
            tmpDay.getMonth(),
            tmpDay.getDate(),
            this.beginHour,
            this.beginMinute,
            0
          );
        }
      }
    }
    if (this.beginHour >= this.endHour) {
      this.notificationsService.notifyCode('EP003');
      return;
    } else if (
      this.beginHour == this.endHour &&
      this.beginMinute >= this.endMinute
    ) {
      this.notificationsService.notifyCode('EP003');
      return;
    }
    console.log('start', this.tmpStartDate);
    console.log('end', this.tmpEndDate);
  }
  valueEndTimeChange(event: any) {
    if (event?.field == 'endTime') {
      this.endTime = event.data.toDate;
      this.isFullDay = false;
      this.endHour = parseInt(this.endTime.split(':')[0]);
      this.endMinute = parseInt(this.endTime.split(':')[1]);
      if (this.data?.bookingOn) {
        if (!isNaN(this.endHour) && !isNaN(this.endMinute)) {
          let tmpDay = new Date(this.data?.bookingOn);
          this.tmpEndDate = new Date(
            tmpDay.getFullYear(),
            tmpDay.getMonth(),
            tmpDay.getDate(),
            this.endHour,
            this.endMinute,
            0
          );
        }
      }
    }
    if (this.beginHour > this.endHour) {
      this.notificationsService.notifyCode('EP003');
      return;
    } else if (
      this.beginHour == this.endHour &&
      this.beginMinute > this.endMinute
    ) {
      this.notificationsService.notifyCode('EP003');
      return;
    }
    console.log('start', this.tmpStartDate);
    console.log('end', this.tmpEndDate);
  }
  checkedOnlineChange(event) {
    if (event.data instanceof Object) {
      this.data.online = event.data.checked;
    } else {
      this.data.online = event.data;
    }
    if (!this.data?.online) this.data.onlineUrl = null;
    this.detectorRef.detectChanges();
  }

  openPopupLink() {
    this.callfc.openForm(this.addLink, '', 500, 250);
    this.detectorRef.detectChanges();
  }

  popup(evt: any) {
    this.attachment.openPopup();
  }
  popupUploadFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(event: any) {
    this.data.attachments = event.data.length;
  }
  fileCount(event: any) {}
  openPopupCbb() {
    this.isPopupCbb = !this.isPopupCbb;
  }
  checkOpenCbbPopup = 0;
  getDataUserInCbb(event) {
    this.checkOpenCbbPopup++;
    if (event?.dataSelected) {
      if (this.checkOpenCbbPopup >= 2) {
        if (this.dataUserCbb) {
          let i = 0;
          event?.dataSelected.forEach((dt) => {
            this.dataUserCbb.forEach((x) => {
              if (dt.UserID == x.userID) {
                event?.dataSelected.splice(i, 1);
              }
            });
            i++;
          });
        }
      }
      event?.dataSelected.forEach((e: any) => {
        this.dataUserCbb.push({ userID: e.UserID, userName: e.UserName });
      });
      this.detectorRef.detectChanges();
    }
  }
}
