import { Component, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout-approval',
  templateUrl: './layout-approval.component.html',
  styleUrls: ['./layout-approval.component.scss'],
})
export class LayoutApprovalComponent extends LayoutBaseComponent {
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

  navigate(category, funcID) {
    this.category = category;
    switch(category){
      case "approvals":
        this.codxService.navigate(funcID);
        break;
      case "settings":
        this.codxService.navigate('','wp/news/settings/'+funcID);
        break;
      default:
        this.codxService.navigate('','wp/news/'+funcID+'/'+this.category);
        break;
    }
  }

  onAfterViewInit(): void {}
}
