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
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewComponent;

  views: Array<ViewModel> = [];
  menuActive = 1; // = ModuleID
  menuItems1: Array<any> = [];
  menuItems2: Array<any> = [];
  selectedValue: string = '10';
  btnAdd = {
    id: 'btnAdd',
  };

  constructor(inject: Injector) {
    super(inject);
  }

  onInit(): void {
    this.cache.valueList('AC049').subscribe((res) => {
      console.log(res);
      this.menuItems1 = res?.datas;
      this.selectedValue = this.menuItems1[0].value;
    });

    this.cache.valueList('AC050').subscribe((res) => {
      console.log(res);
      this.menuItems2 = res?.datas;
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
  }

  handleClickAdd() {
    (this.grid.dataService as CRUDService).addNew().subscribe((res: any) => {
      let options = new SidebarModel();
      options.DataService = this.grid.dataService;
      options.FormModel = this.grid.formModel;
      options.Width = '550px';

      this.callfc.openSide(
        PopupAddAPPostingAccountComponent,
        {
          formType: 'add',
          formTitle: 'Thêm thiết lập phải trả',
          moduleId: this.menuActive,
          postType: this.selectedValue,
          breadcrumb: this.getBreadcrumb(),
        },
        options,
        this.view.funcID
      );
    });
  }

  filter(field: string, value: string): void {
    this.selectedValue = value;
    this.grid.dataService.setPredicates([field + '=@0'], [value]).subscribe();
  }

  handleClickMoreFuncs(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
    }
  }

  delete(data): void {
    console.log(data);

    (this.grid.dataService as CRUDService)
      .delete([data], true)
      .subscribe((res) => console.log(res));
  }

  edit(data): void {
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
          formTitle: 'Sửa thiết lập phải trả',
          moduleId: this.menuActive,
          postType: this.selectedValue,
          breadcrumb: this.getBreadcrumb(),
        },
        options,
        this.view.funcID
      );
    });
  }

  getBreadcrumb(): string {
    let breadcrumb: string = '';
    if (this.menuActive === 1) {
      breadcrumb +=
        'Tài khoản > ' +
        this.menuItems1.find((m) => m.value === this.selectedValue)?.text;
    } else {
      breadcrumb +=
        'Điều khoản > ' +
        this.menuItems2.find((m) => m.value === this.selectedValue)?.text;
    }

    return breadcrumb;
  }
}
