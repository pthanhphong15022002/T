import {
  AfterViewInit,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  CodxGridviewComponent,
  CRUDService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddAPPostingAccountComponent } from './popup-add-apposting-account/popup-add-apposting-account.component';

@Component({
  selector: 'lib-apposting-accounts',
  templateUrl: './apposting-accounts.component.html',
  styleUrls: ['./apposting-accounts.component.css'],
})
export class APPostingAccountsComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewComponent;

  views: Array<ViewModel> = [];
  menuActive = 1; // = ModuleID
  menuItems1: Array<any> = [];
  menuItems2: Array<any> = [];
  selectedValue: string;
  defaultPostType1: string;
  defaultPostType2: string;
  btnAdd = {
    id: 'btnAdd',
  };
  functionName: string;

  constructor(inject: Injector) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache.valueList('AC049').subscribe((res) => {
      console.log(res);
      this.menuItems1 = res?.datas;
      this.defaultPostType1 = res?.datas[0].value;
    });

    this.cache.valueList('AC050').subscribe((res) => {
      console.log(res);
      this.menuItems2 = res?.datas;
      this.defaultPostType2 = res?.datas[0].value;
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        sameData: false,
        active: true,
        model: {
          panelLeftRef: this.templateLeft,
          widthLeft: '15%',
          panelRightRef: this.templateRight,
        },
      },
    ];

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      console.log(res);
      this.functionName =
        res.defaultName.charAt(0).toLowerCase() + res.defaultName.slice(1);
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
    }
  }
  //#endregion

  //#region Method
  handleClickAdd(e) {
    (this.grid.dataService as CRUDService).addNew().subscribe((res: any) => {
      let options = new SidebarModel();
      options.DataService = this.grid.dataService;
      options.FormModel = this.grid.formModel;
      options.Width = '550px';

      let postType = this.selectedValue;
      if (this.menuActive == 1) {
        if (!this.menuItems1.some((i) => i.value === this.selectedValue)) {
          postType = this.defaultPostType1;
        }
      } else {
        if (!this.menuItems2.some((i) => i.value === this.selectedValue)) {
          postType = this.defaultPostType2;
        }
      }

      this.callfc.openSide(
        PopupAddAPPostingAccountComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
          moduleId: this.menuActive,
          postType: postType,
          breadcrumb: this.getBreadcrumb(this.menuActive, postType),
        },
        options,
        this.view.funcID
      );
    });
  }

  delete(data): void {
    console.log(data);

    (this.grid.dataService as CRUDService)
      .delete([data], true)
      .subscribe((res) => console.log(res));
  }

  edit(e, data): void {
    console.log(data);

    this.grid.dataService.dataSelected = data;
    (this.grid.dataService as CRUDService).edit(data).subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.grid.dataService;
      options.FormModel = this.grid.formModel;
      options.Width = '550px';

      this.callfc.openSide(
        PopupAddAPPostingAccountComponent,
        {
          formType: 'edit',
          formTitle: `${e.text} ${this.functionName}`,
          moduleId: data.moduleID,
          postType: data.postType,
          breadcrumb: this.getBreadcrumb(data.moduleID, data.postType),
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(e, data): void {
    console.log(e);
    console.log(data);

    this.grid.dataService.dataSelected = data;
    (this.grid.dataService as CRUDService).copy().subscribe((res) => {
      console.log(res);

      let options = new SidebarModel();
      options.DataService = this.grid.dataService;
      options.FormModel = this.grid.formModel;
      options.Width = '550px';

      this.callfc.openSide(
        PopupAddAPPostingAccountComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
          moduleId: data.moduleID,
          postType: data.postType,
          breadcrumb: this.getBreadcrumb(data.moduleID, data.postType),
        },
        options,
        this.view.funcID
      );
    });
  }
  //#endregion

  //#region Function
  filter(field: string, value: string): void {
    this.selectedValue = value;
    this.grid.dataService.setPredicates([field + '=@0'], [value]).subscribe();
  }

  getBreadcrumb(moduleId, postType): string {
    let breadcrumb: string = '';
    if (moduleId == 1) {
      breadcrumb += 'Tài khoản';
      if (postType) {
        breadcrumb +=
          ' > ' + this.menuItems1.find((m) => m.value === postType)?.text;
      }
    } else {
      breadcrumb += 'Điều khoản';
      if (postType) {
        breadcrumb +=
          ' > ' + this.menuItems2.find((m) => m.value === postType)?.text;
      }
    }

    return breadcrumb;
  }
  //#endregion
}
