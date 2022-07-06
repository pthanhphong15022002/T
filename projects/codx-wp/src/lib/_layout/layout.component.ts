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

  constructor(
    private route: ActivatedRoute,
     private changedt: ChangeDetectorRef,
     private cache:CacheService,
     inject: Injector) {
    super(inject);
    this.codxService.init(this.module, false,false,"light",false);

    this.cache.valueList('L1492').subscribe((value) => {
      this.valueList = value.datas;
    });
  }

  onInit(): void {
  }

  onAfterViewInit(): void { }


  category = "news";
  navigate(category = 'news',funcID = null) {
    this.category = category;
    if(!funcID){
      funcID = this.route.firstChild.snapshot.params["funcID"];
    }
    this.codxService.navigate('', "wp/" + category + "/" + funcID)
  }
}
