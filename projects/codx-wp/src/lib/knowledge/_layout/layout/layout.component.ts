import { Component, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CacheService, CallFuncService, LayoutBaseComponent } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'wp-knowledge-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {
  funcID: string = '';
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
  onAfterViewInit(): void {}
  
}
