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
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { ISalesInvoice } from './interfaces/ISalesInvoice.interface';
import { ISalesInvoicesLine } from './interfaces/ISalesInvoicesLine.interface';
import { PopupAddSalesInvoiceComponent } from './popup-add-sales-invoice/popup-add-sales-invoice.component';
import { SalesInvoiceService } from './sales-invoices.service';

@Component({
  selector: 'lib-sales-invoices',
  templateUrl: './sales-invoices.component.html',
  styleUrls: ['./sales-invoices.component.css'],
})
export class SalesInvoicesComponent
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
  selectedData: ISalesInvoice;
  salesInvoicesLines: ISalesInvoicesLine[] = [];
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];

  constructor(
    inject: Injector,
    private acService: CodxAcService,
    public salesInvoiceService: SalesInvoiceService
  ) {
    super(inject);

    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit(): void {
    console.log(this.view);

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
      this.functionName = this.acService.toCamelCase(res.defaultName);
    });
  }
  //#endregion

  //#region Event
  onChange(e): void {
    console.log('onChange', e);

    if (e.data.error?.isError) {
      return;
    }

    this.selectedData = e.data.data ?? e.data;
  }

  onClickAdd(e): void {
    this.view.dataService
      .addNew(() =>
        this.api.exec('SM', 'SalesInvoicesBusiness', 'GetDefaultAsync', [
          this.journalNo,
        ])
      )
      .subscribe((res: any) => {
        console.log({ res });

        let options = new SidebarModel();
        options.DataService = this.view.dataService;
        options.FormModel = this.view.formModel;
        options.isFull = true;

        this.callfc.openSide(
          PopupAddSalesInvoiceComponent,
          {
            formType: 'add',
            formTitle: `${e.text} ${this.functionName}`,
            journalNo: this.journalNo,
          },
          options,
          this.view.funcID
        );
      });
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
  //#endregion

  //#region Method
  delete(data: ISalesInvoice): void {
    this.view.dataService.delete([data], true).subscribe((res: any) => {
      console.log({ res });
      if (!res.error) {
        this.salesInvoiceService.deleteLinesByTransID(data.recID);
      }
    });
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
        PopupAddSalesInvoiceComponent,
        {
          formType: 'edit',
          formTitle: `${e.text} ${this.functionName}`,
          journalNo: this.journalNo,
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
        PopupAddSalesInvoiceComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
          journalNo: this.journalNo,
        },
        options,
        this.view.funcID
      );
    });
  }

  export(data) {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    //Chưa có group
    gridModel.groupFields = 'createdBy';
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
  //#endregion
}
