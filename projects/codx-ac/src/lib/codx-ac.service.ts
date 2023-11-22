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

export const fmIssueTransfersLines: FormModel = {
  entityName: 'IV_TransfersLines',
  formName: 'TransfersIssueLines',
  gridViewName: 'grvTransfersIssueLines',
  entityPer: 'IV_TransfersLines',
};

export const fmReceiptTransfersLines: FormModel = {
  entityName: 'IV_TransfersLines',
  formName: 'TransfersReceiptLines',
  gridViewName: 'grvTransfersReceiptLines',
  entityPer: 'IV_TransfersLines',
};

export const fmPurchaseInvoicesAllocation: FormModel = {
  entityName: 'AC_PurchaseInvoices',
  formName: 'PurchaseInvoicesAllocation',
  gridViewName: 'grvPurchaseInvoicesAllocation',
  entityPer: 'AC_PurchaseInvoices',
};

export const fmPurchaseInvoicesLinesAllocation: FormModel = {
  entityName: 'AC_PurchaseInvoicesLines',
  formName: 'PurchaseInvoicesLinesAllocation',
  gridViewName: 'grvPurchaseInvoicesLinesAllocation',
  entityPer: 'AC_PurchaseInvoicesLines',
};

export enum MorfuncDefault {
  Sua = 'SYS03',
  Xoa = 'SYS02',
  SaoChep = 'SYS04',
  XuatDuLieu = 'SYS002'
}

export enum MorfuncCash {
  GhiSoPC = 'ACT041003',
  GhiSoUNC = 'ACT042905',
  GuiDuyetPC = 'ACT041002',
  GuiDuyetUNC = 'ACT042903',
  HuyDuyetPC = 'ACT041004',
  HuyDuyetUNC = 'ACT042904',
  KhoiPhucPC = 'ACT041008',
  KhoiPhucUNC = 'ACT042906',
  ChuyenTienDienTu = 'ACT042901',
  InPC = 'ACT041010',
  InUNC = 'ACT042907',
  KiemTraHopLePC = 'ACT041009',
  KiemTraHopLeUNC = 'ACT042902',
}

export enum MorfuncCashReceipt {
  GhiSoPT = 'ACT040106',
  GhiSoBC = 'ACT042804',
  GuiDuyetPT = 'ACT040104',
  GuiDuyetBC = 'ACT042802',
  HuyDuyetPT = 'ACT040105',
  HuyDuyetBC = 'ACT042803',
  KhoiPhucPT = 'ACT040107',
  KhoiPhucBC = 'ACT042805',
  InPT = 'ACT040108',
  InBC = 'ACT042806',
  KiemTraHopLePT = 'ACT040103',
  KiemTraHopLeBC = 'ACT042801',
}

export enum MorfuncPur {
  GhiSo = 'ACT060103',
  GuiDuyet = 'ACT060102',
  HuyDuyet = 'ACT060104',
  KhoiPhuc = 'ACT060105',
  In = 'ACT060107',
  KiemTraHopLe = 'ACT060106',
  PhanBoChiPhi = 'ACT060108'
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

export enum MorfuncGeneralJournals {
  GhiSo = 'ACT090104',
  GuiDuyet = 'ACT090102',
  HuyDuyet = 'ACT090103',
  KhoiPhuc = 'ACT090105',
  In = 'ACT090106',
  KiemTraHopLe = 'ACT090101',
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

