import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { lstat } from 'fs';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class CodxAdService {
  listview: any;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private notificationsService: NotificationsService
  ) {}

  private modules = new BehaviorSubject<any>(null);
  loadModule = this.modules.asObservable();

  private moduleGroups = new BehaviorSubject<any>(null);
  loadModuleGroups = this.moduleGroups.asObservable();

  lstRoleAfterchoose = new BehaviorSubject<any>(null);
  loadListRoles = this.lstRoleAfterchoose.asObservable();

  notifyInvalid(
    formGroup: FormGroup,
    formModel: FormModel,
    gridViewSetup: any = null
  ) {
    const invalid = [];
    const controls = formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        break;
      }
    }
    let fieldName = invalid[0].charAt(0).toUpperCase() + invalid[0].slice(1);
    // if (gridViewSetup == null) {
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
    // } else {
    //   this.notificationsService.notifyCode(
    //     'E0005',
    //     0,
    //     '"' + gridViewSetup[fieldName].headerText + '"'
    //   );
    // }
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

  deleteUserBeforeDone(data) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'DeleteUserTempAsync',
      data?.userID
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
}
