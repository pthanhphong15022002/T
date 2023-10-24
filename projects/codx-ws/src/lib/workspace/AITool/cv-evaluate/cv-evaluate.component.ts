import { Component, Optional, ViewEncapsulation } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-cv-evaluate',
  templateUrl: './cv-evaluate.component.html',
  styleUrls: ['./cv-evaluate.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CvEvaluateComponent {
  dialog:any;
  data:any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog
  }

  changeValue(e:any)
  {
    this.data = e?.data
  }

  onSave()
  {
    this.dialog.close(this.data)
  }
}
