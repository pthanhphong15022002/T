import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { lstat } from 'fs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
              model[element.fieldName].push(user['buid']);
            } else if (element.fieldName == 'createdOn') {
              model[element.fieldName].push(new Date());
            } else if (element.fieldName == 'stop') {
              model[element.fieldName].push(false);
            } else if (element.fieldName == 'orgUnitID') {
              model[element.fieldName].push(user['buid']);
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
                this.notificationsService.notify("Trường 'Email' không hợp lệ");
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
    let fieldName = invalid[0].charAt(0).toUpperCase() + invalid[0].slice(1);
    if (gridViewSetup == null) {
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((res) => {
          if (res) {
            gridViewSetup = res;
            this.notificationsService.notifyCode(
              'E0005',
              0,
              '"' + gridViewSetup[fieldName].headerText + '"'
            );
          }
        });
    } else {
      this.notificationsService.notifyCode(
        'E0005',
        0,
        '"' + gridViewSetup[fieldName].headerText + '"'
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
    return this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'DeleteByObjectIDAsync',
        [objectID, objectType, delForever]
      )
      .subscribe();
  }

  stopUser(data, isAdd, lstURoles, stop) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'UpdateUserAsync',
      [data, isAdd, lstURoles, stop]
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

  updateUserRoles(lstURoles, NewURoles, isDelete, adUserGroup, dataUserCbb, formAdd = true) {
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
}
