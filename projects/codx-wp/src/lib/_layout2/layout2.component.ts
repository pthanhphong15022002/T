import { Component, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout2.component.html',
  styleUrls: ['./layout2.component.scss'],
})
export class Layout2Component extends LayoutBaseComponent {
  module = 'WP';
  override toolbar = false;
  override aside = false;
  valueList: [];
  category:string = "home";

  constructor(
    private route: ActivatedRoute,
    private cache: CacheService,
    inject: Injector
  ) {
    super(inject);
    this.cache.valueList('L1492').subscribe((value) => {
      this.valueList = value.datas;
    });
  }

  onInit(): void {

  }

  onAfterViewInit(): void {}

  navigate(category, funcID = null) {
    
  }
}
