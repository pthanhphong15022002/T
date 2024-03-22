import { Injectable, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  AuthStore,
  CRUDService,
  CacheService,
  CodxGridviewV2Component,
  DataRequest,
  FormModel,
  NotificationsService,
  PageLink,
  PageTitleService,
} from 'codx-core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { IJournal } from './journals/interfaces/IJournal.interface';
import { Subject } from '@microsoft/signalr';

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

export const fmJournal: FormModel = {
  formName: 'Journals',
  gridViewName: 'grvJournals',
  entityName: 'AC_Journals',
  funcID: 'ACT',
};

export const fmAssetJournal: FormModel = {
  formName: 'AssetAcquisitions',
  gridViewName: 'grvAssetAcquisitions',
  entityName: 'AM_AssetJournals',
  entityPer: 'AM_AssetJournals',
};

export const fmAssetJournalsLines: FormModel = {
  formName: 'AssetAcquisitionsLines',
  gridViewName: 'grvAssetAcquisitionsLines',
  entityName: 'AM_AssetJournalsLines',
  entityPer: 'AM_AssetJournalsLines',
};

export enum MorfuncDefault {
  Sua = 'SYS03',
  Xoa = 'SYS02',
  SaoChep = 'SYS04',
  XuatDuLieu = 'SYS002',
  Xem = 'SYS05',
  //DocXML = 'ACT060109'
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
  KiemTraTrangThai = 'ACT041013',
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
  demo = 'ACT060501',
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

export enum MorfuncCashTranfers {
  GhiSo = 'ACT042204',
  GuiDuyet = 'ACT042202',
  HuyDuyet = 'ACT042203',
  KhoiPhuc = 'ACT042205',
  In = 'ACT042206',
  KiemTraHopLe = 'ACT042201',
}

@Injectable({
  providedIn: 'root',
})
export class CodxAcService {
  stores = new Map<string, any>();
  toolbar: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private cacheService: CacheService,
    private pageTitleService: PageTitleService,
    private authStore: AuthStore
  ) {
    //this.getCache();
  }

  hideToolbar(v) {
    this.toolbar.next(true);
  }

