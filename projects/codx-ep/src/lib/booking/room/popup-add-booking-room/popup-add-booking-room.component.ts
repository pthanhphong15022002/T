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
  AuthStore,
  CacheService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEpService, ModelPage } from '../../../codx-ep.service';
import { Equipments } from '../../../models/equipments.model';
import { APICONSTANT } from '@shared/constant/api-const';
import { BookingAttendees } from '../../../models/bookingAttendees.model';
import { MeetingComponent } from '../../../meeting/meeting.component';

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
  resources: BookingAttendees[] = [];
  bookingAttendees = new BookingAttendees();
  curUser = new BookingAttendees();
  isPopupStationeryCbb = false;
  attendeesList = [];
  tmpAttendeesList = [];
  grvBookingRoom: any;
  peopleAttend = [];
  tempArray = [];
  calendarID: any;
  popover: any;
  idUserSelected: string;
  roomCapacity :any;
  returnData=null;
  checkLoopS = true;
  checkLoopE = true;
  checkLoop = true;
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
  calendarStartTime: any;
  calendarEndTime: any;
  startTime: any = null;
  endTime: any = null;
  tmpStartDate: any;
  bookingOnValid = true;
  tmpEndDate: any;
  isFullDay = false;
  resource!: any;
  busyAttendees: string;
  isPopupUserCbb = false;
  isPopupOptionalUserCbb = false;
  tempDate = new Date();
  lstDevices = [];
  tmplstDevice = [];
  tmplstStationery=[];
  tmpTitle = '';
  title = '';
  isCopy=false;
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabGeneralInfo',
    },
    {
      icon: 'icon-person_outline',
      text: 'Người tham dự',
      name: 'tabPeopleInfo',
    },
    {
      icon: 'icon-layers',
      text: 'Văn phòng phẩm',
      name: 'tabStationery',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
    },
  ];
  lstEquipment = [];

  listRoles = [];
  funcID: string;
  isAdd = false;
  range: any;
  optionalData;
  saveAndApprove = false;
  userInfo;
  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private codxEpService: CodxEpService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private apiHttpService: ApiHttpService,
    private user: AuthStore,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.tmpTitle = dialogData?.data[2];
    this.optionalData = dialogData?.data[3];
    this.isCopy = dialogData?.data[4];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    this.funcID = this.formModel.funcID;
    this.userInfo = user.get();
    if (this.isAdd) {
      if (this.optionalData != null) {
        this.data.bookingOn = this.optionalData.startDate;
        this.data.resourceID = this.optionalData.resourceId;
      } else {
        this.data.bookingOn = new Date();
      }
      this.data.attendees = 1;
    } else if (!this.isAdd) {
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

  onInit(): void {
    //Lấy giờ làm việc
    this.api
      .callSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleAsync',
        'EPParameters'
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
                    if (this.isAdd) {
                      this.startTime = this.calendarStartTime;
                    }
                  } else if (day?.shiftType == '2') {
                    let tmpEndTime = day?.endTime.split(':');
                    this.calendarEndTime = tmpEndTime[0] + ':' + tmpEndTime[1];
                    if (this.isAdd) {
                      this.endTime = this.calendarEndTime;
                    }
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
                  if (this.isAdd) {
                    this.startTime = this.calendarStartTime;
                  }
                  let endTime = JSON.parse(res.dataValue)[1]?.EndTime.split(
                    ':'
                  );
                  this.calendarEndTime = endTime[0] + ':' + endTime[1];
                  if (this.isAdd) {
                    this.endTime = this.calendarEndTime;
                  }
                }
              });
          }

          this.changeDetectorRef.detectChanges();
        }
      });
    //Thêm lấy thời gian hiện tại làm thông tin đặt phòng khi thêm mới
    // if (this.isAdd && this.optionalData!=null) {
    //   let tmpDate = new Date();
    //   let crrMinute = tmpDate.getMinutes();
    //   let crrHour = tmpDate.getHours();
    //   if (crrMinute < 30) {
    //     crrMinute = 30;
    //   } else {
    //     crrMinute = 0;
    //     crrHour = crrHour + 1;
    //   }
    //   this.startTime =
    //     ('0' + crrHour.toString()).slice(-2) +
    //     ':' +
    //     ('0' + crrMinute.toString()).slice(-2);
    // }
    this.cacheService.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon = item.icon;
        this.lstDeviceRoom.push(device);
      });
      if (
        !this.isAdd &&
        this.optionalData == null
        
      ) {
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
        this.data.resourceID=this.data.resourceID;
      }
      if(this.isCopy){
        this.data.equipments.forEach((equip) => {
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
      this.detectorRef.detectChanges();
      if (this.isAdd && this.optionalData != null) {        
        let equips = [];
        this.data.resourceID = this.optionalData.resourceId;
        equips = this.optionalData.resource.equipments;
        equips.forEach((equip) => {
          let tmpDevice = new Device();
          tmpDevice.id = equip.equipmentID;
          tmpDevice.isSelected = false;
          this.lstDeviceRoom.forEach((vlDevice) => {
            if (tmpDevice.id == vlDevice.id) {
              tmpDevice.text = vlDevice.text;
              tmpDevice.icon = vlDevice.icon;
            }
          });
          this.tmplstDevice.push(tmpDevice);
        });
        this.data.bookingOn = this.optionalData.startDate;
        let tmpStartTime = this.optionalData.startDate;
        let tmpEndTime = this.optionalData.endDate;
        this.startTime =
          ('0' + tmpStartTime.getHours()).toString().slice(-2) +
          ':' +
          ('0' + tmpStartTime.getMinutes()).toString().slice(-2);
        this.endTime =
          ('0' + tmpEndTime.getHours()).toString().slice(-2) +
          ':' +
          ('0' + tmpEndTime.getMinutes()).toString().slice(-2);
        this.detectorRef.detectChanges();
      }
      this.tmplstDevice = JSON.parse(JSON.stringify(this.tmplstDevice));
      this.changeDetectorRef.detectChanges();
    });
    this.detectorRef.detectChanges();
    // Lấy list role người tham gia
    this.cache.valueList('EP009').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        let tmpArr = [];
        tmpArr = res.datas;
        tmpArr.forEach((item) => {
          if (item.value != '4') {
            this.listRoles.push(item);
          }
        });
        //thêm người đặt(người dùng hiên tại) khi thêm mới
        if (this.isAdd) {
          let people = this.authService.userValue;
          this.curUser.userID = people.userID;
          this.curUser.userName = people.userName;
          this.curUser.status = '1';
          this.curUser.roleType = '1';
          this.curUser.optional = false;
          this.listRoles.forEach((element) => {
            if (element.value == this.curUser.roleType) {
              this.curUser.icon = element.icon;
              this.curUser.roleName = element.text;
            }
          });
          this.changeDetectorRef.detectChanges();
        } else {
          //lấy ds người tham gia khi sửa
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
                  let tempAttender = new BookingAttendees();
                  tempAttender.userID = people.userID;
                  tempAttender.userName = people.userName;
                  tempAttender.status = people.status;
                  tempAttender.roleType = people.roleType;
                  tempAttender.optional = people.optional;
                  this.listRoles.forEach((element) => {
                    if (element.value == tempAttender.roleType) {
                      tempAttender.icon = element.icon;
                      tempAttender.roleName = element.text;
                    }
                  });
                  if (
                    tempAttender.userID != this.authService.userValue.userID
                  ) {
                    this.attendeesList.push(tempAttender);
                  }
                  if (
                    tempAttender.userID == this.authService.userValue.userID
                  ) {
                    this.curUser = tempAttender;
                  } else if (people.optional == false) {
                    this.lstUser.push(tempAttender);
                  } else {
                    this.lstUserOptional.push(tempAttender);
                  }
                });
                this.changeDetectorRef.detectChanges();
              }
            });
        }
      }
    });

    this.initForm();
    // xử lí thiết bị
    // this.cacheService.valueList('EP012').subscribe((res) => {
    //   this.vllDevices = res.datas;
    //   this.vllDevices.forEach((item) => {
    //     let device = new Device();
    //     device.id = item.value;
    //     device.text = item.text;
    //     device.icon = item.icon;
    //     this.lstDeviceRoom.push(device);
    //   });

    //   if (!this.isAdd && this.data?.equipments != null) {
    //     this.data?.equipments.forEach((equip) => {
    //       let tmpDevice = new Device();
    //       tmpDevice.id = equip.equipmentID;
    //       tmpDevice.isSelected = equip.isPicked;
    //       this.lstDeviceRoom.forEach((vlDevice) => {
    //         if (tmpDevice.id == vlDevice.id) {
    //           tmpDevice.text = vlDevice.text;
    //           tmpDevice.icon = vlDevice.icon;
    //         }
    //       });
    //       this.tmplstDevice.push(tmpDevice);
    //     });
    //   }
    //   this.tmplstDevice = JSON.parse(JSON.stringify(this.tmplstDevice));
    // });

    if (this.data) {
      if (!this.isAdd) {
        if (
          this.startTime == this.calendarStartTime &&
          this.endTime == this.calendarEndTime
        ) {
          this.isFullDay = true;
          this.changeDetectorRef.detectChanges();
        }
      }
    }

    if (!this.isAdd) {
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
                objectType: 'EP_Resources',
                objectID: stationery.itemRecID,
                umid: stationery.umid,
              };
              this.lstStationery.push(order);
            });
            this.changeDetectorRef.detectChanges();
          }
        });
    }
    if((this.isAdd && this.data.resourceID!=null) || !this.isAdd){
      this.codxEpService.getResourceByID(this.data.resourceID).subscribe((res:any)=>{
        if(res){
          this.roomCapacity= res.capacity;
        }
      })
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

  beforeSave(option: RequestOption) {
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [
      itemData,
      this.isAdd,
      this.tmpAttendeesList,
      null,
      this.tmplstStationery,
    ];
    return true;
  }

  onSaveForm(approval: boolean = false) {   
    let roleCheck=0;
    if(this.curUser.roleType!="1"){
      this.attendeesList.forEach(item=>{
        if(item.roleType=="1"){
          roleCheck=roleCheck+1;        
        }      
      });
      if(roleCheck<1){
        this.notificationsService.notify('Chưa có người chủ trì', '2', 0); //EP_WAITING Đợi messcode từ BA 
        return;
      }
    }
    
    this.data.requester = this.authService?.userValue?.userName;
    this.fGroupAddBookingRoom.patchValue(this.data);
    if (this.fGroupAddBookingRoom.invalid == true) {
      this.codxEpService.notifyInvalid(
        this.fGroupAddBookingRoom,
        this.formModel
      );
      return;
    }
    if (!this.bookingOnCheck()) {
      this.notificationsService.notifyCode('EP001');
      return;
    }
    if (this.data.startDate< new Date()) {
      this.notificationsService.notifyCode('EP001');
      return;
    }
    if (!this.validateStartEndTime(this.startTime, this.endTime)) {
      this.notificationsService.notifyCode('EP002');
      return;
    }
    this.tmplstStationery=[];
    this.lstStationery.forEach(item=>{
      this.tmplstStationery.push(item)
    })
    this.tmpAttendeesList = [];
    this.attendeesList.forEach((item) => {
      this.tmpAttendeesList.push(item);
    });
    this.tmpAttendeesList.push(this.curUser);
    let tmpEquip = [];
    this.tmplstDevice.forEach((element) => {
      let tempEquip = new Equipments();
      tempEquip.equipmentID = element.id;
      tempEquip.createdBy = this.authService.userValue.userID;
      tempEquip.isPicked = element.isSelected;
      tmpEquip.push(tempEquip);
    });
    this.data.equipments=[];
    this.data.equipments = tmpEquip; 
    this.data.stopOn=this.data.endDate;
    this.data.category = '1';
    this.data.resourceType = '1';    
    this.data.approveStatus = '1';    
    this.data.status = '1';
    this.data.requester = this.curUser.userName;
    this.data.attendees= this.tmpAttendeesList.length;
    //ktra link online
    if(this.data.online && (this.data.onlineUrl==null || this.data.onlineUrl==''))
    {
      this.notificationsService.alertCode('Chưa có đường dẫn cho cuộc họp online!').subscribe((x)=>{//EP_WAIT đợi messagecode từ BA
        if (x.event.status == 'N') {
          return;
        } else {
          if (this.data.attendees > this.roomCapacity) {
            this.notificationsService.alertCode('EP004').subscribe((x) => {
              if (x.event.status == 'N') {
                return;
              } else {
                this.attendeesValidateStep(approval);
              }
            });
          } else {
            this.attendeesValidateStep(approval);
          }
        }
      })
    }
    else{
      if (this.data.attendees > this.roomCapacity) {
        this.notificationsService.alertCode('EP004').subscribe((x) => {
          if (x.event.status == 'N') {
            return;
          } else {
            this.attendeesValidateStep(approval);
          }
        });
      } else {
        this.attendeesValidateStep(approval);
      }
    }
    
  }

  attendeesValidateStep(approval) {
    this.api
      .callSv(
        'EP',
        'ERM.Business.EP',
        'BookingsBusiness',
        'BookingAttendeesValidatorAsync',
        [
          this.tmpAttendeesList,
          this.data.startDate.toUTCString(),
          this.data.endDate.toUTCString(),
        ]
      )
      .subscribe((res) => {
        if (res != null && res.msgBodyData[0].length > 0) {
          this.busyAttendees = '';
          res.msgBodyData[0].forEach((item) => {
            this.busyAttendees += item.objectName + ', ';
          });
          this.notificationsService
            .alertCode('EP005', null, '"' + this.busyAttendees + '"')
            .subscribe((x) => {
              if (x.event.status == 'N') {
                return;
              } else {
                this.startSave(approval);
              }
            });
        } else {
          this.startSave(approval);
        }
      });
  }
  startSave(approval) {
    this.dialogRef.dataService
      .save((opt: RequestOption) => this.beforeSave(opt), 0, null, null, !approval)
      .subscribe(async (res) => {
        if (res.save || res.update) {
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
          }
          if (this.returnData?.recID && this.returnData?.attachments > 0) {
            this.attachment.objectId = this.returnData?.recID;
            (await this.attachment.saveFilesObservable()).subscribe(
              (item2: any) => {
                if (item2?.status == 0) {
                  this.fileAdded(item2);
                }
              }
            );
          }
          if (approval) {
            (
              this.codxEpService.getCategoryByEntityName(
                this.formModel.entityName
              )
            ).subscribe((res: any) => {
              this.codxEpService
                .release(
                  this.returnData,
                  res?.processID,
                  'EP_Bookings',
                  this.formModel.funcID
                )
                .subscribe((res) => {
                  if (res?.msgCodeError == null && res?.rowCount) {
                    this.notificationsService.notifyCode('ES007');
                    this.returnData.approveStatus = '3';
                    this.returnData.status = '3';
                    this.returnData.write = false;
                    this.returnData.delete = false;
                    (this.dialogRef.dataService as CRUDService)
                      .update(this.returnData)
                      .subscribe();
                    this.dialogRef && this.dialogRef.close(this.returnData);
                  } else {
                    this.notificationsService.notifyCode(res?.msgCodeError);
                    // Thêm booking thành công nhưng gửi duyệt thất bại
                    this.dialogRef && this.dialogRef.close(this.returnData);
                  }
                });
            });
            this.dialogRef && this.dialogRef.close(this.returnData);
          } else {
            this.dialogRef && this.dialogRef.close(this.returnData);
          }
        } else {
          
          return;
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
    var dialog = this.callfc.openForm(template, '', 550, 560);
    this.changeDetectorRef.detectChanges();
  }
  //Date time validate

  valueDateChange(event: any) {
    if (event.data) {
      this.data.bookingOn = event.data.fromDate;
      // if (!this.bookingOnCheck()) {
      //   this.checkLoop = !this.checkLoop;
      //   if (!this.checkLoop) {
      //     this.notificationsService.notifyCode('EP001');
      //   }
      //   return;
      // }
      // if (!this.validateStartEndTime(this.startTime, this.endTime)) {
      //   this.checkLoop = !this.checkLoop;
      //   if (!this.checkLoop) {
      //     this.notificationsService.notifyCode('EP002');
      //   }
      //   return;
      // }
      //this.isFullDay=false;
      this.changeDetectorRef.detectChanges();
    }
  }

  bookingOnCheck() {
    let selectDate = new Date(this.data.bookingOn);        
    let tmpCrrDate = new Date();
    this.data.startDate= new Date(
      selectDate.getFullYear(),
      selectDate.getMonth(),
      selectDate.getDate(),
      this.data.startDate.getHours(),
      this.data.startDate.getMinutes(),
      0,
      0
    );
    this.data.endDate= new Date(
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
      // this.checkLoop = !this.checkLoop;
      // if (!this.checkLoop) {
      //   this.notificationsService.notifyCode('EP002');
      // }
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
      // this.checkLoop = !this.checkLoop;
      // if (!this.checkLoop) {
      //   this.notificationsService.notifyCode('EP002');
      // }
      return;
    }
  }
  valueAllDayChange(event) {
    if (event?.data == true) {
      this.startTime = this.calendarStartTime;
      this.endTime = this.calendarEndTime;
      this.changeDetectorRef.detectChanges();
    }
  }

  validateStartEndTime(startTime: any, endTime: any) {
    if (startTime != null && endTime != null) {
      let tempStartTime = startTime.split(':');
      let tempEndTime = endTime.split(':');
      let tmpDay = this.data.bookingOn;

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

      // if (
      //   this.data.startDate <= new Date() ||
      //   this.data.endDate <= new Date()
      // ) {
      //   return false;
      // }
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
    return true;
  }

  openPopupLink() {
    this.callfc.openForm(this.addLink, '', 500, 300, this.funcID);
  }

  valueAttendeesChange(event: any) {
    if (event?.data) {
      this.data.attendees = event.data;
      this.changeDetectorRef.detectChanges();
    }
  }
  //Attachment
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

  //Popup Stationery and User
  closePopUpCbb() {
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
      if (item.userID == this.curUser.userID) {
        this.attendeesList.splice(this.attendeesList.indexOf(item), 1);
      }
    });
    
    this.changeDetectorRef.detectChanges();
  }

  //cbbDataOptionalUser: any;
  // valueCbxUserOptionalChange(event) {
  //   if (event == null) {
  //     this.isPopupOptionalUserCbb = false;
  //     return;
  //   }
  //   this.cbbDataUser = event;
  //   if (event?.dataSelected) {
  //     this.lstUserOptional = [];
  //     this.attendeesList = [];
  //     event.dataSelected.forEach((people) => {
  //       let tempAttender = new BookingAttendees();
  //       tempAttender.userID = people.UserID;
  //       tempAttender.userName = people.UserName;
  //       tempAttender.status = '1';
  //       tempAttender.roleType = '3';
  //       tempAttender.optional = true;
  //       this.listRoles.forEach((element) => {
  //         if (element.value == tempAttender.roleType) {
  //           tempAttender.icon = element.icon;
  //           tempAttender.roleName = element.text;
  //         }
  //       });
  //       this.lstUserOptional.push(tempAttender);
  //     });
  //     for (let i = 0; i < this.lstUserOptional.length; ++i) {
  //       for (let j = 0; j < this.lstUser.length; ++j) {
  //         if (this.lstUserOptional[i].userID == this.lstUser[j].userID) {
  //           this.lstUser.splice(j, 1);
  //         }
  //       }
  //     }
  //     this.UpdateAttendeesList();
  //     this.changeDetectorRef.detectChanges();
  //     this.isPopupOptionalUserCbb = false;
  //   }
  // }

  cbbDataUser='';
  valueCbxUserChange(event) {
    
    if (event == null) {
      this.isPopupUserCbb = false;
      return;
    }
    if (event?.dataSelected) {
      this.lstUser = [];
      event.dataSelected.forEach((people) => {
        let tempAttender = new BookingAttendees();
        tempAttender.userID = people.UserID;
        tempAttender.userName = people.UserName;
        tempAttender.status = '1';
        tempAttender.roleType = '3';
        tempAttender.optional = false;
        this.listRoles.forEach((element) => {
          if (element.value == tempAttender.roleType) {
            tempAttender.icon = element.icon;
            tempAttender.roleName = element.text;
          }
        });
        this.attendeesList.push(tempAttender);
      });
      this.attendeesList.forEach((item) => {
        if (item.userID == this.curUser.userID) {
          this.attendeesList.splice(this.attendeesList.indexOf(item), 1);
        }
      });
      this.attendeesList=this.filterArray(this.attendeesList);
      this.data.attendees = this.attendeesList.length + 1;
      this.changeDetectorRef.detectChanges();
      let tmpDataCBB='';
      // this.attendeesList.forEach(item=>{
      //   tmpDataCBB=tmpDataCBB+";"+item.userID;        
      // });
      this.cbbDataUser=tmpDataCBB;
      this.isPopupUserCbb = false;
    }
  }
  filterArray(arr) {
    return [...new Map(arr.map(item => [item["userID"], item])).values()];
  }
  //Stationery & Room
  valueCbxRoomChange(event?) {
    if (event?.data != null && event?.data != '') {
      this.tmplstDevice = [];
      var cbxRoom = event.component.dataService.data;
      cbxRoom.forEach((element) => {
        if (element.ResourceID == event.data) {
          this.roomCapacity = element.Capacity;
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
    }
    this.changeDetectorRef.detectChanges();
  }

  valueCbxStationeryChange(event?) {
    if (event == null) {
      this.isPopupStationeryCbb = false;
      return;
    }
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
        objectType: 'EP_Resources',
        objectID: item.RecID,
      };
      this.lstStationery.push(tempStationery);
    });
    this.lstStationery=[...new Map(this.lstStationery.map(item => [item["id"], item])).values()]

    this.changeDetectorRef.detectChanges();
    this.isPopupStationeryCbb = false;
  }

  valueQuantityChange(event?) {
    this.lstStationery.forEach((item) => {
      if (item.id == event?.field) {
        item.quantity = event?.data;
      }
    });

    this.lstStationery = this.lstStationery.filter((item) => {
      return item.quantity != 0;
    });
  }
  //////////////////////////
  attendeesCheckChange(event: any, userID: any) {
    this.attendeesList.forEach((attender) => {
      if (attender.userID == userID) {
        attender.optional = event.data;
      }
    });
  }
  
  showPopover(p, userID) {
    // if (this.popover) this.popover.close();
    if (userID) this.idUserSelected = userID;
    p.open();
    this.popover = p;
  }
  selectRoseType(idUserSelected, value) {
    if(value=="1"){
      let checkRole=true;
      this.attendeesList.forEach(att=>{
        if(att.roleType == value || this.curUser.roleType== value){
          checkRole=false;          
        }      
      });
      if(!checkRole){
        //this.notificationsService.notifyCode('');
        this.notificationsService.notify('Đã có người chủ trì', '2', 0); //EP_WAITING Đợi messcode từ BA 
        this.popover.close();
        return;
      }
    }
    if(idUserSelected==this.curUser.userID){
      this.curUser.roleType=value;
      this.listRoles.forEach((role) => {
        if (this.curUser.roleType == role.value) {
          this.curUser.icon = role.icon;
        }
      });
      
      this.changeDetectorRef.detectChanges();
    }
    else{
      this.attendeesList.forEach((res) => {
        if (res.userID == idUserSelected) {
          res.roleType = value;
          this.listRoles.forEach((role) => {
            if (role?.value == res?.roleType) {
              res.icon = role.icon;
            }
          });
        }
      });      
      this.changeDetectorRef.detectChanges();
    }
    
    this.changeDetectorRef.detectChanges();

    this.popover.close();
  }
  eventApply(e) {
    var listUserID = '';
    var listDepartmentID = '';
    var listUserIDByOrg = '';
    var type = 'U';
    e?.data?.forEach((obj) => {
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
    });
    if (listUserID != '') {
      listUserID = listUserID.substring(0, listUserID.length - 1);
      //this.valueUser(listUserID);
    }

    if (listDepartmentID != '')
      listDepartmentID = listDepartmentID.substring(
        0,
        listDepartmentID.length - 1
      );
    // if (listDepartmentID != '') {
    //   this.tmSv
    //     .getListUserIDByListOrgIDAsync([listDepartmentID, type])
    //     .subscribe((res) => {
    //       if (res) {
    //         listUserIDByOrg += res;
    //         if (listUserID != '') listUserIDByOrg += ';' + listUserID;
    //         this.valueUser(listUserIDByOrg);
    //       }
    //     });
    // }
  }

  // valueUser(resourceID) {
  //   if (resourceID != '') {
  //     if (this.resources != null) {
  //       var user = this.resources;
  //       var array = resourceID.split(';');
  //       var id = '';
  //       var arrayNew = [];
  //       user.forEach((e) => {
  //         id += e.resourceID + ';';
  //       });
  //       if (id != '') {
  //         id = id.substring(0, id.length - 1);

  //         array.forEach((element) => {
  //           if (!id.split(';').includes(element)) arrayNew.push(element);
  //         });
  //       }
  //       if (arrayNew.length > 0) {
  //         resourceID = arrayNew.join(';');
  //         id += ';' + resourceID;
  //         this.getListUser(resourceID);
  //       }
  //     } else {
  //       this.getListUser(resourceID);
  //     }
  //   }
  // }

  // getListUser(resource) {
  //   while (resource.includes(' ')) {
  //     resource = resource.replace(' ', '');
  //   }
  //   var arrUser = resource.split(';');
  //   this.listUserID = this.listUserID.concat(arrUser);
  //   this.api
  //     .execSv<any>(
  //       'HR',
  //       'ERM.Business.HR',
  //       'EmployeesBusiness',
  //       'GetListEmployeesByUserIDAsync',
  //       JSON.stringify(resource.split(';'))
  //     )
  //     .subscribe((res) => {
  //       if (res && res.length > 0) {
  //         for (var i = 0; i < res.length; i++) {
  //           let emp = res[i];
  //           var tmpResource = new CO_Resources();
  //           if (emp.userID == this.user.userID) {
  //             tmpResource.resourceID = emp?.userID;
  //             tmpResource.resourceName = emp?.userName;
  //             tmpResource.positionName = emp?.positionName;
  //             tmpResource.roleType = 'A';
  //             tmpResource.taskControl = true;
  //             this.resources.push(tmpResource);
  //           } else {
  //             tmpResource.resourceID = emp?.userID;
  //             tmpResource.resourceName = emp?.userName;
  //             tmpResource.positionName = emp?.positionName;
  //             tmpResource.roleType = 'P';
  //             tmpResource.taskControl = true;
  //             this.resources.push(tmpResource);
  //           }
  //           this.meeting.resources = this.resources;
  //         }
  //       }
  //     });
  // }

  connectMeetingNow() {
    this.codxEpService
      .connectMeetingNow(
        this.data.title,
        this.data.memmo,
        60,
        null,
        this.userInfo.userName,
        'Dang Test',
        true,
        this.data.onlineUrl,
        this.data.startDate,
        this.startTime
      )
      .then((url) => {
        window.open(url, '_blank');
      });
  }
}
