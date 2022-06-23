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
  FormModel,
  ImageViewerComponent,
  NotificationsService,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEpService, ModelPage } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-stationery',
  templateUrl: './popup-add-stationery.component.html',
  styleUrls: ['./popup-add-stationery.component.scss'],
})
export class PopupAddStationeryComponent implements OnInit {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('addLink', { static: true }) addLink;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('popupColor') popupTemp: TemplateRef<any>;
  @ViewChild('gridTemplate') gridTemplate: TemplateRef<any>;
  @ViewChild('gridView') gridView: CodxGridviewComponent;

  @ViewChild('Devices', { static: true }) templateDevices: TemplateRef<any>;
  @ViewChild('GiftIDCell', { static: true }) GiftIDCell: TemplateRef<any>;
  @ViewChild('ranking', { static: true }) ranking: TemplateRef<any>;

  @Output() closeEdit = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  vllDevices = [];
  lstDeviceRoom = [];
  isAfterRender = false;
  addEditForm: FormGroup;
  chosenDate = null;
  CbxName: any;
  link = '';
  color: any;
  columnGrid;
  headerTitle = 'Thêm Văn Phòng phẩm';
  subHeaderTilte = 'Thêm mới Văn phòng phẩm';
  public headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Định mức sử dụng', iconCss: 'icon-person_add' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];
  data: any = {};
  dialog: any;
  isAdd = true;

  formModel: FormModel;
  constructor(
    private bookingService: CodxEpService,
    private api: ApiHttpService,
    private cacheSv: CacheService,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
    private notification: NotificationsService,
    private cfService: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data;
    this.dialog = dialog;
    this.formModel = this.dialog.formModel;
  }

  ngOnInit(): void {
    this.bookingService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        this.CbxName = res;
      });

    this.initForm();
  }

  ngAfterViewInit(): void {
    // this.views = [
    //   {
    //     sameData: false,
    //     id: '1',
    //     type: 'grid',
    //     active: true,
    //     model: {
    //       panelLeftRef: this.gridTemplate,
    //       widthAsideRight: '750px',
    //       sideBarRightRef: this.carResourceDialog,
    //     },
    //   },
    // ];

    this.columnGrid = [
      {
        field: 'resourceName',
        headerText: 'Định mức',
        template: '',
        width: 200,
      },
      {
        field: 'ranking',
        headerText: 'Cấp bậc nhân viên',
        template: this.ranking,
        width: 150,
      },
    ];
  }

  initForm() {
    this.bookingService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.addEditForm = item;
        this.isAfterRender = true;

        console.log(this.isAfterRender);
      });
  }

  onSaveForm() {
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
    //       '4ef9b480-d73c-11ec-b612-e454e8919646';
    //   }
    //   var date = new Date(this.addEditForm.value.startDate);
    //   this.addEditForm.value.bookingOn = new Date(date.setHours(0, 0, 0, 0));
    // }

    this.addEditForm.value.linkType = '0';
    this.addEditForm.value.resourceType = '6';
    this.api
      .callSv(
        'EP',
        'ERM.Business.EP',
        'ResourcesBusiness',
        'AddEditItemAsync',
        [this.addEditForm.value, this.isAdd]
      )
      .subscribe((res) => {
        this.imageUpload
          .updateFileDirectReload(res.msgBodyData[0].resourceID)
          .subscribe((result) => {
            if (result) {
              this.initForm();
              this.loadData.emit();

              // this.listView.addHandler(res.msgBodyData[0], this.isAddMode, "giftID");
              // this.changedr.detectChanges();
            } else {
              this.initForm();
              // this.listView.addHandler(res.msgBodyData[0], this.isAddMode, "giftID");
              // this.changedr.detectChanges();
            }
          });
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

  openPopupLink() {
    this.modalService
      .open(this.addLink, { centered: true, size: 'md' })
      .result.then(
        (result) => {
          this.addEditForm.patchValue({ onlineUrl: this.link });
        },
        (reason) => {}
      );
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
    if (event?.field) {
      if (event.data instanceof Object) {
        this.addEditForm.patchValue({ [event['field']]: event.data.value });
      } else {
        this.addEditForm.patchValue({ [event['field']]: event.data });
      }
    }
  }
  popupTab() {
    debugger;
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
