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
<<<<<<< HEAD
    this.codxService.fun$.subscribe();
=======
    //this.funcs$.subscribe();
>>>>>>> 3ca2a79da225f5ed0ab776b07eea9cd32a6f5514
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
