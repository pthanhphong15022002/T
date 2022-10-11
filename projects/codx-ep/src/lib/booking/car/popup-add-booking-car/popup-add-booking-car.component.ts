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
import { AuthService, CacheService } from 'codx-core';
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
  isSelected = false;
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
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
      subName: 'Thông tin tham chiếu',
      subText: 'Thông tin tham chiếu',
    },
  ];
  returnData:any;
  title = '';
  cbbData:any;
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
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    this.funcID = this.formModel.funcID;
    this.data.requester = this.authService?.userValue?.userName;
  }
  onInit(): void {
    this.initForm();
    this.cacheService.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        this.lstDeviceCar.push(device);
      });

      if (!this.isAdd && this.data?.equipments != null) {
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
    });
    if (this.isAdd) {
      this.data.attendees = 1;
      this.data.bookingOn = new Date();

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

      this.detectorRef.detectChanges();
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

  onSaveForm(approval:boolean=false) {
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
    this.tmplstDevice.forEach((element) => {
      let tempEquip = new Equipments();
      tempEquip.equipmentID = element.id;
      tempEquip.createdBy = this.authService.userValue.userID;
      tempEquip.isPicked = element.isSelected;
      this.lstEquipment.push(tempEquip);
    });
    this.attendeesList.push(this.curUser);
    this.lstPeople.forEach((people) => {
      this.attendeesList.push(people);
    });
    this.attendeesList.push(this.driver);
    this.data.stopOn = this.data.endDate;
    this.data.bookingOn = this.data.startDate;
    this.data.category = '2';
    if(approval){
      this.data.status = '3';
    }
    else{      
      this.data.status = '1';
    }
    this.data.resourceType = '2';
    (this.data.equipments = this.lstEquipment),
      this.dialogRef.dataService
        .save((opt: any) => this.beforeSave(opt))
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
                      } else {
                        this.notificationsService.notifyCode(res?.msgCodeError);
                      }
                    });
                });
            }
            this.dialogRef && this.dialogRef.close();
          } else {
            this.notificationsService.notifyCode('E0011');
            return;
          }
        });
    this.detectorRef.detectChanges();
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
          this.useCard = element.UseCard;
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
        this.driverValidator(
          this.driver.userID,
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
          this.driver.userID,
          new Date(startDate),
          new Date(endDate),
          recID
        )
        .subscribe((res) => {
          if (res && res.msgBodyData[0] != null) {
            this.driverCheck = res.msgBodyData[0];
            if (!res.msgBodyData[0]) {
              this.driver = null;
              this.notificationsService.notifyCode('E0011'); //Tài xế ko săn sàng
            }
          }
          this.detectorRef.detectChanges();
        });
    }
  }
  

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 430);
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
  timeCheck() {
    if (!this.data.startDate || !this.data.endDate) {
      return;
    }
    let startTime = new Date(this.data.startDate);
    let endTime = new Date(this.data.endDate);
    if (endTime <= startTime) {
      this.checkLoop = !this.checkLoop;
      if (!this.checkLoop) {
        this.notificationsService.notifyCode('TM036');
        return;
      }
    }
    if (this.driver != null) {
      this.driverValidator(
        this.driver.userID,
        this.data.startDate,
        this.data.endDate,
        this.data.recID
      );
    }
  }
  startDateChange(evt: any) {
    if (!evt.field || !evt.data) {
      return;
    }
    this.data.startDate = evt.data.fromDate;
    if (new Date() >= new Date(this.data.startDate)) {
      this.checkLoopS = !this.checkLoopS;
      if (!this.checkLoopS) {
        this.notificationsService.notifyCode('TM036');
        return;
      }
    }
    this.timeCheck();
  }
  endDateChange(evt: any) {
    if (!evt.field || !evt.data) {
      return;
    }
    this.data.endDate = evt.data.fromDate;
    if (new Date() >= new Date(this.data.endDate)) {
      this.checkLoopE = !this.checkLoopE;
      if (!this.checkLoopE) {
        this.notificationsService.notifyCode('TM036');
        return;
      }
    }
    this.timeCheck();
  }
  openPopupCbb() {
    this.isPopupCbb = true;
  }

  valueCbxUserChange(event) {
    this.cbbData=event;  
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
