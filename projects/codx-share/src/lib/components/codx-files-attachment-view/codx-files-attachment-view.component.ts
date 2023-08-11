import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'codx-files-attachment-view',
  templateUrl: './codx-files-attachment-view.component.html',
  styleUrls: ['./codx-files-attachment-view.component.css']
})
export class CodxFilesAttachmentViewComponent {
  headerText:string = "";
  dialog:any;
  objectID:any;
  formModel:any;
  dataSelected:any;
  referType:any;
  addPermissions:any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.headerText = dt.data?.headerText;
    this.objectID = dt.data?.objectID;
    this.dataSelected = dt.data?.dataSelected;
    this.referType = dt.data?.referType;
    this.addPermissions = dt.data?.addPermissions;
    this.formModel = dt.data?.formModel;
    this.dialog = dialog;
  }
}
