import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-roles-instance',
  templateUrl: './popup-roles-instance.component.html',
  styleUrls: ['./popup-roles-instance.component.css']
})
export class PopupRolesInstanceComponent implements OnInit {
  dialog: any;
  data: any;
  title = '';
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { }

  ngOnInit(): void {
  }

}
