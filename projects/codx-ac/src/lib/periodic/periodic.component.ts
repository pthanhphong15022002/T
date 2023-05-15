import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  AuthStore,
  ButtonModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'lib-periodic',
  templateUrl: './periodic.component.html',
  styleUrls: ['./periodic.component.css'],
})
export class PeriodicComponent extends UIComponent {
  //#region Constructor
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  button: ButtonModel = {
    id: 'btnAdd',
  };

  user: any;

  constructor(inject: Injector, private authstore: AuthStore) {
    super(inject);
    this.user = this.authstore.get();
  }
  //#region Constructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.smallcard,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
    ];
  }
  //#region Init

  //#region Events
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

  click(e, data) {}
  //#region Events

  //#region Method
  add(e): void {}

  edit(e, data): void {}

  copy(e, data): void {}

  delete(data): void {}
  //#region Method
}
