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
  UIComponent,
  ViewModel,
  ButtonModel,
  DialogRef,
  CallFuncService,
  ViewType,
  SidebarModel,
  RequestOption,
} from 'codx-core';
import { PopAddDimensionGroupsComponent } from './pop-add-dimension-groups/pop-add-dimension-groups.component';

@Component({
  selector: 'lib-dimension-groups',
  templateUrl: './dimension-groups.component.html',
  styleUrls: ['./dimension-groups.component.css'],
})
export class DimensionGroupsComponent extends UIComponent {
  //#region Contructor
  views: Array<ViewModel> = [];
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  buttons: ButtonModel = { id: 'btnAdd' };
  headerText: any;
  dialog: DialogRef;
  funcName: any;
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
    this.cache.moreFunction('DimensionGroups', 'grvDimensionGroups').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACS20900');
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

  //#region Functione
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
    this.headerText = e.text + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(
        PopAddDimensionGroupsComponent,
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
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          PopAddDimensionGroupsComponent,
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
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(
          PopAddDimensionGroupsComponent,
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
            .exec('ERM.Business.IV', 'DimensionSetupBusiness', 'DeleteAsync', [
              data.dimGroupID,
            ])
            .subscribe((res: any) => {
              if (res) {
                this.api
                  .exec(
                    'ERM.Business.IV',
                    'DimensionControlBusiness',
                    'DeleteAsync',
                    [data.dimGroupID]
                  )
                  .subscribe((res: any) => {});
              }
            });
        }
      });
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'DimensionGroupsBusiness';
    opt.assemblyName = 'IV';
    opt.service = 'IV';
    opt.data = data;
    return true;
  }
  //#endregion
}
