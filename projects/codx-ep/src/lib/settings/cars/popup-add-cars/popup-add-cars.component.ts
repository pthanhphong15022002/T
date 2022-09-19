import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {
  AuthService,
  CacheService,
  CallFuncService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  RequestOption,
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
export class PopupAddCarsComponent implements OnInit, AfterViewInit {
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
  notificationsService: any;
  constructor(
    private authService: AuthService,
    private callFuncService: CallFuncService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private codxEpService: CodxEpService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.data = dialogRef?.dataService?.dataSelected;
    this.isAdd = dialogData?.data[1];
    this.dialogRef = dialogRef;
    this.formModel = this.dialogRef.formModel;
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.initForm();

    this.cacheService.valueList('EP012').subscribe((res) => {
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

    this.codxEpService
      .getComboboxName(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .then((res) => {
        this.CbxName = res;
        console.log('cbx', this.CbxName);
      });
  }

  initForm() {
    if (this.isAdd) {
      this.headerText = 'Thêm mới xe';
      //this.fGroupAddCar.value.resourceName=null;
    } else {
      this.headerText = 'Sửa thông tin xe';
      this.avatarID = this.data.recID;
    }
    this.codxEpService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.fGroupAddCar = item;
        if (this.data) {
          this.fGroupAddCar.patchValue(this.data);
        }
        this.fGroupAddCar.patchValue({
          resourceType: '2',
          linkType: '3',
        });
        this.isAfterRender = true;
      });
    this.cacheService
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((res) => {
        this.gviewCar = res;
        console.log('grvEPT', this.gviewCar);
      });
  }
  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.data;
    }
  }

  openPopupDevice(template: any) {
    var dialog = this.callFuncService.openForm(template, '', 550, 430);
    this.changeDetectorRef.detectChanges();
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
    // const invalid = [];
    // const controls = this.gviewCar;
    // for (const name in controls) {
    //   if (this.gviewCar[name].isRequire) {
    //     invalid.push(name);
    //   }
    // }
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
      this.fGroupAddCar.value.companyID = null;
    } else {
      if (this.fGroupAddCar.value.companyID instanceof Object) {
        this.fGroupAddCar.patchValue({
          companyID: this.fGroupAddCar.value.companyID[0],
        });
      }
    }
    if (this.fGroupAddCar.value.owner instanceof Object) {
      this.fGroupAddCar.patchValue({ owner: this.fGroupAddCar.value.owner[0] });
    }
    if (this.fGroupAddCar.value.linkID instanceof Object) {
      this.fGroupAddCar.patchValue({
        linkID: this.fGroupAddCar.value.linkID[0],
      });
    }
    this.fGroupAddCar.patchValue({
      resourceType: '2',
      linkType: '3',
      equipments: this.lstEquipment,
    });

    this.dialogRef.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.save) {
          this.imageUpload.onSaveFile(res.save.recID)            
          this.dialogRef.close();
        }
        if (res.update) {
          this.imageUpload
            .updateFileDirectReload(res.update.recID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
          (this.dialogRef.dataService as CRUDService)
            .update(res.update)
            .subscribe();
        }
        return;
      });
  }

  fileCount(event) {
    this.fGroupAddCar.value.icon = event.data[0].data;
  }
  fileAdded(event) {
    debugger;
  }

  popupUploadFile() {
    this.attachment.uploadFile();
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
  dataValid() {
    var data = this.fGroupAddCar.value;
    var result = true;
    var requiredControlName = ['resourceName', 'owner', 'capacity', 'category'];
    requiredControlName.forEach((item) => {
      var x = data[item];
      if (!data[item]) {
        let fieldName = item.charAt(0).toUpperCase() + item.slice(1);
        this.notificationsService.notifyCode(
          'E0001',
          0,
          '"' + this.gviewCar[fieldName].headerText + '"'
        );
        result = false;
      }
    });
    return result;
  }
}
