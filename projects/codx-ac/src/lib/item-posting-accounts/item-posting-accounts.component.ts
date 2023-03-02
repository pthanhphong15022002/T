import { F } from '@angular/cdk/keycodes';
import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  Injector,
  ChangeDetectorRef,
  Optional,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  UIComponent,
  ViewModel,
  ViewType,
  ButtonModel,
  CodxGridviewComponent,
  SidebarModel,
  CallFuncService,
  CRUDService,
  DialogRef,
  RequestOption,
} from 'codx-core';
import { PopAddAccountsComponent } from '../chart-of-accounts/pop-add-accounts/pop-add-accounts.component';
import { PopAddItemComponent } from './pop-add-item/pop-add-item.component';

@Component({
  selector: 'postingaccounts',
  templateUrl: './item-posting-accounts.component.html',
  styleUrls: ['./item-posting-accounts.component.css'],
})
export class ItempostingaccountsComponent extends UIComponent {
  //#region Constructor
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewComponent;
  views: Array<ViewModel> = [];
  dialog: DialogRef;
  menuInventory: Array<any> = [];
  menuPurchase: Array<any> = [];
  menuSell: Array<any> = [];
  menuManufacture: Array<any> = [];
  menuProject: Array<any> = [];
  menuIcon: Array<any> = [];
  menuActive: any = 1;
  postTypeInventory: any = '300';
  postTypePurchase: any;
  postTypeSell: any;
  postManufacture: any;
  postProject: any;
  postType:any;
  moreFuncName: any;
  funcName: any;
  subheaderText: any;
  headerText:any;
  button = {
    id: 'btnAdd',
  };
  editSettings: EditSettingsModel = {
    allowEditing: false,
    allowAdding: false,
    allowDeleting: true,
    mode: 'Normal',
  };
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
  }
  //#endregion

  //#region Init
  onInit() {
    this.cache.valueList('AC037').subscribe((res) => {
      if (res) {
        this.menuInventory = res.datas;
      }
    });
    this.cache.valueList('AC052').subscribe((res) => {
      if (res) {
        this.menuPurchase = res.datas;
      }
    });
    this.cache.valueList('AC038').subscribe((res) => {
      if (res) {
        this.menuSell = res.datas;
      }
    });
    this.cache.valueList('AC053').subscribe((res) => {
      if (res) {
        this.menuManufacture = res.datas;
      }
    });
    this.cache.valueList('AC054').subscribe((res) => {
      if (res) {
        this.menuProject = res.datas;
      }
    });
    this.cache.valueList('AC058').subscribe((res) => {
      if (res) {
        res.datas.forEach(element => {
          var newicon = element.icon.replace(".svg", "");
          element.icon = newicon
        });
        this.menuIcon = res.data;
      }
    });
  }

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });
    this.views = [
      {
        type: ViewType.content,
        sameData: true,
        active: true,
        model: {
          panelLeftRef: this.templateLeft,
          widthLeft: '15%',
          panelRightRef: this.templateRight,
        },
      },
    ];
  }
  //#endregion;
  clickMenu(e: any) {
    switch (e) {
      case 1:
        this.menuActive = 1;
        if (this.postTypeInventory == null) {
          this.postTypeInventory = '300';
        }
        break;
      case 2:
        this.menuActive = 2;
        if (this.postTypePurchase == null) {
          this.postTypePurchase = '201';
        }
        break;
      case 3:
        this.menuActive = 3;
        if (this.postTypeSell == null) {
          this.postTypeSell = '103';
        }
        break;
      case 4:
        this.menuActive = 4;
        if (this.postManufacture == null) {
          this.postManufacture = '410';
        }
        break;
      case 5:
        this.menuActive = 5;
        if (this.postProject == null) {
          this.postProject = '1';
        }
        break;
    }
  }
  load(field: string, value: string) {
    switch (this.menuActive) {
      case 1:
        this.postTypeInventory = value;
        break;
      case 2:
        this.postTypePurchase = value;
        break;
      case 3:
        this.postTypeSell = value;
        break;
      case 4:
        this.postManufacture = value;
        break;
      case 5:
        this.postProject = value;
        break;
    }
    this.grid.dataService.setPredicates([field + '=@0'], [value]).subscribe();
  }
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add();
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
    }
  }
  loadMenuActive(data: any) {
    switch (data) {
      case 1:
        this.menuInventory.forEach((element) => {
          if (element.value == this.postTypeInventory) {
            this.subheaderText = 'Hàng tồn kho > ' + element.text;
          }
        });
        this.postType = this.postTypeInventory;
        break;
      case 2:
        this.menuPurchase.forEach((element) => {
          if (element.value == this.postTypePurchase) {
            this.subheaderText = 'Mua hàng > ' + element.text;
          }
        });
        this.postType = this.postTypePurchase;
        break;
      case 3:
        this.menuSell.forEach((element) => {
          if (element.value == this.postTypeSell) {
            this.subheaderText = 'Bán hàng > ' + element.text;
          }
        });
        this.postType = this.postTypeSell;
        break;
      case 4:
        this.menuManufacture.forEach((element) => {
          if (element.value == this.postManufacture) {
            this.subheaderText = 'Sản xuất > ' + element.text;
          }
        });
        this.postType = this.postManufacture;
        break;
      case 5:
        this.menuProject.forEach((element) => {
          if (element.value == this.postProject) {
            this.subheaderText = 'Dự án > ' + element.text;
          }
        });
        this.postType = this.postProject;
        break;
    }
  }
  add() {
    this.loadMenuActive(this.menuActive);
    this.headerText = this.moreFuncName + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
        subheaderText: this.subheaderText,
        moduleID: this.menuActive,
        postType: this.postType,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(
        PopAddItemComponent,
        obj,
        option,
        this.view.funcID
      );
    });
  }
  edit(e, data) {
    this.loadMenuActive(parseInt(data.moduleID));
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        var obj = {
          formType: 'edit',
          headerText: e.text + ' ' + this.funcName,
          subheaderText: this.subheaderText,
        };
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = '550px';
        this.dialog = this.callfunc.openSide(PopAddItemComponent, obj, option);
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
      .subscribe((res: any) => {});
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'IVPostingAccountsBusiness';
    opt.assemblyName = 'AC';
    opt.service = 'AC';
    opt.data = data.recID;
    return true;
  }
}
