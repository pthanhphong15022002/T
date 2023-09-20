import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  DataRequest,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { BehaviorSubject, Observable, distinctUntilKeyChanged } from 'rxjs';
import { IJournal } from '../../journals/interfaces/IJournal.interface';
import { JournalService } from '../../journals/journals.service';
import { IPurchaseInvoice } from './interfaces/IPurchaseInvoice.inteface';
import { PurchaseinvoicesAddComponent } from './purchaseinvoices-add/purchaseinvoices-add.component';
import { MF, PurchaseInvoiceService } from './purchaseinvoices.service';

@Component({
  selector: 'lib-purchaseinvoices',
  templateUrl: './purchaseinvoices.component.html',
  styleUrls: ['./purchaseinvoices.component.scss'],
})
export class PurchaseinvoicesComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('siderTemplate') siderTemplate?: TemplateRef<any>;
  @ViewChild('contentTemplate') contentTemplate?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('memoContent', { read: ElementRef })
  memoContent: ElementRef<HTMLElement>;

  views: Array<ViewModel> = [];
  button: ButtonModel = { id: 'btnAdd' };
  funcName: string;
  journalNo: string;
  defaultSubject = new BehaviorSubject<IPurchaseInvoice>(null);

  master: IPurchaseInvoice;
  journal: IJournal;

  gvsAcctTrans: any;

  constructor(
    inject: Injector,
    private purchaseInvoiceService: PurchaseInvoiceService, // don't remove this
    private journalService: JournalService,
    private routerActive: ActivatedRoute
  ) {
    super(inject);

    this.routerActive.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.emitDefault();

    this.journalService.getJournal$(this.journalNo).subscribe((journal) => {
      this.purchaseInvoiceService.journal = this.journal = journal;
    });

    this.journalService.setChildLinks(this.journalNo);

    // this.purchaseInvoiceService.initCache();
  }

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.funcName = res.defaultName;
    });

    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.siderTemplate,
          panelRightRef: this.contentTemplate,
        },
      },
    ];
  }
  //#endregion

  //#region Event
  onInitMF(mfs: any, data: IPurchaseInvoice): void {
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

  onClickMF(e, data) {
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

  onClickAdd(e) {
    this.view.dataService
      .addNew(() =>
        this.defaultSubject
          .asObservable()
          .pipe(distinctUntilKeyChanged('recID'))
      )
      .subscribe((res: any) => {
        console.log('onClickAdd', res);
        if (res) {
          let options = new SidebarModel();
          options.DataService = this.view.dataService;
          options.FormModel = this.view.formModel;
          options.isFull = true;

          this.callfc
            .openSide(
              PurchaseinvoicesAddComponent,
              {
                formType: 'add',
                formTitle: this.funcName,
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

  onSelectChange(e) {
    console.log('onChange', e);

    if (e.data?.error?.isError) {
      return;
    }
    
    if (e.data.data ?? e.data) {
      this.master = e.data.data ?? e.data;
    }
  }
  //#endregion

  //#region Method
  getDefault(): Observable<any> {
    return this.api.exec('AC', 'PurchaseInvoicesBusiness', 'GetDefaultAsync', [
      this.journalNo,
    ]);
  }

  edit(e, data): void {
    const copiedData = { ...data };
    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe((res: any) => {
      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.callfc.openSide(
        PurchaseinvoicesAddComponent,
        {
          formType: 'edit',
          formTitle: this.funcName,
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(e, data): void {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .copy(() => this.getDefault())
      .subscribe((res: any) => {
        if (res) {
          var obj = {
            formType: 'add',
            formTitle: this.funcName,
          };
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.isFull = true;
          this.callfc.openSide(
            PurchaseinvoicesAddComponent,
            obj,
            option,
            this.view.funcID
          );
        }
      });
  }

  delete(data: IPurchaseInvoice): void {
    this.view.dataService.delete([data], true).subscribe();
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
