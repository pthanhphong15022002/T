import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { AnyNsRecord } from 'dns';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-popup-view-file-full',
  templateUrl: './popup-view-file-full.component.html',
  styleUrls: ['./popup-view-file-full.component.scss']
})
export class PopupViewFileFullComponent {
  dialog:any;
  dataFile:any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.dataFile = dt?.data?.dataFile;
  }

  getSrcImage(data) {
    if(data?.avatar) return data?.avatar
    return environment.urlUpload + "/" +data?.pathDisk;
  }

  close()
  {
    this.dialog.close()
  }
}
