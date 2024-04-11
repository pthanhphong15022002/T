import { Component, OnInit, Injector } from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { ActivatedRoute, Router } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-layout-portal',
  templateUrl: './layout-portal.component.html',
  styleUrls: ['./layout-portal.component.scss'],
})
export class LayoutPortalComponent extends LayoutBaseComponent {
  funcID: string = '';
  dialog!: DialogRef;
  constructor(
    inject: Injector,
    private route: ActivatedRoute,
    private callfc: CallFuncService,
    private cache: CacheService,
    private shareService: CodxShareService,
    private routers : Router,
  ) {
    super(inject);
    this.module = 'WP';
    let tenant = this.routers?.url.split("/")[1];
    if(!environment.asideMode.includes(tenant)) this.layoutModel.asideFixed = false;
    this.layoutModel.asideTheme = 'transparent';
    this.layoutModel.asideMinimize = 'icon';
    this.layoutModel.toolbarDisplay = false;
    this.layoutModel.asideKeepActive = false;
  }

  onInit() {
  }

  asideClick(evt: any) {
    if (evt?.function?.assemblyName == 'HCS') {
      evt.cancel = true;
      this.shareService.redirect(
        'HCS',
        evt.function.url,
        evt?.function.displayMode
      );
    }
  }
  onAfterViewInit(): void {}
  
}
