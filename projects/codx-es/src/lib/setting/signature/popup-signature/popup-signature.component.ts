import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  CacheService,
  CodxService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  UIComponent,
} from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'app-popup-signature',
  templateUrl: './popup-signature.component.html',
  styleUrls: ['./popup-signature.component.scss'],
})
export class PopupSignatureComponent extends UIComponent {
  @ViewChild('imgSignature1') imgSignature1: ImageViewerComponent;
  @ViewChild('imgSignature2') imgSignature2: ImageViewerComponent;
  @ViewChild('imgStamp') imgStamp: ImageViewerComponent;

  currentTab: number = 1;
  dataFile: any = null;
  Signature1: any = null;
  Signature2: any = null;
  Stamp: any = null;

  isAddSignature1 = false;
  isAddSignature2 = false;
  isAddStamp = false;

  //headerText = 'Chọn chữ kí';
  headerText = '';

  dialog: DialogRef;
  dialogSignature: FormGroup;
  data: any;

  //NHBUU
  vllFontStyle;
  selectedFont;
  selectedFontIndex = 0;
  sMssg: string = '';

  constructor(
    private inject: Injector,
    private cr: ChangeDetectorRef,
    public dmSV: CodxDMService,

    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.dialog.formModel = data?.data.dialog.formModel;
    this.dialogSignature = data?.data.model;
    // this.data = dialog.DataService?.dataSelected;
    this.data = data?.data.data;
    console.log('dialog add signature', this.dialog);

    this.cache.message('ES008').subscribe((mssg) => {
      if (mssg) {
        this.sMssg = mssg?.customName ?? mssg?.defaultName;
      }
    });
  }

  onInit(): void {
    this.cache.valueList('ES024').subscribe((res) => {
      this.vllFontStyle = res.datas;
      this.selectedFont = this.vllFontStyle[0]?.text;
      this.detectorRef.detectChanges();
    });
  }

  onSaveForm() {
    if (this.imgSignature1?.imageUpload) {
      this.imgSignature1
        .updateFileDirectReload(this.data.recID + '1')
        .subscribe((img) => {
          if (img && this.data.signature1 == null) {
            this.data.signature1 = (img[0] as any).recID;

            this.dialog && this.dialog.close(this.data);
          }
        });
    }

    if (this.imgSignature2?.imageUpload) {
      this.imgSignature2
        .updateFileDirectReload(this.data.recID + '2')
        .subscribe((img) => {
          if (img && this.data.signature2 == null) {
            this.data.signature2 = (img[0] as any).recID;

            this.dialog && this.dialog.close(this.data);
          }
        });
    }

    if (this.imgStamp?.imageUpload) {
      this.imgStamp
        .updateFileDirectReload(this.data.recID + 's')
        .subscribe((img) => {
          if (img && this.data.stamp == null) {
            this.data.stamp = (img[0] as any).recID;

            this.dialog && this.dialog.close(this.data);
          }
        });
    }
    this.dialog && this.dialog.close(this.data);
  }

  onSavePopup() {}

  fileAdded(event, currentTab) {}

  fileCount(event, control: AttachmentComponent, currentTab) {
    if (control.fileUploadList && control.fileUploadList.length > 1) {
    }
    control.fileUploadList = event.data;
    console.log(event);
    console.log(control);
    console.log(currentTab);
  }

  changeTab(tab) {
    this.currentTab = tab;
  }

  changeSelectedFont(font, index) {
    this.selectedFont = font;
    this.selectedFontIndex = index;
  }
}
