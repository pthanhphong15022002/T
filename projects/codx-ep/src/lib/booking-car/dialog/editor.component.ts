import {
  AfterViewInit,
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
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  NotificationsFCMService,
  NotificationsService,
} from 'codx-core';
import { CodxEpService, ModelPage } from '../../codx-ep.service';

@Component({
  selector: 'car-booking-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss'],
})
export class DialogCarBookingComponent implements OnInit, AfterViewInit {
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

  public headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Người đi cùng', iconCss: 'icon-person_add' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];

  constructor(
    private api: ApiHttpService,
    private modalService: NgbModal,
    private cacheSv: CacheService,
    private notificationsService: NotificationsService,
    private cr: ChangeDetectorRef,
    private bookingService: CodxEpService,
    private notification: NotificationsService,
    private cfService: CallFuncService
  ) {}
  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.bookingService.getModelPage('EPT2').then((res) => {
      if (res) this.modelPage = res;

      this.initForm();
      this.cacheSv.valueList('EP012').subscribe((res) => {
        this.vllDevices = res.datas;
      });

      this.bookingService
        .getComboboxName(this.modelPage.formName, this.modelPage.gridViewName)
        .then((res) => {
          this.CbxName = res;
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

  ngOnChange(): void {}

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
      this.notificationsService.notify(
        'Ngày, thời gian không hợp lệ!',
        'error'
      );
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

  valueChange(event) {
    console.log('valueChnage', event);
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

  isExist(deviceName) {}

  openPopupDevice() {
    // this.cfService
    //   .openForm(this.popupDevice, 'title', 700, 900)
    //   .subscribe((res) => {
    //     res.close = this.close();
    //   });
    this.modalService
      .open(this.popupDevice, { centered: true, size: 'md' })
      .result.then(
        (result) => {},
        (reason) => {
          console.log('reason');
        }
      );
  }

  close() {}

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
