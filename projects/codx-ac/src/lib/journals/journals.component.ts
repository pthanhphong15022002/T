import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  ButtonModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  UrlUtil,
  ViewModel,
  ViewType,
} from 'codx-core';
import { JournalService } from './journals.service';
import { PopupAddJournalComponent } from './popup-add-journal/popup-add-journal.component';

@Component({
  selector: 'lib-journal',
  templateUrl: './journals.component.html',
})
export class JournalsComponent extends UIComponent {
  //#region Constructor
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel = {
    id: 'btnAdd',
  };
  functionName: string;
  vll86 = [];
  vll85 = [];
  func = [];
  constructor(
    inject: Injector,
    private route: Router,
    private notiService: NotificationsService,
    private journalService: JournalService
  ) {
    super(inject);
  }
  //#region Constructor

  //#region Init
  onInit(): void {
    // let data = {"sourceAccountNumber":"0001100012473007","payeeType":"ACCOUNT","tranferAmount":100000,"transferDescription":"TRANSFER AMOUNT TO","payeeAccountNumber":"0129837294","payeeCardNumber":"","bankCode":"970406"}
    // this.api.execSv("AC","Core","CMBusiness","SendRequestBankHubAsync",[JSON.stringify(data),"FastTransferOrder"]).subscribe(res=>{
    //   console.log(res);
    // })
    this.cache.valueList('AC077').subscribe((func) => {
      if (func) this.func = func.datas;
    });

    this.cache.valueList('AC086').subscribe((res) => {
      if (res) {
        this.vll86 = res.datas;
      }
    });
    this.cache.valueList('AC085').subscribe((res) => {
      if (res) {
        this.vll85 = res.datas;
      }
    });
  }

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
    let f = this.func.find((x) => x.value === data.journalType);
    if (!f) return;
    this.cache.functionList(f?.default).subscribe((func) => {
      if (func) {
        let urlRedirect = '/' + UrlUtil.getTenant();
        if (func && func.url && func.url.charAt(0) != '/') urlRedirect += '/';
        urlRedirect += func.url;
        this.route.navigate([urlRedirect], {
          queryParams: { journalNo: data.journalNo },
        });
      }
    });
  }
  //#region Events

  //#region Method
  add(e): void {
    console.log(`${e.text} ${this.functionName}`);

    this.view.dataService
      .addNew(() => this.api.exec('AC', 'JournalsBusiness', 'SetDefaultAsync'))
      .subscribe((res) => {
        console.log(res);
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

  edit(e, data): void {
    console.log('edit', { data });

    if (data.dataValue) {
      data = { ...data, ...JSON.parse(data.dataValue) };
    }

    this.view.dataService.dataSelected = data;
    this.view.dataService.edit(data).subscribe(() => {
      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;

      this.callfc.openSide(
        PopupAddJournalComponent,
        {
          formType: 'edit',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(e, data): void {
    console.log('copy', data);

    if (data.dataValue) {
      data = { ...data, ...JSON.parse(data.dataValue) };
    }

    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe(() => {
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

  delete(data): void {
    console.log('delete', data);

    this.view.dataService
      .delete([data], true, (req: RequestOption) => {
        req.methodName = 'DeleteJournalAsync';
        req.className = 'JournalsBusiness';
        req.assemblyName = 'ERM.Business.AC';
        req.service = 'AC';
        req.data = data.recID;

        return true;
      })
      .subscribe((res: any) => {
        console.log(res);

        if (res) {
          this.journalService
            .deleteAutoNumber(data.journalNo)
            .subscribe((res) => console.log(res));
        }
      });
  }
  //#region Method

  //#region Function
  //#endregion
}