  getCache() {
    this.api
      .exec('AC', 'ACBusiness', 'GetCacheAccountAsync', '')
      .subscribe((res) => {
        if (res) this.stores.set('account', res);
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
    event.reduce((pre, element) => {
      if (
        !Object.values(MorfuncCash).includes(element.functionID) &&
        !Object.values(MorfuncDefault).includes(element.functionID)
      )
        element.disabled = true;
      if (type === 'viewgrid') element.isbookmark = false;
      if (type === 'viewdetail') {
        if (
          ![MorfuncDefault.XuatDuLieu, MorfuncDefault.Xem].includes(
            element.functionID
          )
        ) {
          element.isbookmark = true;
        }
      }
      if (
        [MorfuncDefault.Sua, MorfuncDefault.Xoa].includes(element.functionID) &&
        data?.status != '1' &&
        data?.status != '2'
      )
        element.disabled = true;
      if (Object.values(MorfuncCash).includes(element.functionID)) {
        switch (data?.status) {
          case '1':
            if (!data?.validated) {
              if (
                ![
                  MorfuncCash.KiemTraHopLePC,
                  MorfuncCash.KiemTraHopLeUNC,
                  MorfuncCash.InPC,
                  MorfuncCash.InUNC,
                ].includes(element.functionID)
              )
                element.disabled = true;
            } else {
              if (journal.approvalControl == '0') {
                if (
                  ![
                    MorfuncCash.GhiSoPC,
                    MorfuncCash.GhiSoUNC,
                    MorfuncCash.InPC,
                    MorfuncCash.InUNC,
                    MorfuncCash.ChuyenTienDienTu,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              } else {
                if (
                  ![
                    MorfuncCash.GuiDuyetPC,
                    MorfuncCash.GuiDuyetUNC,
                    MorfuncCash.InPC,
                    MorfuncCash.InUNC,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              }
            }
            break;

          case '2':
            if (
              ![
                MorfuncCash.KiemTraHopLePC,
                MorfuncCash.KiemTraHopLeUNC,
                MorfuncCash.InPC,
                MorfuncCash.InUNC,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '3':
            if (
              ![
                MorfuncCash.HuyDuyetPC,
                MorfuncCash.HuyDuyetUNC,
                MorfuncCash.InPC,
                MorfuncCash.InUNC,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '5':
          case '9':
            if (
              ![
                MorfuncCash.GhiSoPC,
                MorfuncCash.GhiSoUNC,
                MorfuncCash.InPC,
                MorfuncCash.InUNC,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '6':
            if (
              ![
                MorfuncCash.KhoiPhucPC,
                MorfuncCash.KhoiPhucUNC,
                MorfuncCash.InPC,
                MorfuncCash.InUNC,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '10':
            if (
              ![MorfuncCash.GhiSoUNC, MorfuncCash.InUNC].includes(
                element.functionID
              )
            )
              element.disabled = true;
            break;

          case '8':
          case '11':
            if (
              ![MorfuncCash.InUNC, MorfuncCash.KiemTraTrangThai].includes(
                element.functionID
              )
            )
              element.disabled = true;
            break;

          default:
            element.disabled = true;
            break;
        }
      }
      event = event.sort((a, b) => b.functionID.localeCompare(a.functionID));
    }, {});
  }

  changeMFCashReceipt(event, data, type: any = '', journal, formModel) {
    event.reduce((pre, element) => {
      if (
        !Object.values(MorfuncCashReceipt).includes(element.functionID) &&
        !Object.values(MorfuncDefault).includes(element.functionID)
      )
        element.disabled = true;
      if (type === 'viewgrid') element.isbookmark = false;
      if (type === 'viewdetail') {
        if (![MorfuncDefault.XuatDuLieu].includes(element.functionID)) {
          element.isbookmark = true;
        }
      }
      if (
        [MorfuncDefault.Sua, MorfuncDefault.Xoa].includes(element.functionID) &&
        data?.status != '1' &&
        data?.status != '2'
      )
        element.disabled = true;
      if (Object.values(MorfuncCashReceipt).includes(element.functionID)) {
        switch (data?.status) {
          case '1':
            if (!data?.validated) {
              if (
                ![
                  MorfuncCashReceipt.KiemTraHopLePT,
                  MorfuncCashReceipt.KiemTraHopLeBC,
                  MorfuncCashReceipt.InPT,
                  MorfuncCashReceipt.InBC,
                ].includes(element.functionID)
              )
                element.disabled = true;
            } else {
              if (journal.approvalControl == '0') {
                if (
                  ![
                    MorfuncCashReceipt.GhiSoPT,
                    MorfuncCashReceipt.GhiSoBC,
                    MorfuncCashReceipt.InPT,
                    MorfuncCashReceipt.InBC,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              } else {
                if (
                  ![
                    MorfuncCashReceipt.GuiDuyetPT,
                    MorfuncCashReceipt.GuiDuyetBC,
                    MorfuncCashReceipt.InPT,
                    MorfuncCashReceipt.InBC,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              }
            }
            break;

          case '2':
            if (
              ![
                MorfuncCashReceipt.KiemTraHopLePT,
                MorfuncCashReceipt.KiemTraHopLeBC,
                MorfuncCashReceipt.InPT,
                MorfuncCashReceipt.InBC,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '3':
            if (
              ![
                MorfuncCashReceipt.HuyDuyetPT,
                MorfuncCashReceipt.HuyDuyetBC,
                MorfuncCashReceipt.InPT,
                MorfuncCashReceipt.InBC,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '5':
          case '9':
            if (
              ![
                MorfuncCashReceipt.GhiSoPT,
                MorfuncCashReceipt.GhiSoBC,
                MorfuncCashReceipt.InPT,
                MorfuncCashReceipt.InBC,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '6':
            if (
              ![
                MorfuncCashReceipt.KhoiPhucPT,
                MorfuncCashReceipt.KhoiPhucBC,
                MorfuncCashReceipt.InPT,
                MorfuncCashReceipt.InBC,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          default:
            element.disabled = true;
            break;
        }
      }
      event = event.sort((a, b) => b.functionID.localeCompare(a.functionID));
    }, {});
  }

  changeMFGeneralJournal(event, data, type: any = '', journal, formModel) {
    event.reduce((pre, element) => {
      if (
        !Object.values(MorfuncGeneralJournals).includes(element.functionID) &&
        !Object.values(MorfuncDefault).includes(element.functionID)
      )
        element.disabled = true;
      if (type === 'viewgrid') element.isbookmark = false;
      if (type === 'viewdetail') {
        if (![MorfuncDefault.XuatDuLieu].includes(element.functionID)) {
          element.isbookmark = true;
        }
      }
      if (
        [MorfuncDefault.Sua, MorfuncDefault.Xoa].includes(element.functionID) &&
        data?.status != '1' &&
        data?.status != '2'
      )
        element.disabled = true;
      if (Object.values(MorfuncGeneralJournals).includes(element.functionID)) {
        switch (data?.status) {
          case '1':
            if (!data?.validated) {
              if (
                ![
                  MorfuncGeneralJournals.KiemTraHopLe,
                  MorfuncGeneralJournals.In,
                ].includes(element.functionID)
              )
                element.disabled = true;
            } else {
              if (journal.approvalControl == '0') {
                if (
                  ![
                    MorfuncGeneralJournals.GhiSo,
                    MorfuncGeneralJournals.In,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              } else {
                if (
                  ![
                    MorfuncGeneralJournals.GuiDuyet,
                    MorfuncGeneralJournals.In,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              }
            }
            break;

          case '2':
            if (
              ![
                MorfuncGeneralJournals.KiemTraHopLe,
                MorfuncGeneralJournals.In,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '3':
            if (
              ![
                MorfuncGeneralJournals.HuyDuyet,
                MorfuncGeneralJournals.In,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '5':
          case '9':
            if (
              ![
                MorfuncGeneralJournals.GhiSo,
                MorfuncGeneralJournals.In,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '6':
            if (
              ![
                MorfuncGeneralJournals.KhoiPhuc,
                MorfuncGeneralJournals.In,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          default:
            element.disabled = true;
            break;
        }
      }
      event = event.sort((a, b) => b.functionID.localeCompare(a.functionID));
    }, {});
  }

  changeMFCashTranfers(event, data, type: any = '', journal, formModel) {
    event.reduce((pre, element) => {
      if (
        !Object.values(MorfuncCashTranfers).includes(element.functionID) &&
        !Object.values(MorfuncDefault).includes(element.functionID)
      )
        element.disabled = true;
      if (type === 'viewgrid') element.isbookmark = false;
      if (type === 'viewdetail') {
        if (![MorfuncDefault.XuatDuLieu].includes(element.functionID)) {
          element.isbookmark = true;
        }
      }
      if (
        [MorfuncDefault.Sua, MorfuncDefault.Xoa].includes(element.functionID) &&
        data?.status != '1' &&
        data?.status != '2'
      )
        element.disabled = true;
      if (Object.values(MorfuncCashTranfers).includes(element.functionID)) {
        switch (data?.status) {
          case '1':
            if (!data?.validated) {
              if (
                ![
                  MorfuncCashTranfers.KiemTraHopLe,
                  MorfuncCashTranfers.In,
                ].includes(element.functionID)
              )
                element.disabled = true;
            } else {
              if (journal.approvalControl == '0') {
                if (
                  ![
                    MorfuncCashTranfers.GhiSo,
                    MorfuncCashTranfers.In,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              } else {
                if (
                  ![
                    MorfuncCashTranfers.GuiDuyet,
                    MorfuncCashTranfers.In,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              }
            }
            break;

          case '2':
            if (
              ![
                MorfuncCashTranfers.KiemTraHopLe,
                MorfuncCashTranfers.In,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '3':
            if (
              ![
                MorfuncCashTranfers.HuyDuyet,
                MorfuncCashTranfers.In,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '5':
          case '9':
            if (
              ![
                MorfuncCashTranfers.GhiSo,
                MorfuncCashTranfers.In,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '6':
            if (
              ![
                MorfuncCashTranfers.KhoiPhuc,
                MorfuncCashTranfers.In,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          default:
            element.disabled = true;
            break;
        }
      }
      event = event.sort((a, b) => b.functionID.localeCompare(a.functionID));
    }, {});
  }

  changeMFPur(event, data, type: any = '', journal, formModel) {
    event.reduce((pre, element) => {
      if (
        !Object.values(MorfuncPur).includes(element.functionID) &&
        !Object.values(MorfuncDefault).includes(element.functionID)
      )
        element.disabled = true;
      if (type === 'viewgrid') element.isbookmark = false;
      if (type === 'viewdetail') {
        if (![MorfuncDefault.XuatDuLieu].includes(element.functionID)) {
          element.isbookmark = true;
        }
      }
      if (
        [MorfuncDefault.Sua, MorfuncDefault.Xoa].includes(element.functionID) &&
        data?.status != '1' &&
        data?.status != '2'
      )
        element.disabled = true;
      if (Object.values(MorfuncPur).includes(element.functionID)) {
        switch (data?.status) {
          case '1':
            if (!data?.validated) {
              if (
                ![MorfuncPur.KiemTraHopLe, MorfuncPur.In].includes(
                  element.functionID
                )
              )
                element.disabled = true;
            } else {
              if (journal.approvalControl == '0') {
                if (
                  ![
                    MorfuncPur.GhiSo,
                    MorfuncPur.In,
                    MorfuncPur.PhanBoChiPhi,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              } else {
                if (
                  ![MorfuncPur.GuiDuyet, MorfuncPur.In].includes(
                    element.functionID
                  )
                )
                  element.disabled = true;
              }
            }
            break;

          case '2':
            if (
              ![MorfuncPur.KiemTraHopLe, MorfuncPur.In].includes(
                element.functionID
              )
            )
              element.disabled = true;
            break;

          case '3':
            if (
              ![MorfuncPur.HuyDuyet, MorfuncPur.In].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '5':
          case '9':
            if (
              ![
                MorfuncPur.GhiSo,
                MorfuncPur.In,
                MorfuncPur.PhanBoChiPhi,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '6':
            if (
              ![MorfuncPur.KhoiPhuc, MorfuncPur.In].includes(element.functionID)
            )
              element.disabled = true;
            break;

          default:
            element.disabled = true;
            break;
        }
      }
      event = event.sort((a, b) => b.functionID.localeCompare(a.functionID));
    }, {});
  }

  changeMFSale(event, data, type: any = '', journal, formModel) {
    event.reduce((pre, element) => {
      if (
        !Object.values(MorfuncSale).includes(element.functionID) &&
        !Object.values(MorfuncDefault).includes(element.functionID)
      )
        element.disabled = true;
      if (type === 'viewgrid') element.isbookmark = false;
      if (type === 'viewdetail') {
        if (![MorfuncDefault.XuatDuLieu].includes(element.functionID)) {
          element.isbookmark = true;
        }
      }
      if (
        [MorfuncDefault.Sua, MorfuncDefault.Xoa].includes(element.functionID) &&
        data?.status != '1' &&
        data?.status != '2'
      )
        element.disabled = true;
      if (Object.values(MorfuncSale).includes(element.functionID)) {
        switch (data?.status) {
          case '1':
            if (!data?.validated) {
              if (
                ![
                  MorfuncSale.KiemTraHopLe,
                  MorfuncSale.In,
                  MorfuncSale.demo,
                ].includes(element.functionID)
              )
                element.disabled = true;
            } else {
              if (journal.approvalControl == '0') {
                if (
                  ![
                    MorfuncSale.GhiSo,
                    MorfuncSale.In,
                    MorfuncSale.demo,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              } else {
                if (
                  ![
                    MorfuncSale.GuiDuyet,
                    MorfuncSale.In,
                    MorfuncSale.demo,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              }
            }
            break;

          case '2':
            if (
              ![
                MorfuncSale.KiemTraHopLe,
                MorfuncSale.In,
                MorfuncSale.demo,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '3':
            if (
              ![
                MorfuncSale.HuyDuyet,
                MorfuncSale.In,
                MorfuncSale.demo,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '5':
          case '9':
            if (
              ![MorfuncSale.GhiSo, MorfuncSale.In, MorfuncSale.demo].includes(
                element.functionID
              )
            )
              element.disabled = true;
            break;

          case '6':
            if (
              ![
                MorfuncSale.KhoiPhuc,
                MorfuncSale.In,
                MorfuncSale.demo,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          default:
            element.disabled = true;
            break;
        }
      }
      event = event.sort((a, b) => b.functionID.localeCompare(a.functionID));
    }, {});
  }

  changeMFVoucher(event, data, type: any = '', journal, formModel) {
    event.reduce((pre, element) => {
      if (
        !Object.values(MorfuncVoucher).includes(element.functionID) &&
        !Object.values(MorfuncDefault).includes(element.functionID)
      )
        element.disabled = true;
      if (type === 'viewgrid') element.isbookmark = false;
      if (type === 'viewdetail') {
        if (![MorfuncDefault.XuatDuLieu].includes(element.functionID)) {
          element.isbookmark = true;
        }
      }
      if (
        [MorfuncDefault.Sua, MorfuncDefault.Xoa].includes(element.functionID) &&
        data?.status != '1' &&
        data?.status != '2'
      )
        element.disabled = true;
      if (Object.values(MorfuncVoucher).includes(element.functionID)) {
        switch (data?.status) {
          case '1':
            if (!data?.validated) {
              if (
                ![
                  MorfuncVoucher.KiemTraHopLeNK,
                  MorfuncVoucher.KiemTraHopLeXK,
                  MorfuncVoucher.InNK,
                  MorfuncVoucher.InXK,
                ].includes(element.functionID)
              )
                element.disabled = true;
            } else {
              if (journal.approvalControl == '0') {
                if (
                  ![
                    MorfuncVoucher.GhiSoNK,
                    MorfuncVoucher.GhiSoXK,
                    MorfuncVoucher.InNK,
                    MorfuncVoucher.InXK,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              } else {
                if (
                  ![
                    MorfuncVoucher.GuiDuyetNK,
                    MorfuncVoucher.GuiDuyetXK,
                    MorfuncVoucher.InNK,
                    MorfuncVoucher.InXK,
                  ].includes(element.functionID)
                )
                  element.disabled = true;
              }
            }
            break;

          case '2':
            if (
              ![
                MorfuncVoucher.KiemTraHopLeNK,
                MorfuncVoucher.KiemTraHopLeXK,
                MorfuncVoucher.InNK,
                MorfuncVoucher.InXK,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '3':
            if (
              ![
                MorfuncVoucher.HuyDuyetNK,
                MorfuncVoucher.HuyDuyetXK,
                MorfuncVoucher.InNK,
                MorfuncVoucher.InXK,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '5':
          case '9':
            if (
              ![
                MorfuncVoucher.GhiSoNK,
                MorfuncVoucher.GhiSoXK,
                MorfuncVoucher.InNK,
                MorfuncVoucher.InXK,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          case '6':
            if (
              ![
                MorfuncVoucher.KhoiPhucNK,
                MorfuncVoucher.KhoiPhucXK,
                MorfuncVoucher.InNK,
                MorfuncVoucher.InXK,
              ].includes(element.functionID)
            )
              element.disabled = true;
            break;

          default:
            element.disabled = true;
            break;
        }
      }
      event = event.sort((a, b) => b.functionID.localeCompare(a.functionID));
    }, {});
  }

  changeMFTranfers(event, data, type: any = '', journal, formModel) {
    event.reduce((pre, element) => {
      if (
        !Object.values(MorfuncTranfers).includes(element.functionID) &&
        !Object.values(MorfuncDefault).includes(element.functionID)
      )
        element.disabled = true;
      if (type === 'viewgrid') element.isbookmark = false;
      if (type === 'viewdetail') {
        if (![MorfuncDefault.XuatDuLieu].includes(element.functionID)) {
          element.isbookmark = true;
        }
      }
      if (
        [MorfuncDefault.Sua, MorfuncDefault.Xoa].includes(element.functionID) &&
        data?.status != '1' &&
        data?.status != '2'
      )
        element.disabled = true;
      if (Object.values(MorfuncTranfers).includes(element.functionID)) {
        switch (data?.status) {
          case '1':
            if (!data?.validated) {
              if (
                ![MorfuncTranfers.KiemTraHopLe, MorfuncTranfers.In].includes(
                  element.functionID
                )
              )
                element.disabled = true;
            } else {
              if (journal.approvalControl == '0') {
                if (
                  ![MorfuncTranfers.GhiSo, MorfuncTranfers.In].includes(
                    element.functionID
                  )
                )
                  element.disabled = true;
              } else {
                if (
                  ![MorfuncTranfers.GuiDuyet, MorfuncTranfers.In].includes(
                    element.functionID
                  )
                )
                  element.disabled = true;
              }
            }
            break;

          case '2':
            if (
              ![MorfuncTranfers.KiemTraHopLe, MorfuncTranfers.In].includes(
                element.functionID
              )
            )
              element.disabled = true;
            break;

          case '3':
            if (
              ![MorfuncTranfers.HuyDuyet, MorfuncTranfers.In].includes(
                element.functionID
              )
            )
              element.disabled = true;
            break;

          case '5':
          case '9':
            if (
              ![MorfuncTranfers.GhiSo, MorfuncTranfers.In].includes(
                element.functionID
              )
            )
              element.disabled = true;
            break;

          case '6':
            if (
              ![MorfuncTranfers.KhoiPhuc, MorfuncTranfers.In].includes(
                element.functionID
              )
            )
              element.disabled = true;
            break;

          default:
            element.disabled = true;
            break;
        }
      }
      event = event.sort((a, b) => b.functionID.localeCompare(a.functionID));
    }, {});
  }

  changeMFJournal(event, type) {
    event.reduce((pre, element) => {
      if (!Object.values(MorfuncDefault).includes(element.functionID))
        element.disabled = true;
      if ([MorfuncDefault.XuatDuLieu].includes(element.functionID))
        element.disabled = true;
      element.isbookmark = true;
      if (type === '3' && element.functionID === 'ACT09')
        element.disabled = false;
      if (element.functionID === MorfuncDefault.Xem) element.disabled = true;
    }, {});
  }

  changeMFCategories(event, type) {
    event.reduce((pre, element) => {
      if (type === 'views') element.isbookmark = true;
      if (!['SYS03', 'SYS02', 'SYS04'].includes(element.functionID))
        element.disabled = true;
    }, {});
  }

  getSettingFromJournal(
    eleGrid: CodxGridviewV2Component,
    journal: any,
    data: any = null,
    baseCurr: any = '',
    hideFields: any = []
  ) {
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
    eleGrid.setPredicates('accountID', preAccountID, dtvAccountID);

    if (
      (journal.crAcctControl == '1' || journal.crAcctControl == '2') &&
      journal.entryMode == '1'
    ) {
      preOffsetAcctID = '@0.Contains(AccountID)';
      dtvOffsetAcctID = `[${journal?.crAcctID}]`;
    }
    eleGrid.setPredicates('offsetAcctID', preOffsetAcctID, dtvOffsetAcctID);

    if (journal.diM1Control == '1' || journal.diM1Control == '2') {
      preDIM1 = '@0.Contains(ProfitCenterID)';
      dtvDIM1 = `[${journal?.diM1}]`;
    }
    eleGrid.setPredicates('diM1', preDIM1, dtvDIM1);

    if (journal.diM2Control == '1' || journal.diM2Control == '2') {
      preDIM2 = '@0.Contains(CostCenterID)';
      dtvDIM2 = `[${journal?.diM2}]`;
    }
    eleGrid.setPredicates('diM2', preDIM2, dtvDIM2);

    if (journal.diM3Control == '1' || journal.diM3Control == '2') {
      preDIM3 = '@0.Contains(CostItemID)';
      dtvDIM3 = `[${journal?.diM3}]`;
    }
    eleGrid.setPredicates('diM3', preDIM3, dtvDIM3);

    let arrayType = ['PI', 'SI'];
    if (arrayType.includes(journal.journalType)) {
      if (!journal.useDutyTax) {
        //? không sử dụng thuế xuất nhập khẩu (ẩn)
        hideFields.push('SalesTaxPct');
        hideFields.push('SalesTaxAmt');
        hideFields.push('SalesTaxAmt2');
      } else {
        if (data && data?.currencyID == baseCurr)
          hideFields.push('SalesTaxAmt2');
      }

      if (!journal.useExciseTax) {
        //? không sử dụng thuế TTĐB (ẩn)
        hideFields.push('ExciseTaxPct');
        hideFields.push('ExciseTaxAmt');
        hideFields.push('ExciseTaxAmt2');
      } else {
        if (data && data?.currencyID == baseCurr)
          hideFields.push('ExciseTaxAmt2');
      }

      if (journal.vatControl == '0') {
        //? không sử dụng thuế GTGT (ẩn)
        hideFields.push('VATPct');
        hideFields.push('VATAmt');
        hideFields.push('VATBase');
        hideFields.push('VATAmt2');
        hideFields.push('VATBase2');
        hideFields.push('VATID');
      } else {
        if (data && data?.currencyID == baseCurr) {
          hideFields.push('VATAmt2');
          hideFields.push('VATBase2');
        }
      }
    }

    return [eleGrid, hideFields];
  }

  getDataSettingFromJournal(oLine: any, journal: any) {
    if (journal) {
      let arrayType = ['CP', 'BP', 'CR', 'BR', 'GJ'];
      if (arrayType.includes(journal.journalType)) {
        switch (journal?.drAcctControl) {
          case '1':
            if (oLine.accountID && oLine.accountID != journal?.drAcctID)
              oLine.accountID = null;
            break;
          case '4':
            if (oLine.accountID == null) {
              oLine.accountID = journal?.drAcctID;
            }
            break;
          case '2':
            if (!journal?.drAcctID.split(';').includes(oLine.accountID))
              oLine.accountID = null;
            break;
        }

        switch (journal?.crAcctControl) {
          case '1':
            if (oLine.offsetAcctID && oLine.offsetAcctID != journal?.crAcctID)
              oLine.offsetAcctID = null;
            break;
          case '4':
            if (oLine.offsetAcctID == null) {
              oLine.offsetAcctID = journal?.crAcctID;
            }
            break;
          case '2':
            if (!journal?.crAcctID.split(';').includes(oLine.offsetAcctID))
              oLine.offsetAcctID = null;
            break;
        }
      }
      if (
        journal?.diM1Control &&
        journal?.diM1Control != '2' &&
        journal?.diM1Control != '0'
      )
        oLine.diM1 = journal.diM1;
      if (
        journal?.diM2Control &&
        journal?.diM2Control != '2' &&
        journal?.diM2Control != '0'
      )
        oLine.diM2 = journal.diM2;
      if (
        journal?.diM3Control &&
        journal?.diM3Control != '2' &&
        journal?.diM3Control != '0'
      )
        oLine.diM3 = journal.diM3;

      return oLine;
    }
  }

  setChildLinks() {
    let options1 = new DataRequest();
    options1.entityName = 'SYS_FunctionList';
    options1.pageLoading = false;
    options1.predicates = 'ParentID=@0 and Language=@1';
    options1.dataValues = `ACT;${
      this.authStore.get().language == '' ? 'VN' : this.authStore.get().language
    }`;

    let options2 = new DataRequest();
    options2.entityName = 'AC_Journals';
    options2.pageLoading = false;
    options2.predicates = 'Status=@0';
    options2.dataValues = '1';

    combineLatest({
      functionList: this.api
        .execSv('SYS', 'Core', 'DataBusiness', 'LoadDataAsync', options1)
        .pipe(map((r) => r?.[0] ?? [])),
      journals: this.api
        .execSv('AC', 'Core', 'DataBusiness', 'LoadDataAsync', options2)
        .pipe(map((r) => r?.[0] ?? [])),
      vll077: this.cacheService.valueList('AC077').pipe(map((v) => v.datas)),
    }).subscribe(({ functionList, journals, vll077 }) => {
      let links: PageLink[] = [];
      journals.forEach((journal) => {
        let functionId: string = vll077.find(
          (v) => v.value === journal.journalType
        )?.default;
        let func: any = functionList.find((f) => f.functionID === functionId);
        links.push({
          title: func?.defaultName,
          desc: journal.journalDesc,
          path: func?.url + '/' + journal?.journalNo,
        });
      });
      this.pageTitleService.setChildren(links);
    });
  }
}
