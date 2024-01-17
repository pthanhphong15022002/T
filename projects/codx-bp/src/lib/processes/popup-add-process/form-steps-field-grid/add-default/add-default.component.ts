import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-add-default',
  templateUrl: './add-default.component.html',
  styleUrls: ['./add-default.component.scss']
})
export class AddDefaultComponent {
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  )
  {
  }
}
