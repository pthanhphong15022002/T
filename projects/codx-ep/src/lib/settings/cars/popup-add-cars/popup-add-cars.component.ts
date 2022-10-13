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

import {
  AuthService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Device } from '../../../booking/car/popup-add-booking-car/popup-add-booking-car.component';

import { CodxEpService } from '../../../codx-ep.service';
import { Equipments } from '../../../models/equipments.model';

@Component({
  selector: 'popup-add-cars',
  templateUrl: 'popup-add-cars.component.html',
  styleUrls: ['popup-add-cars.component.scss'],
})
export class PopupAddCarsComponent extends UIComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data!: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() loadData = new EventEmitter();

  headerText = '';
  subHeaderText = '';

  fGroupAddCar: FormGroup;
  formModel: FormModel;
  dialogRef: DialogRef;
  lstEquipment = [];
  CbxName: any;
  isAfterRender = false;
  gviewCar: any;
  vllDevices = [];
  lstDeviceCar = [];
  tmplstDevice = [];
  avatarID: any = null;
  returnData:any;
  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxEpService: CodxEpService,
    private notificationsService: NotificationsService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogData?.data[0];
    this.isAdd = dialogData?.data[1];
    this.headerText=dialogData?.data[2];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }

  ngAfterViewInit(): void {}

  onInit(): void {
    this.initForm();
    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        if (!this.isAdd) {
          this.data.equipments.forEach((item) => {
            if (item.equipmentID == device.id) {
              device.isSelected = true;
            }
          });
        }
        this.lstDeviceCar.push(device);
        this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceCar));
      });
    });    
  }
  initForm() {
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddCar = item;        
        this.isAfterRender = true;
      });    
  }
  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 430);
    this.detectorRef.detectChanges();
  }

  valueChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }

  valueCbxChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.fGroupAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }

  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddCar.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    this.data.linkType='3';
    this.data.resourceType='2';
    this.fGroupAddCar.patchValue(this.data);
    if (this.fGroupAddCar.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupAddCar, this.formModel);
      return;
    }

    this.tmplstDevice.forEach((element) => {
      if (element.isSelected) {
        let tempEquip = new Equipments();
        tempEquip.equipmentID = element.id;
        tempEquip.createdBy = this.authService.userValue.userID;
        this.lstEquipment.push(tempEquip);
      }
    });

    if (this.fGroupAddCar.value.category != 1) {
      this.fGroupAddCar.patchValue({companyID:null});
    }    
    this.fGroupAddCar.patchValue({
      equipments: this.lstEquipment,
    });
    let index:any
    if(this.isAdd){
      index=0;
    }
    else{
      index=null;
    }
    this.dialogRef.dataService
    .save((opt: any) => this.beforeSave(opt),index)
    .subscribe((res) => {
      if (res) {          
        if (!res.save) {
          this.returnData = res.update;
        } else {
          this.returnData = res.save;
        }
        if(this.imageUpload)
        {
           this.imageUpload
          .updateFileDirectReload(this.returnData.recID)
          .subscribe((result) => {
            if (result) {
              this.loadData.emit();
              //xử lí nếu upload ảnh thất bại
              //...
            }
          });
        }
        this.dialogRef.close();
      }
      else{
        this.notificationsService.notifyCode('SYS001');
        return;
      }
    });
  }
  changeCategory(event:any){
    if(event?.data && event?.data!='1'){
      this.data.companyID=null;
      this.detectorRef.detectChanges();
    }
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
