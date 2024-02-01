import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-add-file-from-process',
  templateUrl: './add-file-from-process.component.html',
  styleUrls: ['./add-file-from-process.component.scss']
})
export class AddFileFromProcessComponent {
  dialog:any;
  data:any;
  step:any;
  documentControl:any;
  formModel:any;
  selected:any;

  constructor(
    private ref: ChangeDetectorRef,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.formModel = dialog.formModel;
    this.data = dt?.data?.process;
    this.step = dt?.data?.step;
    this.dialog = dialog;
  }

  save()
  {
    this.dialog.close(this.selected)
  }

  selectedChange(e:any)
  {
    this.selected = e;
  }
}
