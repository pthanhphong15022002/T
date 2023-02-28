import { F } from '@angular/cdk/keycodes';
import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  Injector,
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
} from 'codx-core';
import { PopAddAccountsComponent } from '../chart-of-accounts/pop-add-accounts/pop-add-accounts.component';

@Component({
  selector: 'postingaccounts',
  templateUrl: './item-posting-accounts.component.html',
  styleUrls: ['./item-posting-accounts.component.css'],
})
export class ItempostingaccountsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  menu1: Array<any> = [];
  menu2: Array<any> = [];
  menuActive = 1;
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
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  @ViewChild('grid') grid: CodxGridviewComponent;
  constructor(inject: Injector, private callfunc: CallFuncService) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit() {
    this.cache.valueList('AC037').subscribe((res) => {
      if (res) {
        this.menu1 = res.datas;
      }
    });
  }

  ngAfterViewInit() {
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
  //#endregion;

  //#region Method
  add($event) {
    (this.grid.dataService as CRUDService).addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: 'test',
      };
      let option = new SidebarModel();
      option.DataService = this.grid.dataService;
      option.FormModel = this.grid.formModel;
      option.Width = '800px';
      let d = this.callfunc.openSide(
        PopAddAccountsComponent,
        obj,
        option,
        this.view.funcID
      );
    });
  }

  load(field: string, value: string) {
    //this.grid.dataSelected
    this.grid.dataService.setPredicates([field + '=@0'], [value]).subscribe();
  }
  //#endregion
}
