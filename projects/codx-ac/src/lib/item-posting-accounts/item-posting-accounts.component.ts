import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  Injector,
} from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { UIComponent, ViewModel, ViewType } from 'codx-core';

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
  linkActive = 1;
  editSettings: EditSettingsModel = {
    allowEditing: false,
    allowAdding: false,
    allowDeleting: true,
    mode: 'Normal',
  };
  @ViewChild('templateLeft') templateLeft: TemplateRef<any>;
  @ViewChild('templateRight') templateRight: TemplateRef<any>;
  constructor(inject: Injector) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit() {
    this.cache.valueList('AC037').subscribe((res) => {
      if (res) {
        console.log(res);
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
}
