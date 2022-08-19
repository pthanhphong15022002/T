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
  gridViewSetup: any = [];
  checkBtnAdd = false;
  saveSuccess = false;
  dataAfterSave: any;
  countOpenPopRoles = 0;
  userType: any;
  isUserGroup = false;
  isPopupCbb = false;
  dataUserCbb: any = [];
  formUserGroup: FormGroup;

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
    if (this.formType == 'edit') {
      this.viewChooseRole = this.data?.chooseRoles;
      this.viewChooseRoleTemp = JSON.parse(
        JSON.stringify(this.data?.chooseRoles)
      );
      this.countListViewChoose();
    }
    this.adUserGroup = JSON.parse(JSON.stringify(this.data));
    this.dialog = dialog;
    this.user = auth.get();

    this.cache.gridViewSetup('Users', 'grvUsers').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }

  onInit(): void {
    if (this.formType == 'edit') {
      this.title = 'Cập nhật nhóm người dùng';
      this.isAddMode = false;
    } else this.title = this.form?.title;
  }

  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.dialog.closed.subscribe((res) => {
      if (!this.saveSuccess) {
        if (this.dataAfterSave && this.dataAfterSave.userID) {
          this.adService.deleteUserBeforeDone(this.dataAfterSave).subscribe();
        }
      }
    });
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
    if (
      this.adUserGroup?.employeeID == '' ||
      this.adUserGroup?.employeeID == null
    ) {
      this.notification.notify('Vui lòng nhập thông tin nhóm người dùng');
    } else {
      this.countOpenPopRoles++;
      if (this.countOpenPopRoles > 0) this.addUserTemp();
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

  addUserTemp() {
    this.checkBtnAdd = true;
    this.formUserGroup.patchValue(this.adUserGroup);
    if (this.formUserGroup.invalid) {
      this.adService.notifyInvalid(this.formUserGroup, this.formModel);
      return;
    } else {
      this.dialog.dataService
        .save((opt: any) => this.beforeSaveTemp(opt))
        .subscribe((res) => {
          if (res.save) {
            this.dataAfterSave = res.save;
          }
        });
    }
  }

  countListViewChoose() {
    this.countListViewChooseRoleApp = this.viewChooseRole.filter(
      (obj) => obj.isPortal == false
    ).length;
    this.countListViewChooseRoleService = this.viewChooseRole.filter(
      (obj) => obj.isPortal == true
    ).length;
  }

  beforeSave(op: RequestOption) {
    var data = [];
    var checkDifference =
      JSON.stringify(this.viewChooseRoleTemp) ===
      JSON.stringify(this.viewChooseRole);
    if (this.formType == 'add') {
      this.isAddMode = true;
      op.methodName = 'AddUserAsync';
      data = [this.adUserGroup, this.viewChooseRole, true, true];
    }
    if (this.formType == 'edit') {
      this.isAddMode = false;
      op.methodName = 'UpdateUserAsync';
      if (checkDifference == true)
        data = [this.adUserGroup, this.viewChooseRole];
      else data = [this.adUserGroup, this.viewChooseRole, checkDifference];
    }
    op.data = data;
    return true;
  }

  beforeSaveTemp(op: RequestOption) {
    var data = [];
    this.isAddMode = true;
    op.methodName = 'AddUserAsync';
    data = [this.adUserGroup, null, false, true];
    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res.save) {
          res.save.chooseRoles = res.save?.functions;
        }
      });
    this.dialog.close();
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
          this.changeDetector.detectChanges();
        }
      });
    this.dialog.close();
  }

  onSave() {
    this.saveSuccess = true;
    this.formUserGroup.patchValue(this.adUserGroup);
    if (this.formUserGroup.invalid) {
      this.adService.notifyInvalid(this.formUserGroup, this.formModel);
      return;
    } else {
      if (this.isAddMode) {
        if (this.checkBtnAdd == false) return this.onAdd();
        else {
          if (
            this.countListViewChooseRoleApp > 0 ||
            this.countListViewChooseRoleService > 0
          ) {
            this.adService
              .addUserRole(this.dataAfterSave, this.viewChooseRole)
              .subscribe((res: any) => {
                if (res) {
                  res.chooseRoles = res?.functions;
                  (this.dialog.dataService as CRUDService)
                    .update(res)
                    .subscribe();
                  this.changeDetector.detectChanges();
                }
              });
          }
          this.dialog.close();
          this.notification.notifyCode('SYS006');
        }
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
      .call('ERM.Business.AD', 'UsersBusiness', 'GetModelListRoles', [userID])
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

  getDataUserInCbb(event) {
    if (event?.dataSelected) {
      this.dataUserCbb = event?.dataSelected;
      this.changeDetector.detectChanges();
    }
  }

  openPopupCbb() {
    this.isPopupCbb = !this.isPopupCbb;
  }

  deleteUserCbb(index) {
    this.dataUserCbb.splice(index, 1);
    this.changeDetector.detectChanges();
  }
}
