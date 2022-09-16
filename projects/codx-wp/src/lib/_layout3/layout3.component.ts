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
  override toolbar = true;
  override aside = false;
  override asideFixed = false;
  valueList: [];
  category:string = "approvals";
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
    this.cache.valueList('WP002').subscribe((value) => {
      this.valueList = value.datas;
    });
  }

  navigate(category, funcID = null) {
    this.category = category;
    this.dt.detectChanges;
    if(funcID){
      this.codxService.navigate(funcID);
    }
    else
    {
      this.funcID = this.route.firstChild.snapshot.params["funcID"];
      this.codxService.navigate('','wp/news/'+this.funcID+'/'+this.category);
    }
    this.dt.detectChanges;
  }

  onAfterViewInit(): void {}
}
