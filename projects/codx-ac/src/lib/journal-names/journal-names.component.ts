import { Router } from '@angular/router';
import { UIComponent, ViewModel, ViewType, UrlUtil } from 'codx-core';
import {
  Component,
  OnInit,
  inject,
  Injector,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'lib-journal-names',
  templateUrl: './journal-names.component.html',
})
export class JournalNamesComponent extends UIComponent {
  //#region Constructor
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  testimg = 'UyNhiemChi.svg';
  moreFuncName: string = '';
  button = {
    id: 'btnAdd',
  };

  constructor(inject: Injector, private route: Router) {
    super(inject);
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
  }
  //#region Constructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
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
  }
  //#region Init

  //#region Events
  clickMF(e, data) {
    console.log(e);
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

  add(e) {
    let data = {
      JournalName: 'Giấy báo có',
      Description: 'Giấy báo có',
      PostedLayer: '1',
      JournalType: '1',
      AllowEdited: true,
      InvoiceEdited: true,
      Approval: '1',
      CurrencyControl: true,
      ExchangeRate: 1.0,
      TransactionText: '1',
      IsTransfer: true,
      IsSettlement: true,
      IsAllocation: true,
      PeriodControl: true,
      PostSubControl: true,
      QtyControl: true,
      AssetControl: true,
      LoanControl: true,
      ProjectControl: true,
      Stop: false,
      Owner: '1',
      CreatedBy: 'THINH',
      FunctionID: 'ACT0428',
      Thumbnail: 'GiayBaoCo.JPG',
    };
    // this.api.exec('AC', 'JournalNamesBusiness', 'AddAsync', data).subscribe();
  }
  //#region Method
}
