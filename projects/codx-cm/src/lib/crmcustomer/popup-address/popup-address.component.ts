import { Component, OnInit, Optional } from '@angular/core';
import { DialogRef, DialogData } from 'codx-core';

@Component({
  selector: 'lib-popup-address',
  templateUrl: './popup-address.component.html',
  styleUrls: ['./popup-address.component.css']
})
export class PopupAddressComponent implements OnInit {
  dialog: any;
  data: any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
   }

  ngOnInit(): void {
  }

  onSave(){

  }
}
