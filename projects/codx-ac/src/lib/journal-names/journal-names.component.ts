import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  ButtonModel,
  SidebarModel,
  UIComponent,
  UrlUtil,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddJournalComponent } from './popup-add-journal/popup-add-journal.component';

@Component({
  selector: 'lib-journal-names',
  templateUrl: './journal-names.component.html',
})
export class JournalNamesComponent extends UIComponent {
  //#region Constructor
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;

  views: Array<ViewModel> = [];
  testimg = 'UyNhiemChi.svg';
  button: ButtonModel = {
    id: 'btnAdd',
  };
  functionName: string;

  constructor(inject: Injector, private route: Router) {
    super(inject);
  }
  //#region Constructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.smallcard,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName =
        res.defaultName.charAt(0).toLowerCase() + res.defaultName.slice(1);
    });
  }
  //#region Init

  //#region Events
  clickMF(e, data) {
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

  dbClick(e, data) {
    console.log('data: ', data);
    this.cache.functionList(data.functionID).subscribe((func) => {
      if (func) {
        let urlRedirect = '/' + UrlUtil.getTenant();
        if (func && func.url && func.url.charAt(0) != '/') urlRedirect += '/';
        urlRedirect += func.url;
        this.route.navigate([urlRedirect], {
          queryParams: { recID: data.recID },
        });
      }
    });
  }
  //#region Events

  //#region Method
  add(e): void {
    console.log(`${e.text} ${this.functionName}`);

    // let data = {
    //   JournalName: 'Giấy báo có',
    //   Description: 'Giấy báo có',
    //   PostedLayer: '1',
    //   JournalType: '1',
    //   AllowEdited: true,
    //   InvoiceEdited: true,
    //   Approval: '1',
    //   CurrencyControl: true,
    //   ExchangeRate: 1.0,
    //   TransactionText: '1',
    //   IsTransfer: true,
    //   IsSettlement: true,
    //   IsAllocation: true,
    //   PeriodControl: true,
    //   PostSubControl: true,
    //   QtyControl: true,
    //   AssetControl: true,
    //   LoanControl: true,
    //   ProjectControl: true,
    //   Stop: false,
    //   Owner: '1',
    //   CreatedBy: 'THINH',
    //   FunctionID: 'ACT0428',
    //   Thumbnail: 'GiayBaoCo.JPG',
    // };
    // this.api.exec('AC', 'JournalNamesBusiness', 'AddAsync', data).subscribe();
    this.view.dataService.addNew().subscribe(() => {
      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;

      this.callfc.openSide(
        PopupAddJournalComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  edit(e, data): void {}

  copy(e, ata): void {}

  delete(data): void {}
  //#region Method
}
