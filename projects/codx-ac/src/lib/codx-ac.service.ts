import { E } from '@angular/cdk/keycodes';
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

export const fmPurchaseInvoicesLines: FormModel = {
  entityName: 'AC_PurchaseInvoicesLines',
  formName: 'PurchaseInvoicesLines',
  gridViewName: 'grvPurchaseInvoicesLines',
  entityPer: 'AC_PurchaseInvoicesLines',
};

export const fmVATInvoices: FormModel = {
  entityName: 'AC_VATInvoices',
  formName: 'VATInvoices',
  gridViewName: 'grvVATInvoices',
  entityPer: 'AC_VATInvoices',
};

export const fmCashPaymentsLines: FormModel = {
  formName: 'CashPaymentsLines',
  gridViewName: 'grvCashPaymentsLines',
  entityName: 'AC_CashPaymentsLines',
  entityPer: 'AC_CashPaymentsLines',
};

export const fmCashPaymentsLinesOneAccount: FormModel = {
  formName: 'CashPaymentsLinesOneAccount',
  gridViewName: 'grvCashPaymentsLinesOneAccount',
  entityName: 'AC_CashPaymentsLines',
  entityPer: 'AC_CashPaymentsLines',
};

export const fmAdvancePayment: FormModel = {
  formName: 'AdvancedPaymentLines',
  gridViewName: 'grvAdvancedPaymentLines',
  entityName: 'AC_AdvancedPaymentLines',
  entityPer: 'AC_AdvancedPaymentLines',
};

export const fmPaymentOrder: FormModel = {
  formName: 'PaymentOrder',
  gridViewName: 'grvPaymentOrder',
  entityName: 'AC_PaymentOrder',
  entityPer: 'AC_PaymentOrder',
};

export const fmAcctTrans: FormModel = {
  formName: 'AcctTrans',
  gridViewName: 'grvAcctTrans',
  entityName: 'AC_AcctTrans',
  entityPer: 'AC_AcctTrans',
};

export const fmSettledInvoices: FormModel = {
  formName: 'SettledInvoices',
  gridViewName: 'grvSettledInvoices',
  entityName: 'AC_SettledInvoices',
  entityPer: 'AC_SettledInvoices',
};

export const fmSalesInvoicesLines: FormModel = {
  entityName: 'AC_SalesInvoicesLines',
  formName: 'SalesInvoicesLines',
  gridViewName: 'grvSalesInvoicesLines',
  entityPer: 'AC_SalesInvoicesLines',
};

export const fmVouchersLines: FormModel = {
  entityName: 'IV_VouchersLines',
  formName: 'VouchersLinesReceipts',
  gridViewName: 'grvVouchersLinesReceipts',
  entityPer: 'IV_VouchersLines',
};

export const fmIssueVouchersLines: FormModel = {
  entityName: 'IV_VouchersLines',
  formName: 'VouchersLinesIssues',
  gridViewName: 'grvVouchersLinesIssues',
  entityPer: 'IV_VouchersLines',
};

export const fmGeneralJournalsLines: FormModel = {
  entityName: 'AC_GeneralJournalsLines',
  formName: 'GeneralJournalsLines',
  gridViewName: 'grvGeneralJournalsLines',
  entityPer: 'AC_GeneralJournalsLines',
};

export const fmGeneralJournalsLinesOne: FormModel = {
  entityName: 'AC_GeneralJournalsLines',
  formName: 'GeneralJournalsLinesOneAccount',
  gridViewName: 'grvCashPaymentsLinesOneAccount',
  entityPer: 'AC_GeneralJournalsLines',
};

export enum MorfuncCash {
  GhiSoPC = 'ACT041003',
  GhiSoUPC = 'ACT042905',
  GuiDuyetPC = 'ACT041002',
  GuiDuyetUPC = 'ACT042903',
  HuyDuyetPC = 'ACT041004',
  HuyDuyetUPC = 'ACT042904',
  KhoiPhucPC = 'ACT041008',
  KhoiPhucUPC = 'ACT042906',
  ChuyenTienDienTu = 'ACT042901',
  InPC = 'ACT041010',
  InUPC = 'ACT042907',
  KiemTraHopLePC = 'ACT041009',
  KiemTraHopLeUPC = 'ACT042902',
}

