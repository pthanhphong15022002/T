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
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { CodxEpService, ModelPage } from '../../codx-ep.service';
export class Device {
  id;
  text = '';
  isSelected = false;
}
@Component({
  selector: 'popup-add-booking-car',
  templateUrl: 'popup-add-booking-car.component.html',
  styleUrls: ['popup-add-booking-car.component.scss'],
})
export class PopupAddBookingCarComponent implements OnInit, AfterViewInit {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data = {};
  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @ViewChild('popupDevice', { static: true }) popupDevice;

  isAfterRender = false;
  dialogCarBooking: FormGroup;
  devices: any;
  modelPage: ModelPage;
  CbxName: any;
  vllDevices = [];
  lstDeviceRoom = [];
  tmplstDevice = [];
  public headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Người đi cùng', iconCss: 'icon-person_add' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];

  dialog: any;
  isSaveSuccess = false;
  constructor(
    private api: ApiHttpService,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cr: ChangeDetectorRef,
    private bookingService: CodxEpService,
    private cfService: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
  }
  ngAfterViewInit(): void {
    if (this.dialog) {
      if (!this.isSaveSuccess) {
        this.dialog.closed.subscribe((res: any) => {
          this.dialog.dataService.saveFailed.next(null);
        });
      }
    }
  }

  ngOnInit(): void {
    this.bookingService.getModelPage('EPT2').then((res) => {
      if (res) this.modelPage = res;

      this.initForm();
      this.cacheSv.valueList('EP012').subscribe((res) => {
        this.vllDevices = res.datas;
      });
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
        .getComboboxName(this.modelPage.formName, this.modelPage.gridViewName)
        .then((res) => {
          this.CbxName = res;
          console.log('Cbx', this.CbxName);
        });
    });
  }

  initForm() {
    this.bookingService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        this.dialogCarBooking = item;
        this.isAfterRender = true;
      });
  }

  ngOnChange(): void { }

  closeFormEdit() {
    this.closeEdit.emit();
  }

  onSaveForm() {
    if (this.dialogCarBooking.invalid == true) {
      return;
    }
    if (
      this.dialogCarBooking.value.endDate -
      this.dialogCarBooking.value.startDate <=
      0
    ) {
      this.notificationsService.notifyCode('EP003');
    }
    if (
      this.dialogCarBooking.value.startDate &&
      this.dialogCarBooking.value.endDate
    ) {
      let hours = parseInt(
        (
          (this.dialogCarBooking.value.endDate -
            this.dialogCarBooking.value.startDate) /
          1000 /
          60 /
          60
        ).toFixed()
      );
      if (!isNaN(hours) && hours > 0) {
        this.dialogCarBooking.patchValue({ hours: hours });
      }
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
    if (this.isAdd) {
      this.dialogCarBooking.patchValue({
        category: '1',
        status: '1',
        resourceType: '2',
      });
      if (!this.dialogCarBooking.value.resourceID) {
        this.dialogCarBooking.value.resourceID =
          'd6ac6857-d778-11ec-b612-e454e8919646';
      }
      var date = new Date(this.dialogCarBooking.value.startDate);
      this.dialogCarBooking.value.bookingOn = new Date(
        date.setHours(0, 0, 0, 0)
      );
    }
    this.api
      .callSv('EP', 'ERM.Business.EP', 'BookingsBusiness', 'AddEditItemAsync', [
        this.dialogCarBooking.value,
        this.isAdd,
        '',
      ])
      .subscribe((res) => {
        this.onDone.emit([res.msgBodyData[0], this.isAdd]);
        this.closeForm();
      });
  }
  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.target.checked;
    }
  }
  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogCarBooking.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.dialogCarBooking.patchValue({ [event['field']]: event.data });
      }
    }
  }

  isExist(deviceName) { }

  openPopupDevice(template: any) {
    var dialog = this.cfService.openForm(template, '', 550, 430);
    this.cr.detectChanges();
  }

  close() { }

  public setdata(data: any) {
    if (this.isAdd) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.dialogCarBooking.patchValue(data);
    }
  }
  valueTimeChange(evt) {
    console.log('Time change', evt);
  }
  closeForm() {
    this.initForm();
    this.closeEdit.emit();
  }
}
