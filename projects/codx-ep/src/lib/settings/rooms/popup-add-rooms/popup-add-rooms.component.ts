import { ViewBaseComponent } from 'codx-core/lib/layout/views/view-base/view-base.component';
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
  DialogData,
  FormModel,
  RequestOption,
  DialogRef,
  ImageViewerComponent,
  AuthService,
  UIComponent,
  CRUDService,
  NotificationsService,
} from 'codx-core';
import { Device } from '../../../booking/car/popup-add-booking-car/popup-add-booking-car.component';
import { CodxEpService } from '../../../codx-ep.service';
import { Equipments } from '../../../models/equipments.model';

@Component({
  selector: 'popup-add-rooms',
  templateUrl: 'popup-add-rooms.component.html',
  styleUrls: ['popup-add-rooms.component.scss'],
})
export class PopupAddRoomsComponent extends UIComponent {
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  
  @Input() data!: any;
  @Input() editResources: any;
  @Input() isAdd = true;
  @Output() closeEdit = new EventEmitter();
  dialogRef: DialogRef;
  cacheGridViewSetup: any;
  CbxName: any;
  fGroupAddRoom: FormGroup;
  vllDevices = [];
  lstDevices: [];
  isAfterRender = false;
  isDone=true;
  tmplstDevice = [];
  lstDeviceRoom = [];
  returnData:any;
  formModel: FormModel;
  headerText = '';
  subHeaderText = '';
  lstEquipment = [];
  moreFunc:any;
  functionList:any;
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
    if(this.isAdd){
      this.data.preparator= this.authService.userValue.userID;
    }
  }

  onInit(): void {
    this.initForm();    
    this.cache.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        device.icon= item.icon;
        device.isSelected= false;  
        if (!this.isAdd) {
          this.data.equipments.forEach((item) => {
            if (item.equipmentID == device.id) {
              device.isSelected = true;
            }
          });
        }
        this.lstDeviceRoom.push(device);
        this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceRoom));
      });
    });
    
  }

  initForm() {
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddRoom = item;        
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
    var dialog = this.callfc.openForm(template, '', 550, 350);
    this.detectorRef.detectChanges();
  }
  onSaveForm() {
    this.data.resourceType='1';
    this.fGroupAddRoom.patchValue(this.data);
    if (this.fGroupAddRoom.invalid == true) {
      this.codxEpService.notifyInvalid(this.fGroupAddRoom, this.formModel);
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
    this.fGroupAddRoom.patchValue({      
      equipments: this.lstEquipment,
      category: '1',
      linkType: '0',
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
      .subscribe(async (res) => {
        if (res.save || res.update) {          
          if (!res.save) {
            this.returnData = res.update;            
          } else {
            this.returnData = res.save;
          }
          if(this.returnData?.recID)
          {
            if(this.imageUpload?.imageUpload?.item) {
              this.imageUpload
              .updateFileDirectReload(this.returnData.recID)
              .subscribe((result) => {
                if (result) {                  
                  //xử lí nếu upload ảnh thất bại
                  //...                
                }
                this.dialogRef && this.dialogRef.close(this.returnData);
              });  
            }          
            else 
            {
              this.dialogRef && this.dialogRef.close(this.returnData);
            }
          } 
          this.dialogRef && this.dialogRef.close(this.returnData);
        }
        else{ 
          //Trả lỗi từ backend.         
          return;
        }
      });
  }

  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddRoom.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }
}
