import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ApiHttpService,
  TenantStore,
  CacheService,
  FormModel,
  NotificationsService,
  DataRequest,
} from 'codx-core';
import { BehaviorSubject, Observable, finalize, map, share } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CodxFdService {
  form = '';
  datafunction = null;
  type = '';
  listview: any;
  tableview: any;
  active = '';
  tenant: string;
  private title = new BehaviorSubject<any>(null);
  SetLayout = new BehaviorSubject<any>(null);
  private caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();
  constructor(
    private api: ApiHttpService,
    private router: Router,
    private tenantStore: TenantStore,
    private notificationsService: NotificationsService,
    private cache: CacheService,

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
    let fieldName = invalid[0]?.charAt(0).toUpperCase() + invalid[0]?.slice(1);
    if (fieldName) {
      if (gridViewSetup == null) {
        this.cache
          .gridViewSetup(formModel.formName, formModel.gridViewName)
          .subscribe((res) => {
            if (res) {
              if (fieldName == 'Buid') fieldName = 'BUID';
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
  }

  deleteFile(item, objectType) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteByObjectIDAsync',
      [item.recID, objectType, true]
    );
  }

  getSettings(formName: string) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'SettingsBusiness',
      'GetSettingByFormAsync',
      formName
    );
  }

  getSettingValues(formName: string) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'SettingValuesBusiness',
      'GetListSettingValuesAsync',
      formName
    );
  }

  getSettingValueByModule(FormName: string, TransType: string){
    return this.api.execSv<any>(
      'SYS',
      'ERM.Business.SYS',
      'SettingValuesBusiness',
      'GetByModuleAsync',
      [FormName, TransType]
    );
  }

  updateSettingValue(
    formName: string,
    transType: string,
    category: string,
    fieldName: string,
    fieldValue: string
  ) {
    return this.api.execSv<any>(
      'SYS',
      'SYS',
      'SettingValuesBusiness',
      'UpdateFieldAsync',
      [formName, transType, category, fieldName, fieldValue]
    );
  }

  getDataCbbx(gridModel, service) {
    return this.api.execSv<any>(
      service,
      'ERM.Business.Core',
      'DataBusiness',
      'LoadDataCbxAsync',
      gridModel
    );
  }

  getListPolicies(lstFieldNames: string[]) {
    return this.api.execSv(
      'FD',
      'FD',
      'PoliciesBusiness',
      'GetPoliciesByFieldsAsync',
      [lstFieldNames]
    );
  }

  updateActivePolicy(policyrecID) {
    return this.api.execSv(
      'FD',
      'FD',
      'PoliciesBusiness',
      'AddUpdateActiveAsync',
      [policyrecID]
    );
  }

  getFavorite(entity, entityType, defaultFavID, hasNotAllFav) {
    return this.api.execSv(
      'SYS',
      'SYS',
      'SearchFavoriteBusiness',
      'GetFavoriteAsync',
      [entity, entityType, defaultFavID, hasNotAllFav]
    );
  }

  getListCard(model: DataRequest) {
    return this.api.execSv('FD', 'FD', 'CardsBusiness', 'GetListCardAsync', [
      model,
    ]);
  }

  countCardByCardType(
    predicatesReceive: string,
    dataValueReceive: string,
    predicatesSend: string,
    dataValueSend: string
  ) {
    return this.api.execSv(
      'FD',
      'FD',
      'CardsBusiness',
      'CountCardByCardTypeAsync',
      [predicatesReceive, dataValueReceive, predicatesSend, dataValueSend]
    );
  }

  addComment(recID: string, comment: string) {
    return this.api.execSv(
      'FD',
      'FD',
      'CardsBusiness',
      'AddCommentAsync',
      [recID, comment]
    );
  }

  loadData(
    paras:any,
    keyRoot:any,
    service:any,
    assemly:any,
    className:any,
    method:any
  ): Observable<any>
  {
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
    let observable = this.api.execSv(service,assemly,className,method,paras)
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
  loadGridView(formName:any, gridViewName:any): Observable<any>
  {
    let paras = [formName,gridViewName];
    let keyRoot = formName + gridViewName;
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
    let observable = this.cache.gridViewSetup(formName,gridViewName)
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
  loadFunctionList(funcID:any): Observable<any>
  {
    let paras = ["FuncID",funcID];
    let keyRoot = "FuncID" + funcID;
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
    let observable = this.cache.functionList(funcID)
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
  updateCache(keyRoot:any , key:any , data:any)
  {
    if (this.caches.has(keyRoot))
    {
      let c = this.caches.get(keyRoot);
      c?.set(key, data);
    }
  }

  sendGift(
    recID: string, 
    status: string, 
    comment: string, 
    funcID: string
  ) {
    return this.api.execSv(
      'FD',
      'FD',
      'GiftTransBusiness',
      'DeliverGiftTransAsync',
      [recID, status, comment, funcID]
    );
  }

  activeWallet(userID: string) {
    return this.api.execSv(
      'FD',
      'FD',
      'WalletsBusiness',
      'ActiveWalletAsync',
      [userID]
    );
  }

  getListPolicyByPredicate(predicate: string, dataValue: string) {
    return this.api.execSv(
      'FD',
      'FD',
      'PoliciesBusiness',
      'GetListPolicyByPredicateAsync',
      [predicate, dataValue]
    );
  }

  // refreshType = (1: Coins, 2: coCoins, 3: kudos)
  refreshWallet(refreshType: string, policyID: string, userID: string) {
    return this.api.execSv(
      'FD',
      'FD',
      'PoliciesBusiness',
      'RefreshWalletAsync',
      [refreshType, policyID, userID])
  }

  getEmployeesByUserID(data) {
    return this.api.execSv(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetEmpByUserIDAsync',
      data
    );
  }

  checkValidAdd(cardtype: string) {
    return this.api.execSv(
      'FD',
      'FD',
      'CardsBusiness',
      'CheckAvalidAdd',
      ['FDParameters', cardtype]
    );
  }

  CheckAvalidReceiver(cardtype: string, receiverID: string) {
    return this.api.execSv(
      'FD',
      'FD',
      'CardsBusiness',
      'CheckAvalidReceiver',
      ['FDParameters', cardtype, receiverID]
    );
  }

  LoadDataRangeLine(){
    return this.api.execSv(
      'BS',
      'ERM.Business.BS',
      'RangeLinesBusiness',
      'GetDataByPredicateAsync',
      [
        {
          "pageLoading": true,
          "page": 1,
          "pageSize": 20,
          "formName": "FEDRangeLines",
          "gridViewName": "grvFEDRangeLines",
          "entityName": "BS_RangeLines",
          "predicate": "RangeID=@0",
          "dataValue": "KUDOS",
          "funcID": "FDS04",
          "entityPermission": "BS_FEDRangeLines",
          "treeField": "",
          "treeIDValue": "",
          "predicates": "",
          "dataValues": "",
          "entryMode": "",
          "selector": "",
          "sortColumns": "BreakValue",
          "sortDirections": "asc"
        }
      ]
    );
  }

  countFavorite(
    favsID: string, 
    funcID: string, 
    FormName: string, 
    GridViewName: string,
    EntityName: string,
    EntityPermission: string,
  ) {
    return this.api.execSv(
      'FD', 
      'FD', 
      'CardsBusiness',
      'CountFavoriteAsync',
      [
        favsID, funcID, FormName, GridViewName, 
        EntityName, EntityPermission
      ]
    );
  }

  getReportUserByEmployeeID(employeeID: string) {
    return this.api.execSv(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetReportUserByEmployeeIDAsync',
      [employeeID]
    );
  }

  getGiftTranByRecID(recID: string) {
    return this.api.execSv(
      'FD',
      'FD',
      'GiftTransBusiness',
      'GetGiftTranInforAsync',
      [recID]
    );
  }
}
