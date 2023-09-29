import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CallFuncService,
  DataRequest,
  FormModel,
  NotificationsService,
  SidebarModel,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { lastValueFrom } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../journals/journals.service';
import { IPurchaseInvoice } from './interfaces/IPurchaseInvoice.inteface';
import { PurchaseinvoicesAddComponent } from './purchaseinvoices-add/purchaseinvoices-add.component';

export enum MF {
  GuiDuyet = 'ACT060102',
  GhiSo = 'ACT060103',
  HuyYeuCauDuyet = 'ACT060104',
  KhoiPhuc = 'ACT060105',
  KiemTraTinhHopLe = 'ACT060106',
  In = 'ACT060107',
}

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

@Injectable({
  providedIn: 'root',
})
export class PurchaseInvoiceService {
  journal: IJournal;

  constructor(
    cacheService: CacheService,
    private notiService: NotificationsService,
    private apiService: ApiHttpService,
    private acService: CodxAcService,
    private shareService: CodxShareService,
    private journalService: JournalService,
    private callFuncService: CallFuncService
  ) {
    cacheService
      .gridViewSetup(fmVATInvoices.formName, fmVATInvoices.gridViewName)
      .subscribe();
  }

  initCache(): void {
    this.apiService
      .exec('IV', 'IVBusiness', 'InitItemInfoListCacheAsync')
      .subscribe();

    this.apiService
      .exec('IV', 'IVBusiness', 'InitDimGroupListCacheAsync')
      .subscribe();

    this.apiService
      .exec('IV', 'IVBusiness', 'InitDimSetupListCacheAsync')
      .subscribe();
  }

  loadJournal(journalNo: string): void {
    this.journalService.getJournal$(journalNo).subscribe((res) => {
      this.journal = res;
    });
  }

