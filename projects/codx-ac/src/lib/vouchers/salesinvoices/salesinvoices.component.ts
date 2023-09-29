import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType
} from 'codx-core';
import { BehaviorSubject, distinctUntilKeyChanged } from 'rxjs';
import { JournalService } from '../../journals/journals.service';
import { ISalesInvoice } from './interfaces/ISalesInvoice.interface';
import { SalesinvoicesAddComponent } from './salesinvoices-add/salesinvoices-add.component';
import { SalesInvoiceService } from './salesinvoices.service';

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
  master: ISalesInvoice;
  defaultSubject = new BehaviorSubject<ISalesInvoice>(null);

  constructor(
    inject: Injector,
    private salesInvoiceService: SalesInvoiceService,
    private journalService: JournalService
  ) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
      this.salesInvoiceService.loadJournal(this.journalNo);
    });

    this.emitDefault();

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
      this.functionName = res.defaultName;
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

  async onInitMF(mfs: any, data: ISalesInvoice): Promise<void> {
    await this.salesInvoiceService.onInitMFAsync(mfs, data);
  }

  onClickMF(e, data): void {
    this.salesInvoiceService.onClickMF(
      e,
      data,
      this.functionName,
      this.view.formModel,
      this.view.dataService
    );
  }
  //#endregion

  //#region Method
  emitDefault(): void {
    this.api
      .exec('AC', 'SalesInvoicesBusiness', 'GetDefaultAsync', [this.journalNo])
      .subscribe((res: any) => {
        this.defaultSubject.next({
          ...res,
          recID: res.data.recID,
        });
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
