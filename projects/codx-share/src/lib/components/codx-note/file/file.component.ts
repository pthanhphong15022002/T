import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
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
  files: any;

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

  onInit() {
    this.dialog.beforeClose.subscribe(res => {
      
    })
  }
  
  ngAfterViewInit() {  
  }

  popup() {
    this.attachment.uploadFile();
  }

  fileCount(e) {
    if (e.data.length > 0) {
      this.attachment.objectId = this.data.recID;
      var obj = {
        count: e.data.length,
        data: e.data,
      }
      this.files = obj;
      this.attachment.saveFiles();
    }
    this.saveFile();
  }

  saveFile() {
    this.dialog.close(this.files);
  }
}
