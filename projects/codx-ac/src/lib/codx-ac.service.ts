import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  CacheService,
  FormModel,
  NotificationsService,
} from 'codx-core';

@Injectable({
  providedIn: 'root',
})
export class CodxAcService {
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

  setMemo(master: any, text: string, idx: number) {
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

  validateFormData(
    formGroup: FormGroup,
    gridViewSetup: any,
    irregularFields: string[] = []
  ): boolean {
    console.log(formGroup);
    console.log(gridViewSetup);

    const controls = formGroup.controls;
    let isValid: boolean = true;
    for (const propName in controls) {
      if (controls[propName].invalid) {
        const gvsPropName =
          irregularFields.find(
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

  toCamelCase(pascalCase: string): string {
    return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  }

  toPascalCase(camelCase: string): string {
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }
}
