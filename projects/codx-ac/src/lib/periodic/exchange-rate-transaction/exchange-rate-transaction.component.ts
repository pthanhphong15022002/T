import { ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CallFuncService, DataRequest, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { PopAddExchangeRateTransactionComponent } from './pop-add-exchange-rate-transaction/pop-add-exchange-rate-transaction.component';

@Component({
  selector: 'lib-exchange-rate-transaction',
  templateUrl: './exchange-rate-transaction.component.html',
  styleUrls: ['./exchange-rate-transaction.component.css']
})
export class ExchangeRateTransactionComponent extends UIComponent{
  
  views: Array<ViewModel> = [];
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;

  button?: ButtonModel = { id: 'btnAdd' };
  dialog!: DialogRef;
  funcID: any;
  entityName: any;
  mfFormName: any = 'ExchangeRateTransaction';
  mfGrvName: any = 'grvExchangeRateTransaction';
  funcName: any;
  headerText: any;
  
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private dt: ChangeDetectorRef,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.cache.moreFunction(this.mfFormName, this.mfGrvName).subscribe((res: any) =>{
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACP10901');
        if (m) this.entityName = m.defaultName;
      }
    });
  }

  //region Init
  onInit(): void {
  }

  ngAfterViewInit() {
    this.cache.moreFunction(this.mfFormName, this.mfGrvName).subscribe((res: any) =>{
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACP10900');
        if (m) this.funcName = m.defaultName;
      }
    });
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
      {
        type: ViewType.smallcard,
        active: false,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
    ];
  }
  //endRegion Init

  //#region Event

  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add(e);
        break;
    }
  }

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
      case 'SYS002':
        this.export(data);
        break;
    }
  }
  //#endRegion Event

  //region Function

  add(e) {
    this.headerText = e.text + ' ' + this.funcName;
    this.view.dataService
      .addNew()
      .subscribe((res: any) => {
        var obj = {
          formType: 'add',
          headerText: this.headerText,
        };
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width =  '550px';
        this.dialog = this.callfunc.openSide(
          PopAddExchangeRateTransactionComponent,
          obj,
          option,
          this.view.funcID
        );
      });
  }

  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'edit',
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          PopAddExchangeRateTransactionComponent,
          obj,
          option
        );
      });
  }

  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .copy()
      .subscribe((res: any) => {
        var obj = {
          formType: 'copy',
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          PopAddExchangeRateTransactionComponent,
          obj,
          option
        );
      });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {
    });
  }

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
    this.callfunc.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [gridModel, data.recID],
      null
    );
  }

  setEntityName()
  {
    this.view.entityName = this.entityName;
  }

  getDate(date: any){
    var newDate = new Date(date);
    var day, month, year;

    year = newDate.getFullYear();
    month = newDate.getMonth() + 1;
    day = newDate.getDate();
    
    if (month < 10) {
      month = '0' + month;
    }

    if (day < 10) {
      day = '0' + day;
    }
    
    return day + '/' + month + '/' + year;
  }
  //endRegion Function

}
