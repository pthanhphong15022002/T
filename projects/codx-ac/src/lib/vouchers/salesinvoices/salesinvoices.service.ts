import { Injectable } from '@angular/core';
import {
  ApiHttpService,
  CRUDService,
  CallFuncService,
  DataRequest,
  FormModel,
  NotificationsService,
  SidebarModel,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { lastValueFrom } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../journals/journals.service';
import { SalesinvoicesAddComponent } from './salesinvoices-add/salesinvoices-add.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

export enum MF {
  GuiDuyet = 'ACT060504',
  GhiSo = 'ACT060506',
  HuyYeuCauDuyet = 'ACT060505',
  KhoiPhuc = 'ACT060507',
  KiemTraTinhHopLe = 'ACT060503',
  In = 'ACT060508',
}

export const fmSalesInvoicesLines: FormModel = {
  entityName: 'AC_SalesInvoicesLines',
  formName: 'SalesInvoicesLines',
  gridViewName: 'grvSalesInvoicesLines',
  entityPer: 'AC_SalesInvoicesLines',
  // funcID: 'ACT0605',
};

@Injectable({
  providedIn: 'root',
})
export class SalesInvoiceService {
  vats: any[]; // remove later
  journal: IJournal;

  constructor(
    private apiService: ApiHttpService,
    private acService: CodxAcService,
    private journalService: JournalService,
    private callFuncService: CallFuncService,
    private notiService: NotificationsService,
    private shareService: CodxShareService,
  ) {
    this.acService
      .loadComboboxData$('VATCodesAC', 'AC')
      .subscribe((res) => (this.vats = res));
  }

  loadJournal(journalNo: string): void {
    this.journalService.getJournal$(journalNo).subscribe((res) => {
      this.journal = res;
    });
  }

  async onInitMFAsync(mfs: any, data: any): Promise<void> {
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
    data: any,
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
        // this.validate(e, data);
        break;
      case MF.GhiSo:
        // this.post(e, data);
        break;
      case MF.GuiDuyet:
        this.submitForApproval(e, data, formModel, dataService);
        break;
      case MF.HuyYeuCauDuyet:
        this.cancelApprovalRequest(e, data, formModel, dataService);
        break;
    }
  }

  delete(data: any, dataService: CRUDService): void {
    dataService.delete([data], true).subscribe();
  }

  edit(
    data: any,
    funcName: string,
    formModel: FormModel,
    dataService
  ): void {
    console.log('edit', { data });

    const copiedData = { ...data };
    dataService.dataSelected = copiedData;
    dataService.edit(copiedData).subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = dataService;
      options.FormModel = formModel;
      options.isFull = true;

      this.callFuncService.openSide(
        SalesinvoicesAddComponent,
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
    data: any,
    funcName: string,
    formModel: FormModel,
    dataService: CRUDService
  ): void {
    console.log('copy', { data });

    dataService.dataSelected = data;
    dataService
      .copy(() =>
        this.apiService.exec('AC', 'SalesInvoicesBusiness', 'GetDefaultAsync', [
          data.journalNo,
        ])
      )
      .subscribe((res) => {
        let options = new SidebarModel();
        options.DataService = dataService;
        options.FormModel = formModel;
        options.isFull = true;

        this.callFuncService.openSide(
          SalesinvoicesAddComponent,
          {
            formType: 'add',
            formTitle: funcName,
          },
          options,
          formModel.funcID
        );
      });
  }

  export(data, formModel: FormModel, dataService: CRUDService): void {
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

  submitForApproval(
    e: any,
    data: any,
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
    data: any,
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
