import { Injectable, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  DataRequest,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Reason } from './models/Reason.model';

@Injectable({
  providedIn: 'root',
})
export class CodxAcService {
  childMenuClick = new BehaviorSubject<any>(null);
  stores = new Map<string, any>();
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService
  ) {
    this.getCache();
  }

  getCache() {
    this.api
      .exec('AC', 'CommonBusiness', 'GetCacheAccountAsync', '')
      .subscribe((res) => {
        if (res) this.stores.set('account', res);
      });

    this.api
      .exec('AC', 'CommonBusiness', 'GetCacheSubObjectAsync', '')
      .subscribe((res) => {
        if (res) this.stores.set('subobject', res);
      });
  }

  getCacheValue(storeName: string, value: string) {
    let v = '';
    if (this.stores.has(storeName)) v = this.stores.get(storeName)[value];
    return v;
  }

  getGridViewSetup(formName: any, gridViewName: any) {
    return this.cache.gridViewSetup(formName, gridViewName);
  }

  setCacheFormModel(formModel: FormModel) {
    this.cache.gridView(formModel.gridViewName).subscribe((gridView) => {
      this.cache.setGridView(formModel.gridViewName, gridView);
      this.cache
        .gridViewSetup(formModel.formName, formModel.gridViewName)
        .subscribe((gridViewSetup) => {
          this.cache.setGridViewSetup(
            formModel.formName,
            formModel.gridViewName,
            gridViewSetup
          );
        });
    });
  }

  loadData(assemblyName: any, className: any, methodName: any, data: any) {
    return this.api.exec(assemblyName, className, methodName, data);
  }

  execApi(
    assemblyName: any,
    className: any,
    methodName: any,
    data: any
  ): Observable<any[]> {
    return this.api.exec(assemblyName, className, methodName, data);
  }

  addData(assemblyName: any, className: any, methodName: any, data: any) {
    return this.api.exec(assemblyName, className, methodName, data);
  }

  checkDataContactAddress(
    assemblyName: any,
    className: any,
    methodName: any,
    data: any
  ) {
    return this.api.exec(assemblyName, className, methodName, data);
  }

  setMemo2(master: any, text: string, idx: number, transactiontext: any) {
    let newMemo = '';

    let aMemo = [];

    if (master.memo) aMemo = master.memo.split('-');
    if (aMemo.length == 0) return text;

    aMemo[idx] = text;

    for (let i = 0; i < aMemo.length; i++) {
      if (i == aMemo.length - 1) newMemo += aMemo[i].trim();
      else newMemo += aMemo[i].trim() + ' - ';
    }
    return newMemo;
  }

  setMemo(master: any, transactiontext: Array<Reason>) {
    let newMemo = '';
    let sortTrans = transactiontext.sort((a, b) => a.index - b.index);
    for (let i = 0; i < sortTrans.length; i++) {
      if (sortTrans[i].value != null) {
      }
      if (i == sortTrans.length - 1 && sortTrans[i].value != null) {
        newMemo += sortTrans[i].value;
      } else {
        if (sortTrans[i].value != null) {
          newMemo += sortTrans[i].value + ' - ';
        }
      }
    }
    return newMemo;
  }

  /** @param irregularGvsPropNames Use irregularGvsPropNames in case unable to transform some data prop names to gvs prop names respectively. */
  validateFormData(
    formGroup: FormGroup,
    gridViewSetup: any,
    irregularGvsPropNames: string[] = [],
    ignoredFields: string[] = []
  ): boolean {
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());

    let invalidFields: string[] = [];
    const controls = formGroup.controls;
    for (const propName in controls) {
      if (ignoredFields.includes(propName.toLowerCase())) {
        continue;
      }

      if (controls[propName].invalid) {
        const gvsPropName =
          irregularGvsPropNames.find(
            (i) => i.toLowerCase() === propName.toLowerCase()
          ) ?? this.toPascalCase(propName);

        invalidFields.push(gvsPropName);
      }
    }

    if (invalidFields.length == 0) {
      return true;
    }

    this.notiService.notify(
      invalidFields
        .map(
          (f) =>
            `${invalidFields.length > 1 ? '•' : ''} "${
              gridViewSetup[f].headerText
            }" không được phép bỏ trống`
        )
        .join('<br>'),
      '2'
    );

    // set the focus to the first invalid input
    invalidFields = invalidFields.map((f) => f.toLowerCase());
    const inputEls: Element[] = Array.from(
      document.querySelectorAll('codx-input')
    );
    for (const el of inputEls) {
      if (invalidFields.includes(el.getAttribute('field')?.toLowerCase())) {
        setTimeout(() => {
          el.querySelector('input').focus();
        }, 100);

        break;
      }
    }

    return false;
  }

  /** @param irregularDataPropNames Use irregularDataPropNames in case unable to transform some gvs prop names to data prop names respectively. */
  validateFormDataUsingGvs(
    gridViewSetup: any,
    data: any,
    irregularDataPropNames: string[] = [],
    ignoredFields: string[] = []
  ): boolean {
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());

    let isValid = true;
    for (const propName in gridViewSetup) {
      if (gridViewSetup[propName].isRequire) {
        if (ignoredFields.includes(propName.toLowerCase())) {
          continue;
        }

        const dataPropName =
          irregularDataPropNames.find(
            (i) => i.toLowerCase() === propName.toLowerCase()
          ) ?? this.toCamelCase(propName);

        if (
          gridViewSetup[propName].dataType === 'String' &&
          !data[dataPropName]?.trim()
        ) {
          //console.log('invalid', { propName });

          this.notiService.notifyCode(
            'SYS009',
            0,
            `"${gridViewSetup[propName]?.headerText}"`
          );

          isValid = false;
        }
      }
    }

    return isValid;
  }

  /** @example StudentId => studentId */
  toCamelCase(pascalCase: string): string {
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }

  /** @example studentId => StudentId */
  toPascalCase(camelCase: string): string {
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  loadComboboxData(
    comboboxName: string,
    service: string,
    predicates?: string,
    dataValues?: string
  ): Observable<any[]> {
    const dataRequest = new DataRequest();
    dataRequest.comboboxName = comboboxName;
    dataRequest.pageLoading = false;
    dataRequest.predicates = predicates ?? '';
    dataRequest.dataValues = dataValues ?? '';
    return this.api
      .execSv(
        service,
        'ERM.Business.Core',
        'DataBusiness',
        'LoadDataCbxAsync',
        [dataRequest]
      )
      .pipe(
        //tap((p) => console.log(p)),
        map((p) => JSON.parse(p[0]))
        //tap((p) => console.log(p))
      );
  }

  loadDataAsync(service: string, options: DataRequest): Observable<any[]> {
    return this.api
      .execSv(service, 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r[0]));
  }

  createCrudService(
    injector: Injector,
    formModel: FormModel,
    service: string
  ): CRUDService {
    const requestData = new DataRequest();
    requestData.entityName = formModel.entityName;
    requestData.entityPermission = formModel.entityPer;
    requestData.formName = formModel.formName;
    requestData.gridViewName = formModel.gridViewName;
    requestData.pageLoading = false;

    const crudService = new CRUDService(injector);
    crudService.service = service;
    crudService.request = requestData;

    return crudService;
  }

  getDefaultNameFromMoreFunctions(
    formName: string,
    gridViewName: string,
    functionId: string
  ): Observable<string> {
    return this.cache
      .moreFunction(formName, gridViewName)
      .pipe(
        map(
          (data) => data.find((m) => m.functionID === functionId)?.defaultName
        )
      );
  }

  /** @param objectType entityName */
  deleteFile(objectId: string, objectType: string) {
    return this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'DeleteByObjectIDAsync',
        [objectId, objectType, true]
      )
      .subscribe();
  }

  getACParameters(category: string = '1'): Observable<any> {
    return this.cache.viewSettingValues('ACParameters').pipe(
      map((arr: any[]) => arr.find((a) => a.category === category)),
      map((data) => JSON.parse(data.dataValue))
    );
  }

  getMorefunction(formName, gridviewName) {
    return this.cache.moreFunction(formName, gridviewName);
  }

  checkExistAccount(data: any): boolean {
    let result: boolean = true;
    this.api
      .exec('AC', 'CashPaymentsBusiness', 'CheckExistAccount', [data])
      .subscribe((res: any) => {
        result = res;
      });
    return result;
  }

  getCategoryByEntityName(entityName: string) {
    return this.api.execSv(
      'ES',
      'ERM.Business.ES',
      'CategoriesBusiness',
      'GetCategoryByEntityNameAsync',
      [entityName]
    );
  }

  setPopupSize(dialog: any, width: any, height: any) {
    dialog.dialog.properties.height = height;
    dialog.dialog.properties.width = width;
  }
}
