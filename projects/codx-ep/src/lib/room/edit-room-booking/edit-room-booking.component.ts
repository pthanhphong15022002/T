import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatetimePipe } from '@core/pipes/datetime.pipe';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { traceChildProgressBar } from '@syncfusion/ej2-gantt/src/gantt/base/css-constants';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationMessage,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEpService, ModelPage } from '../../codx-ep.service';

export class Device {
  id;
  text = '';
  isSelected = false;
}

@Component({
  selector: 'app-edit-room-booking',
  templateUrl: './edit-room-booking.component.html',
  styleUrls: ['./edit-room-booking.component.scss'],
})
export class EditRoomBookingComponent implements OnInit {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('addLink', { static: true }) addLink;
  @ViewChild('attachment') attachment: AttachmentComponent;

  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  modelPage: ModelPage;
  vllDevices = [];
  lstDeviceRoom = [];
  isAfterRender = false;
  addEditForm: FormGroup;
  chosenDate = null;
  CbxName: any;
  link = '';

  selectDate = null;
  startTime: any = null;
  endTime: any = null;
  isFullDay = false;

  public headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Người tham dự', iconCss: 'icon-person_add' },
    { text: 'Văn phòng phẩm', iconCss: 'icon-layers' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];

  isAdd = true;
  data: any = {};
  dialog: any;
  constructor(
    private bookingService: CodxEpService,
    private cacheSv: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private notification: NotificationsService,
    private cfService: CallFuncService,
    private api: ApiHttpService,
    private callFuncService: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    console.log('dataaaaaaaaa', this.data);
    // this.bookingService.getModelPage('EPT1').then((res) => {
    //   if (res) this.modelPage = res;
    //   console.log('constructor', this.modelPage);
    // });
  }

  ngOnInit(): void {
    this.bookingService.getModelPage('EPT1').then((res) => {
      if (res) {
        this.modelPage = res;
      }
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
        .getComboboxName(this.modelPage.formName, this.modelPage.gridViewName)
        .then((res) => {
          this.CbxName = res;
          console.log(res);
        });

      this.initForm();
    });

    this.isFullDay = false;
    this.chosenDate = null;
  }

  initForm() {
    this.bookingService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        this.addEditForm = item;
        this.isAfterRender = true;
      });
    this.link = null;
    this.selectDate = null;
    this.endTime = null;
    this.startTime = null;
  }

  onSaveForm() {
    if (this.addEditForm.invalid == true) {
      return;
    }
    if (
      this.addEditForm.value.endDate - this.addEditForm.value.startDate <=
      0
    ) {
      this.notification.notify('Ngày, thời gian không hợp lệ!', 'error');
    }
    if (this.startTime && this.endTime) {
      let hours = parseInt(
        ((this.endTime - this.startTime) / 1000 / 60 / 60).toFixed()
      );
      if (!isNaN(hours) && hours > 0) {
        this.addEditForm.patchValue({ hours: hours });
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
    this.addEditForm.patchValue({ equipments: equipments });
    if (this.isAdd) {
      this.addEditForm.patchValue({
        category: '1',
        status: '1',
        resourceType: '1',
      });
      if (!this.addEditForm.value.resourceID) {
        this.addEditForm.value.resourceID =
          '4ef9b480-d73c-11ec-b612-e454e8919646';
      }
      var date = new Date(this.addEditForm.value.startDate);
      this.addEditForm.value.bookingOn = new Date(date.setHours(0, 0, 0, 0));
    }
    this.api
      .callSv('EP', 'ERM.Business.EP', 'BookingsBusiness', 'AddEditItemAsync', [
        this.addEditForm.value,
        this.isAdd,
        '',
      ])
      .subscribe((res) => {
        debugger;
        this.onDone.emit([res.msgBodyData[0], this.isAdd]);
        this.closeForm();
      });
  }

  valueChange(event) {
    if (event?.field == 'day') {
      this.isFullDay = event.data?.checked;
      if (event.data?.checked == true) {
        this.startTime = new Date();
        this.startTime = new Date(
          this.startTime.getFullYear(),
          this.startTime.getMonth(),
          this.startTime.getDate(),
          0,
          0,
          0,
          0
        );
        this.endTime = new Date(
          this.startTime.getFullYear(),
          this.startTime.getMonth(),
          this.startTime.getDate(),
          23,
          59,
          59,
          59
        );
        this.setDate();
      } else {
        this.endTime = null;
        this.startTime = null;
      }
    } else if (event?.field) {
      if (event.data instanceof Object) {
        this.addEditForm.patchValue({ [event['field']]: event.data.value });
      } else {
        this.addEditForm.patchValue({ [event['field']]: event.data });
      }
    }
  }

  closeForm() {
    this.initForm();
    this.closeEdit.emit();
  }

  lstDevices = [];
  tmplstDevice = [];

  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.target.checked;
    }
  }

  openPopupDevice(template: any) {
    var dialog = this.callFuncService.openForm(template, '', 300, 400);
    // this.modalService
    //   .open(this.popupDevice, { centered: true, size: 'md' })
    //   .result.then(
    //     (result) => {
    //       this.lstDeviceRoom = JSON.parse(JSON.stringify(this.tmplstDevice));
    //     },
    //     (reason) => {
    //       this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceRoom));
    //     }
    //   );
    this.changeDetectorRef.detectChanges();
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

  valueDateChange(event: any) {
    this.selectDate = event.data;
    this.setDate();
  }

  valueStartTimeChange(event: any) {
    this.startTime = event.value;
    this.isFullDay = false;
    this.setDate();
  }

  valueEndTimeChange(event: any) {
    this.endTime = event.value;
    this.isFullDay = false;
    this.setDate();
  }

  setDate() {
    if (this.selectDate != null) {
      if (this.startTime != null) {
        let hour = this.startTime.getHours();
        let minutes = this.startTime.getMinutes();
        var startDate = new Date(
          this.selectDate.getFullYear(),
          this.selectDate.getMonth(),
          this.selectDate.getDate(),
          hour,
          minutes,
          0,
          0
        );
        this.addEditForm.patchValue({ startDate: startDate });
      }
      if (this.endTime != null) {
        let hour = this.endTime.getHours();
        let minutes = this.endTime.getMinutes();
        var endDate = new Date(
          this.selectDate.getFullYear(),
          this.selectDate.getMonth(),
          this.selectDate.getDate(),
          hour,
          minutes,
          0,
          0
        );
        this.addEditForm.patchValue({ endDate: this.endTime });
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  checkedOnlineChange(event) {
    this.addEditForm.patchValue({
      online: event.data instanceof Object ? event.data.checked : event.data,
    });

    if (!this.addEditForm.value.online)
      this.addEditForm.patchValue({ onlineUrl: null });
    this.changeDetectorRef.detectChanges();
  }

  changeLink(event) {
    this.link = event.data;
  }

  openPopupLink() {
    this.callFuncService.openForm(this.addLink, '', 300, 500);
    // this.modalService
    //   .open(this.addLink, { centered: true, size: 'md' })
    //   .result.then(
    //     (result) => {
    //       this.addEditForm.patchValue({ onlineUrl: this.link });
    //     },
    //     (reason) => {}
    //   );
  }

  public setdata(data: any) {
    if (this.isAdd) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.addEditForm.patchValue(data);
    }
  }

  popup(evt: any) {
    this.attachment.openPopup();
  }

  fileAdded(evt: any) {
    console.log(evt);
  }
}
