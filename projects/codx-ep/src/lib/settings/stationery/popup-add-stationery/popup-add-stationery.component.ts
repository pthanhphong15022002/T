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
  CallFuncService,
  CodxGridviewComponent,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
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
  dialogStationery: FormGroup;
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
  dialog: DialogRef;
  isAdd = true;
  colorItem: any;
  formModel: FormModel;
  constructor(
    private bookingService: CodxEpService,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
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
        this.dialogStationery = item;
        this.isAfterRender = true;
        this.dialogStationery.patchValue({
          ranking: '1',
          category: '1',
          owner: '',
        });
        if (this.data) {
          this.dialogStationery.patchValue(this.data);
        }
        console.log(this.isAfterRender);
      });
  }
  beforeSave(option: any) {
    let itemData = this.dialogStationery.value;
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
    if (this.dialogStationery.invalid == true) {
      console.log(this.dialogStationery);
      return;
    }
    if (!this.dialogStationery.value.linkType) {
      this.dialogStationery.value.linkType = '0';
    }
    this.dialogStationery.value.resourceType = '6';
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        this.imageUpload
          .updateFileDirectReload(res.msgBodyData[0].resourceID)
          .subscribe((result) => {
            if (result) {
              this.initForm();
              this.loadData.emit();
            } else {
              this.initForm();
            }
          });
        this.onDone.emit([res.msgBodyData[0], this.isAdd]);
        this.closeForm();
      });
  }

  valueOwnerChange(event) {
    if (event) this.dialogStationery.patchValue({ owner: event[0] });
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
    this.dialogStationery.patchValue({
      online: event.data instanceof Object ? event.data.checked : event.data,
    });

    if (!this.dialogStationery.value.online)
      this.dialogStationery.patchValue({ onlineUrl: null });
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
          this.dialogStationery.patchValue({ onlineUrl: this.link });
        },
        (reason) => {}
      );
  }

  public setdata(data: any) {
    if (this.isAdd) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.dialogStationery.patchValue(data);
    }
  }

  popup(evt: any) {
    // this.attachment.openPopupDevices();
  }

  fileAdded(evt: any) {
    console.log(evt);
  }

  openPopupDevice(template: any, color) {
    this.color = color;
    var dialog = this.cfService.openForm(template, '', 300, 300);
    this.changeDetectorRef.detectChanges();
  }

  add() {
    console.log(this.color);
    console.log('Aloo');
  }
  listColor = [];
  valueChange(event) {
    debugger;
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogStationery.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.dialogStationery.patchValue({ [event['field']]: event.data });
      }
    }
    this.colorItem = event.data;
  }

  closeDialog(evt: any) {
    if (this.color != null) {
      let i = this.listColor.indexOf(this.color);
      if (i != -1) {
        this.listColor[i] = this.colorItem;
      }
    } else {
      this.listColor.push(this.colorItem);
      console.log(this.listColor);
    }

    this.changeDetectorRef.detectChanges();
  }

  getlstDevice(items: string) {
    this.lstDevices = items.split(';');
    return this.lstDevices;
  }

  getDeviceName(value) {
    let device = this.vllDevices.find((x) => x.value == value);
    if (device) return device.text;
  }

  getfileCount(event) {}
}
