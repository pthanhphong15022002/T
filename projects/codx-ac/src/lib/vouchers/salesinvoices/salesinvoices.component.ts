import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  DataRequest,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { BehaviorSubject, Observable, distinctUntilKeyChanged } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../journals/journals.service';
import { toCamelCase } from '../../utils';
import { ISalesInvoice } from './interfaces/ISalesInvoice.interface';
import { SalesinvoicesAddComponent } from './salesinvoices-add/salesinvoices-add.component';
import { SalesInvoiceService } from './salesinvoices.service';

export enum MF {
  GuiDuyet = 'ACT060504',
  GhiSo = 'ACT060506',
  HuyYeuCauDuyet = 'ACT060505',
  KhoiPhuc = 'ACT060507',
  KiemTraTinhHopLe = 'ACT060503',
  In = 'ACT060508',
}

@Component({
  selector: 'lib-salesinvoices',
  templateUrl: './salesinvoices.component.html',
  styleUrls: ['./salesinvoices.component.scss'],
})
export class SalesinvoicesComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('moreTemplate') moreTemplate?: TemplateRef<any>;
  @ViewChild('sider') sider?: TemplateRef<any>;
  @ViewChild('content') content?: TemplateRef<any>;

  views: Array<ViewModel> = [];
  btnAdd = {
    id: 'btnAdd',
  };
  functionName: string;
  journalNo: string;
  defaultSubject = new BehaviorSubject<ISalesInvoice>(null);

  journal: IJournal;
  master: ISalesInvoice;

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private salesInvoiceService: SalesInvoiceService,
    private journalService: JournalService
  ) {
    super(inject);

    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.emitDefault();

    this.journalService.getJournal$(this.journalNo).subscribe((journal) => {
      this.salesInvoiceService.journal = this.journal = journal;
    });

    this.journalService.setChildLinks(this.journalNo);
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.moreTemplate,
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.sider,
          panelRightRef: this.content,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName = toCamelCase(res.defaultName);
    });
  }
  //#endregion

  //#region Event
  onSelectChange(e): void {
    console.log('onChange', e);

    if (e.data.error?.isError) {
      return;
    }

    if (e.data.data ?? e.data) {
      this.master = e.data.data ?? e.data;
    }
  }

  onClickAdd(e): void {
    this.view.dataService
      .addNew(() =>
        this.defaultSubject
          .asObservable()
          .pipe(distinctUntilKeyChanged('recID'))
      )
      .subscribe((res: any) => {
        if (res) {
          let options = new SidebarModel();
          options.DataService = this.view.dataService;
          options.FormModel = this.view.formModel;
          options.isFull = true;

          this.callfc
            .openSide(
              SalesinvoicesAddComponent,
              {
                formType: 'add',
                formTitle: this.functionName,
              },
              options,
              this.view.funcID
            )
            .closed.subscribe(() => {
              this.emitDefault();
            });
        }
      })
      .unsubscribe();
  }

  onClickMF(e, data): void {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
      case 'SYS002':
        this.export(data);
        break;
    }
  }

  onInitMF(mfs: any, data: ISalesInvoice): void {
    // console.log(mfs.filter((f) => !f.disabled));
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
          disabledFuncs = disabledFuncs.filter((f) => f !== MF.GuiDuyet);
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
  //#endregion

  //#region Method
  getDefault(): Observable<any> {
    return this.api.exec('AC', 'SalesInvoicesBusiness', 'GetDefaultAsync', [
      this.journalNo,
    ]);
  }

  delete(data: ISalesInvoice): void {
    this.view.dataService.delete([data], true).subscribe();
  }

  edit(e, data): void {
    console.log('edit', { data });

    const copiedData = { ...data };
    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        SalesinvoicesAddComponent,
        {
          formType: 'edit',
          formTitle: this.functionName,
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(e, data): void {
    console.log('copy', { data });

    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        SalesinvoicesAddComponent,
        {
          formType: 'add',
          formTitle: this.functionName,
        },
        options,
        this.view.funcID
      );
    });
  }

  export(data): void {
    const gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    gridModel.groupFields = 'createdBy'; //Chưa có group
    this.callfc.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }
  //#endregion

  //#region Function
  emitDefault(): void {
    this.getDefault().subscribe((res) => {
      this.defaultSubject.next({
        ...res,
        recID: res.data.recID,
      });
    });
  }
  //#endregion
}
