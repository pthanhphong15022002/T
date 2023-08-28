import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { CallFuncService, DialogData, DialogRef, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { WR_WorkOrderUpdates } from '../../_models-wr/wr-model.model';

@Component({
  selector: 'lib-popup-update-reasoncode',
  templateUrl: './popup-update-reasoncode.component.html',
  styleUrls: ['./popup-update-reasoncode.component.css'],
})
export class PopupUpdateReasonCodeComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;

  data = new WR_WorkOrderUpdates();
  dialog: DialogRef;
  title = '';
  showLabelAttachment = false;
  isHaveFile = false;

  dateControl = false;
  commentControl = false;
  startTime: any = null;
  endTime: any = null;
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
  ngOnInit(): void {
    this.data.recID = Util.uid();

  }

  async onSave() {
    if (this.attachment?.fileUploadList?.length > 0) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          var countAttach = 0;
          countAttach = Array.isArray(res) ? res.length : 1;
          this.data.attachments = countAttach;
        }
      });
    } else {
    }
  }

  valueChange(e) {
    this.data[e?.field] = e?.data;
    if(e?.field == 'statusCode'){
      this.dateControl = e?.component?.itemsSelected[0]?.DateControl;
      this.commentControl = e?.component?.itemsSelected[0]?.CommentControl;
      if(this.commentControl){
        this.data.comment = e?.component?.itemsSelected[0]?.Comment;
      }
    }
    this.detectorRef.detectChanges();
  }

  valueDateChange(e){}
  valueStartTimeChange(e){}
  valueEndTimeChange(e){}
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
