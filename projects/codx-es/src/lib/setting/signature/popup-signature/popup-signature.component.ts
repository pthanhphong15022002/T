import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { CacheService, CodxService, DialogData, DialogRef } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { isBuffer } from 'util';

@Component({
  selector: 'app-popup-signature',
  templateUrl: './popup-signature.component.html',
  styleUrls: ['./popup-signature.component.scss'],
})
export class PopupSignatureComponent implements OnInit {
  @ViewChild('attSignature1') attSignature1: AttachmentComponent;
  @ViewChild('attSignature2') attSignature2: AttachmentComponent;
  @ViewChild('attStamp') attStamp: AttachmentComponent;

  currentTab: number = 3;
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

  constructor(
    private codxService: CodxService,
    private cr: ChangeDetectorRef,
    public dmSV: CodxDMService,

    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.dialog.formModel = data?.data.dialog.formModel;
    this.dialogSignature = data?.data.model;
  }

  ngOnInit(): void {
    console.log(this.dialogSignature.value);
    if (this.dialogSignature.value.signature1 == null) {
      this.codxService
        .getAutoNumber(
          this.dialog.formModel.funcID,
          this.dialog.formModel.entityName,
          'Signature1'
        )
        .subscribe((res) => {
          this.Signature1 = res + 'signature1';
        });
    }
    if (this.dialogSignature.value.signature2 == null) {
      this.codxService
        .getAutoNumber(
          this.dialog.formModel.funcID,
          this.dialog.formModel.entityName,
          'Signature2'
        )
        .subscribe((res) => {
          this.Signature2 = res + 'signature2';
        });
    }
    if (this.dialogSignature.value.stamp == null) {
      this.codxService
        .getAutoNumber(
          this.dialog.formModel.funcID,
          this.dialog.formModel.entityName,
          'Stamp'
        )
        .subscribe((res) => {
          this.Stamp = res + 'stamp';
        });
    }
  }

  onSaveForm() {
    if (this.attSignature1.fileUploadList.length == 1) {
      this.attSignature1.saveFilesObservable().subscribe((res) => {
        if (res) {
          this.dialogSignature.patchValue({
            signature1: (res as any).data.recID,
          });
        }
      });
    }

    if (this.attSignature2.fileUploadList.length == 1) {
      this.attSignature2.saveFilesObservable().subscribe((res1) => {
        if (res1) {
          this.dialogSignature.patchValue({
            signature2: (res1 as any).data.recID,
          });
        }
      });
    }

    if (this.attStamp.fileUploadList.length == 1) {
      this.attStamp.saveFilesObservable().subscribe((res2) => {
        if (res2) {
          this.dialogSignature.patchValue({ stamp: (res2 as any).data.recID });
        }
      });
    }

    this.dialog.close();
  }

  onSavePopup() {}

  fileAdded(event, currentTab) {
    debugger;
    // switch (currentTab) {
    //   case 3:
    //     if (event.data) {
    //       this.isAddSignature1 = true;
    //     }
    //     break;
    //   case 4:
    //     if (event.data) {
    //       this.isAddSignature2 = true;
    //     }
    //     break;
    //   case 5:
    //     if (event.data) {
    //       this.isAddStamp = true;
    //     }
    //     break;
    // }
  }

  fileCount(event, currentTab) {}

  changeTab(tab) {
    this.currentTab = tab;
  }
}
