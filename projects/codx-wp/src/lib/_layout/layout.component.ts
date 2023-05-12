import { Component, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  
  constructor(
    private route: ActivatedRoute,
    private cache: CacheService,
    inject: Injector
  ) {
    super(inject);
    this.module = 'WP';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarFixed = false;
    this.layoutModel.toolbarDisplay = false;
  }

  onInit(): void {}

  onAfterViewInit(): void {}
}
