import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ApiHttpService,
  TenantStore,
  CacheService,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { BehaviorSubject, Observable, finalize, map, share } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxSvService {
  form = '';
  datafunction = null;
  type = '';
  listview: any;
  tableview: any;
  active = '';
  tenant: string;
  private title = new BehaviorSubject<any>(null);
  signalSave = new BehaviorSubject<any>(null);
  public caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();
  constructor(
    private api: ApiHttpService,
    private router: Router,
    private tenantStore: TenantStore,
    private notificationsService: NotificationsService,
    private cache: CacheService
  ) {}
  appendTitle(title) {
    this.title.next(title);
    this.tenant = this.tenantStore.get()?.tenant;
  }
  LoadCategory(url, func) {
    this.router.navigate(['/' + this.tenant + '/fed/' + url], {
      queryParams: { funcID: func },
    });
  }
  getSV(recID:any)
  {
    return this.api.execSv("SV","SV","SurveysBusiness","GetItemByRecIDAsync",recID);
  }
  updateSV(recID:any,data:any, isChangeTmp = false)
  {
    return this.api.execSv("SV","SV","SurveysBusiness","UpdateItemByRecIDAsync",[recID,data,isChangeTmp]);
  }

  loadFuncByParentID(parentID:any): Observable<any>
  {
    let paras = [parentID];
    let keyRoot = "ParentID" + parentID;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.execSv("SYS","SYS","FunctionListBusiness","GetByParentAsync",paras)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadValuelist(vll:any): Observable<any>
  {
    let paras = [vll];
    let keyRoot = "Vll" + vll;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.cache.valueList(vll)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadTags(entityName:any): Observable<any>
  {
    let paras = [entityName];
    let keyRoot = "Tags" + entityName;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.exec<any>("BS","TagsBusiness","GetModelDataAsync",paras)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadAlertRule(ruleNo:any): Observable<any>
  {
    let paras = [ruleNo];
    let keyRoot = "AlertRule" + ruleNo;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.execSv<any>("SYS","AD","AlertRulesBusiness","GetAlertRulesWithRuleNoAsync",paras)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  loadEmailTemplate(emailTemplate:any): Observable<any>
  {
    let paras = [emailTemplate];
    let keyRoot = "EmailTemplate" + emailTemplate;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    }
    else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key)
    }
    let observable = this.api.execSv<any>("SYS","AD","EmailTemplatesBusiness","GetEmailTemplateAsync",paras)
    .pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }
  convertListToObject(
    list: Array<object>,
    fieldName: string,
    fieldValue: string
  ) {
    if (!Array.isArray(list) || list.length == 0) return {};
    return list.reduce((a, v) => ({ ...a, [v[fieldName]]: v[fieldValue] }), {});
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
            if (fieldName == 'Buid') fieldName = 'BUID';
            gridViewSetup = res;
            this.notificationsService.notifyCode(
              'SYS028',
              0,
              '"' + gridViewSetup[fieldName]?.headerText + '"'
            );
          }
        });
    } else {
      this.notificationsService.notifyCode(
        'SYS028',
        0,
        '"' + gridViewSetup[fieldName]?.headerText + '"'
      );
    }
  }

  deleteFile(objectID, objectType) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteByObjectIDAsync',
      [objectID, objectType, true]
    );
  }

  deleteListFile(lstObjectID) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteListFileByListObjectIDAsync',
      [lstObjectID, true]
    );
  }

  getFileByObjectID(recID) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      recID
    );
  }

  loadTemplateData(recID) {
    return this.api.execSv(
      'SV',
      'ERM.Business.SV',
      'QuestionsBusiness',
      'GetByRecIDAsync',
      [recID]
    );
  }

  getDataQuestionOther(data, resultQuestion) {
    var dataSession = JSON.parse(JSON.stringify(data));
    var rsSession: any = new Array();
    var rsQuestion: any = new Array();
    //TH1 chọn session
    rsSession = dataSession.filter((x) => x['check']);
    if (rsSession.length > 0) {
      rsSession.forEach((y) => {
        y.children = y.children.filter((z) => z['check']);
      });
    }
    //TH2 chọn question
    rsQuestion = this.getUniqueListBy(resultQuestion, 'recID');
    var dt = new Array();
    rsSession.forEach((x) => {
      x.children.forEach((y) => {
        dt.push(y);
      });
    });
    //Check xem list children trong session trùng với list question thì xóa bên list question
    rsQuestion.forEach((x, index) => {
      dt.forEach((y) => {
        if (x.recID == y.recID) rsQuestion.splice(index, 1);
      });
    });
    var obj = {
      dataSession: rsSession,
      dataQuestion: rsQuestion,
    };
    return obj;
  }

  public getUniqueListBy(arr: any, key: any) {
    return [
      ...new Map(arr.map((item: any) => [item[key], item])).values(),
    ] as any;
  }

  getFilesByObjectType(objectType) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByObjectTypeAsync',
      objectType
    );
  }

  getFilesByObjectTypeRefer(objectType: any,referType:any) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByObjectTypeReferAsync',
      [objectType,referType]
    );
  }

  deleteFilesByContainRefer(referType:any) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteFilesByContainReferAsync',
      referType
    );
  }
  onSave(transID, data, isModeAdd) {
    return this.api.execSv(
      'SV',
      'ERM.Business.SV',
      'QuestionsBusiness',
      'SaveAsync',
      [transID, data, isModeAdd]
    );
  }

  onSaveFile(dataUpload) {
    return this.api.execSv(
      'DM',
      'DM',
      'FileBussiness',
      'CopyAsync',
      dataUpload
    );
  }

  shareLink(data:any,post=false,funcID:any,link:any) {
    return this.api.execSv(
      'SV',
      'SV',
      'SurveysBusiness',
      'ShareLinkAsync',
      [data,post,funcID,link]
    );
  }
  onSaveListFile(lstDataUpload) {
    return this.api.execSv('DM', 'DM', 'FileBussiness', 'CopyListFileAsync', [
      lstDataUpload,
    ]);
  }

  getDataSurveys(data:any) {
    return this.api.execSv('SV', 'SV', 'SurveysBusiness', 'GetAsync', [
      data
    ]);
  }
  getDataQuestion(recID:any) {
    return this.api.execSv("SV",'ERM.Business.SV', 'QuestionsBusiness', 'GetByRecIDAsync', recID);
  }

  getDataRepondent(recID:any) {
    return this.api.execSv("SV",'ERM.Business.SV', 'RespondentsBusiness', 'GetByRecIDAsync', recID);
  }
  onSubmit(data) {
    return this.api.execSv(
      'SV',
      'SV',
      'RespondentsBusiness',
      'SaveAsync',
      [data, true]
    );
  }
  onUpdate(data)
  {
    return this.api.execSv(
      'SV',
      'SV',
      'RespondentsBusiness',
      'UpdateAsync',
      [data, true]
    );
  }
  filterSearchSuggest()
  {
    // return this.api.execSv(
    //   'SV',
    //   'SV',
    //   'RespondentsBusiness',
    //   'SaveAsync',
    //   [data, true]
    // );
  }
}
