import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { APICONSTANT } from '@shared/constant/api-const';
import { ApiHttpService, AuthStore, CacheService, NotificationsService, UploadFile, UserModel } from 'codx-core';

export class ModelPage {
  functionID = '';
  gridViewName = '';
  formName = '';
  entity = '';
}
export class AddGridData {
  dataItem: any = null;
  isAdd: boolean = false;
  key: String = '';
}
interface cbxObj {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class CodxEpService {

  user: UserModel;
  constructor(
    private cache: CacheService,
    private auth: AuthStore,
    private fb: FormBuilder,
    private api: ApiHttpService,
    private notificationsService: NotificationsService
  ) {}

  getModelPage(functionID): Promise<ModelPage> {
    return new Promise<ModelPage>((resolve, rejects) => {
      this.cache.functionList(functionID).subscribe((funcList) => {
        var modelPage = new ModelPage();
        if (funcList) {
          modelPage.entity = funcList?.entityName;
          modelPage.formName = funcList?.formName;
          modelPage.gridViewName = funcList?.gridViewName;
          modelPage.functionID = funcList?.functionID;
        }
        resolve(modelPage);
      });
    });
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        var model = {};
        if (gv) {
          const user = this.auth.get();
          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              if (element.fieldName) {
                element.fieldName =
                  element.fieldName.charAt(0).toLowerCase() +
                  element.fieldName.slice(1);
                model[element.fieldName] = [];

                if (element.fieldName == 'owner') {
                  model[element.fieldName].push(user.userID);
                }
                if (element.fieldName == 'createdOn') {
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
              }

              // if (element.isRequire) {
              //   model[element.fieldName].push(
              //     Validators.compose([Validators.required])
              //   );
              // } else {
              //   model[element.fieldName].push(Validators.compose([]));
              // }
            }
          }
        }

        resolve(this.fb.group(model, { updateOn: 'blur' }));
      });
    });
  }

  getComboboxName(formName, gridView): Promise<object> {
    return new Promise<object>((resolve, reject) => {
      var obj: { [key: string]: any } = {};
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        if (gv) {
          for (const key in gv) {
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
              const element = gv[key];
              if (element?.referedValue != null) {
                obj[key] = element.referedValue;
              }
            }
          }
        }
      });
      resolve(obj);
    });
  }

  execEP(
    className: string,
    methodName: string,
    data: any = null,
    uploadFiles: UploadFile[] = null
  ) {
    return this.api.exec<any>(
      APICONSTANT.ASSEMBLY.EP,
      className,
      methodName,
      data
    );
  }

  loadBookings(data) {
    return this.execEP(
      APICONSTANT.BUSINESS.EP.Bookings,
      'GetEventsAsync',
      data
    );
  }
  loadResources(data) {
    return this.execEP(APICONSTANT.BUSINESS.EP.Resources, 'GetListAsync', data);
  }
  loadResources4Booking(data) {
    return this.execEP(
      APICONSTANT.BUSINESS.EP.Bookings,
      'GetResourceAsync',
      data
    );
  }

}
