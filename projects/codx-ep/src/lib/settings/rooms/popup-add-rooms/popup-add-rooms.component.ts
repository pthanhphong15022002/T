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
  dialog: any;
  cacheGridViewSetup: any;
  CbxName: any;
  dialogAddRoom: FormGroup;
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
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dialog?.dataService?.dataSelected;
    this.isAdd = dt?.data[1];
    this.dialog = dialog;
    this.formModel = this.dialog.formModel;
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

    this.codxEpService
      .getComboboxName(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((res) => {
        this.CbxName = res;
        console.log('cbx', this.CbxName);
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
        this.dialogAddRoom = item;
        if (this.data) {
          this.dialogAddRoom.patchValue(this.data);
          this.dialogAddRoom.patchValue({
            resourceType: '1',
          });
        }
        this.isAfterRender = true;
      });
  }

  valueCbxChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddRoom.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddRoom.patchValue({ [event['field']]: event.data });
      }
    }
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
    if (this.dialogAddRoom.invalid == true) {
      this.codxEpService.notifyInvalid(this.dialogAddRoom, this.formModel);
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
    this.dialogAddRoom.patchValue({
      resourceType: '1',
      linkType: '0',
      equipments: this.lstEquipment,
    });
    if (this.dialogAddRoom.value.owner instanceof Object) {
      this.dialogAddRoom.patchValue({
        owner: this.dialogAddRoom.value.owner[0],
      });
    }
    if (this.dialogAddRoom.value.companyID instanceof Object) {
      this.dialogAddRoom.patchValue({
        companyID: this.dialogAddRoom.value.companyID[0],
      });
    }
    this.dialog.dataService
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
          this.dialog.close();
        }
        return;
      });
  }

  beforeSave(option: RequestOption) {
    let itemData = this.dialogAddRoom.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }
  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