export enum MorfuncCashReceipt {
  GhiSo = 'ACT040106',
  GuiDuyet = 'ACT040104',
  HuyDuyet = 'ACT040105',
  KhoiPhuc = 'ACT040107',
  In = 'ACT040108',
  KiemTraHopLe = 'ACT040103',
}

export enum MorfuncPur {
  GhiSo = 'ACT060103',
  GuiDuyet = 'ACT060102',
  HuyDuyet = 'ACT060104',
  KhoiPhuc = 'ACT060105',
  In = 'ACT060107',
  KiemTraHopLe = 'ACT060106',
}

export enum MorfuncSale {
  GhiSo = 'ACT060506',
  GuiDuyet = 'ACT060504',
  HuyDuyet = 'ACT060505',
  KhoiPhuc = 'ACT060507',
  In = 'ACT060508',
  KiemTraHopLe = 'ACT060503',
}

export enum MorfuncVoucher {
  GhiSo = 'ACT070806',
  GuiDuyet = 'ACT070804',
  HuyDuyet = 'ACT070805',
  KhoiPhuc = 'ACT070807',
  In = 'ACT070808',
  KiemTraHopLe = 'ACT070803',
}

export enum MorfuncIssueVoucher {
  GhiSo = 'ACT071406',
  GuiDuyet = 'ACT071404',
  HuyDuyet = 'ACT071405',
  KhoiPhuc = 'ACT071407',
  In = 'ACT071408',
  KiemTraHopLe = 'ACT071403',
}

@Injectable({
  providedIn: 'root',
})

export class CodxAcService {
  childMenuClick = new BehaviorSubject<any>(null);
  changeToolBar = new BehaviorSubject<string>(null);
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
      .exec('AC', 'ACBusiness', 'GetCacheAccountAsync', '')
      .subscribe((res) => {
        if (res) this.stores.set('account', res);
      });

