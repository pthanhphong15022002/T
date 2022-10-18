import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-revisions',
  templateUrl: './revisions.component.html',
  styleUrls: ['./revisions.component.css']
})
export class RevisionsComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;

  headerText= "";
  data: any;
  dialog: any;
  recID: any;

  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;

  }

  ngOnInit(): void {
  }


  //#region file
  fileAdded(e){
  }

  getfileCount(e){}
  getfileGet(e){

  }
  getfilePrimitive(e){}

  openFormUploadFile() {
    this.attachment.uploadFile();
  }
  //#endregion
}
