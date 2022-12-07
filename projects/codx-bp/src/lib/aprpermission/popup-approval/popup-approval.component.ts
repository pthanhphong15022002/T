import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-approval',
  templateUrl: './popup-approval.component.html',
  styleUrls: ['./popup-approval.component.css']
})
export class PopupApprovalComponent implements OnInit {
  dialog: any;
  title = '';
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
  }

}