  clearCache(storeName: string) {
    switch (storeName) {
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
            `${invalidFields.length > 1 ? '•' : ''} "${gridViewSetup[f].headerText
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

  changeMFCashPayment(event, data, type: any = '', journal, formModel) {
    event.forEach((element) => {
      //* thiet lap bookmark cac morefunc tai cac mode view
      if (type === 'viewgrid') element.isbookmark = false; //? viewgrid tất cả ko bookmark ra ngoài
      if (type === 'viewdetail') { //? viewdetail morefunc mac dinh ko bookmark ra ngoai
        if (Object.values(MorfuncDefault).includes(element.functionID)) {
          element.isbookmark = false;
        }else{
          element.isbookmark = true;
        }
      }
      //* an hien morefunc theo nghiep vu
      if(element.functionID == MorfuncDefault.Sua && data?.status != '1' && data?.status != '2') element.disabled = true; //? an morefunc chinh sua khi trang thai khac hop le,lm lại
      switch (data?.status) {
        case '1':
          if (!data?.validated) {
            if([MorfuncCash.KiemTraHopLePC,MorfuncCash.KiemTraHopLeUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID))
              element.disabled = false;
            else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          }else{
            if (journal.approvalControl == '0') {
              if([MorfuncCash.GhiSoPC,MorfuncCash.GhiSoUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID) 
              || (element.functionID == MorfuncCash.ChuyenTienDienTu && formModel.funcID == 'ACT0429'))
                  element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
            }else{
              if([MorfuncCash.GuiDuyetPC,MorfuncCash.GuiDuyetUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }
          }
          break;
        case '2':
          if([MorfuncCash.KiemTraHopLePC,MorfuncCash.KiemTraHopLeUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '3':
          if([MorfuncCash.HuyDuyetPC,MorfuncCash.HuyDuyetUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '5':
        case '9':
          if([MorfuncCash.GhiSoPC,MorfuncCash.GhiSoUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID)
          || (element.functionID == MorfuncCash.ChuyenTienDienTu && formModel.funcID == 'ACT0429'))
              element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          break;
        case '6':
          if([MorfuncCash.KhoiPhucPC,MorfuncCash.KhoiPhucUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '10':
          if([MorfuncCash.GhiSoUNC,MorfuncCash.InUNC].includes(element.functionID) && formModel.funcID == 'ACT0429')
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '8':
        case '11':
          if([MorfuncCash.InUNC].includes(element.functionID) && formModel.funcID == 'ACT0429')
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        default:
          element.disabled = true;
          break;
      }
    })
  }

  changeMFCashReceipt(event, data, type: any = '', journal, formModel) {
    event.forEach((element) => {
      //* thiet lap bookmark cac morefunc tai cac mode view
      if (type === 'viewgrid') element.isbookmark = false; //? viewgrid tất cả ko bookmark ra ngoài
      if (type === 'viewdetail') { //? viewdetail morefunc mac dinh ko bookmark ra ngoai
        if (Object.values(MorfuncDefault).includes(element.functionID)) {
          element.isbookmark = false;
        }else{
          element.isbookmark = true;
        }
      }
      //* an hien morefunc theo nghiep vu
      if(element.functionID == MorfuncDefault.Sua && data?.status != '1' && data?.status != '2') element.disabled = true; //? an morefunc chinh sua khi trang thai khac hop le,lm lại
      switch (data?.status) {
        case '1':
          if (!data?.validated) {
            if([MorfuncCashReceipt.KiemTraHopLePT,MorfuncCashReceipt.KiemTraHopLeBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(element.functionID))
              element.disabled = false;
            else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          }else{
            if (journal.approvalControl == '0') {
              if([MorfuncCashReceipt.GhiSoPT,MorfuncCashReceipt.GhiSoBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }else{
              if([MorfuncCashReceipt.GuiDuyetPT,MorfuncCashReceipt.GuiDuyetBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }
          }
          break;
        case '2':
          if([MorfuncCashReceipt.KiemTraHopLePT,MorfuncCashReceipt.KiemTraHopLeBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '3':
          if([MorfuncCashReceipt.HuyDuyetPT,MorfuncCashReceipt.HuyDuyetBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '5':
        case '9':
          if([MorfuncCashReceipt.GhiSoPT,MorfuncCashReceipt.GhiSoBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(element.functionID))
              element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          break;
        case '6':
          if([MorfuncCashReceipt.KhoiPhucPT,MorfuncCashReceipt.KhoiPhucBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        default:
          element.disabled = true;
          break;
      }
    })
  }

  changeMFGeneralJournal(event, data, type: any = '', journal, formModel) {
    event.forEach((element) => {
      //* thiet lap bookmark cac morefunc tai cac mode view
      if (type === 'viewgrid') element.isbookmark = false; //? viewgrid tất cả ko bookmark ra ngoài
      if (type === 'viewdetail') { //? viewdetail morefunc mac dinh ko bookmark ra ngoai
        if (Object.values(MorfuncDefault).includes(element.functionID)) {
          element.isbookmark = false;
        }else{
          element.isbookmark = true;
        }
      }
      //* an hien morefunc theo nghiep vu
      if(element.functionID == MorfuncDefault.Sua && data?.status != '1' && data?.status != '2') element.disabled = true; //? an morefunc chinh sua khi trang thai khac hop le,lm lại
      switch (data?.status) {
        case '1':
          if (!data?.validated) {
            if([MorfuncGeneralJournals.KiemTraHopLe,MorfuncGeneralJournals.In].includes(element.functionID))
              element.disabled = false;
            else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          }else{
            if (journal.approvalControl == '0') {
              if([MorfuncGeneralJournals.GhiSo,MorfuncGeneralJournals.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }else{
              if([MorfuncGeneralJournals.GuiDuyet,MorfuncGeneralJournals.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }
          }
          break;
        case '2':
          if([MorfuncGeneralJournals.KiemTraHopLe,MorfuncGeneralJournals.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '3':
          if([MorfuncGeneralJournals.HuyDuyet,MorfuncGeneralJournals.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '5':
        case '9':
          if([MorfuncGeneralJournals.GhiSo,MorfuncGeneralJournals.In].includes(element.functionID))
              element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          break;
        case '6':
          if([MorfuncGeneralJournals.KhoiPhuc,MorfuncGeneralJournals.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        default:
          element.disabled = true;
          break;
      }
    })
  }

  changeMFPur(event, data, type: any = '', journal, formModel) {
    event.forEach((element) => {
      //* thiet lap bookmark cac morefunc tai cac mode view
      if (type === 'viewgrid') element.isbookmark = false; //? viewgrid tất cả ko bookmark ra ngoài
      if (type === 'viewdetail') { //? viewdetail morefunc mac dinh ko bookmark ra ngoai
        if (Object.values(MorfuncDefault).includes(element.functionID)) {
          element.isbookmark = false;
        }else{
          element.isbookmark = true;
        }
      }
      //* an hien morefunc theo nghiep vu
      if(element.functionID == MorfuncDefault.Sua && data?.status != '1' && data?.status != '2') element.disabled = true; //? an morefunc chinh sua khi trang thai khac hop le,lm lại
      switch (data?.status) {
        case '1':
          if (!data?.validated) {
            if([MorfuncPur.KiemTraHopLe,MorfuncPur.In].includes(element.functionID))
              element.disabled = false;
            else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          }else{
            if (journal.approvalControl == '0') {
              if([MorfuncPur.GhiSo,MorfuncPur.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }else{
              if([MorfuncPur.GuiDuyet,MorfuncPur.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }
          }
          break;
        case '2':
          if([MorfuncPur.KiemTraHopLe,MorfuncPur.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '3':
          if([MorfuncPur.HuyDuyet,MorfuncPur.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '5':
        case '9':
          if([MorfuncPur.GhiSo,MorfuncPur.In].includes(element.functionID))
              element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          break;
        case '6':
          if([MorfuncPur.KhoiPhuc,MorfuncPur.In,MorfuncPur.PhanBoChiPhi].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        default:
          element.disabled = true;
          break;
      }
    })
  }

  changeMFSale(event, data, type: any = '', journal, formModel) {
    event.forEach((element) => {
      //* thiet lap bookmark cac morefunc tai cac mode view
      if (type === 'viewgrid') element.isbookmark = false; //? viewgrid tất cả ko bookmark ra ngoài
      if (type === 'viewdetail') { //? viewdetail morefunc mac dinh ko bookmark ra ngoai
        if (Object.values(MorfuncDefault).includes(element.functionID)) {
          element.isbookmark = false;
        }else{
          element.isbookmark = true;
        }
      }
      //* an hien morefunc theo nghiep vu
      if(element.functionID == MorfuncDefault.Sua && data?.status != '1' && data?.status != '2') element.disabled = true; //? an morefunc chinh sua khi trang thai khac hop le,lm lại
      switch (data?.status) {
        case '1':
          if (!data?.validated) {
            if([MorfuncSale.KiemTraHopLe,MorfuncSale.In].includes(element.functionID))
              element.disabled = false;
            else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          }else{
            if (journal.approvalControl == '0') {
              if([MorfuncSale.GhiSo,MorfuncSale.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }else{
              if([MorfuncSale.GuiDuyet,MorfuncSale.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }
          }
          break;
        case '2':
          if([MorfuncSale.KiemTraHopLe,MorfuncSale.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '3':
          if([MorfuncSale.HuyDuyet,MorfuncSale.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '5':
        case '9':
          if([MorfuncSale.GhiSo,MorfuncSale.In].includes(element.functionID))
              element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          break;
        case '6':
          if([MorfuncSale.KhoiPhuc,MorfuncSale.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        default:
          element.disabled = true;
          break;
      }
    })
  }

  changeMFVoucher(event, data, type: any = '', journal, formModel) {
    event.forEach((element) => {
      //* thiet lap bookmark cac morefunc tai cac mode view
      if (type === 'viewgrid') element.isbookmark = false; //? viewgrid tất cả ko bookmark ra ngoài
      if (type === 'viewdetail') { //? viewdetail morefunc mac dinh ko bookmark ra ngoai
        if (Object.values(MorfuncDefault).includes(element.functionID)) {
          element.isbookmark = false;
        }else{
          element.isbookmark = true;
        }
      }
      //* an hien morefunc theo nghiep vu
      if(element.functionID == MorfuncDefault.Sua && data?.status != '1' && data?.status != '2') element.disabled = true; //? an morefunc chinh sua khi trang thai khac hop le,lm lại
      switch (data?.status) {
        case '1':
          if (!data?.validated) {
            if([MorfuncVoucher.KiemTraHopLe,MorfuncVoucher.In].includes(element.functionID))
              element.disabled = false;
            else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          }else{
            if (journal.approvalControl == '0') {
              if([MorfuncVoucher.GhiSo,MorfuncVoucher.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }else{
              if([MorfuncVoucher.GuiDuyet,MorfuncVoucher.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }
          }
          break;
        case '2':
          if([MorfuncVoucher.KiemTraHopLe,MorfuncVoucher.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '3':
          if([MorfuncVoucher.HuyDuyet,MorfuncVoucher.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '5':
        case '9':
          if([MorfuncVoucher.GhiSo,MorfuncVoucher.In].includes(element.functionID))
              element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          break;
        case '6':
          if([MorfuncVoucher.KhoiPhuc,MorfuncVoucher.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        default:
          element.disabled = true;
          break;
      }
    })
  }

  changeMFIssueVoucher(event, data, type: any = '', journal, formModel) {
    event.forEach((element) => {
      //* thiet lap bookmark cac morefunc tai cac mode view
      if (type === 'viewgrid') element.isbookmark = false; //? viewgrid tất cả ko bookmark ra ngoài
      if (type === 'viewdetail') { //? viewdetail morefunc mac dinh ko bookmark ra ngoai
        if (Object.values(MorfuncDefault).includes(element.functionID)) {
          element.isbookmark = false;
        }else{
          element.isbookmark = true;
        }
      }
      //* an hien morefunc theo nghiep vu
      if(element.functionID == MorfuncDefault.Sua && data?.status != '1' && data?.status != '2') element.disabled = true; //? an morefunc chinh sua khi trang thai khac hop le,lm lại
      switch (data?.status) {
        case '1':
          if (!data?.validated) {
            if([MorfuncIssueVoucher.KiemTraHopLe,MorfuncIssueVoucher.In].includes(element.functionID))
              element.disabled = false;
            else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          }else{
            if (journal.approvalControl == '0') {
              if([MorfuncIssueVoucher.GhiSo,MorfuncIssueVoucher.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }else{
              if([MorfuncIssueVoucher.GuiDuyet,MorfuncIssueVoucher.In].includes(element.functionID))
                element.disabled = false;
              else if (!Object.values(MorfuncDefault).includes(element.functionID))
                element.disabled = true;
            }
          }
          break;
        case '2':
          if([MorfuncIssueVoucher.KiemTraHopLe,MorfuncIssueVoucher.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '3':
          if([MorfuncIssueVoucher.HuyDuyet,MorfuncIssueVoucher.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        case '5':
        case '9':
          if([MorfuncIssueVoucher.GhiSo,MorfuncIssueVoucher.In].includes(element.functionID))
              element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
              element.disabled = true;
          break;
        case '6':
          if([MorfuncIssueVoucher.KhoiPhuc,MorfuncIssueVoucher.In].includes(element.functionID))
            element.disabled = false;
          else if (!Object.values(MorfuncDefault).includes(element.functionID))
            element.disabled = true;
          break;
        default:
          element.disabled = true;
          break;
      }
    })
  }
}
