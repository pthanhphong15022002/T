import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-quickadd-contact',
  templateUrl: './popup-quickadd-contact.component.html',
  styleUrls: ['./popup-quickadd-contact.component.css']
})
export class PopupQuickaddContactComponent implements OnInit {

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

  valueChange(e){

  }
}
