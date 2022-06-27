import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
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
        this.dialogRoom = item;
        this.dialogRoom.patchValue({
          ranking: '1',
          category: '1',
          owner: '',
        });

        if (this.data) {
          this.dialogRoom.patchValue(this.data);
        }
        this.isAfterRender = true;
      });
  }

  valueCbxChange(event: any) {
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
    this.dialogRoom.value.resourceType = '1';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
