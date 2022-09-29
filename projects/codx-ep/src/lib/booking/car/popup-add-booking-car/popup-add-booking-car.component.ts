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
  icon='';
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

  titleAction = 'Thêm mới';
  title = 'đặt xe';
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
  isSaveSuccess = false;
  subHeaderText = 'Đặt xe';
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
  lstEquipment=[];
  tempAtender: {
    userId: string;
    userName: string;
    roleType: string;
    status: string;
    objectType: string;
  };
  attendeesList = [];

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
  tmpTitle='';
  tempArray = [];
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
    this.data.requester =this.authService?.userValue?.userName;
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
        //this.tmplstDevice = JSON.parse(JSON.stringify(this.tmplstDevice));
      });
    if (this.isAdd) {
      this.data.attendees= 1;
      this.data.bookingOn = new Date();  
      
      let people = this.authService.userValue;
      this.tempAtender = {
        userId: people.userID,
        userName: people.userName,
        status: '1',
        objectType: 'AD_Users',
        roleType: '2',
      };
      this.curUser = this.tempAtender;
      
      this.detectorRef.detectChanges();
    }
    

    if (!this.isAdd) {
      this.driverChangeWithCar(this.data?.resourceID);
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
                userId: people.userID,
                userName: people.userName,
                status: people.status,
                objectType: 'AD_Users',
                roleType: people.roleType,
              };
              if (
                this.tempAtender.userId == this.authService.userValue.userID
              ) {
                this.curUser = this.tempAtender;
              } else {
                this.lstPeople.push(this.tempAtender);
              }
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
        this.fGroupAddBookingCar = item;        
        this.isAfterRender = true;              
      });   
      this.detectorRef.detectChanges();       
  }
  setTitle(e: any) {
    this.title = this.tmpTitle;
    this.detectorRef.detectChanges();
  }
  ngAfterViewInit(): void {
        if (this.dialogRef) {
      if (!this.isSaveSuccess) {
        this.dialogRef.closed.subscribe((res: any) => {
          console.log('Close without saving or save failed', res);
          this.dialogRef.dataService.saveFailed.next(null);
        });
      }
    }
  }
  beforeSave(option: RequestOption) {
    let itemData = this.data;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd, this.attendeesList, null, null];
    return true;
  }

  onSaveForm() {
    this.fGroupAddBookingCar.patchValue(this.data);
    if (this.fGroupAddBookingCar.invalid == true) {
      this.codxEpService.notifyInvalid(
        this.fGroupAddBookingCar,
        this.formModel
      );
      return;
    }
    if (
      this.data.startDate &&
      this.data.endDate
    ) {
      let hours = parseInt(
        (
          (this.data.endDate -
            this.data.startDate) /
          1000 /
          60 /
          60
        ).toFixed()
      );
      if (!isNaN(hours) && hours > 0) {
        this.data.hours= hours;
      }
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
    
    // if (this.data.value.resourceID instanceof Object) {
    //   this.data.resourceID= this.data.value.resourceID[0];
    // }
    // if (this.data.value.agencyName instanceof Object) {
    //   this.data.agencyName= this.data.value.agencyName[0];
    // }
    // if (this.data.value.reasonID instanceof Object) {
    //   this.data.reasonID= this.data.value.reasonID[0];
    // }
    this.data.stopOn = this.data.endDate;
    this.data.bookingOn= this.data.startDate;
    this.data.category= '2';
    this.data.status= '1';
    this.data.resourceType= '2';
    this.data.equipments= this.lstEquipment,

    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.save || res.update) {
          this.dialogRef && this.dialogRef.close();
        } else {
          this.notificationsService.notifyCode('E0011');
          return;
        }
      });
    this.detectorRef.detectChanges();
  }
  buttonClick(e: any) {
    //console.log(e);
  }
  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.data['field']= event.data.value;        
      } else {
        this.data['field']= event.data.value;
      }
    }
  }

  valueCbxCarChange(event?) {
    if (event?.data != null && event?.data != '') {      
      this.tmplstDevice = [];
      var cbxCar = event.component.dataService.data;
      cbxCar.forEach((element) => {
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
      this.driverChangeWithCar(event.data);
      this.detectorRef.detectChanges();
    }
  }

  driverChangeWithCar(carID: string) {
    this.codxEpService.getGetDriverByCar(carID).subscribe((res) => {
      if (res) {
        var x = res;
        let driverInfo: {
          id: string;
          text: string;
          objectType: string;
          objectName: string;
        } = {
          id: res.msgBodyData[0].resourceID,
          text: res.msgBodyData[0].resourceName,
          objectType: undefined,
          objectName: undefined,
        };
        this.driver = driverInfo;
        this.detectorRef.detectChanges();
      }
    });
  }
  valueCbxUserChange(event?) {
    this.lstPeople = [];
    event.data.dataSelected.forEach((people) => {
      this.tempAtender = {
        userId: people.id,
        userName: people.text,
        status: '1',
        objectType: 'AD_Users',
        roleType: '3',
      };
      if (this.tempAtender.userId != this.curUser.userId) {
        this.lstPeople.push(this.tempAtender);
      }
    });
    if (this.lstPeople.length > 0) {
      this.data.attendees= this.lstPeople.length + 1;      
    }
    this.detectorRef.detectChanges();
  }

  // valueCbxDriverChange(event) {
  //   this.driver= event.data.dataSelected[0];
  //   this.changeDetectorRef.detectChanges();
  // }

  // changeTime(data) {
  //   if (!data.field || !data.data) return;
  //   this.data.patchValue({
  //     [data['field']]: data.data.fromDate,
  //   });
  // }
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
  timeCheck(){
    if(!this.data.startDate || !this.data.endDate){
      return;
    }
    let startTime =new Date(this.data.startDate);
    let endTime =new Date(this.data.endDate);
    let crrTime = new Date();
    if(startTime.getFullYear() < crrTime.getFullYear() || endTime.getFullYear() < crrTime.getFullYear() || endTime.getFullYear() < startTime.getFullYear() ){
      this.notificationsService.notifyCode('EP003');
      return;
    }     
    else if(startTime.getMonth() < crrTime.getMonth() || endTime.getMonth() < crrTime.getMonth() || endTime.getMonth() < startTime.getMonth() ){
      this.notificationsService.notifyCode('EP003');
      return;
    }
    else if(startTime.getDate() < crrTime.getDate() || endTime.getDate() < crrTime.getDate() || endTime.getDate() < startTime.getDate() ){
      this.notificationsService.notifyCode('EP003');
      return;
    }
    else if(startTime.getHours() < crrTime.getHours() || endTime.getHours() < crrTime.getHours() || endTime.getHours() < startTime.getHours() ){
      this.notificationsService.notifyCode('EP003');
      return;
    }
    else if(startTime.getMinutes() <= crrTime.getMinutes() || endTime.getMinutes() <= crrTime.getMinutes() || endTime.getMinutes() <= startTime.getMinutes() ){
      this.notificationsService.notifyCode('EP003');
      return;
    }   
  }
  startDateChange(evt:any){
    if (!evt.field || !evt.data) {
      return;  
    } 
    this.data.startDate= evt.data.fromDate;    
    this.timeCheck()
  }
  endDateChange(evt:any){
    if (!evt.field || !evt.data) {
      return;  
    } 
    this.data.endDate= evt.data.fromDate; 
    this.timeCheck()   
  }
}
