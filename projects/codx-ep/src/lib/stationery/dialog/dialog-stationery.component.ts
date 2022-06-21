import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxGridviewComponent,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  ViewModel,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEpService, ModelPage } from '../../codx-ep.service';
import { Device } from '../../room/edit-room-booking/edit-room-booking.component';

@Component({
  selector: 'codx-dialog-stationery',
  templateUrl: './dialog-stationery.component.html',
  styleUrls: ['./dialog-stationery.component.scss'],
})
export class DialogStationeryComponent implements OnInit {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('addLink', { static: true }) addLink;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('popupColor') popupTemp: TemplateRef<any>;
  @ViewChild('gridTemplate') gridTemplate: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  @ViewChild('Devices', { static: true }) templateDevices: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('ranking', { static: true }) ranking: TemplateRef<any>;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  views: Array<ViewModel> = [];
  modelPage: ModelPage;
  vllDevices = [];
  lstDeviceRoom = [];
  isAfterRender = false;
  addEditForm: FormGroup;
  chosenDate = null;
  CbxName: any;
  link = '';
  color: any;
  columnGrid;
  public headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Định mức sử dụng', iconCss: 'icon-person_add' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];

  isAdd = true;
  data: any = {};
  dialog: any;
  constructor(
    private bookingService: CodxEpService,
    private api: ApiHttpService,
    private cacheSv: CacheService,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
    private cfService: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    // this.bookingService.getModelPage('EPT1').then((res) => {
    //   if (res) this.modelPage = res;
    //   console.log('constructor', this.modelPage);
    // });
  }

  ngOnInit(): void {
    this.bookingService.getModelPage('EPS24').then((res) => {
      if (res) {
        console.log(res);

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
        });

      this.initForm();
    });
  }
  openPopupLink() {
    this.cfService.openForm(this.addLink, '', 300, 500)
    // this.modalService
    //   .open(this.addLink, { centered: true, size: 'md' })
    //   .result.then(
    //     (result) => {
    //       this.addEditForm.patchValue({ onlineUrl: this.link });
    //     },
    //     (reason) => {}
    //   );
  }
  ngAfterViewInit(): void {
    this.columnGrid = [
      {
        field: 'resourceName',
        headerText: 'Định mức',
        template: '',
        width: 100,
      },
      {
        field: 'ranking',
        headerText: 'Cấp bậc nhân viên',
        template: this.ranking,
        width: 100,
      },
    ];
  }

  initForm() {
    this.bookingService
      .getFormGroup(this.modelPage.formName, this.modelPage.gridViewName)
      .then((item) => {
        this.addEditForm = item;
        this.isAfterRender = true;

      });
  }

  onSaveForm() {
    console.log(this.addEditForm);
    return;

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
        this.onDone.emit([res.msgBodyData[0], this.isAdd]);
        this.closeForm();
      });
  }

  valueOwnerChange(event) {
    if (event) this.addEditForm.patchValue({ owner: event[0] });
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

  openPopupDevice() {
    this.modalService
      .open(this.popupDevice, { centered: true, size: 'md' })
      .result.then(
        (result) => {
          this.lstDeviceRoom = JSON.parse(JSON.stringify(this.tmplstDevice));
        },
        (reason) => {
          this.tmplstDevice = JSON.parse(JSON.stringify(this.lstDeviceRoom));
        }
      );
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

  public setdata(data: any) {
    if (this.isAdd) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.addEditForm.patchValue(data);
    }
  }

  popup(evt: any) {
    // this.attachment.openPopupDevices();
  }

  fileAdded(evt: any) {
    console.log(evt);
  }

  openPopupDevices() {
    this.cfService.openForm(this.popupTemp, 'Chọn màu');
  }

  add() {
    console.log(this.color);
    console.log('Aloo');
  }
  valueChange(event) {
    debugger;
    console.log('Color: ', event);
  }
  popupTab() {
    this.cfService.openForm(this.popupTemp, 'Chọn màu');
  }
  getlstDevice(items: string) {
    //this.lstDevices = items.split(';');
    return this.lstDevices;
  }

  getDeviceName(value) {
    let device = this.vllDevices.find((x) => x.value == value);
    if (device) return device.text;
  }
}
