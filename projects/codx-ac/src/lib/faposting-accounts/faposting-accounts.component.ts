import {
  AfterViewInit,
  Component,
  Injector, TemplateRef,
  ViewChild
} from '@angular/core';
import {
  CodxGridviewComponent,
  CRUDService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType
} from 'codx-core';
import { PopupAddFAPostingAccountComponent } from './popup-add-faposting-account/popup-add-faposting-account.component';

@Component({
  selector: 'lib-faposting-accounts',
  templateUrl: './faposting-accounts.component.html',
  styleUrls: ['./faposting-accounts.component.css'],
})
export class FAPostingAccountsComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewComponent;

  views: Array<ViewModel> = [];
  menuActive = 1; // = ModuleID
  menuItems: Array<any> = [];
  selectedValue: string;
  defaultPostType: string;
  btnAdd = {
    id: 'btnAdd',
  };

  constructor(inject: Injector) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache.valueList('AC060').subscribe((res) => {
      console.log(res);
      this.menuItems = res?.datas;
      this.defaultPostType = res?.datas[0].value;
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
  //#endregion

  //#region Event
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
  //#endregion

  //#region Method
  handleClickAdd() {
    (this.grid.dataService as CRUDService).addNew().subscribe((res: any) => {
      let options = new SidebarModel();
      options.DataService = this.grid.dataService;
      options.FormModel = this.grid.formModel;
      options.Width = '550px';
      this.callfc.openSide(
        PopupAddFAPostingAccountComponent,
        {
          formType: 'add',
          formTitle: 'Thêm thiết lập tài khoản',
          moduleId: this.menuActive,
          postType: this.selectedValue ?? this.defaultPostType,
          breadcrumb: this.getBreadcrumb(
            this.selectedValue ?? this.defaultPostType
          ),
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

  edit(data): void {
    console.log(data);

    this.grid.dataService.dataSelected = data;
    (this.grid.dataService as CRUDService).edit(data).subscribe((res) => {
      let options = new SidebarModel();
      options.DataService = this.grid.dataService;
      options.FormModel = this.grid.formModel;
      options.Width = '550px';

      this.callfc.openSide(
        PopupAddFAPostingAccountComponent,
        {
          formType: 'edit',
          formTitle: 'Sửa thiết lập tài khoản',
          moduleId: data.moduleID,
          postType: data.postType,
          breadcrumb: this.getBreadcrumb(data.postType),
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

  getBreadcrumb(postType): string {
    let breadcrumb: string = '';
    if (this.menuActive == 1) {
      breadcrumb += 'Tài sản cố định';
      if (postType) {
        breadcrumb +=
          ' > ' + this.menuItems.find((m) => m.value == postType)?.text;
      }
    }

    return breadcrumb;
  }
  //#endregion
}
