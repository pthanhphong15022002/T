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
import { Device } from '../../../booking-room/popup-add-booking-room/popup-add-booking-room.component';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-rooms',
  templateUrl: 'popup-add-rooms.component.html',
  styleUrls: ['popup-add-rooms.component.scss'],
})
export class PopupAddRoomsComponent implements OnInit {
  @Input() data = {};
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
  headerText = 'Thêm mới phòng họp';
  subHeaderText = 'Thêm mới phòng họp';
  constructor(
    private cacheSv: CacheService,
    private bookingService: CodxEpService,
    private callFuncService: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.initForm();
    this.cacheSv.valueList('EP012').subscribe((res) => {
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
        console.log('Cbx', this.CbxName);
      });
  }

  initForm() {
    this.bookingService
      .getFormGroup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .then((item) => {
        this.dialogAddRoom = item;
        this.dialogAddRoom.patchValue({
          ranking: '1',
          category: '1',
          owner: '',
        });

        if (this.data) {
          this.dialogAddRoom.patchValue(this.data);
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
      this.tmplstDevice[index].isSelected = event.target.checked;
    }
  }
  openPopupDevice(template: any) {
    var dialog = this.callFuncService.openForm(template, '', 550, 430);
    this.changeDetectorRef.detectChanges();
  }
  onSaveForm() {
    if (this.dialogAddRoom.invalid == true) {
      console.log(this.dialogAddRoom);
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
    if (!this.dialogAddRoom.value.linkType) {
      this.dialogAddRoom.value.linkType = '0';
    }
    this.dialogAddRoom.value.resourceType = '1';

    this.dialog.dataService.save((opt: any) => this.beforeSave(opt)).subscribe();

  }

  beforeSave(option: any) {
    let itemData = this.dialogAddRoom.value;
    if (!itemData.resourceID) {
      this.isAdd = true;
    } else {
      this.isAdd = false;
    }
    option.method = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }
  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
