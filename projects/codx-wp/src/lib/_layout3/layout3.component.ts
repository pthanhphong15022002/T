import { Component, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout3.component.html',
  styleUrls: ['./layout3.component.scss'],
})
export class Layout3Component extends LayoutBaseComponent {
  module = 'WP';
  override toolbar = false;
  override aside = false;
  override asideFixed = false;
  valueList: [];
  category:string = "home";
  funcID:string | null = "";
 

  constructor(
    private route: ActivatedRoute,
    private cache: CacheService,
    private dt:ChangeDetectorRef,
    inject: Injector
  ) {
    super(inject);
  }

  onInit(): void {

  }

  onAfterViewInit(): void {}
}
