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
  //Role
  full: boolean = false;
  create:	boolean;
  read:	boolean;
  update:	boolean;
  assign:	boolean;
  delete:	boolean;
  share:	boolean;
  upload:	boolean;
  download:	boolean;
  //Date
  startDate: Date;
  endDate: Date;

  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
   }

  ngOnInit(): void {
  }


  //#region Event user
  valueChange(e, type){

  }
  //#endregion

  //#region check role
  controlFocus(focus){

  }

  checkAdminUpdate(){
    return true;
  }
  //#endregion
}
