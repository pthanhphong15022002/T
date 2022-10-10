import { Component, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'WP';
  override aside = false;
  override toolbar = false;

  constructor(
    private route: ActivatedRoute,
    private cache: CacheService,
    inject: Injector
  )
  {
    super(inject);
  }

  onInit(): void 
  {
  }

  onAfterViewInit(): void {}

}
