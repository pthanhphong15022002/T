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
  journalNo: string;

  constructor(inject: Injector) {
    super(inject);

    this.router.queryParams.subscribe((params) => {
      this.journalNo = params?.journalNo;
    });
  }
  //#endregion

  //#region Init
  onInit(): void {}

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
      case 'SYS002':
        this.export(data);
        break;
    }
  }

  handleClickAdd(e): void {
    this.view.dataService
      .addNew(() =>
        this.api.exec('AC', 'CashTranfersBusiness', 'SetDefaultAsync', [
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
                  parentID: this.journalNo,
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
}
