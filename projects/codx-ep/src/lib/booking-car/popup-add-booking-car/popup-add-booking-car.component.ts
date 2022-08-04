import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
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
  UIComponent,
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
export class PopupAddBookingCarComponent extends UIComponent {
  @Input() editResources: any;
  @Input() isAdd = true;
  @Input() data = {};
  @ViewChild('popupDevice', { static: true }) popupDevice;

  isAfterRender = false;
  dialogAddBookingCar: FormGroup;
  devices: any;
  modelPage: ModelPage;
  CbxName: any;
  vllDevices = [];
  lstDeviceRoom = [];
  tmplstDevice = []
  headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Người đi cùng', iconCss: 'icon-person_add' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];
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
    this.data = dt?.data;
    this.dialog = dialog;
  }

  onInit(): void {
    this.epService.getModelPage('EPT2').then((res) => {
      if (res) this.modelPage = res;

      this.initForm();
      this.cache.valueList('EP012').subscribe((res) => {
        this.vllDevices = res.datas;
      });
      this.cache.valueList('EP012').subscribe((res) => {
        this.vllDevices = res.datas;
        this.vllDevices.forEach((item) => {
          let device = new Device();
          device.id = item.value;
          device.text = item.text;
          this.lstDeviceRoom.push(device);
        });
        this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceRoom));
      });
      this.epService
        .getComboboxName(this.modelPage.formName, this.modelPage.gridViewName)
        .then((res) => {
          this.CbxName = res;
        });

      this.cache.functionList('EPT2').subscribe(res => {
        this.cache.gridViewSetup(res.formName, res.gridViewName).subscribe(res => {
          console.log('Test', res)
        })
      })

    });
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

  initForm() {
    this.epService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        this.dialogAddBookingCar = item;
        this.isAfterRender = true;
      });
  }

  onSaveForm() {
    // if (this.dialogAddBookingCar.invalid == true) {
    //   return;
    // }
    // if (
    //   this.dialogAddBookingCar.value.endDate -
    //   this.dialogAddBookingCar.value.startDate <=
    //   0
    // ) {
    //   this.notiService.notifyCode('EP003');
    // }
    // if (
    //   this.dialogAddBookingCar.value.startDate &&
    //   this.dialogAddBookingCar.value.endDate
    // ) {
    //   let hours = parseInt(
    //     (
    //       (this.dialogAddBookingCar.value.endDate -
    //         this.dialogAddBookingCar.value.startDate) /
    //       1000 /
    //       60 /
    //       60
    //     ).toFixed()
    //   );
    //   if (!isNaN(hours) && hours > 0) {
    //     this.dialogAddBookingCar.patchValue({ hours: hours });
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
    // if (this.isAdd) {
    //   this.dialogAddBookingCar.patchValue({
    //     category: '1',
    //     status: '1',
    //     resourceType: '2',
    //   });
    //   if (!this.dialogAddBookingCar.value.resourceID) {
    //     this.dialogAddBookingCar.value.resourceID =
    //       'd6ac6857-d778-11ec-b612-e454e8919646';
    //   }
    //   var date = new Date(this.dialogAddBookingCar.value.startDate);
    //   this.dialogAddBookingCar.value.bookingOn = new Date(
    //     date.setHours(0, 0, 0, 0)
    //   );
    // }
    // this.api
    //   .callSv('EP', 'ERM.Business.EP', 'BookingsBusiness', 'AddEditItemAsync', [
    //     this.dialogAddBookingCar.value,
    //     this.isAdd,
    //     '',
    //   ])
    //   .subscribe((res) => {
    //     this.onDone.emit([res.msgBodyData[0], this.isAdd]);
    //     this.closeForm();
    //   });
    console.log(this.dialogAddBookingCar.value);
  }

  valueChange(event) {
    debugger;
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogAddBookingCar.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.dialogAddBookingCar.patchValue({ [event['field']]: event.data });
      }
    }
  }

  openPopupDevice(template: any) {
    var dialog = this.callfc.openForm(template, '', 550, 430);
    this.detectorRef.detectChanges();
  }

  checkedChange(event: any, device: any) {
    let index = this.tmplstDevice.indexOf(device);
    if (index != -1) {
      this.tmplstDevice[index].isSelected = event.target.checked;
    }
  }
}
