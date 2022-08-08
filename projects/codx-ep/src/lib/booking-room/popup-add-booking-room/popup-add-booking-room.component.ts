import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEpService, ModelPage } from '../../codx-ep.service';

export class Device {
  id;
  text = '';
  isSelected = false;
}

@Component({
  selector: 'popup-add-booking-room',
  templateUrl: './popup-add-booking-room.component.html',
  styleUrls: ['./popup-add-booking-room.component.scss'],
})
export class PopupAddBookingRoomComponent extends UIComponent {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('addLink', { static: true }) addLink;
  @ViewChild('attachment') attachment: AttachmentComponent;

  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  modelPage: ModelPage;
  vllDevices = [];
  lstDeviceRoom = [];
  isAfterRender = false;
  dialogAddBookingRoom: FormGroup;
  chosenDate = null;
  CbxName: any;
  link = '';
  headerTitle = 'Đặt phòng';
  subHeaderTitle = 'Đặt phòng họp';
  selectDate = null;
  startTime: any = null;
  endTime: any = null;
  startDate: any;
  endDate: any;
  isFullDay = false;
  resource!: any;
  beginHour = 0;
  beginMinute = 0;
  endHour = 0;
  endMinute = 0;
  public headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Người tham dự', iconCss: 'icon-person_add' },
    { text: 'Văn phòng phẩm', iconCss: 'icon-layers' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];

  isAdd = false;
  range: any;
  data: any = {};
  dialog: any;
  isSaveSuccess = false;
  constructor(
    private injector: Injector,
    private notiService: NotificationsService,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data[0];
    this.isAdd = dt?.data[1];
    this.dialog = dialog;
    this.range = dialog.dataService!.dataSelected;
  }

