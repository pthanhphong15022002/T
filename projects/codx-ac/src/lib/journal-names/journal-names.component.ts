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
import { JournalService } from './journal-names.service';
import { PopupAddJournalComponent } from './popup-add-journal/popup-add-journal.component';

@Component({
  selector: 'lib-journal-names',
  templateUrl: './journal-names.component.html',
})
export class JournalNamesComponent extends UIComponent {
  //#region Constructor
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;

  views: Array<ViewModel> = [];
  button: ButtonModel = {
    id: 'btnAdd',
  };
  functionName: string;

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
          queryParams: { recID: data.recID, journalNo: data.journalNo },
        });
      }
    });
  }
  //#region Events

  //#region Method
  add(e): void {
    console.log(`${e.text} ${this.functionName}`);

    this.view.dataService.addNew().subscribe((res) => {
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

    this.api
      .exec(
        'ERM.Business.AC',
        'JournalsBusiness',
        'IsEditableAsync',
        data.recID
      )
      .subscribe((res) => {
        if (res) {
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
            .deleteAutoNumber(data.recID)
            .subscribe((res) => console.log(res));
        }
      });
  }
  //#region Method

  //#region Function
  //#endregion
}