  async onInitMFAsync(mfs: any, data: IPurchaseInvoice): Promise<void> {
    if (!this.journal) {
      this.journal = await lastValueFrom(
        this.journalService.getJournal$(data.journalNo)
      );
    }

    let disabledFuncs: MF[] = [
      MF.GuiDuyet,
      MF.GhiSo,
      MF.HuyYeuCauDuyet,
      MF.In,
      MF.KhoiPhuc,
      MF.KiemTraTinhHopLe,
    ];
    switch (data.status) {
      case '7': // phac thao
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.KiemTraTinhHopLe && f !== MF.In
        );
        break;
      case '1': // da hop le
        if (['1', '2'].includes(this.journal.approvalControl)) {
          disabledFuncs = disabledFuncs.filter(
            (f) => f !== MF.GuiDuyet && f !== MF.In
          );
        } else {
          disabledFuncs = disabledFuncs.filter(
            (f) => f !== MF.GhiSo && f !== MF.In
          );
        }
        break;
      case '3': // cho duyet
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.HuyYeuCauDuyet && f !== MF.In
        );
        break;
      case '5': // da duyet
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.GhiSo && f !== MF.In
        );
        break;
      case '6': // da ghi so
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.KhoiPhuc && f !== MF.In
        );
        break;
      case '9': // khoi phuc
        disabledFuncs = disabledFuncs.filter(
          (f) => f !== MF.GhiSo && f !== MF.In
        );
        break;
    }

    for (const mf of mfs) {
      if (disabledFuncs.includes(mf.functionID)) {
        mf.disabled = true;
      }
    }
  }

  onClickMF(
    e: any,
    data: IPurchaseInvoice,
    funcName: string,
    formModel: FormModel,
    dataService: CRUDService
  ): void {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data, dataService);
        break;
      case 'SYS03':
        this.edit(data, funcName, formModel, dataService);
        break;
      case 'SYS04':
        this.copy(data, funcName, formModel, dataService);
        break;
      case 'SYS002':
        this.export(data, formModel, dataService);
        break;
      case MF.KiemTraTinhHopLe:
        this.validate(e, data);
        break;
      case MF.GhiSo:
        this.post(e, data);
        break;
      case MF.GuiDuyet:
        this.submitForApproval(e, data, formModel, dataService);
        break;
      case MF.HuyYeuCauDuyet:
        this.cancelApprovalRequest(e, data, formModel, dataService);
        break;
    }
  }

  edit(
    data: IPurchaseInvoice,
    funcName: string,
    formModel: FormModel,
    dataService: CRUDService
  ): void {
    const copiedData = { ...data };
    dataService.dataSelected = copiedData;
    dataService.edit(copiedData).subscribe((res: any) => {
      const options = new SidebarModel();
      options.DataService = dataService;
      options.FormModel = formModel;
      options.isFull = true;

      this.callFuncService.openSide(
        PurchaseinvoicesAddComponent,
        {
          formType: 'edit',
          formTitle: funcName,
        },
        options,
        formModel.funcID
      );
    });
  }

  copy(
    data: IPurchaseInvoice,
    funcName: string,
    formModel: FormModel,
    dataService: CRUDService
  ): void {
    dataService.dataSelected = data;
    dataService
      .copy(() =>
        this.apiService.exec(
          'AC',
          'PurchaseInvoicesBusiness',
          'GetDefaultAsync',
          [data.journalNo]
        )
      )
      .subscribe((res: any) => {
        if (res) {
          const options = new SidebarModel();
          options.DataService = dataService;
          options.FormModel = formModel;
          options.isFull = true;
          this.callFuncService.openSide(
            PurchaseinvoicesAddComponent,
            {
              formType: 'add',
              formTitle: funcName,
            },
            options,
            formModel.funcID
          );
        }
      });
  }

  delete(data: IPurchaseInvoice, dataService: CRUDService): void {
    dataService.delete([data], true).subscribe();
  }

  export(
    data: IPurchaseInvoice,
    formModel: FormModel,
    dataService: CRUDService
  ): void {
    const gridModel = new DataRequest();
    gridModel.formName = formModel.formName;
    gridModel.entityName = formModel.entityName;
    gridModel.funcID = formModel.funcID;
    gridModel.gridViewName = formModel.gridViewName;
    gridModel.page = dataService.request.page;
    gridModel.pageSize = dataService.request.pageSize;
    gridModel.predicate = dataService.request.predicates;
    gridModel.dataValue = dataService.request.dataValues;
    gridModel.entityPermission = formModel.entityPer;
    gridModel.groupFields = 'createdBy'; //Chưa có group
    this.callFuncService.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }

  validate(e: any, data: IPurchaseInvoice): void {
    this.apiService
      .exec('AC', 'PurchaseInvoicesBusiness', 'ValidateAsync', data)
      .subscribe((res) => {
        if (res) {
          Object.assign(data, res);
          this.notiService.notifyCode('AC0029', 0, e.text);
        }
      });
  }

  post(e: any, data: IPurchaseInvoice): void {
    this.apiService
      .exec('AC', 'PurchaseInvoicesBusiness', 'PostAsync', data)
      .subscribe((res) => {
        if (res) {
          Object.assign(data, res);
          this.notiService.notifyCode('AC0029', 0, e.text);
        }
      });
  }

  submitForApproval(
    e: any,
    data: IPurchaseInvoice,
    formModel: FormModel,
    dataService: CRUDService
  ): void {
    this.acService
      .getCategoryByEntityName(formModel.entityName)
      .subscribe((res1: any) => {
        console.log(res1);
        this.shareService
          .codxRelease(
            'AC',
            data.recID,
            res1?.processID,
            formModel.entityName,
            formModel.funcID,
            '',
            '',
            ''
          )
          .subscribe((res2: any) => {
            console.log(res2);
            if (res2?.msgCodeError) {
              this.notiService.notifyCode(res2.msgCodeError);
            } else {
              data.status = res2.returnStatus;
              dataService.clear();
              dataService.updateDatas.set(data.recID, data);
              dataService
                .save(null, null, null, null, false)
                .subscribe((res3: any) => {
                  if (res3.save.data || res3.update.data) {
                    this.notiService.notifyCode('AC0029', 0, e.text);
                  }
                });
            }
          });
      });
  }

  cancelApprovalRequest(
    e: any,
    data: IPurchaseInvoice,
    formModel: FormModel,
    dataService: CRUDService
  ): void {
    this.shareService
      .codxCancel('AC', data.recID, formModel.entityName, null, null)
      .subscribe((res2: any) => {
        if (res2?.msgCodeError) {
          this.notiService.notifyCode(res2.msgCodeError);
        } else {
          data.status = res2.returnStatus;
          dataService.clear();
          dataService.updateDatas.set(data.recID, data);
          dataService
            .save(null, null, null, null, false)
            .subscribe((res3: any) => {
              if (res3.save.data || res3.update.data) {
                this.notiService.notifyCode('AC0029', 0, e.text);
              }
            });
        }
      });
  }
}
