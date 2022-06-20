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
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, CacheService, NotificationsService } from 'codx-core';
import { AddGridData, CodxEpService, ModelPage } from '../../../codx-ep.service';

@Component({
  selector: 'dialog-room-resource-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss'],
})
export class DialogRoomResourceComponent implements OnInit {
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
  dialog: FormGroup;
  constructor(
    private api: ApiHttpService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cr: ChangeDetectorRef,
    private bookingService: CodxEpService
  ) {
    // this.modelPage = {
    //   entity: 'EP_Rooms1',
    //   formName: 'Rooms',
    //   gridViewName: 'grvRooms',
    //   functionID: 'EPS21',
    // };
  }

  vllDevices = [];
  lstDevices = [];
  tmplstDevice = [];
  cacheGridViewSetup: any;
  isAfterRender = false;

  ngOnInit(): void {
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
      this.dialog.patchValue(data);
      if (
        this.dialog.value.equipments != null ||
        this.dialog.value.equipments != ''
      ) {
        this.lstDevices = this.dialog.value.equipments.split(';');
        this.tmplstDevice = this.dialog.value.equipments.split(';');
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

  initForm() {
    this.cacheSv
      .gridViewSetup(this.modelPage.formName, this.modelPage.gridViewName)
      .subscribe((item) => {
        this.editResources = item;
      });

    this.bookingService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        this.dialog = item;
        console.log(this.dialog);
        this.isAfterRender = true;
      });
    // this.editform.patchValue({ ranking: '1', category: '1', companyID: '1' });
    this.lstDevices = [];
    this.tmplstDevice = [];
  }

  saveRoom() {
    if (this.dialog.invalid == true) {
      console.log(this.dialog);
      return;
    }

    this.dialog.value.linkType = '0';
    this.dialog.value.equipments = this.lstDevices.join(';');
    this.dialog.value.resourceType = '1';
    console.log(this.dialog);
    this.api
      .callSv(
        'EP',
        'ERM.Business.EP',
        'ResourcesBusiness',
        'AddEditItemAsync',
        [this.dialog.value, this.isAdd]
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
      if (typeof event.data === 'object') {
        this.dialog.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialog.patchValue({ [event['field']]: event.data });
      }
    }
  }

  icon: any;
  valueChangeIcon(icon: any) {
    this.icon = icon;
    this.dialog.patchValue({ icon: icon });
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
    if (event) this.dialog.patchValue({ owner: event[0] });
  }
}
