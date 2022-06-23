import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import {
  AddGridData,
  CodxEpService,
  ModelPage,
} from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-rooms',
  templateUrl: 'popup-add-rooms.component.html',
  styleUrls: ['popup-add-rooms.component.scss'],
})
export class PopupAddRoomsComponent implements OnInit {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data = {};
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @ViewChild('popupDevice', { static: true }) popupDevice;
  dataGrid: AddGridData;
  devices: any;
  modelPage: ModelPage;

  // defaultRecource: any = {
  //   recID: '',
  //   resourceName: '',
  //   ranking: '1',
  //   category: '1',
  //   area: '',
  //   capacity: '',
  //   location: '',
  //   companyID: '1',
  //   owner: '',
  //   note: '',
  //   resourceType: '',
  //   icon: '',
  //   equipments: '',
  // };
  dialog: any;
  addEditForm: FormGroup;
  formModel: FormModel;
  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cr: ChangeDetectorRef,
    private bookingService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.formModel = this.dialog.formModel;
    // this.modelPage = {
    //   entity: 'EP_Rooms1',
    //   formName: 'Rooms',
    //   gridViewName: 'grvRooms',
    //   functionID: 'EPS21',
    // };
  }
  CbxName: any;
  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];
  cacheGridViewSetup: any;
  isAfterRender = false;
  headerText = 'Thêm mới Phòng họp';
  subHeaderText = 'Tạo & upload file văn bản';
  ngOnInit(): void {
    this.bookingService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        this.CbxName = res;
      });
    this.bookingService.getModelPage('EPS21').then((res) => {
      if (res) this.modelPage = res;
      console.log('constructor', this.modelPage);

      this.cacheSv.valueList('EP012').subscribe((res) => {
        this.vllDevices = res.datas;
      });

      this.bookingService
        .getComboboxName(this.modelPage.entity, this.modelPage.gridViewName)
        .then((res) => {
          console.log(res);
          this.cacheGridViewSetup = res;
          console.log(this.cacheGridViewSetup);
        });

      this.initForm();
    });
  }

  public setdata(data: any) {
    this.isAdd = false;
    if (!data.recID) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.addEditForm.patchValue(data);
      if (
        this.addEditForm.value.equipments != null ||
        this.addEditForm.value.equipments != ''
      ) {
        this.lstDevices = this.addEditForm.value.equipments.split(';');
        this.tmplstDevice = this.addEditForm.value.equipments.split(';');
      } else {
        this.lstDevices = [];
        this.tmplstDevice = [];
      }
    }
  }

  ngOnChange(): void {
    console.log('change');
    if (this.data != null) {
      this.setdata(this.data);
    }
  }
  clickMF(evt?: any, data?: any) {}
  click(evt?: any) {}
  initForm() {
    this.cacheSv
      .gridViewSetup(this.modelPage.formName, this.modelPage.gridViewName)
      .subscribe((item) => {
        this.editResources = item;
      });

    this.bookingService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        this.addEditForm = item;
        console.log(this.addEditForm);
        this.isAfterRender = true;
      });
    // this.editform.patchValue({ ranking: '1', category: '1', companyID: '1' });
    this.lstDevices = [];
    this.tmplstDevice = [];
  }
  beforeSave(option: any) {
    let itemData = this.addEditForm.value;
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
    if (this.addEditForm.invalid == true) {
      console.log(this.addEditForm);
      return;
    }

    this.addEditForm.value.linkType = '0';
    this.addEditForm.value.equipments = this.lstDevices.join(';');
    this.addEditForm.value.resourceType = '1';
    console.log(this.addEditForm);
    // this.api
    //   .callSv(
    //     'EP',
    //     'ERM.Business.EP',
    //     'ResourcesBusiness',
    //     'AddEditItemAsync',
    //     [this.addEditForm.value, this.isAdd]
    //   )
    //   .subscribe((res) => {
    //     this.dataGrid = new AddGridData();
    //     if (res && res.msgBodyData[0][0] == true) {
    //       this.dataGrid.dataItem = res.msgBodyData[0][1];
    //       this.dataGrid.isAdd = this.isAdd;
    //       this.dataGrid.key = 'recID';
    //       this.notificationsService.notify('Successfully');
    //       this.closeFormEdit(this.dataGrid);
    //     } else {
    //       this.notificationsService.notify('Fail');
    //       this.closeFormEdit(null);
    //     }
    //   });
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe();
  }

  valueChange(event: any) {
    console.log('valueChange', event);
    if (event?.field != null) {
      if (typeof event.data === 'object') {
        this.addEditForm.patchValue({ [event['field']]: event.data.value });
      } else {
        this.addEditForm.patchValue({ [event['field']]: event.data });
      }
    }
  }

  icon: any;
  valueChangeIcon(icon: any) {
    this.icon = icon;
    this.addEditForm.patchValue({ icon: icon });
  }

  openPopupDevices() {
    this.modalService
      .open(this.popupDevice, { centered: true, size: 'md' })
      .result.then(
        (result) => {
          this.lstDevices = [...this.tmplstDevice];
        },
        (reason) => {
          this.tmplstDevice = [...this.lstDevices];
          console.log('reason', this.getDismissReason(reason));
        }
      );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  isExist(deviceName) {
    let index = this.lstDevices.indexOf(deviceName);
    if (index == -1) return false;
    return true;
  }

  getDeviceName(value) {
    let device = this.vllDevices.find((x) => x.value == value);
    if (device) return device.text;
  }

  checkedChange(event: any, device: any) {
    if (event.target.checked) {
      if (!this.isExist(device.value)) {
        this.tmplstDevice.push(device.value);
      }
    } else {
      let index = this.tmplstDevice.indexOf(device.value);
      if (index != -1) {
        let newArr = this.tmplstDevice.splice(index, 1);
        if (newArr.length == 0) this.tmplstDevice = [];
      }
    }
  }

  closeFormEdit(data) {
    this.initForm();
    this.closeEdit.emit(data);
  }

  valueOwnerChange(event) {
    if (event) this.addEditForm.patchValue({ owner: event[0] });
  }
}
