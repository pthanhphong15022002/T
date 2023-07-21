import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-attachment-web',
  templateUrl: './attachment-web.component.html',
  styleUrls: ['./attachment-web.component.css']
})
export class AttachmentWebComponent {
  dialog : any
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
  }
  ngOnInit(): void {
  }

  close()
  {
    this.dialog.close();
  }
}
