import { Injectable, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CodxGridviewV2Component,
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

export const fmItemsPurchase: FormModel = {
  entityName: 'IV_ItemsPurchase',
  formName: 'ItemsPurchase',
  gridViewName: 'grvItemsPurchase',
  entityPer: 'IV_ItemsPurchase',
};

export const fmItemsSales: FormModel = {
  entityName: 'IV_ItemsSales',
  formName: 'ItemsSales',
  gridViewName: 'grvItemsSales',
  entityPer: 'IV_ItemsSales',
};

export const fmItemsProduction: FormModel = {
  entityName: 'IV_ItemsProduction',
  formName: 'ItemsProduction',
  gridViewName: 'grvItemsProduction',
  entityPer: 'IV_ItemsProduction',
};

export const fmItemsSize: FormModel = {
  entityName: 'IV_ItemsSizes',
  formName: 'ItemsSizes',
  gridViewName: 'grvItemsSizes',
  entityPer: 'IV_ItemsSizes',
};

export const fmItemsStyle: FormModel = {
  entityName: 'IV_ItemsStyles',
  formName: 'ItemStyles',
  gridViewName: 'grvItemStyles',
  entityPer: 'IV_ItemsStyles',
};

export const fmItemsColor: FormModel = {
  entityName: 'IV_ItemsColors',
  formName: 'ItemColors',
  gridViewName: 'grvItemColors',
  entityPer: 'IV_ItemsColors',
};

export const fmUMConversion: FormModel = {
  entityName: 'BS_UMConversion',
  formName: 'UMConversion',
  gridViewName: 'grvUMConversion',
  entityPer: 'BS_UMConversion',
};

export enum MorfuncDefault {
  Sua = 'SYS03',
  Xoa = 'SYS02',
  SaoChep = 'SYS04',
  XuatDuLieu = 'SYS002',
  DocXML = 'ACT060109'
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
  KiemTraTrangThai = 'ACT041013'
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
  PhanBoChiPhi = 'ACT060108',
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
  GhiSoNK = 'ACT070806',
  GhiSoXK = 'ACT071406',
  GuiDuyetNK = 'ACT070804',
  GuiDuyetXK = 'ACT071404',
  HuyDuyetNK = 'ACT070805',
  HuyDuyetXK = 'ACT071405',
  KhoiPhucNK = 'ACT070807',
  KhoiPhucXK = 'ACT071407',
  InNK = 'ACT070808',
  InXK = 'ACT071408',
  KiemTraHopLeNK = 'ACT070803',
  KiemTraHopLeXK = 'ACT071403',
}

// export enum MorfuncIssueVoucher {
//   GhiSo = 'ACT071406',
//   GuiDuyet = 'ACT071404',
//   HuyDuyet = 'ACT071405',
//   KhoiPhuc = 'ACT071407',
//   In = 'ACT071408',
//   KiemTraHopLe = 'ACT071403',
// }

export enum MorfuncGeneralJournals {
  GhiSo = 'ACT090104',
  GuiDuyet = 'ACT090102',
  HuyDuyet = 'ACT090103',
  KhoiPhuc = 'ACT090105',
  In = 'ACT090106',
  KiemTraHopLe = 'ACT090101',
}

export enum MorfuncTranfers {
  GhiSo = 'ACT072204',
  GuiDuyet = 'ACT072202',
  HuyDuyet = 'ACT072203',
  KhoiPhuc = 'ACT072205',
  In = 'ACT072206',
  KiemTraHopLe = 'ACT072201',
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
    event.reduce((pre,element) => {
      if(!Object.values(MorfuncCash).includes(element.functionID) && !Object.values(MorfuncDefault).includes(element.functionID)) element.disabled = true;
      if (type === 'viewgrid') element.isbookmark = false;
      if (type === 'views'){
        if (![MorfuncDefault.XuatDuLieu].includes(element.functionID)) {
          element.isbookmark = true;
        }
      }
      if([MorfuncDefault.Sua,MorfuncDefault.Xoa].includes(element.functionID) && (data?.status != '1' && data?.status != '2')) element.disabled = true;
      if (Object.values(MorfuncCash).includes(element.functionID)) {
        switch (data?.status) {
          case '1':
            if (!data?.validated) {
              if(![MorfuncCash.KiemTraHopLePC, MorfuncCash.KiemTraHopLeUNC, MorfuncCash.InPC, MorfuncCash.InUNC].includes(element.functionID)) element.disabled = true;
            }else{
              if (journal.approvalControl == '0') {
                if(![MorfuncCash.GhiSoPC,MorfuncCash.GhiSoUNC,MorfuncCash.InPC,MorfuncCash.InUNC,MorfuncCash.ChuyenTienDienTu].includes(element.functionID)) element.disabled = true;
              }else{
                if(![MorfuncCash.GuiDuyetPC,MorfuncCash.GuiDuyetUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID)) element.disabled = true;
              }
            }
            break;

          case '2':
            if(![MorfuncCash.KiemTraHopLePC,MorfuncCash.KiemTraHopLeUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID)) element.disabled = true;
            break;

          case '3':
            if(![MorfuncCash.HuyDuyetPC,MorfuncCash.HuyDuyetUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID)) element.disabled = true;
            break;

          case '5':
          case '9':
            if(![MorfuncCash.GhiSoPC,MorfuncCash.GhiSoUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID)) element.disabled = true;
            break;

          case '6':
            if(![MorfuncCash.KhoiPhucPC,MorfuncCash.KhoiPhucUNC,MorfuncCash.InPC,MorfuncCash.InUNC].includes(element.functionID)) element.disabled = true;
            break;

          case '10':
            if(![MorfuncCash.GhiSoUNC,MorfuncCash.InUNC].includes(element.functionID)) element.disabled = true;
            break;

          case '8':
          case '11':
            if(![MorfuncCash.InUNC,MorfuncCash.KiemTraTrangThai].includes(element.functionID)) element.disabled = true;
            break;

          default:
            element.disabled = true;
            break;
        }
      }
      event = event.sort((a, b) => b.functionID.localeCompare(a.functionID));
    },{});
  }

  changeMFCashReceipt(event, data, type: any = '', journal, formModel) {
    //* thiet lap bookmark cac morefunc tai cac mode view
    event.filter((x) => !Object.values(MorfuncCashReceipt).includes(x.functionID) && !Object.values(MorfuncDefault).includes(x.functionID)).reduce((pre,element) => {element.disabled = true},{}); //? disable cac morfunc ko xai
    if (type === 'viewgrid') event.reduce((pre,element) => {element.isbookmark = false},{}); //? view grid thi morfunc ko bookmark ra ngoai
    if (type === 'viewdetail') event.filter((x) => ![MorfuncDefault.XuatDuLieu].includes(x.functionID)).reduce((pre,element) => {element.isbookmark = true},{});
    
    //* an hien morefunc theo nghiep vu
    if(data?.status != '1' && data?.status != '2') event.filter((x) => [MorfuncDefault.Sua].includes(x.functionID)).reduce((pre,element) => {element.disabled = true},{});
    event = event.filter((x) => Object.values(MorfuncCashReceipt).includes(x.functionID));
    switch (data?.status) {
      case '1':
        if (!data?.validated) {
          event.filter((x) => ![MorfuncCashReceipt.KiemTraHopLePT, MorfuncCashReceipt.KiemTraHopLeBC, MorfuncCashReceipt.InPT, MorfuncCashReceipt.InBC].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
        }else{
          if (journal.approvalControl == '0') {
            event.filter((x) => ![MorfuncCashReceipt.GhiSoPT,MorfuncCashReceipt.GhiSoBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }else{
            event.filter((x) => ![MorfuncCashReceipt.GuiDuyetPT,MorfuncCashReceipt.GuiDuyetBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }
        }
        break;
      case '2':
        event.filter((x) => ![MorfuncCashReceipt.KiemTraHopLePT,MorfuncCashReceipt.KiemTraHopLeBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '3':
        event.filter((x) => ![MorfuncCashReceipt.HuyDuyetPT,MorfuncCashReceipt.HuyDuyetBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '5':
      case '9':
        event.filter((x) => ![MorfuncCashReceipt.GhiSoPT,MorfuncCashReceipt.GhiSoBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '6':
        event.filter((x) => ![MorfuncCashReceipt.KhoiPhucPT,MorfuncCashReceipt.KhoiPhucBC,MorfuncCashReceipt.InPT,MorfuncCashReceipt.InBC].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      default:
        event.reduce((pre, element) => { element.disabled = true }, {});
          break;
    }
  }

  changeMFGeneralJournal(event, data, type: any = '', journal, formModel) {
    //* thiet lap bookmark cac morefunc tai cac mode view
    event.filter((x) => !Object.values(MorfuncGeneralJournals).includes(x.functionID) && !Object.values(MorfuncDefault).includes(x.functionID))
      .reduce((pre, element) => { element.disabled = true }, {}); //? disable cac morfunc ko xai
    if (type === 'viewgrid') event.reduce((pre,element) => {element.isbookmark = false},{}); //? view grid thi morfunc ko bookmark ra ngoai
    if (type === 'viewdetail') event.filter((x) => ![MorfuncDefault.XuatDuLieu].includes(x.functionID)).reduce((pre,element) => {element.isbookmark = true},{});
    
    //* an hien morefunc theo nghiep vu
    if(data?.status != '1' && data?.status != '2') event.filter((x) => [MorfuncDefault.Sua].includes(x.functionID)).reduce((pre,element) => {element.disabled = true},{});
    event = event.filter((x) => Object.values(MorfuncGeneralJournals).includes(x.functionID));
    switch (data?.status) {
      case '1':
        if (!data?.validated) {
          event.filter((x) => ![MorfuncGeneralJournals.KiemTraHopLe,MorfuncGeneralJournals.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
        }else{
          if (journal.approvalControl == '0') {
            event.filter((x) => ![MorfuncGeneralJournals.GhiSo,MorfuncGeneralJournals.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }else{
            event.filter((x) => ![MorfuncGeneralJournals.GuiDuyet,MorfuncGeneralJournals.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }
        }
        break;
      case '2':
        event.filter((x) => ![MorfuncGeneralJournals.KiemTraHopLe,MorfuncGeneralJournals.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '3':
        event.filter((x) => ![MorfuncGeneralJournals.HuyDuyet,MorfuncGeneralJournals.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '5':
      case '9':
        event.filter((x) => ![MorfuncGeneralJournals.GhiSo,MorfuncGeneralJournals.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '6':
        event.filter((x) => ![MorfuncGeneralJournals.KhoiPhuc,MorfuncGeneralJournals.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      default:
        event.reduce((pre, element) => { element.disabled = true }, {});
          break;
    }
  }

  changeMFPur(event, data, type: any = '', journal, formModel) {
    //* thiet lap bookmark cac morefunc tai cac mode view
    event.filter((x) => !Object.values(MorfuncPur).includes(x.functionID) && !Object.values(MorfuncDefault).includes(x.functionID))
      .reduce((pre, element) => { element.disabled = true }, {}); //? disable cac morfunc ko xai
    if (type === 'viewgrid') event.reduce((pre,element) => {element.isbookmark = false},{}); //? view grid thi morfunc ko bookmark ra ngoai
    if (type === 'viewdetail') event.filter((x) => ![MorfuncDefault.XuatDuLieu,MorfuncDefault.DocXML].includes(x.functionID)).reduce((pre,element) => {element.isbookmark = true},{});
    
    //* an hien morefunc theo nghiep vu
    if(data?.status != '1' && data?.status != '2') event.filter((x) => [MorfuncDefault.Sua].includes(x.functionID)).reduce((pre,element) => {element.disabled = true},{});
    event = event.filter((x) => Object.values(MorfuncPur).includes(x.functionID));
    switch (data?.status) {
      case '1':
        if (!data?.validated) {
          event.filter((x) => ![MorfuncPur.KiemTraHopLe,MorfuncPur.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
        }else{
          if (journal.approvalControl == '0') {
            event.filter((x) => ![MorfuncPur.GhiSo,MorfuncPur.In,MorfuncPur.PhanBoChiPhi].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }else{
            event.filter((x) => ![MorfuncPur.GuiDuyet,MorfuncPur.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }
        }
        break;
      case '2':
        event.filter((x) => ![MorfuncPur.KiemTraHopLe,MorfuncPur.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '3':
        event.filter((x) => ![MorfuncPur.HuyDuyet,MorfuncPur.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '5':
      case '9':
        event.filter((x) => ![MorfuncPur.GhiSo,MorfuncPur.In,MorfuncPur.PhanBoChiPhi].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '6':
        event.filter((x) => ![MorfuncPur.KhoiPhuc,MorfuncPur.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      default:
        event.reduce((pre, element) => { element.disabled = true }, {});
          break;
    }
  }

  changeMFSale(event, data, type: any = '', journal, formModel) {
    //* thiet lap bookmark cac morefunc tai cac mode view
    event.filter((x) => !Object.values(MorfuncSale).includes(x.functionID) && !Object.values(MorfuncDefault).includes(x.functionID))
      .reduce((pre, element) => { element.disabled = true }, {}); //? disable cac morfunc ko xai
    if (type === 'viewgrid') event.reduce((pre,element) => {element.isbookmark = false},{}); //? view grid thi morfunc ko bookmark ra ngoai
    if (type === 'viewdetail') event.filter((x) => ![MorfuncDefault.XuatDuLieu].includes(x.functionID)).reduce((pre,element) => {element.isbookmark = true},{});
    
    //* an hien morefunc theo nghiep vu
    if(data?.status != '1' && data?.status != '2') event.filter((x) => [MorfuncDefault.Sua].includes(x.functionID)).reduce((pre,element) => {element.disabled = true},{});
    event = event.filter((x) => Object.values(MorfuncSale).includes(x.functionID));
    switch (data?.status) {
      case '1':
        if (!data?.validated) {
          event.filter((x) => ![MorfuncSale.KiemTraHopLe,MorfuncSale.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
        }else{
          if (journal.approvalControl == '0') {
            event.filter((x) => ![MorfuncSale.GhiSo,MorfuncSale.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }else{
            event.filter((x) => ![MorfuncSale.GuiDuyet,MorfuncSale.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }
        }
        break;
      case '2':
        event.filter((x) => ![MorfuncSale.KiemTraHopLe,MorfuncSale.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '3':
        event.filter((x) => ![MorfuncSale.HuyDuyet,MorfuncSale.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '5':
      case '9':
        event.filter((x) => ![MorfuncSale.GhiSo,MorfuncSale.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '6':
        event.filter((x) => ![MorfuncSale.KhoiPhuc,MorfuncSale.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      default:
        event.reduce((pre, element) => { element.disabled = true }, {});
          break;
    }
  }

  changeMFVoucher(event, data, type: any = '', journal, formModel) {
    //* thiet lap bookmark cac morefunc tai cac mode view
    event.filter((x) => !Object.values(MorfuncVoucher).includes(x.functionID) && !Object.values(MorfuncDefault).includes(x.functionID))
      .reduce((pre, element) => { element.disabled = true }, {}); //? disable cac morfunc ko xai
    if (type === 'viewgrid') event.reduce((pre,element) => {element.isbookmark = false},{}); //? view grid thi morfunc ko bookmark ra ngoai
    if (type === 'viewdetail') event.filter((x) => ![MorfuncDefault.XuatDuLieu].includes(x.functionID)).reduce((pre,element) => {element.isbookmark = true},{});
    
    //* an hien morefunc theo nghiep vu
    if(data?.status != '1' && data?.status != '2') event.filter((x) => [MorfuncDefault.Sua].includes(x.functionID)).reduce((pre,element) => {element.disabled = true},{});
    event = event.filter((x) => Object.values(MorfuncVoucher).includes(x.functionID));
    switch (data?.status) {
      case '1':
        if (!data?.validated) {
          event.filter((x) => ![MorfuncVoucher.KiemTraHopLeNK,MorfuncVoucher.KiemTraHopLeXK,MorfuncVoucher.InNK,MorfuncVoucher.InXK].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
        }else{
          if (journal.approvalControl == '0') {
            event.filter((x) => ![MorfuncVoucher.GhiSoNK,MorfuncVoucher.GhiSoXK,MorfuncVoucher.InNK,MorfuncVoucher.InXK].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }else{
            event.filter((x) => ![MorfuncVoucher.GuiDuyetNK,MorfuncVoucher.GuiDuyetXK,MorfuncVoucher.InNK,MorfuncVoucher.InXK].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }
        }
        break;
      case '2':
        event.filter((x) => ![MorfuncVoucher.KiemTraHopLeNK,MorfuncVoucher.KiemTraHopLeXK,MorfuncVoucher.InNK,MorfuncVoucher.InXK].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '3':
        event.filter((x) => ![MorfuncVoucher.HuyDuyetNK,MorfuncVoucher.HuyDuyetXK,MorfuncVoucher.InNK,MorfuncVoucher.InXK].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '5':
      case '9':
        event.filter((x) => ![MorfuncVoucher.GhiSoNK,MorfuncVoucher.GhiSoXK,MorfuncVoucher.InNK,MorfuncVoucher.InXK].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '6':
        event.filter((x) => ![MorfuncVoucher.KhoiPhucNK,MorfuncVoucher.KhoiPhucXK,MorfuncVoucher.InNK,MorfuncVoucher.InXK].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      default:
        event.reduce((pre, element) => { element.disabled = true }, {});
          break;
    }
  }

  changeMFIssueVoucher(event, data, type: any = '', journal, formModel) {
    //* thiet lap bookmark cac morefunc tai cac mode view
    // event.filter((x) => !Object.values(MorfuncVoucher).includes(x.functionID) && !Object.values(MorfuncDefault).includes(x.functionID))
    //   .reduce((pre, element) => { element.disabled = true }, {}); //? disable cac morfunc ko xai
    // if (type === 'viewgrid') event.reduce((pre,element) => {element.isbookmark = false},{}); //? view grid thi morfunc ko bookmark ra ngoai
    // if (type === 'viewdetail') event.filter((x) => ![MorfuncDefault.XuatDuLieu].includes(x.functionID)).reduce((pre,element) => {element.isbookmark = true},{});
    
    // //* an hien morefunc theo nghiep vu
    // if(data?.status != '1' && data?.status != '2') event.filter((x) => [MorfuncDefault.Sua].includes(x.functionID)).reduce((pre,element) => {element.disabled = true},{});
    // event = event.filter((x) => Object.values(MorfuncIssueVoucher).includes(x.functionID));
    // switch (data?.status) {
    //   case '1':
    //     if (!data?.validated) {
    //       event.filter((x) => ![MorfuncIssueVoucher.KiemTraHopLe,MorfuncIssueVoucher.In].includes(x.functionID))
    //         .reduce((pre, element) => { element.disabled = true }, {});
    //     }else{
    //       if (journal.approvalControl == '0') {
    //         event.filter((x) => ![MorfuncIssueVoucher.GhiSo,MorfuncIssueVoucher.In].includes(x.functionID))
    //         .reduce((pre, element) => { element.disabled = true }, {});
    //       }else{
    //         event.filter((x) => ![MorfuncIssueVoucher.GuiDuyet,MorfuncIssueVoucher.In].includes(x.functionID))
    //         .reduce((pre, element) => { element.disabled = true }, {});
    //       }
    //     }
    //     break;
    //   case '2':
    //     event.filter((x) => ![MorfuncIssueVoucher.KiemTraHopLe,MorfuncIssueVoucher.In].includes(x.functionID))
    //         .reduce((pre, element) => { element.disabled = true }, {});
    //       break;
    //   case '3':
    //     event.filter((x) => ![MorfuncIssueVoucher.HuyDuyet,MorfuncIssueVoucher.In].includes(x.functionID))
    //         .reduce((pre, element) => { element.disabled = true }, {});
    //       break;
    //   case '5':
    //   case '9':
    //     event.filter((x) => ![MorfuncIssueVoucher.GhiSo,MorfuncIssueVoucher.In].includes(x.functionID))
    //         .reduce((pre, element) => { element.disabled = true }, {});
    //       break;
    //   case '6':
    //     event.filter((x) => ![MorfuncIssueVoucher.KhoiPhuc,MorfuncIssueVoucher.In].includes(x.functionID))
    //         .reduce((pre, element) => { element.disabled = true }, {});
    //       break;
    //   default:
    //     event.reduce((pre, element) => { element.disabled = true }, {});
    //       break;
    // }
  }

  changeMFTranfers(event, data, type: any = '', journal, formModel) {
    //* thiet lap bookmark cac morefunc tai cac mode view
    event.filter((x) => !Object.values(MorfuncTranfers).includes(x.functionID) && !Object.values(MorfuncDefault).includes(x.functionID))
      .reduce((pre, element) => { element.disabled = true }, {}); //? disable cac morfunc ko xai
    if (type === 'viewgrid') event.reduce((pre,element) => {element.isbookmark = false},{}); //? view grid thi morfunc ko bookmark ra ngoai
    if (type === 'viewdetail') event.filter((x) => ![MorfuncDefault.XuatDuLieu].includes(x.functionID)).reduce((pre,element) => {element.isbookmark = true},{});
    
    //* an hien morefunc theo nghiep vu
    if(data?.status != '1' && data?.status != '2') event.filter((x) => [MorfuncDefault.Sua].includes(x.functionID)).reduce((pre,element) => {element.disabled = true},{});
    event = event.filter((x) => Object.values(MorfuncTranfers).includes(x.functionID));
    switch (data?.status) {
      case '1':
        if (!data?.validated) {
          event.filter((x) => ![MorfuncTranfers.KiemTraHopLe,MorfuncTranfers.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
        }else{
          if (journal.approvalControl == '0') {
            event.filter((x) => ![MorfuncTranfers.GhiSo,MorfuncTranfers.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }else{
            event.filter((x) => ![MorfuncTranfers.GuiDuyet,MorfuncTranfers.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          }
        }
        break;
      case '2':
        event.filter((x) => ![MorfuncTranfers.KiemTraHopLe,MorfuncTranfers.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '3':
        event.filter((x) => ![MorfuncTranfers.HuyDuyet,MorfuncTranfers.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '5':
      case '9':
        event.filter((x) => ![MorfuncTranfers.GhiSo,MorfuncTranfers.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      case '6':
        event.filter((x) => ![MorfuncTranfers.KhoiPhuc,MorfuncTranfers.In].includes(x.functionID))
            .reduce((pre, element) => { element.disabled = true }, {});
          break;
      default:
        event.reduce((pre, element) => { element.disabled = true }, {});
          break;
    }
  }

  changeMFJournal(event) {
    event.filter((x) => !Object.values(MorfuncDefault).includes(x.functionID)) 
      .reduce((pre, element) => { element.disabled = true }, {});
    event = event.filter((x) => Object.values(MorfuncDefault).includes(x.functionID));
    event.forEach(element => {
      if([MorfuncDefault.XuatDuLieu].includes(element.functionID)) element.disabled = true;
      element.isbookmark = true;
    });
  }

  getSettingFromJournal(eleGrid:CodxGridviewV2Component,journal:any,data:any = null,baseCurr:any = '',hideFields:any = []){
    //* Thiết lập datasource combobox theo sổ nhật ký
    let preAccountID = '';
    let dtvAccountID = '';
    let preOffsetAcctID = '';
    let dtvOffsetAcctID = '';
    let preDIM1 = '';
    let dtvDIM1 = '';
    let preDIM2 = '';
    let dtvDIM2 = '';
    let preDIM3 = '';
    let dtvDIM3 = '';

    if (journal.drAcctControl == '1' || journal.drAcctControl == '2') {
      preAccountID = '@0.Contains(AccountID)';
      dtvAccountID = `[${journal?.drAcctID}]`;
    }
    eleGrid.setPredicates('accountID',preAccountID,dtvAccountID);

    if ((journal.crAcctControl == '1' || journal.crAcctControl == '2') && journal.entryMode == '1') {
      preOffsetAcctID = '@0.Contains(AccountID)';
      dtvOffsetAcctID = `[${journal?.crAcctID}]`;
    }
    eleGrid.setPredicates('offsetAcctID',preOffsetAcctID,dtvOffsetAcctID);

    if (journal.diM1Control == '1' || journal.diM1Control == '2') {
      preDIM1 = '@0.Contains(ProfitCenterID)';
      dtvDIM1 = `[${journal?.diM1}]`;
    }
    eleGrid.setPredicates('diM1',preDIM1,dtvDIM1);

    if (journal.diM2Control == '1' || journal.diM2Control == '2') {
      preDIM2 = '@0.Contains(CostCenterID)';
      dtvDIM2 = `[${journal?.diM2}]`;
    }
    eleGrid.setPredicates('diM2',preDIM2,dtvDIM2);

    if (journal.diM3Control == '1' || journal.diM3Control == '2') {
      preDIM3 = '@0.Contains(CostItemID)';
      dtvDIM3 = `[${journal?.diM3}]`;
    }
    eleGrid.setPredicates('diM3',preDIM3,dtvDIM3);

    let arrayType = ['PI','SI'];
    if (arrayType.includes(journal.journalType)) {
      if(!journal.useDutyTax){ //? không sử dụng thuế xuất nhập khẩu (ẩn)
        hideFields.push('SalesTaxPct');
        hideFields.push('SalesTaxAmt');
        hideFields.push('SalesTaxAmt2');
      }else{
        if(data && data?.currencyID == baseCurr) hideFields.push('SalesTaxAmt2');
      }
  
  
      if(!journal.useExciseTax){ //? không sử dụng thuế TTĐB (ẩn)
        hideFields.push('ExciseTaxPct');
        hideFields.push('ExciseTaxAmt');
        hideFields.push('ExciseTaxAmt2');
      }else{
        if(data && data?.currencyID == baseCurr) hideFields.push('ExciseTaxAmt2');
      }  
  
      if(journal.vatControl == '0'){ //? không sử dụng thuế GTGT (ẩn)
        hideFields.push('VATPct'); 
        hideFields.push('VATAmt'); 
        hideFields.push('VATBase'); 
        hideFields.push('VATAmt2');
        hideFields.push('VATBase2');
        hideFields.push('VATID');
      }else{
        if(data && data?.currencyID == baseCurr){
          hideFields.push('VATAmt2');
          hideFields.push('VATBase2');
        } 
      } 
    }

    return [eleGrid,hideFields];
  }

  getDataSettingFromJournal(oLine:any,journal:any){
    if (journal) {
      let arrayType = ['CP','BP','CR','BR','GJ'];
      if(arrayType.includes(journal.journalType)){
        switch(journal?.drAcctControl){
          case '1':
            if(oLine.accountID && (oLine.accountID != journal?.drAcctID)) oLine.accountID = null;
            break;
          case '4':
            if (oLine.accountID == null) {
              oLine.accountID = journal?.drAcctID;
            }
            break;
          case '2':
            if(!(journal?.drAcctID.split(';')).includes(oLine.accountID)) oLine.accountID = null;
            break;
        }
        
        switch(journal?.crAcctControl){
          case '1':
            if(oLine.offsetAcctID && (oLine.offsetAcctID != journal?.crAcctID)) oLine.offsetAcctID = null;
            break;
          case '4':
            if (oLine.offsetAcctID == null) {
              oLine.offsetAcctID = journal?.crAcctID;
            }
            break;
          case '2':
            if(!(journal?.crAcctID.split(';')).includes(oLine.offsetAcctID)) oLine.offsetAcctID = null;
            break;
        }
      }
      if(journal?.diM1Control && journal?.diM1Control != '2' && journal?.diM1Control != '0') oLine.diM1 = journal.diM1;
      if(journal?.diM2Control && journal?.diM2Control != '2' && journal?.diM2Control != '0') oLine.diM2 = journal.diM2;
      if(journal?.diM3Control && journal?.diM3Control != '2' && journal?.diM3Control != '0') oLine.diM3 = journal.diM3;

      return oLine;
    }
  }
}
