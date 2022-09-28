import { T } from '@angular/cdk/keycodes';
import {
  Component,
  OnInit,
  Injector,
  ChangeDetectorRef,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  AuthStore,
  CRUDService,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';
import { AD_Roles } from '../../models/AD_User.models';
import { AD_UserGroups } from '../../models/AD_UserGroups.models';
import { AD_UserRoles } from '../../models/AD_UserRoles.models';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';
import { PopRolesComponent } from '../../users/pop-roles/pop-roles.component';

@Component({
  selector: 'lib-add-user-groups',
  templateUrl: './add-user-groups.component.html',
  styleUrls: ['./add-user-groups.component.css'],
})
export class AddUserGroupsComponent extends UIComponent implements OnInit {
  @ViewChild('form') form: any;

  title = '';
  dialog!: DialogRef;
  dialogRole: DialogRef;
  data: any;
  isAddMode = true;
  user: any;
  adUserGroup = new AD_UserGroups();
  adRoles: AD_Roles = new AD_Roles();
  adUserRoles: AD_UserRoles = new AD_UserRoles();
  countListViewChooseRoleApp: Number = 0;
  countListViewChooseRoleService: Number = 0;
  viewChooseRole: tmpformChooseRole[] = [];
  viewChooseRoleTemp: tmpformChooseRole[] = [];
  formModel: FormModel;
  formType: any;
  formGroupAdd: FormGroup;
  checkBtnAdd = false;
  saveSuccess = false;
  dataAfterSave: any;
  // countOpenPopRoles = 0;
  userType: any;
  isUserGroup = false;
  isPopupCbb = false;
  dataUserCbb: any = new Array();
  formUserGroup: FormGroup;
  lstUser: any;
  dataUserCbbTemp: any;
  dataCopy: any;

  constructor(
    private injector: Injector,
    private changeDetector: ChangeDetectorRef,
    private auth: AuthStore,
    private adService: CodxAdService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    super(injector);
    this.formType = dt?.data?.formType;
    this.userType = dt?.data?.userType;
    this.data = dialog.dataService!.dataSelected;
    this.adUserGroup = JSON.parse(JSON.stringify(this.data));
    if (this.formType == 'edit') {
      this.viewChooseRole = this.data?.chooseRoles;
      this.viewChooseRoleTemp = JSON.parse(
        JSON.stringify(this.data?.chooseRoles)
      );
      this.countListViewChoose();
      this.adService
        .getUserByUserGroup(this.adUserGroup.userID)
        .subscribe((res: any) => {
          if (res) {
            this.dataUserCbb = res;
            this.dataUserCbbTemp = JSON.parse(JSON.stringify(this.dataUserCbb));
          }
        });
    } else if (this.formType == 'copy') {
      this.dataCopy = dt?.data?.dataCopy;
      this.adUserGroup = JSON.parse(JSON.stringify(this.dataCopy));
      this.viewChooseRole = this.dataCopy?.chooseRoles;
      this.viewChooseRoleTemp = JSON.parse(
        JSON.stringify(this.dataCopy?.chooseRoles)
      );
      this.countListViewChoose();
      this.adService
        .getUserByUserGroup(this.adUserGroup.userID)
        .subscribe((res: any) => {
          if (res) {
            this.dataUserCbb = res;
            this.dataUserCbbTemp = JSON.parse(JSON.stringify(this.dataUserCbb));
          }
        });
    }
    this.dialog = dialog;
    this.user = auth.get();
  }

  capitalizeWords(arr) {
    return arr.map((element) => {
      return element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
    });
  }

  onInit(): void {
    if (this.formType == 'edit') {
      this.title = 'Cập nhật nhóm người dùng';
      this.isAddMode = false;
    } else this.title = this.form?.title;
    this.adService.getListUser().subscribe((res) => {
      if (res) {
        this.lstUser = res;
      }
    });
  }

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.initForm();
  }

  initForm() {
    this.adService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.formUserGroup = res;
        }
      });
  }

  openPopup(item: any) {
    this.formUserGroup.patchValue(this.adUserGroup);
    if (this.formUserGroup.invalid) {
      this.adService.notifyInvalid(this.formUserGroup, this.formModel);
      return;
    } else {
      var option = new DialogModel();
      option.FormModel = this.form.formModel;
      var obj = {
        formType: this.formType,
        data: item,
      };
      this.dialogRole = this.callfc.openForm(
        PopRolesComponent,
        '',
        1200,
        700,
        '',
        obj,
        '',
        option
      );
      this.dialogRole.closed.subscribe((e) => {
        if (e?.event) {
          this.viewChooseRole = e?.event;
          this.countListViewChoose();
          this.viewChooseRole.forEach((dt) => {
            dt['module'] = dt.functionID;
            dt['roleID'] = dt.recIDofRole;
            dt.userID = this.adUserGroup.userID;
          });
          this.changeDetector.detectChanges();
        }
      });
    }
  }

  countListViewChoose() {
    if (this.viewChooseRole) {
      this.countListViewChooseRoleApp = this.viewChooseRole.filter(
        (obj) => obj.isPortal == false
      ).length;
      this.countListViewChooseRoleService = this.viewChooseRole.filter(
        (obj) => obj.isPortal == true
      ).length;
    }
  }

  beforeSave(op: RequestOption) {
    var data = [];
    var checkDifference =
      JSON.stringify(this.viewChooseRoleTemp) ===
      JSON.stringify(this.viewChooseRole);
    if (this.formType == 'add') {
      this.isAddMode = true;
      op.methodName = 'AddUserAsync';
      data = [this.adUserGroup, this.viewChooseRole, true, true, false];
    }
    if (this.formType == 'edit') {
      this.isAddMode = false;
      op.methodName = 'UpdateUserAsync';
      data = [this.adUserGroup, this.viewChooseRole, checkDifference];
    }
    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), 0)
      .subscribe((res) => {
        if (res.save) {
          if (res.save?.functions) {
            res.save.chooseRoles = res.save?.functions;
            (this.dialog.dataService as CRUDService)
              .update(res.save)
              .subscribe();
          }
          this.dialog.close(res.save);
          this.changeDetector.detectChanges();
        }
      });
  }

  onUpdate() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.update) {
          res.update['chooseRoles'] = res.update?.functions;
          (this.dialog.dataService as CRUDService)
            .update(res.update)
            .subscribe();
          this.dialog.close(res.update);
          this.changeDetector.detectChanges();
        }
      });
  }

  onSave() {
    this.saveSuccess = true;
    this.formUserGroup.patchValue(this.adUserGroup);
    if (this.formUserGroup.invalid) {
      this.adService.notifyInvalid(this.formUserGroup, this.formModel);
      return;
    } else {
      this.saveUserRoles();
    }
  }

  saveUserRoles() {
    var lstUser: any = new Array();
    var checkDifference = true;
    if (this.viewChooseRole) {
      checkDifference =
        JSON.stringify(this.viewChooseRoleTemp) ===
        JSON.stringify(this.viewChooseRole);
    }
    this.dataUserCbb.forEach((res) => {
      this.lstUser.forEach((dt) => {
        if (res.userID == dt.userID) {
          lstUser.push(dt);
        }
      });
    });
    let countUserHaveGroup = 0;
    var lstUserHaveGroup = [];
    var lstUserName = [];
    lstUser.forEach((res) => {
      if (res.userGroup != null) {
        countUserHaveGroup++;
        lstUserHaveGroup.push(res);
      }
    });
    if (lstUserHaveGroup.length > 0) {
      lstUserHaveGroup.forEach((dt) => {
        var userName = Util.stringFormat(dt.userName, ...lstUserHaveGroup);
        lstUserName.push(userName);
      });
    }
    if (countUserHaveGroup > 0 && this.formType == 'add') {
      this.notification
        .alertCode('AD004', null, lstUserName.join(', '))
        .subscribe((x) => {
          if (x.event.status == 'Y') {
            this.saveUser(lstUser, checkDifference);
          } else {
            return;
          }
        });
    } else {
      this.saveUser(lstUser, checkDifference);
    }
  }

  saveUser(lstUser, checkDifference) {
    var checkDifferenceUserCbb = true;
    if (this.dataUserCbb) {
      checkDifferenceUserCbb =
        JSON.stringify(this.dataUserCbbTemp) ===
        JSON.stringify(this.dataUserCbb);
    }
    if (this.isAddMode) {
      if (this.dataUserCbb.length > 0) {
        this.notification
          .alertCode('AD005', null, this.adUserGroup.userName)
          .subscribe((x) => {
            if (x?.event.status == 'Y') {
              this.onAdd();
              if (
                this.dataUserCbb.length > 0 &&
                this.viewChooseRole.length > 0
              ) {
                this.adService
                  .updateUserRoles(
                    lstUser,
                    this.viewChooseRole,
                    true,
                    this.adUserGroup,
                    this.dataUserCbb
                  )
                  .subscribe();
              }
            } else this.onAdd();
          });
      } else this.onAdd();
    } else {
      if (!checkDifferenceUserCbb || !checkDifference) {
        this.notification
          .alertCode('AD005', null, this.adUserGroup.userName)
          .subscribe((x) => {
            if (x?.event.status == 'Y') {
              this.onUpdate();
              if (
                !checkDifferenceUserCbb ||
                (!checkDifference && this.dataUserCbb.length > 0)
              ) {
                this.adService
                  .updateUserRoles(
                    this.dataUserCbbTemp,
                    this.viewChooseRole,
                    true,
                    this.adUserGroup,
                    this.dataUserCbb,
                    false
                  )
                  .subscribe();
              }
            } else this.onUpdate();
          });
      } else this.onUpdate();
    }
  }

  valueChangeM(data) {
    this.adUserGroup[data.field] = data.data;
  }
  valueChangeU(data) {
    this.adUserGroup[data.field] = data.data;
  }
  valueChangeP(data) {
    this.adUserGroup[data.field] = data.data;
  }

  valueEmp(data) {
    this.adUserGroup.employeeID = data.data;
    this.getEmployee(this.adUserGroup.employeeID);
  }

  valueUG(data) {
    if (data.data) {
      this.adUserGroup.userGroup = data.data;
      this.loadUserRole(data.data);
    }
  }

  valueBU(data) {
    if (data.data) {
      this.adUserGroup[data.field] = data.data;
    }
  }

  getEmployee(employeeID: string) {
    this.api
      .exec<any>('ERM.Business.HR', 'HRBusiness', 'GetModelEmp', [employeeID])
      .subscribe((employee) => {
        if (employee) {
          this.adUserGroup.employeeID = employeeID;
          this.adUserGroup.userName = employee.employeeName;
          this.adUserGroup.buid = employee.organizationID;
          this.adUserGroup.email = employee.email;
          this.adUserGroup.phone = employee.phone;
          this.changeDetector.detectChanges();
        }
      });
  }

  loadUserRole(userID) {
    if (!userID) return;
    this.api
      .call('ERM.Business.AD', 'UsersBusiness', 'GetModelListRolesAsync', [
        userID,
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData) {
          this.viewChooseRole = res.msgBodyData[0];
          this.viewChooseRole.forEach((dt) => {
            dt['module'] = dt.functionID;
            dt['roleID'] = dt.recIDofRole;
            dt.userID = this.adUserGroup.userID;
          });
          this.countListViewChooseRoleApp = this.viewChooseRole.length;
          this.changeDetector.detectChanges();
        }
      });
  }

  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-playlist_add_check', text: 'Phân quyền', name: 'Roles' },
  ];

  setTitle(e: any) {
    this.title = 'Thêm ' + e;
    this.changeDetector.detectChanges();
  }

  checkOpenCbbPopup = 0;
  getDataUserInCbb(event) {
    this.checkOpenCbbPopup++;
    if (event?.dataSelected) {
      if (
        this.checkOpenCbbPopup >= 2 ||
        this.formType == 'add' ||
        this.formType == 'edit'
      ) {
        if (this.dataUserCbb) {
          let i = 0;
          event?.dataSelected.forEach((dt) => {
            this.dataUserCbb.forEach((x) => {
              if (dt.UserID == x.userID) {
                event?.dataSelected.splice(i, 1);
              }
            });
            i++;
          });
        }
      }
      event?.dataSelected.forEach((e: any) => {
        this.dataUserCbb.push({ userID: e.UserID, userName: e.UserName });
      });
      this.changeDetector.detectChanges();
    }
  }

  openPopupCbb() {
    this.isPopupCbb = !this.isPopupCbb;
  }

  deleteUserCbb(index, item) {
    this.dataUserCbb.splice(index, 1);
    this.changeDetector.detectChanges();
  }
}
