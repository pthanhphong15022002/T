import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { map, Observable, tap } from 'rxjs';
import { PopupAddCashTransferComponent } from './popup-add-cash-transfer/popup-add-cash-transfer.component';

@Component({
  selector: 'lib-cash-transfers',
  templateUrl: './cash-transfers.component.html',
  styleUrls: ['./cash-transfers.component.css'],
})
export class CashTransfersComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  btnAdd = {
    id: 'btnAdd',
  };
  functionName: string;
  parentID: string;
  journalNo: string;

  constructor(inject: Injector) {
    super(inject);

    this.router.queryParams.subscribe((params) => {
      console.log(params);
      this.parentID = params?.recID;
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName =
        res.defaultName.charAt(0).toLowerCase() + res.defaultName.slice(1);
      console.log(res);
    });
  }
  //#endregion

  //#region Event
  handleClickMoreFuncs(e, data) {
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
    }
  }

  handleClickAdd(e): void {
    this.view.dataService
      .addNew(() =>
        this.api.exec('AC', 'CashTranfersBusiness', 'SetDefaultAsync', [
          this.parentID,
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
                  parentID: this.parentID,
                  formTitle: `${e.text} ${this.functionName}`,
                },
                options,
                this.view.funcID
              );
            }
          });
      });
  }

  edit(e, data): void {
    console.log('edit', { data });

    this.view.dataService.dataSelected = data;
    this.view.dataService.edit(data).subscribe((res: any) => {
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
  //#endregion

  //#region Method
  delete(data): void {
    this.view.dataService.delete([data], true).subscribe((res: any) => {
      console.log({ res });
      if (res?.data) {
        this.api
          .exec(
            'ERM.Business.AC',
            'VATInvoicesBusiness',
            'DeleteVATInvoiceAsync',
            data
          )
          .subscribe((res) => console.log(res));
      }
    });
  }
  //#endregion

  //#region Function
  //#endregion
}
