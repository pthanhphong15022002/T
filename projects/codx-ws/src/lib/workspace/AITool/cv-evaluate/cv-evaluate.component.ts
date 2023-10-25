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
  data = "Có kinh nghiệm làm việc trên 2 năm";
  listBreadCrumb = []
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog
    this.listBreadCrumb = dt?.data
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
