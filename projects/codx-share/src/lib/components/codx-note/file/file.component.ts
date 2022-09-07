import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { DialogRef, UIComponent, DialogData } from 'codx-core';
import { AttachmentComponent } from '../../attachment/attachment.component';

@Component({
  selector: 'lib-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css'],
})
export class FileComponent extends UIComponent implements OnInit {
  headerAttachment = 'Danh sách file đính kèm';
  dialog: any;
  objectType: any;
  funcID: any;
  objectID: any;
  data: any;

  @ViewChild('attachment') attachment: AttachmentComponent;

  constructor(private injector: Injector,
    private dt: DialogRef,
    private dialogData: DialogData,
    ) {
    super(injector);
    this.dialog = dt;
    this.data = dialogData.data?.data;
    this.objectType = dialogData.data?.objectType;
  }

  onInit() {}

  popup() {
    this.attachment.uploadFile();
  }

  fileCount(e) {
    if (e.data.length > 0) {
      this.attachment.objectId = this.data.recID;
      this.attachment.saveFiles();
    }
  }
}
