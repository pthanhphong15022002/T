import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  ViewModel,
  CacheService,
  UIComponent,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'lib-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.css'],
})
export class ChartOfAccountsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  funcName = '';
  moreFuncName = '';
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  constructor(private inject: Injector) {
    super(inject);
  }
  //#region Constructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          frozenColumns: 1,
          template2: this.templateMore,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddAsync';
    this.view.dataService.methodUpdate = 'EditAsync';
  }

  //#region Init

  //#region Event
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
        this.delete();
        break;
    }
    this.edit();
  }

  //#endregion

  //#region Function
  add() {}

  edit() {}

  delete() {}
  //#endregion
}
