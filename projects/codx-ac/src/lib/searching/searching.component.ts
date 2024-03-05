import { ChangeDetectionStrategy, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService, AuthStore, ViewModel, ViewType, UrlUtil, UIComponent } from 'codx-core';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { CodxFullTextSearch } from 'projects/codx-share/src/lib/components/codx-fulltextsearch/codx-fulltextsearch.component';

@Component({
  selector: 'lib-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchingComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  user: any = {};
  constructor(
    private inject: Injector,
    private hideToolbar: CodxOdService,
    private authStore: AuthStore,
    private route: Router
  ) {
    super(inject);
    this.user = this.authStore.get();
  }
  //#endregion Constructor

  //#region Init
  onInit() {
    
  }
  ngAfterViewInit(): void {
    this.codxService.setStyleToolbarLayout(this.view.elementRef.nativeElement, 'toolbar1');
    this.views = [
      {
        type: ViewType.smallcard,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
    ];
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Event

  click(e, data) {
    this.cache.functionList(data?.functionID).subscribe((func) => {
      if (func) {
        let urlRedirect = '/' + UrlUtil.getTenant();
        if (func && func.url && func.url.charAt(0) != '/') urlRedirect += '/';
        urlRedirect += func.url;
        this.route.navigate([urlRedirect]);
      }
    });
  }
  //#endregion Event

  //#region Function
  //#endregion Function
}
