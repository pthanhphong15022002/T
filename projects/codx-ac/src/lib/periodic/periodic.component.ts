import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  UIComponent,
  UrlUtil,
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

  user: any;

  constructor(inject: Injector, private authstore: AuthStore, private route: Router) {
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
  click(e, data) {
    this.cache.functionList(data?.functionID).subscribe((func) => {
      if (func) {
        let urlRedirect = '/' + UrlUtil.getTenant();
        if (func && func.url && func.url.charAt(0) != '/') urlRedirect += '/';
        urlRedirect += func.url;
        this.route.navigate([urlRedirect]);
      }
    });
  }
  //#region Events

  //#region Method
  //#region Method
}
