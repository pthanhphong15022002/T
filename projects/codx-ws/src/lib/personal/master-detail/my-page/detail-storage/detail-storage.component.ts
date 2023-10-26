import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-detail-storage',
  templateUrl: './detail-storage.component.html',
  styleUrls: ['./detail-storage.component.scss']
})
export class DetailStorageComponent {
  predicate = "RecID.Contains(@0)";
  dataValue:any;
  dialog:any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dataValue = dt?.data;
    this.dialog = dialog;
  }

  close()
  {
    this.dialog.close();
  }
}
