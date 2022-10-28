import { T } from '@angular/cdk/keycodes';
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import { AuthService, CacheService, CRUDService } from 'codx-core';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
  FormModel,
  RequestOption,
} from 'codx-core';
import { CodxEpService, ModelPage } from '../../../codx-ep.service';
import { Equipments } from '../../../models/equipments.model';

export class Device {
  id;
  text = '';
  isSelected = true;
  icon = '';
}

@Component({
  selector: 'popup-add-booking-car',
  templateUrl: 'popup-add-booking-car.component.html',
  styleUrls: ['popup-add-booking-car.component.scss'],
})
export class PopupAddBookingCarComponent extends UIComponent {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('form') form: any;

  @Input() editResources: any;
  @Input() isAdd = true;

  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();

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
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
    },
  ];
  tempDriver: any;
  returnData: any;
  title = '';
  cbbData: any;
  driverCheck = false;
  useCard = false;
  isSaveSuccess = false;
  fGroupBookingAttendees: FormGroup;
  fGroupAddBookingCar: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  modelPage: ModelPage;
  attendees = [];
  curUser: any;
  data: any;
  isNew: boolean = true;
  currentSection = 'GeneralInfo';
  CbxName: any;
  isAfterRender = false;
  lstEquipment = [];
  tempAtender: {
    userID: string;
    userName: string;
    roleType: string;
    status: string;
    objectType: string;
    objectID: any;
  };
  carCapacity = 0;
  attendeesList = [];
  checkLoopS = true;
  checkLoopE = true;
  checkLoop = true;
  grvBookingCar: any;
  strAttendees: string = '';
  vllDevices = [];
  lstDeviceCar = [];
  tmplstDevice = [];
  lstPeople = [];
  funcID: string;
  driver: any;
  smallListPeople = [];
  editCarDevice = null;
  tmpTitle = '';
  tempArray = [];
  listRoles = [];
  optionalData: any;
  calendarStartTime: any;
  calendarEndTime: any;
  calEndHour: any;
  calStartHour: any;
  calEndMinutes: any;
  calStartMinutes: any;
  calendarID: any;
  isPopupCbb = false;
  constructor(
    private injector: Injector,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private cacheService: CacheService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.tmpTitle = dialogData?.data[2];
    this.optionalData = dialogData?.data[3];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    this.funcID = this.formModel.funcID;
    this.data.requester = this.authService?.userValue?.userName;
    if(this.isAdd && this.optionalData!=null){
      this.data.bookingOn=this.optionalData.startDate;
    }
    else if(this.isAdd && this.optionalData==null){
      this.data.bookingOn=new Date();
    }
    
  }
  onInit(): void {
    this.cacheService.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon = item.icon;
        this.lstDeviceCar.push(device);
      });
      if (
        !this.isAdd &&
        this.data?.equipments != null &&
        this.optionalData == null
      ) {
        this.data?.equipments.forEach((equip) => {
          let tmpDevice = new Device();
          tmpDevice.id = equip.equipmentID;
          tmpDevice.isSelected = equip.isPicked;
          this.lstDeviceCar.forEach((vlDevice) => {
            if (tmpDevice.id == vlDevice.id) {
              tmpDevice.text = vlDevice.text;
              tmpDevice.icon = vlDevice.icon;
            }
          });
          this.tmplstDevice.push(tmpDevice);
        });
      }
      if (this.isAdd && this.optionalData != null) {
        this.data.resourceID = this.optionalData.resourceId;
        let equips = [];
        equips = this.optionalData.resource.equipments;
        equips.forEach((equip) => {
          let tmpDevice = new Device();
          tmpDevice.id = equip.equipmentID;
          tmpDevice.isSelected = true;
          this.lstDeviceCar.forEach((vlDevice) => {
            if (tmpDevice.id == vlDevice.id) {
              tmpDevice.text = vlDevice.text;
              tmpDevice.icon = vlDevice.icon;
            }
          });
          this.tmplstDevice.push(tmpDevice);
        });
        this.data.startDate = this.optionalData.startDate;
        this.data.endDate = this.optionalData.startDate;
        this.detectorRef.detectChanges();
      }
      this.tmplstDevice = JSON.parse(JSON.stringify(this.tmplstDevice));
    });
    this.detectorRef.detectChanges();

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
                let tmpDateTime = this.data.bookingOn;
                res.forEach((day) => {
                  if (day?.shiftType == '1') {
                    let tmpstartTime = day?.startTime.split(':');
                    this.calendarStartTime =
                      tmpstartTime[0] + ':' + tmpstartTime[1];
                    if (this.isAdd) {
                      this.data.startDate = new Date(
                        tmpDateTime.getFullYear(),
                        tmpDateTime.getMonth(),
                        tmpDateTime.getDate(),
                        tmpstartTime[0],
                        tmpstartTime[1],
                        0
                      );
                    }
                    this.calEndHour = tmpstartTime[0];
                    this.calEndMinutes = tmpstartTime[1];
                    
                  } else if (day?.shiftType == '2') {
                    let tmpEndTime = day?.endTime.split(':');
                    this.calendarEndTime = tmpEndTime[0] + ':' + tmpEndTime[1];
                    if (this.isAdd ) {
                      this.data.endDate = new Date(
                        tmpDateTime.getFullYear(),
                        tmpDateTime.getMonth(),
                        tmpDateTime.getDate(),
                        tmpEndTime[0],
                        tmpEndTime[1],
                        0
                      );
                    }
                    this.calEndHour = tmpEndTime[0];
                    this.calEndMinutes = tmpEndTime[1];                    
                  }
                });
                if(this.isAdd && this.optionalData){
                  this.driverChangeWithCar(this.optionalData.resourceId);
                }
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
                  let tempEndTime = JSON.parse(res.dataValue)[1]?.EndTime.split(
                    ':'
                  );
                  this.calendarEndTime = tempEndTime[0] + ':' + tempEndTime[1];
                  let tmpDateTime = new Date();
                  if (this.isAdd && this.optionalData == null) {
                    this.data.startDate = new Date(
                      tmpDateTime.getFullYear(),
                      tmpDateTime.getMonth(),
                      tmpDateTime.getDate(),
                      tempStartTime[0],
                      tempStartTime[1],
                      0
                    );
                    this.data.endDate = new Date(
                      tmpDateTime.getFullYear(),
                      tmpDateTime.getMonth(),
                      tmpDateTime.getDate(),
                      tempEndTime[0],
                      tempEndTime[1],
                      0
                    );
                  }
                  this.calStartHour = tempStartTime[0];
                  this.calStartMinutes = tempStartTime[1];
                  this.calEndHour = tempEndTime[0];
                  this.calEndMinutes = tempEndTime[1];
                  if(this.isAdd && this.optionalData){
                    this.driverChangeWithCar(this.optionalData.resourceId);
                  }
                }
              });
          }
          this.detectorRef.detectChanges();
        }
      });

    
    this.cache.valueList('EP010').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        let tmpArr = [];
        tmpArr = res.datas;
        tmpArr.forEach((item) => {
          this.listRoles.push(item);
        });
        if (this.isAdd) {
          let people = this.authService.userValue;
          this.tempAtender = {
            userID: people.userID,
            userName: people.userName,
            status: '1',
            objectType: 'AD_Users',
            roleType: '1',
            objectID: undefined,
          };
          this.curUser = this.tempAtender;
        }
        if (!this.isAdd) {
          this.codxEpService
            .getBookingAttendees(this.data.recID)
            .subscribe((res) => {
              if (res) {
                this.attendees = res.msgBodyData[0];
                this.attendees.forEach((people) => {
                  this.tempAtender = {
                    userID: people.userID,
                    userName: people.userName,
                    status: people.status,
                    objectType: 'AD_Users',
                    roleType: people.roleType,
                    objectID: undefined,
                  };
                  if (
                    this.tempAtender.userID == this.authService.userValue.userID
                  ) {
                    this.curUser = this.tempAtender;
                  } else if (this.tempAtender.roleType == '2') {
                    this.driver = this.tempAtender;
                    this.driver.objectID = people.note;
                    this.driver.objectType = 'EP_Drivers';
                  } else {
                    this.lstPeople.push(this.tempAtender);
                  }
                });
                if (this.driver != null) {
                  this.driverCheck = true;
                } else {
                  this.driverCheck = false;
                }
                this.detectorRef.detectChanges();
              }
            });
        }
      }
    });

    this.initForm();
    if (this.isAdd) {
      this.data.attendees = 1;
      this.data.bookingOn = this.data.startDate;
      this.detectorRef.detectChanges();
    }
    
  }

  initForm() {
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddBookingCar = item;
        this.isAfterRender = true;
      });
    this.detectorRef.detectChanges();
  }
  setTitle(e: any) {
    this.title = this.tmpTitle;
    this.detectorRef.detectChanges();
  }
  ngAfterViewInit(): void {}
  beforeSave(option: RequestOption) {
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd, this.attendeesList, null, null];
    return true;
  }

  onSaveForm(approval: boolean = false) {
    this.fGroupAddBookingCar.patchValue(this.data);
    if (this.fGroupAddBookingCar.invalid == true) {
      this.codxEpService.notifyInvalid(
        this.fGroupAddBookingCar,
        this.formModel
      );
      return;
    }
    if (
      this.data.startDate != null &&
      this.data.endDate != null &&
      this.data.startDate < this.data.endDate
    ) {
      let hours = parseInt(
        ((this.data.endDate - this.data.startDate) / 1000 / 60 / 60).toFixed()
      );
      if (!isNaN(hours) && hours > 0) {
        this.data.hours = hours;
      }
    } else {
      this.notificationsService.notifyCode('TM036');
      return;
    }
    this.lstEquipment = [];
    this.tmplstDevice.forEach((element) => {
      let tempEquip = new Equipments();
      tempEquip.equipmentID = element.id;
      tempEquip.createdBy = this.authService.userValue.userID;
      tempEquip.isPicked = element.isSelected;
      this.lstEquipment.push(tempEquip);
    });
    this.attendeesList = [];
    this.attendeesList.push(this.curUser);
    this.lstPeople.forEach((people) => {
      this.attendeesList.push(people);
    });
    if(this.driver!=null){
      this.attendeesList.push(this.driver);
    }
    this.data.stopOn = this.data.endDate;
    this.data.bookingOn = this.data.startDate;
    this.data.category = '2';
    this.data.status = '1';
    this.data.resourceType = '2';
    this.data.equipments = this.lstEquipment;

    if (this.data.attendees > this.carCapacity) {
      this.notificationsService.alertCode('EP010').subscribe((x) => {
        if (x.event.status == 'N') {
          return;
        } else {
          this.startSave(approval);
        }
      });
    } else {
      this.startSave(approval);
    }
    this.detectorRef.detectChanges();
  }
  startSave(approval) {
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt), 0, null, null, !approval)
      .subscribe((res) => {
        if (res.save || res.update) {
          if (!res.save) {
            this.returnData = res.update;
          } else {
            this.returnData = res.save;
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
                      this.returnData.status = '3';
                      this.returnData.write = false;
                      this.returnData.delete = false;
                      (this.dialogRef.dataService as CRUDService)
                        .update(this.returnData)
                        .subscribe();
                      this.dialogRef && this.dialogRef.close();
                    } else {
                      this.notificationsService.notifyCode(res?.msgCodeError);
                      // Thêm booking thành công nhưng gửi duyệt thất bại
                      this.dialogRef && this.dialogRef.close();
                    }
                  });
              });

            this.dialogRef && this.dialogRef.close();
          } else {
            this.dialogRef && this.dialogRef.close();
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
        this.data[event?.field] = event.data;
      }
    }
  }
  valueCbxCarChange(event?) {
    if (event?.data != null && event?.data != '') {
      this.tmplstDevice = [];
      var cbxCar = event.component.dataService.data;
      cbxCar.forEach((element) => {
        if (element.ResourceID == event.data) {
          this.carCapacity = element.Capacity;
          this.useCard = element.UseCard;
          element.Equipments.forEach((item) => {
            let tmpDevice = new Device();
            tmpDevice.id = item.EquipmentID;
            tmpDevice.isSelected = true;
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
      this.driverChangeWithCar(event.data);

      this.detectorRef.detectChanges();
    }
  }
  driverChangeWithCar(carID: string) {
    this.codxEpService.getGetDriverByCar(carID).subscribe((res) => {
      if (res && res.msgBodyData[0]?.resourceID != null) {
        this.tempAtender = {
          userID: res.msgBodyData[0].resourceID,
          userName: res.msgBodyData[0].resourceName,
          status: '1',
          objectType: 'EP_Drivers',
          roleType: '2',
          objectID: res.msgBodyData[0].recID,
        };
        this.driver = this.tempAtender;
        this.tempDriver = this.driver;
        this.driverValidator(
          this.tempDriver.userID,
          this.data.startDate,
          this.data.endDate,
          this.data.recID
        );
      } else {
        this.driver = null;
      }
      this.detectorRef.detectChanges();
    });
  }
  driverValidator(driverID: any, startDate: Date, endDate: Date, recID: any) {
    if (
      driverID != null &&
      startDate != null &&
      endDate != null &&
      endDate > startDate
    ) {
      this.codxEpService
        .driverValidator(
          driverID,
          new Date(startDate).toUTCString(),
          new Date(endDate).toUTCString(),
          recID
        )
        .subscribe((res) => {
          if (res && res.msgBodyData[0] != null) {
            this.driverCheck = res.msgBodyData[0];
            if (res.msgBodyData[0]) {
              this.driver = this.tempDriver;
            }
            if (!res.msgBodyData[0]) {
              this.driver = null;
              this.notificationsService.notifyCode('EP008'); //Tài xế ko săn sàng
            }
          }
          this.detectorRef.detectChanges();
        });
    }
  }
  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 350);
    this.detectorRef.detectChanges();
  }
  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }
  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
  timeCheck(startTime: Date, endTime: Date) {
    if (endTime <= startTime) {
      return false;
    }
    if (this.tempDriver != null) {
      this.driverValidator(
        this.tempDriver.userID,
        this.data.startDate,
        this.data.endDate,
        this.data.recID
      );
    }
    return true;
  }
  startDateChange(evt: any) {
    if (!evt.field || !evt.data) {
      return;
    }
    this.data.startDate = new Date(evt.data.fromDate);
    // if (
    //   this.data.startDate.getHours() == 0 &&
    //   this.data.startDate.getMinutes() == 0
    // ) {
    //   let temp = this.data.startDate;
    //   this.data.startDate = new Date(
    //     temp.getFullYear(),
    //     temp.getMonth(),
    //     temp.getDate(),
    //     this.calStartHour,
    //     this.calStartMinutes
    //   );
    // }
    // let tmpDate = new Date();
    // let startDate= this.data.startDate;
    // if (new Date(tmpDate.getFullYear(),tmpDate.getMonth(),tmpDate.getDate(),0,0,0,0) > new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate(),0,0,0,0)) {
    //   this.checkLoopS = !this.checkLoopS;
    //   if (!this.checkLoopS) {
    //     this.notificationsService.notifyCode('TM036');
    //   }
    //   return;
    // }
    // if(this.data.startDate && this.data.endDate){
    //   if(!this.timeCheck(this.data.startDate,this.data.endDate)){
    //     this.checkLoopS = !this.checkLoopS;
    //     if (!this.checkLoopS) {
    //       this.notificationsService.notifyCode('TM036');
    //     }
    //     return;
    //   };
    // }
  }
  endDateChange(evt: any) {
    if (!evt.field || !evt.data) {
      return;
    }
    this.data.endDate = new Date(evt.data.fromDate);
    // if (
    //   this.data.endDate.getHours() == 0 &&
    //   this.data.endDate.getMinutes() == 0
    // ) {
    //   let temp = this.data.endDate;
    //   this.data.endDate = new Date(
    //     temp.getFullYear(),
    //     temp.getMonth(),
    //     temp.getDate(),
    //     this.calEndHour,
    //     this.calEndMinutes
    //   );
    // }
    // let tmpDate = new Date();
    // let endDate= this.data.endDate;
    // if (new Date(tmpDate.getFullYear(),tmpDate.getMonth(),tmpDate.getDate(),0,0,0,0) > new Date(endDate.getFullYear(),endDate.getMonth(),endDate.getDate(),0,0,0,0)) {
    //     this.checkLoopE = !this.checkLoopE;
    //   if (!this.checkLoopE) {
    //     this.notificationsService.notifyCode('TM036');
    //   }
    //   return;
    // }
    // if(this.data.startDate && this.data.endDate){
    //   if(!this.timeCheck(this.data.startDate,this.data.endDate)){
    //     this.checkLoopE = !this.checkLoopE;
    //     if (!this.checkLoopE) {
    //       this.notificationsService.notifyCode('TM036');
    //     }
    //     return;
    //   };
    // }
  }
  openPopupCbb() {
    this.isPopupCbb = true;
  }
  valueCbxUserChange(event) {
    //this.cbbData=event.id; gán data đã chọn cho combobox
    if (event?.dataSelected) {
      this.lstPeople = [];
      event.dataSelected.forEach((people) => {
        this.tempAtender = {
          userID: people.UserID,
          userName: people.UserName,
          status: '1',
          objectType: 'AD_Users',
          roleType: '3',
          objectID: undefined,
        };
        if (this.tempAtender.userID != this.curUser.userID) {
          this.lstPeople.push(this.tempAtender);
        }
      });
      if (this.lstPeople.length > 0) {
        this.data.attendees = this.lstPeople.length + 1;
      }
      this.isPopupCbb = false;
      this.detectorRef.detectChanges();
    }
  }
}
