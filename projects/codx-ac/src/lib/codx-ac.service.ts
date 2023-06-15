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
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Reason } from './models/Reason.model';

@Injectable({
  providedIn: 'root',
})
export class CodxAcService {
  childMenuClick = new BehaviorSubject<any>(null);
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService
  ) {}
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
        newMemo += sortTrans[i].value + ' - ';
      }
      // if (i == sortTrans.length - 1 && sortTrans[i].value != null){
      //   newMemo += sortTrans[i].value;
      // }else{
      //   if (sortTrans[i].value != null) {
          
      //   }
      // }
      
    }
    newMemo.split('-');
    return newMemo;
  }

  /** @param irregularGvsPropNames Use irregularGvsPropNames in case unable to transform some data prop names to gvs prop names respectively. */
  validateFormData(
    formGroup: FormGroup,
    gridViewSetup: any,
    irregularGvsPropNames: string[] = [],
    ignoredFields: string[] = []
  ): boolean {
    console.log(formGroup);
    console.log(gridViewSetup);

    ignoredFields = ignoredFields.map((i) => i.toLowerCase());

    const controls = formGroup.controls;
    let isValid: boolean = true;
    for (const propName in controls) {
      if (ignoredFields.includes(propName.toLowerCase())) {
        continue;
      }

      if (controls[propName].invalid) {
        console.log('invalid', { propName });

        const gvsPropName =
          irregularGvsPropNames.find(
            (i) => i.toLowerCase() === propName.toLowerCase()
          ) ?? this.toPascalCase(propName);

        this.notiService.notifyCode(
          'SYS009',
          0,
          `"${gridViewSetup[gvsPropName]?.headerText}"`
        );

        isValid = false;
      }
    }

    return isValid;
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
          console.log('invalid', { propName });

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

  /** Same as validateFormDataUsingGvs but show only the first error message and return its field name respectively. */
  validateFormDataUsingGvs2(
    gridViewSetup: any,
    data: any,
    irregularDataPropNames: string[] = [],
    ignoredFields: string[] = []
  ): [isValid: boolean, invalidFieldName: string] {
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());

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
          console.log('invalid', { propName });

          this.notiService.notifyCode(
            'SYS009',
            0,
            `"${gridViewSetup[propName]?.headerText}"`
          );

          return [false, dataPropName];
        }
      }
    }

    return [true, ''];
  }

  /** @example StudentId => studentId */
  toCamelCase(pascalCase: string): string {
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }

  /** @example studentId => StudentId */
  toPascalCase(camelCase: string): string {
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  loadComboboxData(comboboxName: string, service: string): Observable<any[]> {
    const dataRequest = new DataRequest();
    dataRequest.comboboxName = comboboxName;
    dataRequest.pageLoading = false;
    return this.api
      .execSv(
        service,
        'ERM.Business.Core',
        'DataBusiness',
        'LoadDataCbxAsync',
        [dataRequest]
      )
      .pipe(
        tap((p) => console.log(p)),
        map((p) => JSON.parse(p[0]))
      );
  }

  loadDataAsync(service: string, options: DataRequest): Observable<any[]> {
    return this.api
      .execSv(service, 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(
        tap((r) => console.log(r)),
        map((r) => r[0])
      );
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
      .subscribe((res) => console.log('deleteFile', res));
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
  release(
    recID: string,
    processID: string,
    entityName: string,
    funcID: string,
    title: string
  ) {
    return this.api.execSv<any>(
      'AC',
      'ERM.Business.Core',
      'DataBusiness',
      'ReleaseAsync',
      [recID, processID, entityName, funcID, title]
    );
  }
  setPopupSize(dialog: any, width: any, height: any) {
    dialog.dialog.properties.height = width;
    dialog.dialog.properties.width = height;
  }
}
