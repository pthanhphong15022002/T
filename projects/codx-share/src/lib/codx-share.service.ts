import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { TM_Tasks } from './components/codx-tasks/model/task.model';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DataRequest,
  SidebarModel,
} from 'codx-core';
import { AssignInfoComponent } from './components/assign-info/assign-info.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class CodxShareService {
  hideAside = new BehaviorSubject<any>(null);
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private cache: CacheService,
    private fb: FormBuilder
  ) {}
  defaultMoreFunc(
    val: any,
    data: any,
    afterSave?: Function,
    formModel?: any,
    dataService?: any
  ) {
    var funcID = val?.functionID;
    switch (funcID) {
      //Giao việc
      case 'SYS005': {
        var task = new TM_Tasks();
        task.refID = data?.recID;
        task.refType = formModel.entityName;
        var vllControlShare = 'TM003';
        var vllRose = 'TM002';
        var title = val?.data.customName;
        let option = new SidebarModel();
        option.DataService = dataService;
        option.FormModel = formModel;
        option.Width = '550px';
        let dialog = this.callfunc.openSide(
          AssignInfoComponent,
          [task, vllControlShare, vllRose, title],
          option
        );
        dialog.closed.subscribe((e) => {
          if (afterSave && e?.event && e?.event[0]) {
            var result = {
              funcID: funcID,
              result: e?.event,
              data: data,
            };
            afterSave(result);
          }
        });
        break;
      }
    }
  }

  //#region EmailTemplate
  loadDataCbx(service: string, dataRequest: DataRequest = null) {
    if (dataRequest == null) {
      dataRequest = new DataRequest();
      dataRequest.comboboxName = 'DataViewItems';
      dataRequest.page = 1;
      dataRequest.pageSize = 10;
    }
    return this.api.execSv<any>(
      service,
      'ERM.Business.CM',
      'DataBusiness',
      'LoadDataCbxAsync',
      [dataRequest]
    );
  }

  getFormGroup(formName, gridView): Promise<FormGroup> {
    return new Promise<FormGroup>((resolve, reject) => {
      this.cache.gridViewSetup(formName, gridView).subscribe((gv) => {
        var model = {};
        model['write'] = [];
        model['delete'] = [];
        model['assign'] = [];
        model['share'] = [];
        if (gv) {
          const user = this.auth.get();
          console.log(user);

          for (const key in gv) {
            var b = false;
            if (Object.prototype.hasOwnProperty.call(gv, key)) {
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

              // if (element.isRequire) {
              //   model[element.fieldName].push(
              //     Validators.compose([Validators.required])
              //   );
              // } else {
              //   model[element.fieldName].push(Validators.compose([]));
              // }
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

  getEmailTemplate(templateID: string) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'GetViewEmailTemplateAsyncLogic',
      templateID
    );
  }

  sendEmailTemplate(emailRecID) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'SendEmailAsync',
      emailRecID
    );
  }

  addEmailTemplate(data: any, sendTo: any) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'AddEmaiTemplateAsync',
      [data, sendTo]
    );
  }

  editEmailTemplate(data: any, sendTo: any) {
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.AD',
      'EmailTemplatesBusiness',
      'EditEmaiTemplateAsync',
      [data, sendTo]
    );
  }
  //#endregion
}
