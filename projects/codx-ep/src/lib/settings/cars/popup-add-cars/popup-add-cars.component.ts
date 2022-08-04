import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
} from 'codx-core';
import { Device } from '../../../booking-car/popup-add-booking-car/popup-add-booking-car.component';

import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-cars',
  templateUrl: 'popup-add-cars.component.html',
  styleUrls: ['popup-add-cars.component.scss'],
})
export class PopupAddCarsComponent implements OnInit {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data!: any;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  cacheGridViewSetup: any;
  CbxName: any;
  dialogAddCar: FormGroup;
  dialog: any;
  headerText = 'Thêm mới xe';
  subHeaderText = 'Thêm mới xe';
  
  constructor(
    private cacheSv: CacheService,
    private bookingService: CodxEpService,
    private callFuncService: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
    this.dialog = dialog;
  }

  isAfterRender = false;
  vllDevices = [];
  lstDeviceRoom = [];
  tmplstDevice = [];
  ngOnInit(): void {
    this.initForm();
    this.cacheSv.valueList('EP012').subscribe((res) => {
      console.log('Res: ', res);

      this.vllDevices = res.datas;
      this.vllDevices.forEach((item) => {
        let device = new Device();
        device.id = item.value;
        device.text = item.text;
        this.lstDeviceRoom.push(device);
      });
      this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceRoom));
    });
    this.bookingService
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
    this.cacheSv
      .gridViewSetup('Resources', 'EP_Resources')
      .subscribe((item) => {
        this.editResources = item;
        this.dialogAddCar.patchValue({
          ranking: '1',
          category: '1',
          owner: '',
        });
      });

    this.bookingService
      .getFormGroup('Resources', 'grvResources')
      .then((item) => {
        this.dialogAddCar = item;
        if (this.data) {
          this.dialogAddCar.patchValue(this.data);
        }
        this.isAfterRender = true;
      });
  }

  valueChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }

  beforeSave(option: any) {
    let itemData = this.dialogAddCar.value;
    option.methodName = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  valueCbxChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogAddCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddCar.patchValue({ [event['field']]: event.data });
      }
    }
  }
  openPopupDevice(template: any) {
    var dialog = this.callFuncService.openForm(template, '', 550, 430);
    this.changeDetectorRef.detectChanges();
  }
  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.target.checked;
    }
  }
  onSaveForm() {
    if (this.dialogAddCar.invalid == true) {
      console.log(this.dialogAddCar);
      return;
    }
    let equipments = '';
    this.lstDeviceRoom.forEach((element) => {
      if (element.isSelected) {
        if (equipments == '') {
          equipments += element.id;
        } else {
          equipments += ';' + element.id;
        }
      }
    });
    if (!this.dialogAddCar.value.linkType) {
      this.dialogAddCar.value.linkType = '0';
    }
    this.dialogAddCar.value.resourceType = '2';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
