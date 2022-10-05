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
  // aside=true;
  // asideFixed = true;
  // toolbar = false;
  valueList: [];
  category:string = "home";

  constructor(
    private route: ActivatedRoute,
    private cache: CacheService,
    inject: Injector
  ) {
    super(inject);
    
    
  }

  onInit(): void 
  {
    this.cache.valueList('L1492').subscribe((value) => {
      this.valueList = value.datas;
    });
  }

  onAfterViewInit(): void {}

  navigate(category, funcID = null) {
  }
}