    this.api
      .exec('AC', 'ACBusiness', 'GetCacheSubObjectAsync', '')
      .subscribe((res) => {
        if (res) this.stores.set('subobject', res);
      });
  }

  getCacheValue(storeName: string, value: string) {
    let v = '';
    if (this.stores.has(storeName)) v = this.stores.get(storeName)[value];
    return v;
  }

  clearCache(storeName: string){
    switch(storeName){
      case 'account':
        this.api
          .exec('AC', 'ACBusiness', 'GetCacheAccountAsync', '')
          .subscribe((res) => {
            if (res) this.stores.set('account', res);
          });
        break;
    }
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

  setMemo(master: any, transactiontext: any) {
    // let newMemo = '';
    // let sortTrans = transactiontext.sort((a, b) => a.index - b.index);
    // for (let i = 0; i < sortTrans.length; i++) {
    //   if (sortTrans[i].value != null) {
    //   }
    //   if (i == sortTrans.length - 1 && sortTrans[i].value != null) {
    //     newMemo += sortTrans[i].value;
    //   } else {
    //     if (sortTrans[i].value != null) {
    //       newMemo += sortTrans[i].value + ' - ';
    //     }
    //   }
    // }
    // return newMemo;
  }

  /** Check if rerquired fields are valid */
  isFormDataValid(
    formGroup: FormGroup,
    gridViewSetup: any,
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
        const gvsPropName: string = Object.keys(gridViewSetup).find(
          (p: string) => p.toLowerCase() === propName.toLowerCase()
        );
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

  loadComboboxData$(
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

  loadData$(service: string, options: DataRequest): Observable<any[]> {
    return this.api
      .execSv(service, 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r?.[0] ?? []));
  }

  createCRUDService(
    injector: Injector,
    formModel: FormModel,
    service?: string,
    gridView?: any
  ): CRUDService {
    const crudService = new CRUDService(injector);
    if (service) {
      crudService.service = service;
    }
    if (gridView) {
      crudService.gridView = gridView;
    }
    crudService.request.entityName = formModel.entityName;
    crudService.request.entityPermission = formModel.entityPer;
    crudService.request.formName = formModel.formName;
    crudService.request.gridViewName = formModel.gridViewName;
    return crudService;
  }

  getDefaultNameFromMoreFunctions$(
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
  deleteFile(objectId: string, objectType: string): void {
    this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'DeleteByObjectIDAsync',
        [objectId, objectType, true]
      )
      .subscribe();
  }

  getACParameters$(category: string = '1'): Observable<any> {
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

  //Call bankhub
  call_bank(methodName: string, data: any) {
    let token = localStorage.getItem('bh_tk');
    if (token) data.token = token;
    return this.api.execSv(
      'AC',
      'Core',
      'CMBusiness',
      'SendRequestBankHubAsync',
      [methodName, JSON.stringify(data), token]
    );
  }

  changeMFCashPayment(event, data, type:any = '',journal,formModel){
    let array = [MorfuncCash.GhiSoPC, MorfuncCash.GhiSoUPC, MorfuncCash.GuiDuyetPC, MorfuncCash.GuiDuyetUPC, MorfuncCash.HuyDuyetPC, MorfuncCash.HuyDuyetUPC
      , MorfuncCash.KhoiPhucPC, MorfuncCash.KhoiPhucUPC, MorfuncCash.ChuyenTienDienTu, MorfuncCash.InPC, MorfuncCash.InUPC, MorfuncCash.KiemTraHopLePC, MorfuncCash.KiemTraHopLeUPC,
      'SYS02','SYS03','SYS04'];
    let arrBookmark = [];
    event.forEach(element => {
      if (!(array.includes(element.functionID))) {
        element.disabled = true;
      }else{
        if (type === 'viewgrid') {
          element.isbookmark = false;
        }
        if (type === 'viewdetail') {
          if (Object.values(MorfuncCash).includes(element.functionID)) {
            element.isbookmark = true;
          }
          else{
            element.isbookmark = false;
          }
        }
        if (element.functionID != 'SYS02' && element.functionID != 'SYS03' && element.functionID != 'SYS04') {
          let item = event.find(x => x.functionID.toLowerCase() == element.functionID.toLowerCase());
          if(item != null) arrBookmark.push(item);
        }
      }
    });
    
    switch (data?.status) {
      case '1':
        if (journal.approvalControl == '0') {
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncCash.GhiSoPC || element.functionID == MorfuncCash.GhiSoUPC || element.functionID == MorfuncCash.InPC 
              || element.functionID == MorfuncCash.InUPC ||
              (element.functionID == MorfuncCash.ChuyenTienDienTu && formModel.funcID == 'ACT0429')) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }else{
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncCash.GuiDuyetPC || element.functionID == MorfuncCash.GuiDuyetUPC || element.functionID == MorfuncCash.InPC 
              || element.functionID == MorfuncCash.InUPC) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }
        break;
      case '3':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncCash.HuyDuyetPC || element.functionID == MorfuncCash.HuyDuyetUPC || element.functionID == MorfuncCash.InPC 
            || element.functionID == MorfuncCash.InUPC) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '5':
      case '9':
        arrBookmark.forEach(element => {
          if (element.functionID == MorfuncCash.GhiSoPC || element.functionID == MorfuncCash.GhiSoUPC || element.functionID == MorfuncCash.InPC 
            || element.functionID == MorfuncCash.InUPC ||
            (element.functionID == MorfuncCash.ChuyenTienDienTu && formModel.funcID == 'ACT0429')) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        });
        break;
      case '6':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncCash.KhoiPhucPC || element.functionID == MorfuncCash.KhoiPhucUPC || element.functionID == MorfuncCash.InPC 
            || element.functionID == MorfuncCash.InUPC) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '2':
      case '7':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncCash.KiemTraHopLePC || element.functionID == MorfuncCash.KiemTraHopLeUPC || element.functionID == MorfuncCash.InPC 
            || element.functionID == MorfuncCash.InUPC) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '8':
      case '11':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncCash.InUPC && formModel.funcID == 'ACT0429') {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '10':
        arrBookmark.forEach((element) => {
          if ((element.functionID == MorfuncCash.GhiSoUPC || element.functionID == MorfuncCash.InUPC) && formModel.funcID == 'ACT0429') {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      default:
        arrBookmark.forEach((element) => {
          element.disabled = true;
        })
        break;
    }
  }

  changeMFVoucher(event, data, type:any = '',journal,formModel){
    let array = [MorfuncVoucher.GhiSo, MorfuncVoucher.GuiDuyet, MorfuncVoucher.HuyDuyet,MorfuncVoucher.KhoiPhuc, MorfuncVoucher.In, MorfuncVoucher.KiemTraHopLe,
      'SYS02','SYS03','SYS04'];
    let arrBookmark = [];
    event.forEach(element => {
      if (!(array.includes(element.functionID))) {
        element.disabled = true;
      }else{
        if (type === 'viewgrid') {
          element.isbookmark = false;
        }
        if (type === 'viewdetail') {
          if (Object.values(MorfuncVoucher).includes(element.functionID)) {
            element.isbookmark = true;
          }
          else{
            element.isbookmark = false;
          }
        }
        if (element.functionID != 'SYS02' && element.functionID != 'SYS03' && element.functionID != 'SYS04') {
          let item = event.find(x => x.functionID.toLowerCase() == element.functionID.toLowerCase());
          if(item != null) arrBookmark.push(item);
        }
      }
    });
    
    switch (data?.status) {
      case '1':
      case '5':
      case '9':
        if (journal.approvalControl == '0') {
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncVoucher.GhiSo || MorfuncVoucher.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }else{
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncVoucher.GuiDuyet || element.functionID == MorfuncVoucher.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }
        break;
      case '3':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncVoucher.HuyDuyet ||element.functionID == MorfuncVoucher.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '6':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncVoucher.KhoiPhuc || element.functionID == MorfuncVoucher.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '2':
      case '7':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncVoucher.KiemTraHopLe || element.functionID == MorfuncVoucher.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      default:
        arrBookmark.forEach((element) => {
          element.disabled = true;
        })
        break;
    }
  }

  changeMFCashReceipt(event, data, type:any = '',journal,formModel){
    let array = [MorfuncCashReceipt.GhiSo, MorfuncCashReceipt.GuiDuyet, MorfuncCashReceipt.HuyDuyet,MorfuncCashReceipt.KhoiPhuc, MorfuncCashReceipt.In, MorfuncCashReceipt.KiemTraHopLe,
      'SYS02','SYS03','SYS04'];
    let arrBookmark = [];
    event.forEach(element => {
      if (!(array.includes(element.functionID))) {
        element.disabled = true;
      }else{
        if (type === 'viewgrid') {
          element.isbookmark = false;
        }
        if (type === 'viewdetail') {
          if (Object.values(MorfuncCashReceipt).includes(element.functionID)) {
            element.isbookmark = true;
          }
          else{
            element.isbookmark = false;
          }
        }
        if (element.functionID != 'SYS02' && element.functionID != 'SYS03' && element.functionID != 'SYS04') {
          let item = event.find(x => x.functionID.toLowerCase() == element.functionID.toLowerCase());
          if(item != null) arrBookmark.push(item);
        }
      }
    });
    
    switch (data?.status) {
      case '1':
      case '5':
      case '9':
        if (journal.approvalControl == '0') {
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncCashReceipt.GhiSo || MorfuncCashReceipt.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }else{
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncCashReceipt.GuiDuyet || element.functionID == MorfuncCashReceipt.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }
        break;
      case '3':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncCashReceipt.HuyDuyet ||element.functionID == MorfuncCashReceipt.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '6':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncCashReceipt.KhoiPhuc || element.functionID == MorfuncCashReceipt.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '2':
      case '7':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncCashReceipt.KiemTraHopLe || element.functionID == MorfuncCashReceipt.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      default:
        arrBookmark.forEach((element) => {
          element.disabled = true;
        })
        break;
    }
  }

  changeMFPur(event, data, type:any = '',journal,formModel){
    let array = [MorfuncPur.GhiSo, MorfuncPur.GuiDuyet, MorfuncPur.HuyDuyet,MorfuncPur.KhoiPhuc, MorfuncPur.In, MorfuncPur.KiemTraHopLe,
      'SYS02','SYS03','SYS04'];
    let arrBookmark = [];
    event.forEach(element => {
      if (!(array.includes(element.functionID))) {
        element.disabled = true;
      }else{
        if (type === 'viewgrid') {
          element.isbookmark = false;
        }
        if (type === 'viewdetail') {
          if (Object.values(MorfuncPur).includes(element.functionID)) {
            element.isbookmark = true;
          }
          else{
            element.isbookmark = false;
          }
        }
        if (element.functionID != 'SYS02' && element.functionID != 'SYS03' && element.functionID != 'SYS04') {
          let item = event.find(x => x.functionID.toLowerCase() == element.functionID.toLowerCase());
          if(item != null) arrBookmark.push(item);
        }
      }
    });
    
    switch (data?.status) {
      case '1':
      case '5':
      case '9':
        if (journal.approvalControl == '0') {
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncPur.GhiSo || MorfuncPur.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }else{
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncPur.GuiDuyet || element.functionID == MorfuncPur.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }
        break;
      case '3':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncPur.HuyDuyet ||element.functionID == MorfuncPur.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '6':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncPur.KhoiPhuc || element.functionID == MorfuncPur.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '2':
      case '7':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncPur.KiemTraHopLe || element.functionID == MorfuncPur.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      default:
        arrBookmark.forEach((element) => {
          element.disabled = true;
        })
        break;
    }
  }

  changeMFSale(event, data, type:any = '',journal,formModel){
    let array = [MorfuncSale.GhiSo, MorfuncSale.GuiDuyet, MorfuncSale.HuyDuyet,MorfuncSale.KhoiPhuc, MorfuncSale.In, MorfuncSale.KiemTraHopLe,
      'SYS02','SYS03','SYS04'];
    let arrBookmark = [];
    event.forEach(element => {
      if (!(array.includes(element.functionID))) {
        element.disabled = true;
      }else{
        if (type === 'viewgrid') {
          element.isbookmark = false;
        }
        if (type === 'viewdetail') {
          if (Object.values(MorfuncSale).includes(element.functionID)) {
            element.isbookmark = true;
          }
          else{
            element.isbookmark = false;
          }
        }
        if (element.functionID != 'SYS02' && element.functionID != 'SYS03' && element.functionID != 'SYS04') {
          let item = event.find(x => x.functionID.toLowerCase() == element.functionID.toLowerCase());
          if(item != null) arrBookmark.push(item);
        }
      }
    });
    
    switch (data?.status) {
      case '1':
      case '5':
      case '9':
        if (journal.approvalControl == '0') {
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncSale.GhiSo || MorfuncSale.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }else{
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncSale.GuiDuyet || element.functionID == MorfuncSale.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }
        break;
      case '3':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncSale.HuyDuyet ||element.functionID == MorfuncSale.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '6':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncSale.KhoiPhuc || element.functionID == MorfuncSale.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '2':
      case '7':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncSale.KiemTraHopLe || element.functionID == MorfuncSale.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      default:
        arrBookmark.forEach((element) => {
          element.disabled = true;
        })
        break;
    }
  }

  changeMFIssueVoucher(event, data, type:any = '',journal,formModel){
    let array = [MorfuncIssueVoucher.GhiSo, MorfuncIssueVoucher.GuiDuyet, MorfuncIssueVoucher.HuyDuyet,MorfuncIssueVoucher.KhoiPhuc, MorfuncIssueVoucher.In, MorfuncIssueVoucher.KiemTraHopLe,
      'SYS02','SYS03','SYS04'];
    let arrBookmark = [];
    event.forEach(element => {
      if (!(array.includes(element.functionID))) {
        element.disabled = true;
      }else{
        if (type === 'viewgrid') {
          element.isbookmark = false;
        }
        if (type === 'viewdetail') {
          if (Object.values(MorfuncIssueVoucher).includes(element.functionID)) {
            element.isbookmark = true;
          }
          else{
            element.isbookmark = false;
          }
        }
        if (element.functionID != 'SYS02' && element.functionID != 'SYS03' && element.functionID != 'SYS04') {
          let item = event.find(x => x.functionID.toLowerCase() == element.functionID.toLowerCase());
          if(item != null) arrBookmark.push(item);
        }
      }
    });
    
    switch (data?.status) {
      case '1':
      case '5':
      case '9':
        if (journal.approvalControl == '0') {
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncIssueVoucher.GhiSo || MorfuncIssueVoucher.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }else{
          arrBookmark.forEach(element => {
            if (element.functionID == MorfuncIssueVoucher.GuiDuyet || element.functionID == MorfuncIssueVoucher.In) {
              element.disabled = false;
            }else{
              element.disabled = true;
            }
          });
        }
        break;
      case '3':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncIssueVoucher.HuyDuyet ||element.functionID == MorfuncIssueVoucher.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '6':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncIssueVoucher.KhoiPhuc || element.functionID == MorfuncIssueVoucher.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      case '2':
      case '7':
        arrBookmark.forEach((element) => {
          if (element.functionID == MorfuncIssueVoucher.KiemTraHopLe || element.functionID == MorfuncIssueVoucher.In) {
            element.disabled = false;
          }else{
            element.disabled = true;
          }
        })
        break;
      default:
        arrBookmark.forEach((element) => {
          element.disabled = true;
        })
        break;
    }
  }
}
