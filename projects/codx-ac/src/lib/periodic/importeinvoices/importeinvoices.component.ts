import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  DataRequest,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'lib-importeinvoices',
  templateUrl: './importeinvoices.component.html',
  styleUrls: ['./importeinvoices.component.css'],
})
export class ImportEInvoicesComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  button?: ButtonModel = { id: 'btnAdd' };
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  constructor(inject: Injector) {
    super(inject);
  }
  //#endregion

  //#region Init
  override onInit() {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.smallcard,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          frozenColumns: 1,
        },
      },
    ];
  }
  //#endregion

  //#region Event
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        //this.add(e);
        break;
    }
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        //  this.delete(data);
        break;
      case 'SYS03':
        //  this.edit(e, data);
        break;
      case 'SYS04':
        // this.copy(e, data);
        break;
    }
  }
  //#endregion
}
