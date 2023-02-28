import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import {
  UIComponent,
  CodxGridviewComponent,
  ViewModel,
  CallFuncService,
  DialogRef,
  ViewType,
  SidebarModel,
  RequestOption,
} from 'codx-core';
import { PopAddArComponent } from './pop-add-ar/pop-add-ar.component';

@Component({
  selector: 'lib-ar-posting-accounts',
  templateUrl: './ar-posting-accounts.component.html',
  styleUrls: ['./ar-posting-accounts.component.css'],
})
export class ArPostingAccountsComponent extends UIComponent {
  //#region Contructor
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewComponent;
  views: Array<ViewModel> = [];
  menuAccount: Array<any> = [];
  postTypeAccount: any = "10";
  menuRules: Array<any> = [];
  postTypeRules: any;
  dialog: DialogRef;
  headerText: any;
  subheaderText: any;
  moreFuncName: any;
  funcName: any;
  menuActive: any = 1;
  linkActive = '';
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
    this.cache.valueList('AC047').subscribe((res) => {
      if (res) {
        this.menuAccount = res.datas;
      }
    });
    this.cache.valueList('AC048').subscribe((res) => {
      if (res) {
        this.menuRules = res.datas;
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
  //#endregion

  //#region Event
  clickMenu(e: any) {
    switch (e) {
      case 1:
        this.menuActive = 1;
        if (this.postTypeAccount == null) {
          this.postTypeAccount = "10";
        }
        break;
      case 2:
        this.menuActive = 2;
        if (this.postTypeRules == null) {
          this.postTypeRules = "20";
        }
        break;
    }
  }
  load(field: string, value: string) {
    if (this.menuActive == 1) {
      this.postTypeAccount = value;
    }else{
      this.postTypeRules = value;
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
  add() {
    let postType;
    if (this.menuActive == 1) {
      this.menuAccount.forEach((element) => {
        if (element.value == this.postTypeAccount) {
          this.subheaderText = 'Tài khoản > ' + element.text;
        }
      });
      postType = this.postTypeAccount;
    }
    if (this.menuActive == 2) {
      this.menuRules.forEach((element) => {
        if (element.value == this.postTypeRules) {
          this.subheaderText = 'Điều khoản > ' + element.text;
        }
      });
      postType = this.postTypeRules;
    }
    this.headerText = this.moreFuncName + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
        subheaderText: this.subheaderText,
        moduleID: this.menuActive,
        postType: postType,
      };
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.dialog = this.callfunc.openSide(
        PopAddArComponent,
        obj,
        option,
        this.view.funcID
      );
    });
  }
  edit(e, data) {
    if (data.moduleID == '1') {
      this.menuAccount.forEach((element) => {
        if (element.value == data.postType) {
          this.subheaderText = 'Tài khoản > ' + element.text;
        }
      });
    }
    if (data.moduleID == '2') {
      this.menuRules.forEach((element) => {
        if (element.value == data.postType) {
          this.subheaderText = 'Điều khoản > ' + element.text;
        }
      });
    }
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
        this.dialog = this.callfunc.openSide(PopAddArComponent, obj, option);
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
    opt.className = 'ARPostingAccountsBusiness';
    opt.assemblyName = 'AC';
    opt.service = 'AC';
    opt.data = data.recID;
    return true;
  }
  //#endregion
}
