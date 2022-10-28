import { Component, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CacheService, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout-news',
  templateUrl: './layout-news.component.html',
  styleUrls: ['./layout-news.component.scss'],
})
export class LayoutNewsComponent extends LayoutBaseComponent {
  module = 'WP';
  override toolbar = false;
  override aside = false;
  override asideFixed = false;
  valueList: [];
  category:string = "home";
  funcID:string | null = "";
  userPermission:any = null;
 

  constructor(
    private route: ActivatedRoute,
    private cache: CacheService,
    private dt:ChangeDetectorRef,
    private api:ApiHttpService,

    inject: Injector
  ) {
    super(inject);
    
  }

  onInit(): void {
    this.getUserPermission("WPT022");
    this.cache.valueList('WP002').subscribe((value) => {
      this.valueList = value.datas;
    });
  }

  onAfterViewInit(): void {}

  getUserPermission(funcID:string){
    if(funcID){
      this.api.execSv("SYS","ERM.Business.SYS","CommonBusiness","GetUserPermissionsAsync",[funcID])
      .subscribe((res:any) => {
        if(res){
          this.userPermission = res;
          this.dt.detectChanges();
        }
      });
    }
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
    this.dt.detectChanges();
  }
}
