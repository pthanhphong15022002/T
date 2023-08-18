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
import { IAcctTran } from '../salesinvoices/interfaces/IAcctTran.interface';
import { CashTransferService } from './cashtransfers.service';
import { ICashTransfer } from './interfaces/ICashTransfer.interface';
import { CashtransferAddComponent } from './cashtransfers-add/cashtransfers-add.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-cashtransfers',
  templateUrl: './cashtransfers.component.html',
  styleUrls: ['./cashtransfers.component.scss'],
})
export class CashtransfersComponent
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
  tabControl: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ];

  lines: IAcctTran[][] = [[]];
  loading: boolean = false;
  isFirstChange: boolean = true;
  fmAcctTrans: FormModel = {
    entityName: 'AC_AcctTrans',
    formName: 'AcctTrans',
    gridViewName: 'grvAcctTrans',
    entityPer: 'AC_AcctTrans',
  };
  gvsAcctTrans: any;
  fgVatInvoice: any;
  overflowed: boolean = false;
  expanding: boolean = false;
  private destroy$ = new Subject<void>();
  constructor(
    injector: Injector,
    private cashTransferService: CashTransferService,
    private acService: CodxAcService
  ) {
    super(injector);

    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.fgVatInvoice = this.codxService.buildFormGroup(
      'VATInvoices',
      'grvVATInvoices',
      'AC_VATInvoices'
    );
    // this.cache
    //   .gridViewSetup(this.fmAcctTrans.formName, this.fmAcctTrans.gridViewName)
    //   .subscribe((gvs) => {
    //     this.gvsAcctTrans = gvs;
    //   });
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
  }

  ngAfterViewChecked(): void {
    // const element: HTMLElement = this.memo?.nativeElement;
    // this.overflowed = element?.scrollWidth > element?.offsetWidth;
  }

  ngOnDestroy() {
    this.view.setRootNode('');
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    if (e.data?.error?.isError) {
      return;
    }

    this.master = e.data?.data ?? e?.data;
    if (!this.master) {
      return;
    }

    // prevent this function from being called twice on the first run
    if (this.isFirstChange) {
      this.isFirstChange = false;
      return;
    }

    this.expanding = false;

    this.loading = true;
    this.lines = [];
    this.api
      .exec(
        'AC',
        'AcctTransBusiness',
        'GetListDataDetailAsync',
        'e973e7b7-10a1-11ee-94b4-00155d035517'
      )
      .subscribe((res: IAcctTran[]) => {
        console.log(res);
        if (res) {
          this.lines = this.groupBy(res, 'entryID');
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
        let options = new SidebarModel();
        options.DataService = this.view.dataService;
        options.FormModel = this.view.formModel;
        options.isFull = true;
        let dialog = this.callfc.openSide(
          CashtransferAddComponent,
          {
            formType: 'add',
            journalNo: this.journalNo,
            formTitle: `${e.text} ${this.functionName}`,
            fgVatInvoice : this.fgVatInvoice
          },
          options,
          this.view.funcID
        );
        // this.cache
        //   .gridViewSetup('VATInvoices', 'grvVATInvoices')
        //   .subscribe((res) => {
        //     if (res) {
              
        //     }
        //   });
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
              CashtransferAddComponent,
              {
                formType: 'edit',
                formTitle: `${e.text} ${this.functionName}`,
                journalNo: this.journalNo,
                fgVatInvoice : this.fgVatInvoice
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
              CashtransferAddComponent,
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
