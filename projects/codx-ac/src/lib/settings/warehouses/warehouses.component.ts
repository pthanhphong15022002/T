import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  CallFuncService,
  DialogRef,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopAddWarehousesComponent } from './pop-add-warehouses/pop-add-warehouses.component';

@Component({
  selector: 'lib-warehouses',
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.css'],
})
export class WarehousesComponent extends UIComponent {
  //#region Contructor
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  columnsGrid = [];
  dialog: DialogRef;
  funcName: any;
  objecttype: string = '6';
  gridViewSetup: any;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.cache.moreFunction('Warehouses', 'grvWarehouses').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACS21500');
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
    ];
  }
  //#endregion

  //#region Function
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
    }
  }
  add(e) {
    console.log(this.view.dataService);
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
        PopAddWarehousesComponent,
        obj,
        option,
        this.view.funcID
      );
      this.dialog.closed.subscribe((x) => {
        if (x.event == null) this.view.dataService.clear();
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
          PopAddWarehousesComponent,
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
          PopAddWarehousesComponent,
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
      .subscribe((res: any) => {
        if (res) {
          this.api
            .exec('ERM.Business.BS', 'ContactBookBusiness', 'DeleteAsync', [
              this.objecttype,
              data.warehouseID,
            ])
            .subscribe((res: any) => {
              if (res) {
                this.api
                  .exec(
                    'ERM.Business.AC',
                    'ObjectsBusiness',
                    'DeleteAsync',
                    [data.warehouseID]
                  )
                  .subscribe((res: any) => {});
              }
            });
        }
      });
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'WareHousesBusiness';
    opt.assemblyName = 'IV';
    opt.service = 'IV';
    opt.data = data;
    return true;
  }
  //#endregion
}
