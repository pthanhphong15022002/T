import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, FormModel } from 'codx-core';
import { APICONSTANT } from '@shared/constant/api-const';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CodxCalendarService {
  dateChange$ = new BehaviorSubject<any>(null);
  calendarData$ = new BehaviorSubject<any>(null);

  constructor(private api: ApiHttpService, private cache: CacheService) {}

  getParams(formName, fieldName) {
    return this.api.exec<any>(
      APICONSTANT.ASSEMBLY.SYS,
      'SettingValuesBusiness',
      'GetOneField',
      [formName, null, fieldName]
    );
  }

  getFormModel(functionID): Promise<FormModel> {
    return new Promise<FormModel>((resolve, rejects) => {
      this.cache.functionList(functionID).subscribe((funcList) => {
        var formModel = new FormModel();
        if (funcList) {
          formModel.entityName = funcList?.entityName;
          formModel.formName = funcList?.formName;
          formModel.gridViewName = funcList?.gridViewName;
          formModel.funcID = funcList?.functionID;
          formModel.entityPer = funcList?.entityPer;
        }
        resolve(formModel);
      });
    });
  }

  checkPermission(entityName: string, functionID: string) {
    return this.api.exec(
      'ERM.Business.CO',
      'CalendarsBusiness',
      'GetUserPermissionAsync',
      [entityName, functionID]
    );
  }
}
