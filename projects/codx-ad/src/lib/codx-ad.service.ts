import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { lstat } from 'fs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tmpTNMD } from './models/tmpTenantModules.models';
import { tmpformChooseRole } from './models/tmpformChooseRole.models';

@Injectable({
  providedIn: 'root',
})
export class CodxAdService {
  listview: any;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private notificationsService: NotificationsService,
    private auth: AuthStore,
    private fb: FormBuilder
  ) {}

  private modules = new BehaviorSubject<any>(null);
  loadModule = this.modules.asObservable();

  private moduleGroups = new BehaviorSubject<any>(null);
  loadModuleGroups = this.moduleGroups.asObservable();

  lstRoleAfterchoose = new BehaviorSubject<any>(null);
  loadListRoles = this.lstRoleAfterchoose.asObservable();

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv: any) => {
        var model = {};
        model['write'] = [];
        model['delete'] = [];
        model['assign'] = [];
        model['share'] = [];
        if (gv) {
          const user = this.auth.get();
          for (const key in gv) {
            const element = gv[key];
            element.fieldName =
              element.fieldName.charAt(0).toLowerCase() +
              element.fieldName.slice(1);
            model[element.fieldName] = [];
            if (element.fieldName == 'owner') {
              model[element.fieldName].push(user.userID);
            } else if (element.fieldName == 'bUID') {
              model[element.fieldName].push(null);
              model['buid'] = model[element.fieldName];
            } else if (element.fieldName == 'createdOn') {
              model[element.fieldName].push(new Date());
            } else if (element.fieldName == 'stop') {
              model[element.fieldName].push(false);
            } else if (
              element.dataType == 'Decimal' ||
              element.dataType == 'Int'
            ) {
              model[element.fieldName].push(0);
            } else if (
              element.dataType == 'Bool' ||
              element.dataType == 'Boolean'
            )
              model[element.fieldName].push(false);
            else if (element.fieldName == 'createdBy') {
              model[element.fieldName].push(user.userID);
            } else {
              model[element.fieldName].push(null);
            }

            let modelValidator = [];
            if (element.isRequire) {
              modelValidator.push(Validators.required);
            }
            if (element.fieldName == 'email') {
              modelValidator.push(Validators.email);
            }
            if (element.fieldName == 'buid') {
              modelValidator.push(Validators.required);
            }
            if (modelValidator.length > 0) {
              model[element.fieldName].push(modelValidator);
            }
          }
          model['write'].push(false);
          model['delete'].push(false);
          model['assign'].push(false);
          model['share'].push(false);
        }
        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
  }

  notifyInvalid(
    formGroup: FormGroup,
    formModel: FormModel,
    gridViewSetup: any = null
  ) {
    const invalid = [];
    const controls = formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        if (name == 'email') {
          if (controls?.email.value != null) {
            if (controls?.email.value != '') {
              const regex = new RegExp(
                '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
              );
              var checkRegex = regex.test(controls?.email.value);
              if (checkRegex == false) {
                this.notificationsService.notifyCode('SYS037');
                return;
              }
            } else {
              invalid.push(name);
              break;
            }
          }
        }
        invalid.push(name);
        break;
      }
    }
    if (invalid.length == 0) return;
    let fieldName = Util.camelize(invalid[0]); //invalid[0]?.charAt(0)?.toUpperCase() + invalid[0]?.slice(1);
    if (gridViewSetup == null) {
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((grvSetup) => {
          if (grvSetup) {
            let res = Util.camelizekeyObj(grvSetup);
            //if (fieldName == 'Buid') fieldName = 'BUID';
            gridViewSetup = res;
            this.notificationsService.notifyCode(
              'SYS009',
              0,
              '"' + gridViewSetup[fieldName]?.headerText + '"'
            );
          }
        });
    } else {
      this.notificationsService.notifyCode(
        'SYS009',
        0,
        '"' + gridViewSetup[fieldName]?.headerText + '"'
      );
    }
  }

  getListFunction(data) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'FunctionListBusiness',
      'GetByParentAsync',
      data
    );
  }

  getListCompanySettings() {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'CompanySettingsBusiness',
      'GetAsync'
    );
  }

  changeSignatureEmail(recID, nSignEmail) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'CompanySettingsBusiness',
      'UpdateEmailSignatureAsync',
      [recID, nSignEmail]
    );
  }
  updateInformationCompanySettings(data, option?: any, imageUpload?: any) {
    return this.api.execSv<any>(
      'SYS',
      'AD',
      'CompanySettingsBusiness',
      'UpdateBusinessInformationAsync',
      [data, option, imageUpload]
    );
  }
  getListAppByUserRoles(data?: any) {
    return this.api.exec(
      'ERM.Business.AD',
      'UsersBusiness',
      'GetListAppByUserRolesAsync',
      data
    );
  }

  deleteFile(objectID, objectType, delForever) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteByObjectIDAsync',
      [objectID, objectType, delForever]
    );
  }

  stopUser(data) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'UpdateStopAsync',
      [data]
    );
  }

  addUserBeforeDone(data, isUserGroup = false) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'AddUserAsync',
      [data, null, false, isUserGroup]
    );
  }

  getListValidOrderForModules(lstAD_UserRoles, userID) {
    return this.api.execSv(
      'Tenant',
      'ERM.Business.Tenant',
      'TenantModulesBusiness',
      'GetListValidRecIDAsync',
      [lstAD_UserRoles, userID]
    );
  }

  getOrderDetail(orderRecID) {
    return this.api.execSv(
      'Tenant',
      'ERM.Business.Tenant',
      'OrdersBusiness',
      'GetObjectAsync',
      [orderRecID]
    );
  }

  checkExistedUserRoles(lstMemberID) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'CheckExistedUserRolesAsync',
      [lstMemberID]
    );
  }

  addUserRole(itemUser, lstURoles) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UserRolesBusiness',
      'SaveAsync',
      [itemUser, lstURoles]
    );
  }

  getListUser() {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetListUserTempAsync'
    );
  }

  deleteUser(userID, employeeID) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'DeleteTempAsync',
      [userID, employeeID]
    );
  }

  updateUserRoles(
    lstURoles,
    NewURoles,
    isDelete,
    adUserGroup,
    dataUserCbb,
    formAdd = true
  ) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UserRolesBusiness',
      'UpdateAsync',
      [lstURoles, NewURoles, isDelete, adUserGroup, dataUserCbb, formAdd]
    );
  }

  getUserByUserGroup(userID) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetUserByUserGroup',
      userID
    );
  }

  createFirstPost(tmpPost) {
    return this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'CommentsBusiness',
      'PublishPostAsync',
      tmpPost
    );
  }

  getUserGroupByID(groupID) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetUserGroupByUserIDAsync',
      groupID
    );
  }

  //#region Module

  //get lst bought module
  getLstBoughtModule() {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetListBoughtModuleAsync',
      ''
    );
  }

  //1 = trial - 2 = hire - 0 = extend
  buyNewModule(moduleSales: string, mode: string, moduleName: string) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'BuyNewModuleAsync',
      [moduleSales, mode, moduleName]
    );
  }

  getLstAD_UserRolesByModuleIDs(lstMDSales: string[]) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetListUserRoleByModulesAsync',
      [lstMDSales]
    );
  }

  getTenantDefaultSetting() {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'GetTenantDefaultSettingAsync',
      ''
    );
  }

  //#endregion

  sendMail(userID, tenant, mailType) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'SendEmailAsync',
      [userID, tenant, mailType]
    );
  }

  //#region AD_User new process
  removeAD_UserRoles(
    lstModuleIDs: string[],
    lstModuleSales: string[],
    lstUserIDs: string[]
  ) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'RemoveAD_UserRolesAsync',
      [lstModuleIDs, lstModuleSales, lstUserIDs]
    );
  }

  addUpdateAD_UserRoles(
    lstAD_UserRoles: tmpformChooseRole[],
    lstUserIDs: string[],
    needValidate: boolean,
    autoCreated: boolean
  ) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'AddUserRolesAsync',
      [lstAD_UserRoles, lstUserIDs, needValidate, autoCreated]
    );
  }

  addUserToGroupAsync(
    groupID: string,
    userID: string,
    isOverrideRoles: boolean
  ) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'AddUserToGroupAsync',
      [groupID, userID, isOverrideRoles]
    );
  }
  //#endregion

  //#region UserGroupBusiness
  addUserGroupAsync(userGroupModel) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UserGroupsBusiness',
      'AddAsync',
      [userGroupModel]
    );
  }

  addUserGroupMemberAsync(userGroupModel, isOverrideRoles: boolean) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UserGroupsBusiness',
      'AddGroupMembersAsync',
      [userGroupModel, isOverrideRoles]
    );
  }

  validateGroupMemberRoles(sLstMemberIDs: string) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UserGroupsBusiness',
      'ValidateMemberRolesAsync',
      [sLstMemberIDs]
    );
  }

  removeGroupMember(
    lstMDID: string[],
    lstMDSales: string[],
    groupID: string,
    lstMemberIDs: string[]
  ) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UserGroupsBusiness',
      'RemoveGroupMembersAsync',
      [lstMDID, lstMDSales, groupID, lstMemberIDs]
    );
  }

  removeGroupAsync(groupID: string) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UserGroupsBusiness',
      'RemoveGroupAsync',
      [groupID]
    );
  }
  //#endregion

  //#region HCS
  loginHCS() {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'LoginHCSAsync',
      []
    );
  }
  //#endregion
}
