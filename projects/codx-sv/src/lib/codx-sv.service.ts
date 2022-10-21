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
import { BehaviorSubject } from 'rxjs';

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

  deleteFile(item, objectType) {
    return this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'DeleteByObjectIDAsync',
      [item.recID, objectType, true]
    );
  }
}
