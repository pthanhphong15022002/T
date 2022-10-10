import { fieldChoose } from './../viewFileDialog/alertRule.model';
import { Injectable } from '@angular/core';
import { ApiHttpService, CacheService, FormModel, AuthStore } from 'codx-core';
import { APICONSTANT } from '@shared/constant/api-const';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BS_DaysOff } from './models/BS_DaysOff.model';
import { BS_CalendarDate } from './models/BS_CalendarDate.model';

@Injectable({
  providedIn: 'root',
})
export class SettingCalendarService {
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private fb: FormBuilder
  ) {}

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

  getParams(formName, fieldName) {
    return this.api.exec<any>(
      APICONSTANT.ASSEMBLY.SYS,
      'SettingValuesBusiness',
      'GetOneField',
      [formName, null, fieldName]
    );
  }

  getCalendarName(calendarID: string) {
    return this.api.exec<string>(
      APICONSTANT.ASSEMBLY.BS,
      APICONSTANT.BUSINESS.BS.Calendars,
      'GetCalendarNameAsync',
      [calendarID]
    );
  }

  getDayWeek(calendarID: string) {
    return this.api.exec<any>(
      APICONSTANT.ASSEMBLY.BS,
      APICONSTANT.BUSINESS.BS.Calendars,
      'GetDayWeekAsync',
      [calendarID]
    );
  }

  getDaysOff(calendarID: string) {
    return this.api.exec<any>(
      APICONSTANT.ASSEMBLY.BS,
      APICONSTANT.BUSINESS.BS.CalendarDate,
      'GetDateOffAsync',
      [calendarID]
    );
  }

  getSettingCalendar(calendarID: string) {
    return this.api.exec(
      APICONSTANT.ASSEMBLY.BS,
      APICONSTANT.BUSINESS.BS.Calendars,
      'GetSettingCalendarAsync',
      [calendarID]
    );
  }

  removeDayOff(item: BS_DaysOff) {
    return this.api.exec(
      APICONSTANT.ASSEMBLY.BS,
      APICONSTANT.BUSINESS.BS.DaysOff,
      'DeleteAsync',
      [item]
    );
  }

  removeCalendarDate(item: BS_CalendarDate) {
    return this.api.exec(
      APICONSTANT.ASSEMBLY.BS,
      APICONSTANT.BUSINESS.BS.CalendarDate,
      'DeleteAsync',
      [item]
    );
  }
}
