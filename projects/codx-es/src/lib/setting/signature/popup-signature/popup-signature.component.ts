import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CacheService,
  CodxService,
  DialogData,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { SetupShowSignature } from '../../../codx-es.model';
import { CodxEsService } from '../../../codx-es.service';

@Component({
  selector: 'app-popup-signature',
  templateUrl: './popup-signature.component.html',
  styleUrls: ['./popup-signature.component.scss'],
})
export class PopupSignatureComponent extends UIComponent {
  @ViewChild('imgSignature1') imgSignature1: ImageViewerComponent;
  @ViewChild('imgSignature2') imgSignature2: ImageViewerComponent;
  @ViewChild('imgStamp') imgStamp: ImageViewerComponent;
  @ViewChild('popupSupplier') popupSupplier: ElementRef<any>;

  currentTab: number = 1;
  dataFile: any = null;

  isAfterRender: boolean = false;
  isAddNew: boolean = false;
  type = '';
  isSave: boolean = false;

  headerText = 'Chọn chữ kí';
  // headerText = '';

  dialog: DialogRef;
  formModel: FormModel;
  setupShowForm: SetupShowSignature;
  data: any;

  //NHBUU
  vllFontStyle;
  selectedFont;
  selectedFontIndex = 0;
  sMssg: string = '';
  cbxName;

  constructor(
    private inject: Injector,
    private cr: ChangeDetectorRef,
    public notify: NotificationsService,
    public dmSV: CodxDMService,
    public esService: CodxEsService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialog.formModel = data?.data?.dialog?.formModel;
    this.formModel = data?.data?.dialog?.formModel;
    this.setupShowForm = data?.data?.setupShowForm;
    this.data = data?.data.data;

    if (!this.setupShowForm) {
      this.setupShowForm = new SetupShowSignature();
      this.setupShowForm.showFullName = true;
      this.setupShowForm.showSignature1 = true;
      this.setupShowForm.showSignature2 = true;
      this.setupShowForm.showStamp = true;
    }
    this.setDefaultTab(this.setupShowForm);

    this.cache.message('ES008').subscribe((mssg) => {
      if (mssg) {
        this.sMssg = mssg?.customName ?? mssg?.defaultName;
      }
    });
  }

  onInit(): void {
    if (!this.data?.recID) {
      this.esService.getFormModel('ESS21').then((fm) => {
        this.formModel = fm;
        this.dialog.formModel = this.formModel;
        //this.esService.setCacheFormModel(this.formModel);
        this.type = 'signFile';
        this.esService
          .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
          .then((res) => {
            if (res) this.cbxName = res;
          });
        this.esService
          .getDataSignature(this.data?.userID, this.data?.signatureType)
          .subscribe((res) => {
            if (res) {
              this.data = res[0];
              this.isAddNew = res[1];

              //Mới tạo và chữ ký công cộng -> mở popup chọn Supplier
              if (this.isAddNew && this.data?.signatureType == 1) {
                this.callfc.openForm(this.popupSupplier, '', 350, 420);
              }
              this.isAfterRender = true;
            }
          });
      });
    } else {
      this.isAfterRender = true;
    }
    this.cache.valueList('ES024').subscribe((res) => {
      this.vllFontStyle = res.datas;
      this.selectedFont = this.vllFontStyle[0]?.text;
      this.detectorRef.detectChanges();
    });
  }

  addEditSignature(i) {
    if (this.isAddNew && i <= 0 && this.type == 'signFile') {
      this.esService.addNewSignature(this.data).subscribe((res) => {
        if (res) this.notify.notifyCode('RS002');
      });
    } else if (this.isAddNew == false && i <= 0 && this.type == 'signFile') {
      this.esService.editSignature(this.data).subscribe((res) => {
        if (res) this.notify.notifyCode('RS002');
      });
    }
  }

  onSaveForm() {
    let i = 0;
    if (
      !this.imgSignature1?.imageUpload?.item &&
      !this.imgSignature2?.imageUpload?.item &&
      !this.imgStamp?.imageUpload?.item
    ) {
      this.dialog && this.dialog.close(this.data);
      return;
    }

    if (this.imgSignature1?.imageUpload?.item) i++;
    if (this.imgSignature2?.imageUpload?.item) i++;
    if (this.imgStamp?.imageUpload?.item) i++;

    if (this.imgSignature1?.imageUpload?.item) {
      this.imgSignature1
        .updateFileDirectReload(this.data.recID)
        .subscribe((img) => {
          console.log('img', img);
          this.data.modifiedOn = new Date();

          i--;
          if (img && this.data?.signature1 == null) {
            this.data.signature1 = (img[0] as any).recID;
            this.addEditSignature(i);
          }
          if (i <= 0) {
            if (this.type == 'signFile') {
              this.dialog && this.dialog.close(img);
            } else this.dialog && this.dialog.close(this.data);
          }
        });
    }

    if (this.imgSignature2?.imageUpload?.item) {
      this.imgSignature2
        .updateFileDirectReload(this.data.recID)
        .subscribe((img) => {
          this.data.modifiedOn = new Date();
          i--;
          if (img && this.data?.signature2 == null) {
            this.data.signature2 = (img[0] as any).recID;
            this.addEditSignature(i);
          }
          if (i <= 0) {
            if (this.type == 'signFile') {
              this.dialog && this.dialog.close(img);
            } else this.dialog && this.dialog.close(this.data);
          }
        });
    }

    if (this.imgStamp?.imageUpload?.item) {
      this.imgStamp.updateFileDirectReload(this.data.recID).subscribe((img) => {
        i--;
        this.data.modifiedOn = new Date();
        if (img && this.data?.stamp == null) {
          this.data.stamp = (img[0] as any).recID;
          this.addEditSignature(i);
        }
        if (i <= 0) {
          if (this.type == 'signFile') {
            this.dialog && this.dialog.close(img);
          } else this.dialog && this.dialog.close(this.data);
        }
      });
    }
  }

  changeTab(tab) {
    this.currentTab = tab;
  }

  changeSelectedFont(font, index) {
    this.selectedFont = font;
    this.selectedFontIndex = index;
  }

  setDefaultTab(setupShowForm: SetupShowSignature) {
    if (setupShowForm) {
      if (setupShowForm.showFullName) this.currentTab = 1;
      else if (setupShowForm.showSign) this.currentTab = 2;
      else if (setupShowForm.showSignature1) this.currentTab = 3;
      else if (setupShowForm.showSignature2) this.currentTab = 4;
      else if (setupShowForm.showStamp) this.currentTab = 5;
    }
  }

  closePopupSupplier(popup: DialogRef) {
    popup && popup.close();
    if (this.isAddNew) this.dialog && this.dialog.close();
  }

  valueChange(event) {
    if (event?.field && event?.component) {
      this.data[event['field']] = event?.data;
    }
  }

  onSaveSupplier(popup: DialogRef) {
    if (this.data?.supplier && this.data?.supplier != '1') {
      popup && popup.close();
    } else {
    }
  }
}
