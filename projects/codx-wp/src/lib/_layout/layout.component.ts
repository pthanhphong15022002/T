import { Component, OnInit, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService, LayoutBaseComponent } from 'codx-core';
import { Observable } from 'rxjs';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'WP';
  valueList: [];

  constructor(private route: ActivatedRoute, private changedt: ChangeDetectorRef, private cache: CacheService, inject: Injector) {
    super(inject);
    this.codxService.init(this.module);
    this.cache.valueList('L1492').subscribe((value) => {
      this.valueList = value.datas;
    });
  }

  onInit(): void {
    this.codxService.fun$.subscribe();
  }

  onAfterViewInit(): void { }


  category = "news";
  navigate(category = 'news') {
    this.category = category;
    var funcID = this.route.firstChild.snapshot.params["funcID"];
    this.changedt.detectChanges();
    this.codxService.navigate('', "wp/" + category + "/" + funcID);
  }
}
