import { Component, OnInit, Optional } from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-add-permission',
  templateUrl: './popup-add-permission.component.html',
  styleUrls: ['./popup-add-permission.component.css']
})
export class PopupAddPermissionComponent implements OnInit {

  dialog: any;
  title= '';
  requestTitle = '';
  shareContent = '';
  startDate: any;
  endDate: any;
  toPermission: Permission[];
  byPermission: Permission[];
  ccPermission: Permission[];
  fromPermission: Permission[];
  constructor(
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {
  }

  //#region footer
  onShare(){

  }
  //#endregion

  //#region event
  onUserEvent($event, type: string){
    console.log($event);
  }

  txtValue($event, ctrl){

  }

  validate(item){

  }
  //#endregion
}
