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
  DialogData,
  DialogRef,
} from 'codx-core';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-cars',
  templateUrl: 'popup-add-cars.component.html',
  styleUrls: ['popup-add-cars.component.scss'],
})
export class PopupAddCarsComponent implements OnInit {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data! :any ;
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  cacheGridViewSetup: any;
  dialogCar: FormGroup;
  dialog: any;

  constructor(
    private cacheSv: CacheService,
    private cr: ChangeDetectorRef,
    private bookingService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
    this.dialog = dialog;
  }

  isAfterRender = false;
  vllDevices = [];
  ngOnInit(): void {
    this.initForm();

    this.cacheSv.valueList('EPS22').subscribe((res) => {
      this.vllDevices = res.datas;
    });

    this.bookingService.getComboboxName('Cars', 'grvCars').then((res) => {
      this.cacheGridViewSetup = res;
    });
  }

  setdata(data: any) {
    this.isAdd = false;
    if (!data.recID) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.dialogCar.patchValue(data);
    }
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
        this.dialogCar = item;
        if (this.data) {
          this.dialogCar.patchValue(this.data);
        }
        this.isAfterRender = true;
      });
    // this.editform.patchValue({ ranking: '1', category: '1', companyID: '1' });
  }

  valueChange(event: any) {
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogCar.patchValue({ [event['field']]: event.data });
      }
    }
  }

  beforeSave(option: any) {
    let itemData = this.dialogCar.value;
    option.method = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }

  valueCbxChange(evt: any) {
    if (evt.length > 0) {
      this.dialogCar.patchValue({ owner: evt[0] });
    }
  }

  onSaveForm() {
    if (this.dialogCar.invalid == true) {
      console.log(this.dialogCar);
      return;
    }
    if (!this.dialogCar.value.linkType) {
      this.dialogCar.value.linkType = '0';
    }
    this.dialogCar.value.resourceType = '2';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
