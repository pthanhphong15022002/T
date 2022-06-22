import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, CacheService, NotificationsService } from 'codx-core';
import { AddGridData, CodxEpService, ModelPage } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-cars',
  templateUrl: 'popup-add-cars.component.html',
  styleUrls: ['popup-add-cars.component.scss'],
})
export class PopupAddCarsComponent implements OnInit {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data = {};
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @ViewChild('popupDevice', { static: true }) popupDevice;
  dataGrid: AddGridData;
  devices: any;
  modelPage: ModelPage;
  cacheGridViewSetup: any;

  dialogCar: FormGroup;
  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cr: ChangeDetectorRef,
    private bookingService: CodxEpService
  ) {}

  isAfterRender = false;
  vllDevices = [];
  ngOnInit(): void {
    this.initForm();

    this.cacheSv.valueList('EP012').subscribe((res) => {
      this.vllDevices = res.datas;
    });

    this.bookingService.getComboboxName('Rooms', 'grvRooms').then((res) => {
      console.log(res);
      this.cacheGridViewSetup = res;
    });
  }
  public setdata(data: any) {
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
        this.isAfterRender = true;
      });
    // this.editform.patchValue({ ranking: '1', category: '1', companyID: '1' });
  }

  addNew() {}
  edit() {}
  save() {
    if (this.dialogCar.invalid == true) {
      console.log(this.dialogCar);
      return;
    }
    if (!this.dialogCar.value.linkType) {
      this.dialogCar.value.linkType = '0';
    }
    this.dialogCar.value.resourceType = '2';
    console.log(this.dialogCar);
    this.api
      .callSv(
        'EP',
        'ERM.Business.EP',
        'ResourcesBusiness',
        'AddEditItemAsync',
        [this.dialogCar.value, this.isAdd]
      )
      .subscribe((res) => {
        this.dataGrid = new AddGridData();
        if (res && res.msgBodyData[0][0] == true) {
          this.dataGrid.dataItem = res.msgBodyData[0][1];
          this.dataGrid.isAdd = this.isAdd;
          this.dataGrid.key = 'recID';
          this.notificationsService.notify('Successfully');
          this.closeFormEdit(this.dataGrid);
        } else {
          this.notificationsService.notify('Fail');
          this.closeFormEdit(null);
        }
      });
  }

  valueChange(event: any) {
    console.log('valueChange', event);
    if (event?.field != null) {
      if (event.data instanceof Object) {
        this.dialogCar.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogCar.patchValue({ [event['field']]: event.data });
      }
    }
  }

  ngOnChange(): void {}
  valueCbxChange(evt: any) {
    if (evt.length > 0) {
      this.dialogCar.patchValue({ owner: evt[0] });
    }
  }
  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }
}
