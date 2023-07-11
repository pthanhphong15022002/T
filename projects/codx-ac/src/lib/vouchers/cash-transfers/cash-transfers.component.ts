import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  DataRequest,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { CashTransferService } from './cash-transfers.service';
import { ICashTransfer } from './interfaces/ICashTransfer.interface';
import { PopupAddCashTransferComponent } from './popup-add-cash-transfer/popup-add-cash-transfer.component';
import { SumFormat, TableColumn } from '../sales-invoices/models/TableColumn.model';
import { IAcctTran } from '../sales-invoices/interfaces/IAcctTran.interface';

@Component({
  selector: 'lib-cash-transfers',
  templateUrl: './cash-transfers.component.html',
  styleUrls: ['./cash-transfers.component.scss'],
})
export class CashTransfersComponent
  extends UIComponent
  implements AfterViewInit, AfterViewChecked
{
  //#region Constructor
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('sider') sider?: TemplateRef<any>;
  @ViewChild('content') content?: TemplateRef<any>;
  @ViewChild('memo', { read: ElementRef }) memo: ElementRef<HTMLElement>;

  views: Array<ViewModel> = [];
  btnAdd = {
    id: 'btnAdd',
  };
  master: ICashTransfer;
  functionName: string;
  journalNo: string;
  parent: any;
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];

  columns: TableColumn[];
  lines: IAcctTran[][] = [[]];
  loading: boolean = false;
  fmAcctTrans: FormModel = {
    entityName: 'AC_AcctTrans',
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityPer: 'AC_AcctTrans',
  };

  overflowed: boolean = false;
  expanding: boolean = false;

  constructor(
    injector: Injector,
    private cashTransferService: CashTransferService,
    private acService: CodxAcService
  ) {
    super(injector);

    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
      if (params?.parent) {
        this.cache.functionList(params.parent).subscribe((res) => {
          if (res) this.parent = res;
        });
      }
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .gridViewSetup(this.fmAcctTrans.formName, this.fmAcctTrans.gridViewName)
      .subscribe((gvs) => {
        this.columns = [
          new TableColumn({
            labelName: 'Num',
            headerText: 'STT',
          }),
          new TableColumn({
            labelName: 'Account',
            headerText: gvs?.AccountID?.headerText ?? 'Tài khoản',
            footerText: 'Tổng cộng',
            footerClass: 'text-end',
          }),
          new TableColumn({
            labelName: 'Debt1',
            headerText: 'Nợ',
            field: 'transAmt',
            headerClass: 'text-end',
            footerClass: 'text-end',
            hasSum: true,
            sumFormat: SumFormat.Currency,
          }),
          new TableColumn({
            labelName: 'Debt2',
            headerText: 'Có',
            field: 'transAmt',
            headerClass: 'text-end',
            footerClass: 'text-end',
            hasSum: true,
            sumFormat: SumFormat.Currency,
          }),
          new TableColumn({
            labelName: 'Memo',
            headerText: gvs?.Memo?.headerText ?? 'Ghi chú',
            headerClass: 'pe-3',
            footerClass: 'pe-3',
          }),
        ];
      });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
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
    this.view.setRootNode(this.parent?.customName);
  }

  ngAfterViewChecked(): void {
    const element: HTMLElement = this.memo?.nativeElement;
    this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnDestroy() {
    this.view.setRootNode('');
  }
  //#endregion

  //#region Event
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

  onClickShowLess(): void {
    this.expanding = !this.expanding;
    this.detectorRef.detectChanges();
  }

  onChange(e): void {
    if (e.data.error?.isError) {
      return;
    }

    this.master = e.data.data ?? e.data;
    if (!this.master) {
      return;
    }

    this.loading = true;
    this.lines = [];
    this.api
      .exec(
        'AC',
        'AcctTransBusiness',
        'LoadDataAsync',
        'e973e7b7-10a1-11ee-94b4-00155d035517'
      )
      .subscribe((res: IAcctTran[]) => {
        console.log(res);
        if (!res) {
          this.loading = false;
          return;
        }
        
        this.lines = this.groupBy(res, 'entryID');

        // calculate totalRow
        const totalRow: { total1: number; total2: number } = {
          total1: 0,
          total2: 0,
        };
        for (const group of this.lines) {
          for (const line of group) {
            if (!line.crediting) {
              totalRow.total1 += line.transAmt;
            } else {
              totalRow.total2 += line.transAmt;
            }
          }
        }
        for (const col of this.columns) {
          if (col.labelName === 'Debt1') {
            col.sum = totalRow.total1;
          } else if (col.labelName === 'Debt2') {
            col.sum = totalRow.total2;
          }
        }

        this.loading = false;
      });
  }

  onClickAdd(e): void {
    this.view.dataService
      .addNew(() =>
        this.api.exec('AC', 'CashTranfersBusiness', 'GetDefaultAsync', [
          this.journalNo,
        ])
      )
      .subscribe((res: any) => {
        console.log({ res });

        let options = new SidebarModel();
        options.DataService = this.view.dataService;
        options.FormModel = this.view.formModel;
        options.isFull = true;

        this.cache
          .gridViewSetup('VATInvoices', 'grvVATInvoices')
          .subscribe((res) => {
            if (res) {
              this.callfc.openSide(
                PopupAddCashTransferComponent,
                {
                  formType: 'add',
                  journalNo: this.journalNo,
                  formTitle: `${e.text} ${this.functionName}`,
                },
                options,
                this.view.funcID
              );
            }
          });
      });
  }
  //#endregion

  //#region Method
  edit(e, data): void {
    console.log('edit', { data });

    const copiedData = { ...data };
    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe((res: any) => {
      console.log({ res });

      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.cache
        .gridViewSetup('VATInvoices', 'grvVATInvoices')
        .subscribe((res) => {
          if (res) {
            this.callfc.openSide(
              PopupAddCashTransferComponent,
              {
                formType: 'edit',
                formTitle: `${e.text} ${this.functionName}`,
                journalNo: this.journalNo,
              },
              options,
              this.view.funcID
            );
          }
        });
    });
  }

  copy(e, data): void {
    console.log('copy', { data });

    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res) => {
      console.log(res);

      let options = new SidebarModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.isFull = true;

      this.cache
        .gridViewSetup('VATInvoices', 'grvVATInvoices')
        .subscribe((res) => {
          if (res) {
            this.callfc.openSide(
              PopupAddCashTransferComponent,
              {
                formType: 'add',
                formTitle: `${e.text} ${this.functionName}`,
              },
              options,
              this.view.funcID
            );
          }
        });
    });
  }

  delete(data): void {
    this.view.dataService.delete([data]).subscribe((res: any) => {
      if (res?.data) {
        this.cashTransferService.deleteVatInvoiceByTransID(data.recID);
      }
    });
  }
  //#endregion

  //#region Function
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

  groupBy(arr: any[], key: string): any[][] {
    return Object.values(
      arr.reduce((acc, current) => {
        acc[current[key]] = acc[current[key]] ?? [];
        acc[current[key]].push(current);
        return acc;
      }, {})
    );
  }
  //#endregion
}
