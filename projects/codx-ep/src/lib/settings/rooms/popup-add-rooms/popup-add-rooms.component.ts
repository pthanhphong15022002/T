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
  dialogRef: any;
  cacheGridViewSetup: any;
  CbxName: any;
  fGroupAddRoom: FormGroup;
  vllDevices = [];
  lstDevices: [];
  isAfterRender = false;

  tmplstDevice = [];
  lstDeviceRoom = [];

  formModel: FormModel;
  headerText = '';
  subHeaderText = '';
  lstEquipment = [];

  constructor(
    private injector: Injector,
    private authService: AuthService,
    private codxEpService: CodxEpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    super(injector);
    this.data = dialogRef?.dataService?.dataSelected;
    this.isAdd = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }

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
        this.lstDeviceRoom.push(device);
        this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceRoom));
      });
    });
    
  }

  initForm() {
    if (this.isAdd) {
      this.headerText = 'Thêm mới phòng';
    } else {
      this.headerText = 'Sửa thông tin phòng';
    }

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
    var dialog = this.callfc.openForm(template, '', 550, 430);
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
    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res) {
          let objectID= res.save.recID !=null? res.save.recID:res.update.recID;
          this.imageUpload
            .updateFileDirectReload(objectID)
            .subscribe((result) => {
              if (result) {
                //this.loadData.emit();
              }
            });
          this.dialogRef.close();
        }
        return;
      });
  }

  beforeSave(option: RequestOption) {
    let itemData = this.fGroupAddRoom.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  // closeFormEdit(data) {
  //   this.initForm();
  //   this.closeEdit.emit(data);
  // }
}
