import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'codx-core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
  FormModel,
  RequestOption,
  CRUDService,
} from 'codx-core';
import { CodxEpService, ModelPage } from '../../../codx-ep.service';

export class Device {
  id;
  text = '';
  isSelected = false;
}

@Component({
  selector: 'popup-add-booking-car',
  templateUrl: 'popup-add-booking-car.component.html',
  styleUrls: ['popup-add-booking-car.component.scss'],
})
export class PopupAddBookingCarComponent implements OnInit {
  @ViewChild('popupDevice', { static: true }) popupDevice;

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
    },
    {
      icon: 'icon-person_add_alt_1',
      text: 'Người đi cùng',
      name: 'tabPeopleInfo',
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
    },
  ];
  isSaveSuccess = false;

  fGroupBookingAttendees: FormGroup;
  fGroupAddBookingCar: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  modelPage: ModelPage;
  cbxUser: any;
  peopleAttend = [];
  curUser: any;
  data: any;
  isNew: boolean = true;
  currentSection = 'GeneralInfo';
  CbxName: any;
  isAfterRender = false;


  tempAtender:{userId: string, userName:string, roleType:string,status:string,objectType:string};
  attendeesList=[];

  grvBookingCar: any;
  strAttendees: string = '';
  vllDevices = [];
  lstDeviceCar = [];
  tmplstDevice = [];
  lstPeople = [];
  driver: any;
  smallListPeople = [];
  editCarDevice = null;
  tempArray = [];
  constructor(
    private callFuncService: CallFuncService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private apiHttpService: ApiHttpService,
    private authService: AuthService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.data = dialogRef.dataService!.dataSelected;
    //this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
    console.log('formModel', this.formModel);
  }
  ngOnInit(): void {
    if (!this.isAdd) {
      this.titleAction = 'Chỉnh sửa';
    }
    this.codxEpService.getModelPage('EPT2').then((res) => {
      if (res) {
        this.modelPage = res;
        console.log('EPT2', res);
      }
      if (this.isAdd) {
        let people = this.authService.userValue;
        this.tempAtender = {
          userId: people.userID,
          userName: people.userName,
          status:"1",
          objectType: 'AD_Users',
          roleType:'2'
        };
        this.curUser = this.tempAtender;   
        this.changeDetectorRef.detectChanges();
      }
      this.cacheService.valueList('EP012').subscribe((res) => {
        this.vllDevices = res.datas;
        this.vllDevices.forEach((item) => {
          let device = new Device();
          device.id = item.value;
          device.text = item.text;
          this.lstDeviceCar.push(device);
        });
        if (!this.isAdd && this.fGroupAddBookingCar.value.equipments != null) {
          let deviceArray =
            this.fGroupAddBookingCar.value.equipments.split('|');
          let availableDevice = deviceArray[0];
          let pickedDevice = deviceArray[1];

          this.lstDeviceCar.forEach((device) => {
            availableDevice.split(';').forEach((equip) => {
              if (device.id == equip) {
                this.tempArray.push(device);
              }
            });
          });
          this.tempArray.forEach((device) => {
            pickedDevice.split(';').forEach((equip) => {
              if (device.id == equip) {
                device.isSelected = true;
              }
            });
          });
          this.tmplstDevice = JSON.parse(JSON.stringify(this.tempArray));
        }
        this.lstDeviceCar = JSON.parse(JSON.stringify(this.lstDeviceCar));
      });

      if (!this.isAdd) {
        this.driverChangeWithCar(this.data.resourceID);

        this.changeDetectorRef.detectChanges();
      }
      this.codxEpService
        .getComboboxName(
          this.dialogRef.formModel.formName,
          this.dialogRef.formModel.gridViewName
        )
        .then((res) => {
          this.CbxName = res;
          console.log('cbxEPT', this.CbxName);
        });

      this.cacheService.functionList('EPT2').subscribe((res) => {
        this.cacheService
          .gridViewSetup(res.formName, res.gridViewName)
          .subscribe((res) => {
            console.log('grvEPT', res);
            this.grvBookingCar = res;
          });
      });
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
                this.tempAtender ={                
                  userId:people.userID,
                  userName:people.userName,
                  status:people.status,
                  objectType:'AD_Users',
                  roleType:people.roleType,
                };
                if(this.tempAtender.userId==this.authService.userValue.userID){                
                  this.curUser=this.tempAtender;
                }
                else{                  
                  this.lstPeople.push(this.tempAtender);
                }
              });

              this.changeDetectorRef.detectChanges();
            }
          });
      }
      this.initForm();
    });
  }

  initForm() {
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        this.fGroupAddBookingCar = res;
        if (this.data) {
          console.log('fgroupEPT2', this.data);
          this.fGroupAddBookingCar.patchValue(this.data);
          
        }
      });
      if(this.isAdd){
        this.fGroupAddBookingCar.patchValue({
          attendees:1,
        });
  
        var date = new Date(this.fGroupAddBookingCar.value.startDate);
        this.fGroupAddBookingCar.value.bookingOn = new Date(
          date.setHours(0, 0, 0, 0)
        );
      }
      
    this.isAfterRender = true;
    this.changeDetectorRef.detectChanges();
  }
  setTitle(e: any) {
    this.title = this.titleAction + ' ' + e.toString().toLowerCase();
    this.changeDetectorRef.detectChanges();
  }

  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddBookingCar.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd, this.attendeesList,null,null];
    return true;
  }

  onSaveForm() {
    if (this.fGroupAddBookingCar.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupAddBookingCar, this.formModel);
      return;
    }
    if (
      this.fGroupAddBookingCar.value.startDate &&
      this.fGroupAddBookingCar.value.endDate
    ) {
      let hours = parseInt(
        (
          (this.fGroupAddBookingCar.value.endDate -
            this.fGroupAddBookingCar.value.startDate) /
          1000 /
          60 /
          60
        ).toFixed()
      );
      if (!isNaN(hours) && hours > 0) {
        this.fGroupAddBookingCar.patchValue({ hours: hours });
      }
    }    
    
    this.attendeesList.push(this.curUser);
    this.lstPeople.forEach(people=>{
      this.attendeesList.push(people);
    });    

    let pickedEquip = '';
    let availableEquip = '';
    this.tmplstDevice.forEach((element) => {
      if (availableEquip == '') {
        availableEquip += element.id;
      } else {
        availableEquip += ';' + element.id;
      }
      if (element.isSelected) {
        if (pickedEquip == '') {
          pickedEquip += element.id;
        } else {
          pickedEquip += ';' + element.id;
        }
      }
    });
    if(this.fGroupAddBookingCar.value.resourceID instanceof Object){
      this.fGroupAddBookingCar.patchValue({resourceID:this.fGroupAddBookingCar.value.resourceID[0]})
    }
    if (this.fGroupAddBookingCar.value.agencyName instanceof Object){
      this.fGroupAddBookingCar.patchValue({agencyName:this.fGroupAddBookingCar.value.agencyName[0]})
    }
    if (this.fGroupAddBookingCar.value.reasonID instanceof Object){
      this.fGroupAddBookingCar.patchValue({reasonID:this.fGroupAddBookingCar.value.reasonID[0]})
    }
    this.fGroupAddBookingCar.patchValue({
      //equipments: availableEquip + '|' + pickedEquip,
      stopOn:this.fGroupAddBookingCar.value.endDate,
      bookingOn: this.fGroupAddBookingCar.value.startDate,
      category: '2',
      status: '1',
      resourceType: '2',
    });
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
    this.changeDetectorRef.detectChanges();
  }

  buttonClick(e: any) {
    //console.log(e);
  }
  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.fGroupAddBookingCar.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.fGroupAddBookingCar.patchValue({ [event['field']]: event.data });
      }
    }
  }

  valueCbxCarChange(event?) {
    if (event?.data != null && event?.data != '') {
      this.tmplstDevice = [];
      var cbxCar = event.component.dataService.data;
      cbxCar.forEach((element) => {
        if (element.ResourceID == event.data) {
          var carEquipments = element.Equipments.split(';');
          carEquipments.forEach((item) => {
            this.lstDeviceCar.forEach((device) => {
              if (item == device.id) {
                device.isSelected = false;
                this.tmplstDevice.push(device);
              }
            });
          });
        }
      });
      this.driverChangeWithCar(event.data);
    }
  }

  driverChangeWithCar(carID: string) {
    this.apiHttpService
      .callSv(
        'EP',
        'ERM.Business.EP',
        'ResourcesBusiness',
        'GetDriverByCarAsync',
        [carID]
      )
      .subscribe((res) => {
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
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  valueCbxUserChange(event?) {
    event.data.dataSelected.forEach((people) => {
      this.tempAtender = {
        userId: people.id,
        userName: people.text,
        status:"1",
        objectType: 'AD_Users',
        roleType:'3'
      };
      if(this.tempAtender.userId!=this.curUser.userId)
      {
        this.lstPeople.push(this.tempAtender);
      }
    });
    if(this.lstPeople.length>0){
      this.fGroupAddBookingCar.patchValue({attendees:this.lstPeople.length+1});
    }
    this.changeDetectorRef.detectChanges();
  }

  // valueCbxDriverChange(event) {
  //   this.driver= event.data.dataSelected[0];
  //   this.changeDetectorRef.detectChanges();
  // }

  changeTime(data) {
    if (!data.field || !data.data) return;
    this.fGroupAddBookingCar.patchValue({
      [data['field']]: data.data.fromDate,
    });
  }
  openPopupDevice(template: any) {
    var dialog = this.callFuncService.openForm(template, '', 550, 430);
    this.changeDetectorRef.detectChanges();
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

  // dataValid() {
  //   this.fGroupAddBookingCar.value.agencyName =
  //     this.fGroupAddBookingCar.value.agencyName[0];
  //   this.fGroupAddBookingCar.value.resourceID =
  //     this.fGroupAddBookingCar.value.resourceID[0];

  //   var data = this.fGroupAddBookingCar.value;
  //   var result = true;
  //   if (this.lstPeople.length < 1) {
  //     this.notificationsService.notifyCode(
  //       'E0001',
  //       0,
  //       '"' + 'Người đi cùng' + '"'
  //     );
  //     return false;
  //   }
  //   var requiredControlName = [
  //     'resourceID',
  //     'startDate',
  //     'endDate',
  //     'reasonID',
  //     'title',
  //     'agencyName',
  //     'address',
  //     'contactName',
  //     'phone',
  //   ];
  //   requiredControlName.forEach((item) => {
  //     var x = data[item];
  //     if (!data[item]) {
  //       let fieldName = item.charAt(0).toUpperCase() + item.slice(1);
  //       this.notificationsService.notifyCode(
  //         'E0001',
  //         0,
  //         '"' + this.grvBookingCar[fieldName].headerText + '"'
  //       );
  //       result = false;
  //     }
  //   });
  //   return result;
  //}
}
