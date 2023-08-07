import { ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef } from 'codx-core';
import { CM_Permissions } from '../models/cm_model';

@Component({
  selector: 'lib-popup-permissions',
  templateUrl: './popup-permissions.component.html',
  styleUrls: ['./popup-permissions.component.css']
})
export class PopupPermissionsComponent implements OnInit {

  dialog!: DialogRef;
  data: any;
  title = '';
  lstPermissions: CM_Permissions[] = [];
  listRoles = [];
  currentPemission: any;
  //#region quyền
  isSetFull = false;
  full: boolean = false;
  read: boolean = true;
  update: boolean = true;
  assign: boolean = false;
  upload: boolean = true;
  download: boolean = true;
  delete: boolean = false;
  allowPermit: boolean = false;
  allowUpdateStatus: boolean = true;
  //#endregion
  showInput = true;
  isDelete = true;
  constructor(
    private cache: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData,
  ){
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.title = dt?.data?.title;
    if(this.data?.permissions != null && this.data?.permissions?.length > 0){
      this.lstPermissions = this.data?.permissions;
    }
  }

  ngOnInit(): void {
    this.checkAdminUpdate();
    this.checkDeleteAndAdd();
    this.cache.valueList('CRM051').subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
    if(this.lstPermissions != null && this.lstPermissions.length > 0){
      this.changePermissions(0);
    }
  }

  //#region ChangePermisson
  changePermissions(index){
    if (this.currentPemission > -1) {
      let oldIndex = this.currentPemission;
      if (
        oldIndex != index &&
        oldIndex > -1 &&
        this.lstPermissions[oldIndex] != null
      ) {
        this.lstPermissions[oldIndex].full = this.full;
        this.lstPermissions[oldIndex].read = this.read;
        this.lstPermissions[oldIndex].update = this.update;
        this.lstPermissions[oldIndex].assign = this.assign;
        this.lstPermissions[oldIndex].delete = this.delete;
        this.lstPermissions[oldIndex].upload = this.upload;
        this.lstPermissions[oldIndex].download = this.download;
        this.lstPermissions[oldIndex].allowPermit = this.allowPermit;
        this.lstPermissions[oldIndex].allowUpdateStatus = this.allowUpdateStatus ? '1' : '0';
      }
    }
    if(this.lstPermissions[index] != null){
      this.full = this.lstPermissions[index].full;
      this.read = this.lstPermissions[index].full;
      this.update = this.lstPermissions[index].update;
      this.assign = this.lstPermissions[index].assign;
      this.delete = this.lstPermissions[index].delete;
      this.upload = this.lstPermissions[index].upload;
      this.download = this.lstPermissions[index].download;
      this.allowPermit = this.lstPermissions[index].allowPermit;
      this.allowUpdateStatus = this.lstPermissions[index].allowUpdateStatus == '1' ? true : false;
    }
  }

  changUsers(e){

  }
  //#endregion


  //#region value change permissons
  valueChange(e, type){

  }

  controlFocus(isFull) {
    this.isSetFull = isFull;
    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  //#region  check Permission
  checkAdminUpdate(){

  }

  checkDeleteAndAdd(){

  }

  checkRemove(index){}
  //#region
  //#region remove
  removeUser(index){

  }
  //#endregion
}
