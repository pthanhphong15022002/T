import { DP_Instances } from './../../models/models';
import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
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
  instance: DP_Instances;
  currentPemission = 0;
  isSetFull = false;
  //Quyền
  full: boolean = false;
  allowPermit: boolean;
  edit: boolean;
  delete: boolean;
  create: boolean;
  update: boolean;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data[0]));
    this.instance = this.data;
  }

  ngOnInit(): void {
    if(this.instance != null && this.instance.permissions.length > 0){
      this.changePermission(0);
    }
  }

  changePermission(index){

  }

  valueChange($event, type){

  }

  controlFocus(isFull) {
    this.isSetFull = isFull;
    this.changeDetectorRef.detectChanges();
  }

  checkAdminUpdate() {
    return false;
  }
}
