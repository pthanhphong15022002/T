import { Component, Optional, ViewChild } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';

@Component({
  selector: 'lib-detail-notebook',
  templateUrl: './detail-notebook.component.html',
  styleUrls: ['./detail-notebook.component.css'],
})
export class DetailNotebookComponent {
  @ViewChild('attachment') attachment: AttachmentComponent;

  dialog: any;
  data: any;
  isHaveFile = false;
  linkAvatar = '';
  constructor(@Optional() dt: DialogData, @Optional() dialogData: DialogRef) {
    this.dialog = dialogData;
    this.data = JSON.parse(JSON.stringify(dt?.data));
  }

  saveNoteBooks(){}

  valueChange(e) {
    this.data[e?.field] = e?.data;
  }

  close() {
    this.dialog.close();
  }

  addFile(e) {
    if(e){
      this.attachment.referType = 'image';
    }
    this.attachment.uploadFile();
  }

  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
  }

  fileAdded(e) {}
}