  onInit(): void {
    this.epService.getModelPage('EPT1').then((res) => {
      if (res) {
        this.modelPage = res;
      }
      this.cache.valueList('EP012').subscribe((res) => {
        this.vllDevices = res.datas;
        this.vllDevices.forEach((item) => {
          let device = new Device();
          device.id = item.value;
          device.text = item.text;
          this.lstDeviceRoom.push(device);
        });
        this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceRoom));
        console.log('Device: ', this.lstDeviceRoom);
      });

      this.epService
        .getComboboxName(this.modelPage.formName, this.modelPage.gridViewName)
        .then((res) => {
          this.CbxName = res;
        });

      this.cache.functionList('EPT1').subscribe(res => {
        this.cache.gridViewSetup(res.formName, res.gridViewName).subscribe(res => {
          console.log('Test', res)
        })
      })

      this.initForm();
    });

    this.isFullDay = false;
    this.chosenDate = null;
  }

  ngAfterViewInit(): void {
    if (this.dialog) {
      if (!this.isSaveSuccess) {
        this.dialog.closed.subscribe((res: any) => {
          console.log('Close without saving or save failed', res);
          this.dialog.dataService.saveFailed.next(null);
        });
      }
    }
  }

  initForm() {
    this.epService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        this.dialogAddBookingRoom = item;
        this.isAfterRender = true;
        if (!this.isAdd) {
          this.dialogAddBookingRoom && this.dialogAddBookingRoom.patchValue(this.data);
        }
      });
    this.link = null;
    this.selectDate = null;
    this.endTime = null;
    this.startTime = null;
  }
  beforeSave(option: any) {
    let itemData = this.dialogAddBookingRoom.value;
    option.method = 'AddEditItemAsync';
    option.data = [itemData, this.isAdd];
    return true;
  }
  onSaveForm() {
    // if (this.resource) {
    // }
    // if (this.addEditForm.invalid == true) {
    //   return;
    // }
    // if (
    //   this.addEditForm.value.endDate - this.addEditForm.value.startDate <=
    //   0
    // ) {
    //   this.notiService.notifyCode('EP003');
    // }
    // if (this.startTime && this.endTime) {
    //   let hours = parseInt(
    //     ((this.endTime - this.startTime) / 1000 / 60 / 60).toFixed()
    //   );
    //   if (!isNaN(hours) && hours > 0) {
    //     this.addEditForm.patchValue({ hours: hours });
    //   }
    // }
    // let equipments = '';
    // this.lstDeviceRoom.forEach((element) => {
    //   if (element.isSelected) {
    //     if (equipments == '') {
    //       equipments += element.id;
    //     } else {
    //       equipments += ';' + element.id;
    //     }
    //   }
    // });
    // this.addEditForm.patchValue({ equipments: equipments });
    // if (this.isAdd) {
    //   this.addEditForm.patchValue({
    //     category: '1',
    //     status: '1',
    //     resourceType: '1',
    //   });
    //   if (!this.addEditForm.value.resourceID) {
    //     this.addEditForm.value.resourceID =
    //       'd501dea4-e636-11ec-a4e6-8cec4b569fde';
    //   }
    // }
    // this.dialog.dataService
    //   .save((opt: any) => this.beforeSave(opt))
    //   .subscribe((res: any) => {
    //     if (res) {
    //       this.isSaveSuccess = true;
    //     }
    //   });
    console.log(this.dialogAddBookingRoom.value);
  }

  valueChange(event) {
    if (event?.field == 'day') {
      this.isFullDay = event.data;
      if (this.isFullDay) {
        this.startTime = '00:00';
        this.endTime = '23:59';
      } else {
        this.endTime = null;
        this.startTime = null;
      }
    } else if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogAddBookingRoom.patchValue({ [event['field']]: event.data.value });
      } else {
        this.dialogAddBookingRoom.patchValue({ [event['field']]: event.data });
      }

    }
    this.detectorRef.detectChanges();
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
      this.tmplstDevice[index].isSelected = event.data;
    }
  }

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 370);
    this.detectorRef.detectChanges();
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
    this.selectDate = event.data.fromDate;
    if (this.selectDate) {
      this.dialogAddBookingRoom.patchValue({ bookingOn: this.selectDate });
    }

    this.setDate();
  }

  valueStartTimeChange(event: any) {
    this.startTime = event.data.fromDate;
    this.isFullDay = false;
    this.setDate();
  }

  valueEndTimeChange(event: any) {
    this.endTime = event.data.toDate;
    this.isFullDay = false;
    this.setDate();
  }

  setDate() {
    if (this.startTime) {
      this.beginHour = parseInt(this.startTime.split(':')[0]);
      this.beginMinute = parseInt(this.startTime.split(':')[1]);
      if (this.selectDate) {
        if (!isNaN(this.beginHour) && !isNaN(this.beginMinute)) {
          this.startDate = new Date(
            this.selectDate.setHours(this.beginHour, this.beginMinute, 0)
          );
          if (this.startDate) {
            this.dialogAddBookingRoom.patchValue({ startDate: this.startDate });
          }
        }
      }
    }
    if (this.endTime) {
      this.endHour = parseInt(this.endTime.split(':')[0]);
      this.endMinute = parseInt(this.endTime.split(':')[1]);
      if (this.selectDate) {
        if (!isNaN(this.endHour) && !isNaN(this.endMinute)) {
          this.endDate = new Date(
            this.selectDate.setHours(this.endHour, this.endMinute, 0)
          );
          if (this.endDate) {
            this.dialogAddBookingRoom.patchValue({ endDate: this.endDate });
          }
        }
      }
      if (this.beginHour > this.endHour || this.beginMinute > this.endMinute) {
        this.notiService.notifyCode('EP003');
      }
    }
  }

  checkedOnlineChange(event) {
    this.dialogAddBookingRoom.patchValue({
      online: event.data instanceof Object ? event.data.checked : event.data,
    });

    if (!this.dialogAddBookingRoom.value.online)
      this.dialogAddBookingRoom.patchValue({ onlineUrl: null });
    this.detectorRef.detectChanges();
  }

  changeLink(event) {
    this.link = event.data;
  }

  openPopupLink() {
    this.callfc.openForm(this.addLink, '', 500, 300);
  }

  public setdata(data: any) {
    if (this.isAdd) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.dialogAddBookingRoom.patchValue(data);
    }
  }

  popup(evt: any) {
    this.attachment.openPopup();
  }

  fileAdded(evt: any) {
  }
}
