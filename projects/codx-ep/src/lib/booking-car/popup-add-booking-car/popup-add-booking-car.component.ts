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
import { CodxEpService, ModelPage } from '../../codx-ep.service';
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
   @Input() data!: any;

  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();


  titleAction = 'Thêm mới';
  title="đặt xe";
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'tabGeneralInfo'
    },
    {
      icon: 'icon-person_add_alt_1',
      text: 'Người đi cùng',
      name: 'tabPeopleInfo'
    },
    {
      icon: 'icon-tune',
      text: 'Thông tin khác',
      name: 'tabMoreInfo',
    },
  ];
  isSaveSuccess = false;

  fGroupAddBookingCar: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  modelPage: ModelPage;


  isNew: boolean = true;
  currentSection = "GeneralInfo";
  CbxName: any;
  isAfterRender = false;  
  
  vllDevices = [];
  lstDeviceCar = [];
  tmplstDevice = [];
  lstPeople=[];
  driver=null;
  smallListPeople=[];

  constructor(    
    private callFuncService: CallFuncService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    private apiHttpService: ApiHttpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {    
    
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }  
  ngOnInit(): void {    
    this.codxEpService.getModelPage('EPT2').then((res) => {
      if (res) {
        this.modelPage = res;
        console.log('EPT2',res);
      }
      this.cacheService.valueList('EP012').subscribe((res) => {
        this.vllDevices = res.datas;
        this.vllDevices.forEach((item) => {
          let device = new Device();
          device.id = item.value;
          device.text = item.text;
          this.lstDeviceCar.push(device);
        });
        this.lstDeviceCar = JSON.parse(JSON.stringify(this.lstDeviceCar));
      });

      this.codxEpService
      .getComboboxName(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .then((res) => {
        this.CbxName = res;
        console.log('cbxEPT', this.CbxName);
      });

      this.cacheService.functionList('EPT2').subscribe(res => {
        this.cacheService.gridViewSetup(res.formName, res.gridViewName).subscribe(res => {
          console.log('grvEPT', res)
        })
      })     
      this.initForm();
    });
  }
  
  initForm() {  
    this.codxEpService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        this.fGroupAddBookingCar = item;
        this.isAfterRender = true;
        if (this.data) {
          console.log('fgroupEPT2', this.data)
          this.fGroupAddBookingCar.patchValue(this.data);
        }
      });
  }
  setTitle(e: any) {
    this.title = this.titleAction + ' ' + e.toString().toLowerCase();
    this.changeDetectorRef.detectChanges();    
  }

  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddBookingCar.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    if (this.fGroupAddBookingCar.invalid == true) {
      return;
    }    
    if (this.fGroupAddBookingCar.value.endDate - this.fGroupAddBookingCar.value.startDate <= 0 ) {
      this.notificationsService.notifyCode('EP003');
    }
    if ( this.fGroupAddBookingCar.value.startDate && this.fGroupAddBookingCar.value.endDate ) {
      let hours = parseInt(
        (
          (this.fGroupAddBookingCar.value.endDate - this.fGroupAddBookingCar.value.startDate)/1000/60/60
        ).toFixed()
      );
      if (!isNaN(hours) && hours > 0) {
        this.fGroupAddBookingCar.patchValue({ hours: hours });
      }
    }
    
    if (this.isAdd) {
      this.fGroupAddBookingCar.patchValue({
        category: '2',
        status: '1',
        resourceType: '2',
      });

      var date = new Date(this.fGroupAddBookingCar.value.startDate);
      this.fGroupAddBookingCar.value.bookingOn = new Date(
        date.setHours(0, 0, 0, 0)
      );
    }

    let equipments = '';
    this.tmplstDevice.forEach((element) => {
      if (element.isSelected) {
        if (equipments == '') {
          equipments += element.id;
        } else {
          equipments += ';' + element.id;
        }
      }
    });
    
    this.fGroupAddBookingCar.value.equipments = equipments;
    this.fGroupAddBookingCar.value.agencyName=this.fGroupAddBookingCar.value.agencyName[0];
    this.fGroupAddBookingCar.value.reasonID='Chưa có dữ liệu';//Cbx chưa có dữ liệu
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe(
        res => {
          if (res.update) {
            (this.dialogRef.dataService as CRUDService)
              .update(res.update)
              .subscribe();
          }
          this.changeDetectorRef.detectChanges();
        }
      ); 
    // this.apiHttpService
    //   .callSv('EP', 'ERM.Business.EP', 'BookingsBusiness', 'AddEditItemAsync', [
    //     this.fGroupAddBookingCar.value,
    //     this.isAdd,
    //     '',
    //   ])
    //   .subscribe((res) => {
    //     this.onDone.emit([res.msgBodyData[0], this.isAdd]);
    //     this.closeFormEdit(res);
    //   });
    //console.log(this.fGroupAddBookingCar.value);
  }
  buttonClick(e: any) {
    //console.log(e);
  }
  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.fGroupAddBookingCar.patchValue({[event['field']]: event.data.value, });
      } else {
        this.fGroupAddBookingCar.patchValue({ [event['field']]: event.data });
      }
    }
  }
  valueCbxCarChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.fGroupAddBookingCar.patchValue({[event['field']]: event.data.value, });
      } else {
        this.fGroupAddBookingCar.patchValue({ [event['field']]: event.data });
      }
    }
    
    this.tmplstDevice=[];
    var cbxCar = event.component.dataService.data;
      cbxCar.forEach(element => {
        if (element.ResourceID == event.data) {          
          var carEquipments= element.Equipments.split(";");
          carEquipments.forEach(item=>{
            this.lstDeviceCar.forEach(device=>{
              if(item==device.id){
                this.tmplstDevice.push(device);                
              }
            })
          })          
        }
      });   
      this.changeDetectorRef.detectChanges();
  }

  valueCbxUserChange(event) {
    this.lstPeople = event.data.dataSelected; 
    if(this.lstPeople.length == 1){      
      this.smallListPeople = this.lstPeople;
    }
    if(this.lstPeople.length >= 2) {
      this.smallListPeople=null;
      this.smallListPeople = [this.lstPeople[0],this.lstPeople[1]];
    }         
    this.changeDetectorRef.detectChanges();
  }

  valueCbxDriverChange(event) {
    this.driver= event.data.dataSelected[0];    
    this.changeDetectorRef.detectChanges();
  }

  changeTime(data) {
    if (!data.field || !data.data) return;
    this.fGroupAddBookingCar.patchValue({ [data['field']]: data.data.fromDate });
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
}
