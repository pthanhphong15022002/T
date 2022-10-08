import { Subscriber } from 'rxjs';
import {
  ChangeDetectorRef,
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
import { APICONSTANT } from '@shared/constant/api-const';

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
  calendarStartTime:any;  
  calendarEndTime:any;
  isPopupStationeryCbb=false;
  attendeesList = [];
  tmpAttendeesList = [];
  grvBookingRoom: any;
  peopleAttend = [];
  tempArray = [];
  calendarID:any;
  returnData: any;
  checkLoopS = true;
  checkLoopE = true;
  checkLoop = true;
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
  bookingOnValid = true;
  tmpEndDate: any;
  isFullDay = false;
  resource!: any;
  beginHour = 0;
  beginMinute = 0;
  endHour = 24;
  endMinute = 59;
  isPopupUserCbb = false;  
  isPopupOptionalUserCbb = false;
  tempDate = new Date();
  lstDevices = [];
  tmplstDevice = [];
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
  saveAndApprove = false;
  resourceCheck=true;
  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private codxEpService: CodxEpService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
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
    if (this.isAdd) {
      this.data.bookingOn = null;
      this.resourceCheck=true;
    }     
    this.data.attendees = 1;
  }

  onInit(): void {    
    this.initForm();
    this.cacheService.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon = item.icon;
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
      this.tmplstDevice = JSON.parse(JSON.stringify(this.tmplstDevice));
    });
    if (this.data) {
      if (this.data.hours == 24) {
        this.isFullDay = true;
      } else {
        this.isFullDay = false;
      }

      if (this.isAdd) {
        this.data.attendees = 1;
        this.endTime = null;
        this.startTime = null;
      }
      if (!this.isAdd) {
        this.resourceCheck=false;
        this.bookingOnValid=false;
        if (this.data?.hours == 24) {
          this.isFullDay = true;
          this.changeDetectorRef.detectChanges();
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
      this.changeDetectorRef.detectChanges();
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
            this.changeDetectorRef.detectChanges();
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
                umid: string;
                objectID: any;
              } = {
                id: stationery.itemID,
                text: stationery.itemName,
                quantity: stationery.quantity,
                objectType: 'EP_Stationery',
                objectID: stationery.itemRecID,
                umid: stationery.umid,
              };
              this.lstStationery.push(order);
            });
            this.changeDetectorRef.detectChanges();
          }
        });
    }
    this.api.callSv(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByModuleAsync',
      'EPParameters'
    )
    .subscribe((res) => {
      this.calendarID =JSON.parse(res.msgBodyData[0].dataValue)?.CalendarID;
    });
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
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit(): void {}

  setStatusTime(modifiedOn: any) {
    // Tạm thời bỏ qua chức năng hiện thời gian sửa đổi cuối
    // let dateSent = new Date(modifiedOn);
    // let currentDate = new Date();
    // var day = Math.floor(
    //   (Date.UTC(
    //     currentDate.getFullYear(),
    //     currentDate.getMonth(),
    //     currentDate.getDate()
    //   ) -
    //     Date.UTC(
    //       dateSent.getFullYear(),
    //       dateSent.getMonth(),
    //       dateSent.getDate()
    //     )) /
    //     (1000 * 60 * 60 * 24)
    // ).toString();
    // if (day != '0') {
    //   return day + ' ngày trước';
    // } else if (currentDate.getHours() - dateSent.getHours() > 1) {
    //   var hour = currentDate.getHours() - dateSent.getHours();
    //   return hour + ' giờ trước';
    // } else {
    //   return 'Gần đây';
    // }
    return '';
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

  onSaveForm(approval: boolean = false) {
    this.data.requester = this.authService?.userValue?.userName;
    this.fGroupAddBookingRoom.patchValue(this.data);
    if (this.fGroupAddBookingRoom.invalid == true) {
      this.codxEpService.notifyInvalid(
        this.fGroupAddBookingRoom,
        this.formModel
      );
    }
    this.bookingOnCheck();
    this.data.startDate = new Date(
      this.data.bookingOn.getFullYear(),
      this.data.bookingOn.getMonth(),
      this.data.bookingOn.getDate(),
      this.data.startDate.getHours(),
      this.data.startDate.getMinutes(),
      0
    );
    this.data.endDate = new Date(
      this.data.bookingOn.getFullYear(),
      this.data.bookingOn.getMonth(),
      this.data.bookingOn.getDate(),
      this.data.endDate.getHours(),
      this.data.endDate.getMinutes(),
      0
    );
    if (this.data.startDate >= this.data.endDate) {
      this.notificationsService.notifyCode('TM036');
      return;
    }

    this.tmplstDevice.forEach((element) => {
      let tempEquip = new Equipments();
      tempEquip.equipmentID = element.id;
      tempEquip.createdBy = this.authService.userValue.userID;
      tempEquip.isPicked = element.isSelected;
      this.lstEquipment.push(tempEquip);
    });
    this.data.equipments = this.lstEquipment;
    this.data.category = '1';
    this.data.resourceType = '1';
    this.data.requester = this.curUser.userName;
    if(approval){
      this.data.status = '3';
    }
    else{      
      this.data.status = '1';
    }
    this.attendeesList.forEach((item) => {
      this.tmpAttendeesList.push(item);
    });
    this.tmpAttendeesList.push(this.curUser);

    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe(async (res) => {
        if (res.save || res.update) {
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if (this.returnData.recID && this.returnData.attachments > 0) {
            this.attachment.objectId = this.returnData.recID;
            (await this.attachment.saveFilesObservable()).subscribe(
              (item2: any) => {
                if (item2?.status == 0) {
                  this.fileAdded(item2);
                }
              }
            );
          }
          if (approval) {
            this.codxEpService
              .getCategoryByEntityName(this.formModel.entityName)
              .subscribe((res: any) => {
                this.codxEpService
                  .release(
                    this.returnData,
                    res.processID,
                    'EP_Bookings',
                    this.formModel.funcID
                  )
                  .subscribe((res) => {
                    if (res?.msgCodeError == null && res?.rowCount) {
                      this.notificationsService.notifyCode('ES007');
                    } else {
                      this.notificationsService.notifyCode(res?.msgCodeError);
                    }
                  });
              });
          }
        } else {
          this.notificationsService.notifyCode('E0011');
          return;
        }
      });
    this.dialogRef && this.dialogRef.close();
  }

  valueCbxStationeryChange(event?) {
    if(event==null){
      this.isPopupStationeryCbb = false;
      return;
    }
    this.lstStationery = [];
    event.dataSelected.forEach((item) => {
      let tempStationery: {
        id: string;
        quantity: number;
        text: string;
        objectType: string;
        umid: string;
        objectID: string;
      } = {
        id: item.ResourceID,
        quantity: this.data.attendees,
        text: item.ResourceName,
        umid: item.UMID,
        objectType: 'EP_Stationery',
        objectID: item.RecID,
      };
      this.lstStationery.push(tempStationery);
    });
      
    
    this.changeDetectorRef.detectChanges();  
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
        this.data[event.field] = event.data.value;
      } else {
        this.data[event.field] = event.data;
      }
    }
    this.changeDetectorRef.detectChanges();
  }
  valueAllDayChange(event) {    
    if (event?.data == true) {  
      this.isFullDay=true;  
      this.fullDayChecked();
      //this.startTime=this.calendarStartTime;
      //this.endTime=this.calendarEndTime;
      this.changeDetectorRef.detectChanges();      
    }
  }
  fullDayChecked(){
    if(this.isFullDay)
    this.api.exec<any>(APICONSTANT.ASSEMBLY.BS, APICONSTANT.BUSINESS.BS.CalendarWeekdays, 'GetDayShiftAsync', [this.calendarID]).subscribe(res=>{              
      let today= new Date(this.data.bookingOn).getDay().toString();
      res.forEach(day => {
        if(day?.weekday==today && day?.shiftType=="1"){
          let tmpstartTime= day?.startTime.split(":");
          this.calendarStartTime =tmpstartTime[0]+":"+tmpstartTime[1];
          this.startTime =tmpstartTime[0]+":"+tmpstartTime[1];
        }
        else if(day?.weekday==today && day?.shiftType=="2"){
          let tmpEndTime= day?.endTime.split(":");
          this.calendarEndTime =tmpEndTime[0]+":"+tmpEndTime[1];
          this.endTime =tmpEndTime[0]+":"+tmpEndTime[1];
        }       
      });
    }); 
    this.changeDetectorRef.detectChanges();
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
                tmpDevice.icon = vlItem.icon;
              }
            });
            this.tmplstDevice.push(tmpDevice);
          });
        }
      });
      this.resourceCheck=false;
    }
    this.changeDetectorRef.detectChanges();
  }
  closeForm() {
    this.initForm();
    this.closeEdit.emit();
  }
  setTitle(e: any) {
    this.title = this.tmpTitle;
    this.changeDetectorRef.detectChanges();
  }

  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', );
    this.changeDetectorRef.detectChanges();
  }

  valueBookingOnChange(event: any) {
    if (event.data) {
      this.data.bookingOn = event.data.fromDate;
      this.bookingOnCheck();
      if(this.bookingOnValid)
      {
        this.fullDayChecked();
      }
    }
  }
  bookingOnCheck() {
    let selectDate = new Date(this.data.bookingOn);
    let tmpCrrDate = new Date();
    let crrDate = new Date(
      tmpCrrDate.getFullYear(),
      tmpCrrDate.getMonth(),
      tmpCrrDate.getDate()
    );
    if (selectDate < crrDate) {
      this.checkLoop = !this.checkLoop;
      if (!this.checkLoop) {
        this.notificationsService.notifyCode('TM036');
        this.bookingOnValid=true;        
        this.startTime=null;
        this.endTime=null;
        this.isFullDay=false;
        return;
      }
    }
    else{
      this.bookingOnValid=false;
    }
    
  }
  valueAttendeesChange(event: any) {
    if (event?.data) {
      this.data.attendees= event.data;
      this.detectorRef.detectChanges();
    }
  }
  valueStartTimeChange(event: any) {
    if (event?.data) {
      this.startTime = event.data.fromDate;
      this.beginHour = parseInt(this.startTime.split(':')[0]);
      this.beginMinute = parseInt(this.startTime.split(':')[1]);
      if (this.data?.bookingOn) {
        if (!isNaN(this.beginHour) && !isNaN(this.beginMinute)) {
          let tmpDay = new Date(this.data?.bookingOn);
          this.data.startDate = new Date(
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
      this.checkLoopS = !this.checkLoopS;
      if (!this.checkLoopS) {
        this.notificationsService.notifyCode('TM036');
        return;
      }
    } else if (
      this.beginHour == this.endHour &&
      this.beginMinute >= this.endMinute
    ) {
      this.checkLoopS = !this.checkLoopS;
      if (!this.checkLoopS) {
        this.notificationsService.notifyCode('TM036');
        return;
      }
    }
    if(this.startTime != this.calendarStartTime)
    {
      this.isFullDay=false;
    }
    else{
      this.isFullDay=true;
    }
  }
  valueEndTimeChange(event: any) {
    if (event?.data) {
      this.endTime = event.data.toDate;
      this.isFullDay = false;
      this.endHour = parseInt(this.endTime.split(':')[0]);
      this.endMinute = parseInt(this.endTime.split(':')[1]);
      if (this.data?.bookingOn) {
        if (!isNaN(this.endHour) && !isNaN(this.endMinute)) {
          let tmpDay = new Date(this.data?.bookingOn);
          this.data.endDate = new Date(
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
      this.checkLoopE = !this.checkLoopE;
      if (!this.checkLoopE) {
        this.notificationsService.notifyCode('TM036');
        return;
      }
    } else if (
      this.beginHour == this.endHour &&
      this.beginMinute >= this.endMinute
    ) {
      this.checkLoopE = !this.checkLoopE;
      if (!this.checkLoopE) {
        this.notificationsService.notifyCode('TM036');
        return;
      }
    }
    if(this.endTime != this.calendarEndTime)
    {
      this.isFullDay=false;
    }
    else{
      this.isFullDay=true;
    }
  }
  openPopupLink() {
    this.callfc.openForm(this.addLink, '', 500, 250);
    this.changeDetectorRef.detectChanges();
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
  closePopUpCbb(){
    this.isPopupStationeryCbb = false;
    this.isPopupUserCbb = false;
    this.isPopupOptionalUserCbb = false;
  }
  openStationeryPopup() {
    this.isPopupStationeryCbb = true;
  }
  openUserPopup() {
    this.isPopupUserCbb = true;
  }
  openOptionalUserPopup() {
    this.isPopupOptionalUserCbb = true;
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
    this.changeDetectorRef.detectChanges();
  }
  cbbDataOptionalUser:any;
  valueCbxUserOptionalChange(event) {    
    if(event==null){
      this.isPopupOptionalUserCbb = false;
      return;
    }
    this.cbbDataUser=event;  
    if (event?.dataSelected) {
      this.lstUserOptional = [];
      this.attendeesList = [];
      event.dataSelected.forEach((people) => {
        this.tempAtender = {
          userId: people.UserID,
          userName: people.UserName,
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
      this.isPopupOptionalUserCbb = false;
    }
  }
  
  cbbDataUser:any;
  valueCbxUserChange(event) {
    if(event==null){
      this.isPopupUserCbb = false;
      return;
    }
    this.cbbDataUser=event;  
    if (event?.dataSelected) {
      this.lstUser = [];
      this.attendeesList = [];
      event.dataSelected.forEach((people) => {
        this.tempAtender = {
          userId: people.UserID,
          userName: people.UserName,
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
      this.isPopupUserCbb = false;
    }
  }
}
