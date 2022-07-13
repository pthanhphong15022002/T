import { AD_User } from './../../models/AD_User.models';
import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { DialogData, DialogRef, CallFuncService } from 'codx-core';
import { PopRolesComponent } from '../pop-roles/pop-roles.component';

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

  adUser = new AD_User();
  constructor(
    private callfc: CallFuncService,
    private changDetec: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
    this.data = dialog.dataService!.dataSelected;
    this.adUser = this.data;
  }

  ngOnInit(): void {
  }

  openPopup(item: any) {
    this.dialog = this.callfc.openForm(PopRolesComponent, '', 1500, 800, '', item);
    // this.dialog.closed.subscribe(e => {
    //   console.log(e);
    // })
  }

  beforeSave(op: any) {
    var data = [];
    op.method = 'SaveUsersAsync';
    data = [
      this.isAddMode,
      this.adUser,
    ];
    op.data = data;
    return true;
  }

  onSave() {
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
      this.adUser.employeeID = data.data;
    }
  }

  valueUG(data) {
    if (data.data) {
      this.adUser.userGroup = data.data;
    }
  }
  valueBU(data) {
    if (data.data) {
      this.adUser.buid = data.data;
    }
  }
}
