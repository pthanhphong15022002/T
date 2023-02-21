import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
  Injector,
} from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'postingaccounts',
  templateUrl: './item-posting-accounts.component.html',
  styleUrls: ['./item-posting-accounts.component.css'],
})
export class ItempostingaccountsComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  @ViewChild('template') template: TemplateRef<any>;
  constructor(inject: Injector) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        model: {
          panelLeftRef: this.template,
        },
      },
    ];
  }
  #endregion;
}
