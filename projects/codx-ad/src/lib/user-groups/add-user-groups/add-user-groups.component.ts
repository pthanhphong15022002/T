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
  CodxFormComponent,
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
  @ViewChild('form') form: CodxFormComponent;

  title = '';
  dialog!: DialogRef;
  dialogRole: DialogRef;
  data: any;
  isAddMode = true;
  user: any;
  adUserGroup = new AD_UserGroups();
  adRoles: AD_Roles = new AD_Roles();
  adUserRoles: AD_UserRoles = new AD_UserRoles();
  countListViewChooseRoleApp = 0;
  countListViewChooseRoleService = 0;
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
  oldID: any;
  header = '';

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
    this.formType = JSON.parse(JSON.stringify(dt?.data?.formType));
    this.userType = dt?.data?.userType;
    this.data = dialog.dataService!.dataSelected;
    this.adUserGroup = JSON.parse(JSON.stringify(this.data));
    if (this.formType == 'edit') {
      this.adUserGroup.userID = this.data._uuid;
      this.viewChooseRole = this.data?.chooseRoles;
      if (this.data?.chooseRoles)
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
      this.oldID = JSON.parse(JSON.stringify(dt?.data?.oldID));
      if (this.dataCopy)
        this.adUserGroup = JSON.parse(JSON.stringify(this.dataCopy));
      this.adUserGroup.email = '';
      if (this.dataCopy?.chooseRoles) {
        this.viewChooseRole = this.dataCopy?.chooseRoles;
        this.viewChooseRoleTemp = JSON.parse(
          JSON.stringify(this.dataCopy?.chooseRoles)
        );
        this.countListViewChoose();
      }
      this.adService.getUserByUserGroup(this.oldID).subscribe((res: any) => {
        if (res) {
          this.dataUserCbb = res;
          this.dataUserCbbTemp = JSON.parse(JSON.stringify(this.dataUserCbb));
        }
      });
    }
    this.dialog = dialog;
    this.user = auth.get();
    this.title = dt.data?.headerText;
  }

  capitalizeWords(arr) {
    return arr.map((element) => {
      return element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
    });
  }

  onInit(): void {}

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    if (this.formType == 'edit') {
      this.isAddMode = false;
    }
    this.adService.getListUser().subscribe((res) => {
      if (res) {
        this.lstUser = res;
      }
    });
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      if (res) {
        this.header =
          this.title +
          ' ' +
          res?.customName.charAt(0).toLocaleLowerCase() +
          res?.customName.slice(1);
      }
    });
  }

  openPopup(item: any) {
    var formGroup = this.form.formGroup.controls;
    if (
      formGroup.userID.status == 'VALID' &&
      formGroup.userName.status == 'VALID' &&
      formGroup.email.status == 'VALID'
    ) {
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
            dt['roleID'] = dt.roleID;
            dt.userID = this.adUserGroup.userID;
          });
          this.changeDetector.detectChanges();
        }
      });
    } else this.adService.notifyInvalid(this.form.formGroup, this.formModel);
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
    this.adUserGroup.buid = null;
    var data = [];
    var checkDifference =
      JSON.stringify(this.viewChooseRoleTemp) ===
      JSON.stringify(this.viewChooseRole);
    if (this.formType == 'add' || this.formType == 'copy') {
      this.isAddMode = true;
      op.methodName = 'AddUserAsync';
      if (this.formType == 'copy') {
        this.viewChooseRole.map((dt) => {
          dt.userID = this.adUserGroup.userID;
        });
      }
      data = [this.adUserGroup, this.viewChooseRole, true, true, false];
    }
    if (this.formType == 'edit') {
      this.isAddMode = false;
      op.methodName = 'UpdateUserAsync';
      data = [this.adUserGroup, this.viewChooseRole, checkDifference, '1'];
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
          this.dialog.close();
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
          this.dialog.close();
          this.changeDetector.detectChanges();
        }
      });
  }

  onSave() {
    this.saveSuccess = true;
    var formGroup = this.form.formGroup.controls;
    if (
      formGroup.userID.status == 'VALID' &&
      formGroup.userName.status == 'VALID' &&
      formGroup.email.status == 'VALID'
    )
      this.saveUserRoles();
    else this.adService.notifyInvalid(this.form.formGroup, this.formModel);
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
    if (
      countUserHaveGroup > 0 &&
      (this.formType == 'add' || this.formType == 'copy')
    ) {
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
                if (this.formType == 'copy') {
                  this.viewChooseRole.map((dt) => {
                    dt.userID = this.adUserGroup.userID;
                  });
                }
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
            this.dialog.close();
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
      .exec<any>('ERM.Business.HR', 'HRBusiness_Old', 'GetModelEmp', [employeeID])
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
            dt['roleID'] = dt.roleID;
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

  checkOpenCbbPopup = 0;
  getDataUserInCbb(event) {
    this.checkOpenCbbPopup++;
    if (event?.dataSelected) {
      if (
        this.checkOpenCbbPopup >= 2 ||
        this.formType == 'add' ||
        this.formType == 'edit' ||
        this.formType == 'copy'
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
