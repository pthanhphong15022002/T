import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CacheService, DialogData, DialogRef } from 'codx-core';
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
  dialogRoom: FormGroup;
  vllDevices = [];
  lstDevices: [];
  isAfterRender = false;

  constructor(
    private cacheSv: CacheService,
    private bookingService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.initForm();

    this.cacheSv.valueList('EPS21').subscribe((res) => {
      this.vllDevices = res.datas;
    });

    this.bookingService.getComboboxName('Rooms', 'grvRooms').then((res) => {
      this.cacheGridViewSetup = res;
    });
  }

  initForm() {
    this.cacheSv
      .gridViewSetup('Resources', 'EP_Resources')
      .subscribe((item) => {
        this.editResources = item;
      });

    this.bookingService
      .getFormGroup('Resources', 'grvResources')
      .then((item) => {
        this.dialogRoom = item;
        if (this.data) {
          this.dialogRoom.patchValue(this.data);
        }
        this.isAfterRender = true;
      });
    // this.editform.patchValue({ ranking: '1', category: '1', companyID: '1' });
  }

  valueChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogRoom.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogRoom.patchValue({ [event['field']]: event.data });
      }
    }
  }

  beforeSave(option: any) {
    let itemData = this.dialogRoom.value;
    if (!itemData.resourceID) {
      this.isAdd = true;
    } else {
      this.isAdd = false;
    }
    option.method = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  onSaveForm() {
    if (this.dialogRoom.invalid == true) {
      console.log(this.dialogRoom);
      return;
    }
    if (!this.dialogRoom.value.linkType) {
      this.dialogRoom.value.linkType = '0';
    }
    this.dialogRoom.value.resourceType = '2';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }

  getDeviceName(item){}
}
