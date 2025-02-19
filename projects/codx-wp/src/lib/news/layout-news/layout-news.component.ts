import { Component, Injector, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  CacheService,
  LayoutBaseComponent,
  PageTitleService,
} from 'codx-core';
@Component({
  selector: 'lib-layout-news',
  templateUrl: './layout-news.component.html',
  styleUrls: ['./layout-news.component.scss'],
})
export class LayoutNewsComponent extends LayoutBaseComponent {
  valueList: [];
  category: string = 'home';
  funcID: string | null = '';
  userPermission: any = null;
  title$: any;
  constructor(
    private route: ActivatedRoute,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private api: ApiHttpService,
    private pageTitle: PageTitleService,
    inject: Injector
  ) {
    super(inject);
    this.module = 'WP2';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarDisplay = false;
  }

  onInit(): void {
    this.title$ = this.pageTitle.title.asObservable();
    this.getUserPermission('WPT022');
    this.cache.valueList('WP002').subscribe((vll: any) => {
      if (vll) this.valueList = vll.datas;
    });
    let params = window.location.href.split('/');
    if (params?.length > 0) {
      this.category = params.pop();
    }
  }

  onAfterViewInit(): void {}

  getUserPermission(funcID: string) {
    if (funcID) {
      this.api
        .execSv(
          'SYS',
          'ERM.Business.SYS',
          'CommonBusiness',
          'GetUserPermissionsAsync',
          [funcID]
        )
        .subscribe((res: any) => {
          if (res) {
            this.userPermission = res;
            this.dt.detectChanges();
          }
        });
    }
  }
  navigate(category, funcID) {
    this.funcID = funcID;
    this.category = category;
    switch (category) {
      case 'approvals':
        this.codxService.navigate(funcID);
        break;
      case 'settings':
        this.codxService.navigate('', 'wp2/news/settings/' + funcID);
        break;
      default:
        this.codxService.navigate('', `wp2/news/${funcID}/${this.category}`);
        break;
    }
    this.dt.detectChanges();
  }
}
