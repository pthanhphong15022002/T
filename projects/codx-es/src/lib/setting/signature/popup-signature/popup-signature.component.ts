import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { DialogData, DialogRef } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'app-popup-signature',
  templateUrl: './popup-signature.component.html',
  styleUrls: ['./popup-signature.component.scss'],
})
export class PopupSignatureComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;

  currentTab: number = 1;
  dataFile: any = null;
  Signature1: any = null;
  Signature2: any = null;
  Stamp: any = null;

  headerText = 'Chọn chữ kí';

  dialog: DialogRef;
  dialogSignature: FormGroup;

  constructor(
    private cr: ChangeDetectorRef,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.dialogSignature.patchValue(data);
  }

  ngOnInit(): void {}

  onSaveForm() {
    this.attachment.onMultiFileSave(null);
  }

  onSavePopup() {}

  fileAdded(event, currentTab) {
    switch (currentTab) {
      case 3:
        this.Signature1 = event.data;
        this.dialogSignature.patchValue({
          signature1: event.data[0].recID ?? null,
        });
        break;
      case 4:
        this.Signature2 = event.data;
        this.dialogSignature.patchValue({
          signature2: event.data[0].recID ?? null,
        });
        break;
      case 5:
        this.Stamp = event.data;
        this.dialogSignature.patchValue({ stamp: event.data[0].recID ?? null });
        break;
    }
    this.cr.detectChanges();
  }

  changeTab(tab) {
    this.currentTab = tab;
  }
}
