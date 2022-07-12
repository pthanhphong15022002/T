import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-pop-roles',
  templateUrl: './pop-roles.component.html',
  styleUrls: ['./pop-roles.component.css']
})
export class PopRolesComponent implements OnInit {

  data: any;
  dialog: any;
  title='Phân quyền người dùng';
  count = 10;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) { 
    this.dialog = dialog;
    this.data = dt?.data;
  }

  ngOnInit(): void {
  }

}
