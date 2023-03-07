import {
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  ViewModel,
  CacheService,
  UIComponent,
  ViewType,
  DialogRef,
  CallFuncService,
  SidebarModel,
  RequestOption,
} from 'codx-core';
import { PopAddAccountsComponent } from './pop-add-accounts/pop-add-accounts.component';

@Component({
  selector: 'lib-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.css'],
})
export class ChartOfAccountsComponent extends UIComponent {
  //#region Contructor
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  funcName = '';
  columnsGrid = [];
  headerText: any;
  dialog: DialogRef;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  //#region Contructor
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService
  ) {
    super(inject);
    this.dialog = this.dialog;
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) {
        this.funcName = res.defaultName;
      }
    });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          resources: this.columnsGrid,
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddAsync';
    this.view.dataService.methodUpdate = 'EditAsync';
    this.view.dataService.methodDelete = 'DeleteAsync';
  }

  //#endregion

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
        this.copy(e,data);
        break;
    }
  }
  //#endregion

  //#region Function
  add(e) {
    this.headerText = e.text + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      this.dialog = this.callfunc.openSide(
        PopAddAccountsComponent,
        obj,
        option,
        this.view.funcID
      );
      this.dialog.closed.subscribe((x) => {
        if (x.event)
          this.view.dataService
            .add([this.view.dataService.dataSelected])
            .subscribe((x) => {
              this.dt.detectChanges();
            });
      });
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
        option.Width = '800px';
        this.dialog = this.callfunc.openSide(
          PopAddAccountsComponent,
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
      .copy(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'copy',
          headerText: e.text + ' ' + this.funcName,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '800px';
        this.dialog = this.callfunc.openSide(
          PopAddAccountsComponent,
          obj,
          option
        );
      });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([data], true, (option: RequestOption) =>
        this.beforeDelete(option, data)
      )
      .subscribe(() => {});
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'AccountsBusiness';
    opt.assemblyName = 'AC';
    opt.service = 'AC';
    opt.data = data;
    return true;
  }
  //#endregion
}
