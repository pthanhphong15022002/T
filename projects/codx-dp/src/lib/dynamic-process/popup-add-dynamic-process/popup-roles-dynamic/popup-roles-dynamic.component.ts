import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-roles-dynamic',
  templateUrl: './popup-roles-dynamic.component.html',
  styleUrls: ['./popup-roles-dynamic.component.css']
})
export class PopupRolesDynamicComponent implements OnInit {

  dialog: any;
  title = 'Phân quyền';
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
   }

  ngOnInit(): void {
  }

}
