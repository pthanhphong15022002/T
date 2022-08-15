import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { lstat } from 'fs';

@Injectable({
  providedIn: 'root',
})
export class CodxAdService {
  listview: any;

  constructor(private api: ApiHttpService) {}

  private modules = new BehaviorSubject<any>(null);
  loadModule = this.modules.asObservable();

  private moduleGroups = new BehaviorSubject<any>(null);
  loadModuleGroups = this.moduleGroups.asObservable();

  lstRoleAfterchoose = new BehaviorSubject<any>(null);
  loadListRoles = this.lstRoleAfterchoose.asObservable();

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

  addUserBeforeDone(data) {
    return this.api.execSv(
      'SYS',
      'ERM.Business.AD',
      'UsersBusiness',
      'AddUserAsync',
      [data, null, false]
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
