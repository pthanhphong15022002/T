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
  @ViewChild('attSignature1') attSignature1: AttachmentComponent;
  @ViewChild('attSignature2') attSignature2: AttachmentComponent;
  @ViewChild('attStamp') attStamp: AttachmentComponent;

  currentTab: number = 1;
  dataFile: any = null;
  Signature1: any = null;
  Signature2: any = null;
  Stamp: any = null;

  isAddSignature1 = false;
  isAddSignature2 = false;
  isAddStamp = false;

  headerText = 'Chọn chữ kí';

  dialog: DialogRef;
  dialogSignature: FormGroup;
  data: any;

  //NHBUU
  vllFontStyle;
  selectedFont;
  selectedFontIndex = 0;

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
  }

  onInit(): void {
    this.cache.valueList('ES024').subscribe((res) => {
      this.vllFontStyle = res.datas;
      this.selectedFont = this.vllFontStyle[0]?.text;
      this.detectorRef.detectChanges();
    });
  }

  async onSaveForm() {
    if (this.attSignature1.fileUploadList.length == 1) {
      (await this.attSignature1.saveFilesObservable()).subscribe((res) => {
        if (res) {
          // this.dialogSignature.patchValue({
          //   signature1: (res as any).data.recID,
          // });
          this.data.signature1 = (res as any).data.recID;
          this.dialog.close();
        }
      });
    }

    if (this.attSignature2.fileUploadList.length == 1) {
      (await this.attSignature2.saveFilesObservable()).subscribe(
        (res1: any) => {
          if (res1) {
            // this.dialogSignature.patchValue({
            //   signature2: (res1 as any).data.recID,
            // });
            this.data.signature2 = (res1 as any).data.recID;
            this.dialog.close();
          }
        }
      );
    }

    if (this.attStamp.fileUploadList.length == 1) {
      (await this.attStamp.saveFilesObservable()).subscribe((res2) => {
        if (res2) {
          //this.dialogSignature.patchValue({ stamp: (res2 as any).data.recID });
          this.data.stamp = (res2 as any).data.recID;
          this.dialog.close();
        }
      });
    }
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
