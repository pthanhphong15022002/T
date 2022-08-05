import {
  Component,
  EventEmitter,
  Injector,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  UIComponent,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEpService } from '../../../codx-ep.service';

@Component({
  selector: 'popup-add-stationery',
  templateUrl: './popup-add-stationery.component.html',
  styleUrls: ['./popup-add-stationery.component.scss'],
})
export class PopupAddStationeryComponent extends UIComponent {
  @ViewChild('popupDevice', { static: true }) popupDevice;
  @ViewChild('addLink', { static: true }) addLink;
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('popupColor') popupTemp: TemplateRef<any>;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  vllDevices = [];
  lstDeviceRoom = [];
  isAfterRender = false;
  dialogAddStationery: FormGroup;
  chosenDate = null;
  CbxName: any;
  link: string = '';
  color: any;
  columnGrid;
  headerTitle: string = 'Thêm Văn Phòng phẩm';
  subHeaderTilte: string = 'Thêm mới Văn phòng phẩm';
  data: any = {};
  dialog: DialogRef;
  isAdd = true;
  colorItem: any;
  listColor = [];
  formModel: FormModel;
  headerText: Object = [
    { text: 'Thông tin chung', iconCss: 'icon-info' },
    { text: 'Định mức sử dụng', iconCss: 'icon-person_add' },
    { text: 'Thông tin khác', iconCss: 'icon-tune' },
  ];

  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.data = dt?.data;
    this.dialog = dialog;
    this.formModel = this.dialog.formModel;
  }

  onInit(): void {
    this.epService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        this.CbxName = res;
        this.initForm();
      });
    this.cache.functionList('EPS24').subscribe(res => {
      this.cache.gridViewSetup(res.formName, res.gridViewName).subscribe(res => {
        console.log(res)
      })
    })
  }

  initForm() {
    this.epService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((item) => {
        this.dialogAddStationery = item
        this.isAfterRender = true;
        if (this.data) {
          this.dialogAddStationery.patchValue(this.data);
        }
      });
  }

  beforeSave(option: any) {
    let itemData = this.dialogAddStationery.value;
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
    // if (this.dialogAddStationery.invalid == true) {
    //   console.log(this.dialogAddStationery);
    //   return;
    // }
    // if (!this.dialogAddStationery.value.linkType) {
    //   this.dialogAddStationery.value.linkType = '0';
    // }
    // this.dialogAddStationery.value.resourceType = '6';
    // this.dialog.dataService
    //   .save((opt: any) => this.beforeSave(opt))
    //   .subscribe((res) => {
    //     this.imageUpload
    //       .updateFileDirectReload(res.msgBodyData[0].resourceID)
    //       .subscribe((result) => {
    //         if (result) {
    //           this.initForm();
    //           this.loadData.emit();
    //         } else {
    //           this.initForm();
    //         }
    //       });
    //     this.onDone.emit([res.msgBodyData[0], this.isAdd]);
    //     this.dialog.close();
    //   });
    console.log('Send data', this.dialogAddStationery.value)
  }

  checkedOnlineChange(event) {
    this.dialogAddStationery.patchValue({
      online: event.data instanceof Object ? event.data.checked : event.data,
    });

    if (!this.dialogAddStationery.value.online)
      this.dialogAddStationery.patchValue({ onlineUrl: null });
    this.detectorRef.detectChanges();
  }

  changeLink(event) {
    this.link = event.data;
  }

  openPopupLink() {
    // this.modalService
    //   .open(this.addLink, { centered: true, size: 'md' })
    //   .result.then(
    //     (result) => {
    //       this.dialogAddStationery.patchValue({ onlineUrl: this.link });
    //     },
    //     (reason) => { }
    //   );
  }

  public setdata(data: any) {
    if (this.isAdd) {
      this.isAdd = true;
      this.initForm();
    } else {
      this.dialogAddStationery.patchValue(data);
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
    var dialog = this.callfc.openForm(template, '', 500, 350);
    this.detectorRef.detectChanges();
  }

  valueChange(event) {

    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogAddStationery.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.dialogAddStationery.patchValue({ [event['field']]: event.data });
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
    }

    this.detectorRef.detectChanges();
  }



  getfileCount(event) { }
}
