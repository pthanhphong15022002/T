import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { Component, OnInit, Optional, ChangeDetectorRef, Pipe } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'app-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.css']
})

export class ViewUsersComponent implements OnInit {
  data: any;
  dialog: any;
  count: number = 0;
  title = '';
  lstRoles = [];
  itemSelected: any;
  allRoles = [];
  searchItem = '';
  constructor(

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,) {
    this.data = dt?.data;
    this.lstRoles = this.data.chooseRoles;
    this.allRoles = this.lstRoles;
    this.dialog = dialog;
  }

  
  ngOnInit(): void {
    if (this.data) {
      for (let item of this.lstRoles) {
        if (item != "") {
          this.count = this.count + 1;
        }
      }
    }
    this.title = 'Danh sách module (' + this.count + ')';
    // this.assignCopy();
  }

  assignCopy() {
    this.allRoles = Object.assign([], this.lstRoles);
  }


  search(data) {
      this.allRoles = this.lstRoles.filter((val) =>
      val.customName.includes(data)
    );
  }
  
}
