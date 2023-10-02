import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType
} from 'codx-core';
import { BehaviorSubject, distinctUntilKeyChanged } from 'rxjs';
import { JournalService } from '../../journals/journals.service';
import { IPurchaseInvoice } from './interfaces/IPurchaseInvoice.inteface';
import { PurchaseinvoicesAddComponent } from './purchaseinvoices-add/purchaseinvoices-add.component';
import { PurchaseInvoiceService } from './purchaseinvoices.service';

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
  master: IPurchaseInvoice;
  defaultSubject = new BehaviorSubject<IPurchaseInvoice>(null);

  constructor(
    inject: Injector,
    private purchaseInvoiceService: PurchaseInvoiceService, // don't remove this
    private journalService: JournalService
  ) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
      this.purchaseInvoiceService.loadJournal(this.journalNo);
      this.journalService.setChildLinks(this.journalNo);
    });

    this.emitDefault();

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
  async onInitMF(mfs: any, data: IPurchaseInvoice): Promise<void> {
    await this.purchaseInvoiceService.onInitMFAsync(mfs, data);
  }

  onClickMF(e: any, data: IPurchaseInvoice): void {
    this.purchaseInvoiceService.onClickMF(
      e,
      data,
      this.funcName,
      this.view.formModel,
      this.view.dataService
    );
  }

  onAddClick(e) {
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
  emitDefault(): void {
    this.api.exec('AC', 'PurchaseInvoicesBusiness', 'GetDefaultAsync', [
      this.journalNo,
    ]).subscribe((res: any) => {
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
