import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-view-image',
  templateUrl: './popup-view-image.component.html',
  styleUrls: ['./popup-view-image.component.scss'],
})
export class PopupViewImageComponent implements OnInit {
  dialogRef: DialogRef = null;
  fileUpload: any;

  REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
  constructor(@Optional() dt?: DialogData, @Optional() dtr?: DialogRef) {
    //
    this.dialogRef = dtr;
    this.fileUpload = dt?.data.data;
  }

  ngOnInit(): void {}
  onClose() {
    this.dialogRef.close(); //close form
  }
}
