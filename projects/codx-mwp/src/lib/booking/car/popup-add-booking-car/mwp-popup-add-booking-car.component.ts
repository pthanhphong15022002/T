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
import { Equipments } from 'projects/codx-ep/src/lib/models/equipments.model';
import { CodxBookingService } from 'projects/codx-share/src/lib/components/codx-booking/codx-booking.service';


export class Device {
  id;
  text = '';
  isSelected = true;
  icon = '';
}

@Component({
  selector: 'mwp-popup-add-booking-car',
  templateUrl: 'mwp-popup-add-booking-car.component.html',
  styleUrls: ['mwp-popup-add-booking-car.component.scss'],
})
export class MWPPopupAddBookingCarComponent extends UIComponent {
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
  returnData= null;
  title = '';
  cbbData: any;
  driverCheck = false;
  useCard = false;
  isSaveSuccess = false;
  fGroupBookingAttendees: FormGroup;
  fGroupAddBookingCar: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
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
    icon:any;
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
  isCopy = false;
  isPopupCbb = false;
  constructor(
    private injector: Injector,
    private codxEpService: CodxBookingService,
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
    this.isCopy =dialogData?.data[4];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    this.funcID = this.formModel.funcID;
    if(this.isAdd){

      this.data.requester = this.authService?.userValue?.userName;
    }
    if(this.isAdd && this.optionalData!=null){
      this.data.resourceID = this.optionalData.resourceId;
      this.data.bookingOn=this.optionalData.startDate;
    }
    else if(this.isAdd && this.optionalData==null){
      this.data.bookingOn=new Date();
    }
    if(this.isCopy){
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
      if(this.isCopy){
        if(this.data.equipments){
          this.data.equipments.forEach((equip) => {
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
      }
      this.detectorRef.detectChanges();
      if (this.isAdd && this.optionalData != null) {
        this.data.resourceID = this.optionalData.resourceId;
        this.detectorRef.detectChanges();        
        let equips = this.optionalData.resource?.equipments;
        if(equips){
          equips.forEach((equip) => {
            let tmpDevice = new Device();
            tmpDevice.id = equip.equipmentID;
            tmpDevice.isSelected = false;
            this.lstDeviceCar.forEach((vlDevice) => {
              if (tmpDevice.id == vlDevice.id) {
                tmpDevice.text = vlDevice.text;
                tmpDevice.icon = vlDevice.icon;
              }
            });
            this.tmplstDevice.push(tmpDevice);
          });
        }
        else{
          equips=[];
        }        
        this.data.startDate = this.optionalData.startDate;
        this.data.endDate = this.optionalData.startDate;
        this.detectorRef.detectChanges();
      }
      this.tmplstDevice = JSON.parse(JSON.stringify(this.tmplstDevice));
    });
    this.detectorRef.detectChanges();


    
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
            icon:'',
          };
          this.listRoles.forEach((element) => {
            if (element.value == this.tempAtender.roleType) {
              this.tempAtender.icon = element.icon;
            }
          });
          this.curUser = this.tempAtender;
        }
        
      }
    });

    this.initForm();
    if (this.isAdd && !this.isCopy) {
      this.data.attendees = 1;
      this.data.bookingOn = this.data.startDate;
      this.detectorRef.detectChanges();
    }
    if((this.isAdd && this.data.resourceID!=null) || !this.isAdd){
      this.codxEpService.getResourceByID(this.data.resourceID).subscribe((res:any)=>{
        if(res){
          this.carCapacity= res.capacity;
        }
      })
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
    option.methodName = 'SaveAsync';
    option.data = [itemData, this.isAdd, this.attendeesList, null, null];
    return true;
  }
  validatePhoneNumber(phone) {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(phone);
  }

  onSaveForm(approval: boolean = false) {
    this.data.reminder=15;
    this.data.bookingOn=this.data.startDate;
    this.data.stopOn=this.data.endDate;
    this.fGroupAddBookingCar.patchValue(this.data);
    if (this.fGroupAddBookingCar.invalid == true) {
      this.codxEpService.notifyInvalid(
        this.fGroupAddBookingCar,
        this.formModel
      );
      return;
    }

    if(!this.validatePhoneNumber(this.data.phone) && this.data.phone!=null && this.data.phone==''){
      this.notificationsService.notify('Số điện thoại không hợp lệ','2',0);// EP_WAIT doi messcode tu BA
      return;
    };

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
    let tmpEquip = [];
    this.tmplstDevice.forEach((element) => {
      let tempEquip = new Equipments();
      tempEquip.equipmentID = element.id;
      tempEquip.createdBy = this.authService.userValue.userID;
      tempEquip.isPicked = element.isSelected;
      tmpEquip.push(tempEquip);
    });    
    this.data.equipments = tmpEquip;

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
    this.data.approveStatus = '1';    
    this.data.status = '1';
    this.data.resourceType = '2';
    this.data.attendees= this.attendeesList.length;

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

      this.detectorRef.detectChanges();
    }
  }
  deleteAttender(attID:string){
    var tempDelete;
    this.lstPeople.forEach(item=>{
      if(item.userID== attID){
        tempDelete = item;
      }
    });
    this.lstPeople.splice(this.lstPeople.indexOf(tempDelete), 1);
    this.detectorRef.detectChanges();
  }
  
  
  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 560);
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
  filterArray(arr) {
    return [...new Map(arr.map(item => [item["userID"], item])).values()]
  }
  valueCbxUserChange(event) {
    //this.cbbData=event.id; gán data đã chọn cho combobox
    if (event?.dataSelected) {
      //this.lstPeople = [];
      event.dataSelected.forEach((people) => {        
        this.tempAtender = {
          userID: people.UserID,
          userName: people.UserName,
          status: '1',
          objectType: 'AD_Users',
          roleType: '3',
          objectID: people.UserID,          
          icon:'',
        };
        this.listRoles.forEach((element) => {
          if (element.value == this.tempAtender.roleType) {
            this.tempAtender.icon = element.icon;
          }
        });
        if (this.tempAtender.userID != this.curUser.userID) {
          this.lstPeople.push(this.tempAtender);
        }
      });
      
      this.lstPeople=this.filterArray(this.lstPeople);
      
      if (this.lstPeople.length > 0) {
        this.data.attendees = this.lstPeople.length + 1;
      }
      
      this.isPopupCbb = false;
      this.detectorRef.detectChanges();
    }
  }
}
