import { AD_User } from './../../models/AD_User.models';
import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { DialogData, DialogRef, CallFuncService, AuthStore } from 'codx-core';
import { PopRolesComponent } from '../pop-roles/pop-roles.component';
import { throws } from 'assert';

@Component({
  selector: 'lib-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  title = 'Thêm người dùng';
  dialog: DialogRef;
  data: any;
  readOnly = false;
  isAddMode = true;
  user: any;
  data1: any;
  adUser = new AD_User();
  constructor(
    private callfc: CallFuncService,
    private changDetec: ChangeDetectorRef,
    private auth: AuthStore,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.data = dialog.dataService!.dataSelected;
    this.adUser = this.data;
    this.dialog = dialog;
    this.data1 = dt?.data;
    this.user = auth.get();
  }

  ngOnInit(): void {
    if(this.data1=='edit')
      this.title = 'Cập nhật người dùng';
  }

  openPopup(item: any) {
    this.dialog = this.callfc.openForm(PopRolesComponent, '', 1500, 800, '', item);
    // this.dialog.closed.subscribe(e => {
    //   console.log(e);
    // })
  }

  beforeSave(op: any) {
    var data = [];
    if (this.data1=='add') {
      this.isAddMode = true;
      op.method = 'AddUserAsync';
      data = [
        this.adUser,
        this.isAddMode,
      ];
    };
    if(this.data1 == 'edit'){
      this.isAddMode = false;
      op.method = 'UpdateUserAsync';
      data = [
        this.adUser,
        this.isAddMode,
      ];
    }
    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        if (res.save) {
          this.dialog.dataService.setDataSelected(res.save);
          this.dialog.dataService.afterSave.next(res);
          this.changDetec.detectChanges();
        }
      });
    this.closePanel();

  }

  onUpdate() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave)
      .subscribe((res) => {
        if (res.update) {
          this.dialog.dataService.setDataSelected(res.update[0]);
        }
      })
      this.closePanel();

  }

  onSave() {
    if(this.isAddMode)
      return this.onAdd();
    return this.onUpdate();
  }

  closePanel() {
    this.dialog.close()
    //this.viewBase.currentView.closeSidebarRight();
  }

  valueChange(data) {
    if (data.data) {
      this.adUser[data.field] = data.data;
    }
  }

  valueEmp(data) {
    if (data.data) {
      this.adUser.employeeID = data.data[0];
    }
  }

  valueUG(data) {
    if (data.data) {
      this.adUser.userGroup = data.data[0];
    }
  }
  valueBU(data) {
    if (data.data) {
      this.adUser.buid = data.data[0];
    }
  }
}
