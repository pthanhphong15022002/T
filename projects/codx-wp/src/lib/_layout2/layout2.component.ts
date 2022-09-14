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
    this.cache.valueList('WP002').subscribe((value) => {
      this.valueList = value.datas;
    });
  }

  onInit(): void {
  }

  onAfterViewInit(): void {}

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
}
