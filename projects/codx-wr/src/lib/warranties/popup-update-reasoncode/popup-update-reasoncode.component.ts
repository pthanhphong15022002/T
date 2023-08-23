import {
  ChangeDetectorRef,
  Component,
  Optional,
  ViewChild,
} from '@angular/core';
import { CallFuncService, DialogData, DialogRef } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-popup-update-reasoncode',
  templateUrl: './popup-update-reasoncode.component.html',
  styleUrls: ['./popup-update-reasoncode.component.css'],
})
export class PopupUpdateReasonCodeComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;

  data: any;
  dialog: DialogRef;
  title = '';
  showLabelAttachment = false;
  isHaveFile = false;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callFc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    // this.data = JSON.parse(JSON.stringify(dialog.dataService?.dataSelected));
    this.title = dt?.data?.title;
  }

  onSave() {}

  valueChange(e) {}

  //#region file

  addFile(e) {
    this.attachment.uploadFile();
  }
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }

  fileAdded(e) {}
  //#endregion
}
