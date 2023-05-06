import {
  ActivatedRouteSnapshot,
  RouteReuseStrategy,
  DetachedRouteHandle,
  UrlSegment,
} from '@angular/router';
import { CodxService, Util } from 'codx-core';

interface CacheItem {
  handle: DetachedRouteHandle;
  config: any;
}

export class CacheRouteReuseStrategy implements RouteReuseStrategy {
  private static stores = new Map<string, CacheItem>();
  private codxSvc: any;
  private codxSvcConfigs = new Map<string, any>();

  constructor() {}

  //THIS METHOD IS USED FOR DELETE ROUTE
  public static clear(): void {
    for (const key in CacheRouteReuseStrategy.stores) {
      if (CacheRouteReuseStrategy.stores.has(key)) {
        const handle = CacheRouteReuseStrategy.stores.get(key);
        const compRef = (handle as any)['componentRef'];
        if (compRef) {
          compRef.destroy();
        }
      }
    }
    CacheRouteReuseStrategy.stores.clear();
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    //let key = this.getPath(route);
    var ok = route.data['noReuse'] == true ? false : true;
    if(ok){
    console.log("shouldDetach: "+this.getPath(route));
    }
    
    return ok;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if (!handle) return;
    const comRef = (handle as any)['componentRef'];
    if (!comRef || !comRef.instance) return;

    if (!this.codxSvc) {
      this.codxSvc = comRef.injector.get(CodxService);
    }

    const funcID = route.params['funcID'];
    let key = this.getPath(route),
      item: CacheItem = { handle: handle, config: {} };
    console.log("store: "+key);
    if (route.routeConfig?.children) {
      if (comRef.instance.module || comRef.instance.asideTheme) {
        item.config = {
          module: comRef.instance.module,
          aside: comRef.instance.aside,
          asideFixed: comRef.instance.asideFixed,
          asideTheme: comRef.instance.asideTheme,
          toolbar: comRef.instance.toolbar,
          toolbarFixed: comRef.instance.toolbarFixed,
          theme: comRef.instance.theme,
          asideDisplay: comRef.instance.asideDisplay,
          asideCSSClasses: comRef.instance.asideCSSClasses,
          headerCSSClasses: comRef.instance.headerCSSClasses,
          headerLeft: comRef.instance.headerLeft,
        };
      }
    }

    let config:any=null;
    if(this.codxSvcConfigs.has(key))
      config = this.codxSvcConfigs.get(key);
    else if(this.codxSvcConfigs.get(""))
      config = this.codxSvcConfigs.get("");

    if (config) {
      item.config.codxSvc = {
        funcID: funcID,
        activeViews: config.activeViews,
        onActiveMenu: config.onActiveMenu,
        predicate: config.predicate,
        dataValue: config.dataValue,
        autoSetTitle: config.autoSetTitle,
        pageTitle: config.pageTitle,
        pageSubTitle: config.pageSubTitle,
        showIconBack: config.showIconBack,
        layoutUrl: config.layoutUrl,
        layoutLogo: config.layoutLogo,
        breadcrumbs: config.breadcrumbs,
        asideKeepActive: config.asideKeepActive,
        activeMenu: config.activeMenu,
      };
      this.codxSvcConfigs.delete(key);
    } else {
      item.config.codxSvc = {
        funcID: funcID,
        activeViews: this.codxSvc.activeViews,
        onActiveMenu: this.codxSvc.onActiveMenu,
        predicate: this.codxSvc.predicate,
        dataValue: this.codxSvc.dataValue,
        autoSetTitle: this.codxSvc.autoSetTitle,
        pageTitle: this.codxSvc.page.title.value,
        pageSubTitle: this.codxSvc.page.subTitle.value,
        showIconBack: this.codxSvc.layout.showIconBack,
        layoutUrl: this.codxSvc.layout.url.value,
        layoutLogo: this.codxSvc.layout.logo.value,
        breadcrumbs: this.codxSvc.page.breadcrumbs.value,
        asideKeepActive: this.codxSvc.asideKeepActive,
        activeMenu: {}
      };

      if(this.codxSvc.activeMenu){
        if(this.codxSvc.activeMenu.old)
          item.config.codxSvc.activeMenu = JSON.parse(JSON.stringify(this.codxSvc.activeMenu.old));
        else
          item.config.codxSvc.activeMenu = JSON.parse(JSON.stringify(this.codxSvc.activeMenu));
      }
    }

    CacheRouteReuseStrategy.stores.set(key, item);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.getPath(route);
    const has = CacheRouteReuseStrategy.stores.has(key);
    if(has)
      console.log("shouldAttach: "+key);
    return has;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    var key = this.getPath(route);
    if (!CacheRouteReuseStrategy.stores.has(key)) return null;

    console.log("retrieve: "+key);
    const item = CacheRouteReuseStrategy.stores.get(key);
    if (!item) return null;
    const funcID = route.params['funcID'];
    if (item.config && route.routeConfig?.children) {
      const comRef = (item.handle as any)['componentRef'];
      if (comRef && comRef.instance) {
        if (comRef.instance.module || comRef.instance.asideTheme) {
          comRef.instance.module = item.config.module;
          comRef.instance.aside = item.config.aside;
          comRef.instance.asideFixed = item.config.asideFixed;
          comRef.instance.asideTheme = item.config.asideTheme;
          comRef.instance.toolbar = item.config.toolbar;
          comRef.instance.toolbarFixed = item.config.toolbarFixed;
          comRef.instance.theme = item.config.theme;
          comRef.instance.asideDisplay = item.config.asideDisplay;
          comRef.instance.asideCSSClasses = item.config.asideCSSClasses;
          comRef.instance.asideKeepActive = item.config.codxSvc.asideKeepActive;
          comRef.instance.headerCSSClasses = item.config.headerCSSClasses;
          comRef.instance.headerLeft = item.config.headerLeft;

          this.codxSvc.funcID = funcID || item.config.codxSvc.funcID;
          this.codxSvc.activeViews = item.config.codxSvc.activeViews;
          this.codxSvc.onActiveMenu = item.config.codxSvc.onActiveMenu;
          this.codxSvc.activeFav = item.config.codxSvc.activeMenu.fav;
          this.codxSvc.predicate = item.config.codxSvc.predicate,
          this.codxSvc.dataValue = item.config.codxSvc.dataValue,
            //this.codxSvc.autoSetTitle = item.config.codxSvc.autoSetTitle;
          this.codxSvc.page.setTitle(item.config.codxSvc.pageTitle);
          this.codxSvc.page.setSubTitle(item.config.codxSvc.pageSubTitle);
          this.codxSvc.layout.setUrl(item.config.codxSvc.layoutUrl);
          this.codxSvc.layout.setLogo(item.config.codxSvc.layoutLogo);
          this.codxSvc.page.setBreadcrumbs(item.config.codxSvc.breadcrumbs);
          this.codxSvc.activeMenu = item.config.codxSvc.activeMenu;
          this.codxSvc.asideKeepActive = item.config.codxSvc.asideKeepActive;

          this.codxSvc.layout.showIconBack = item.config.codxSvc.showIconBack;
          this.codxSvc.autoSetTitle = false;
          this.codxSvc.init(
            item.config.module,
            item.config.aside,
            item.config.asideFixed,
            item.config.asideTheme,
            item.config.asideKeepActive,
            item.config.toolbar,
            item.config.toolbarFixed,
            item.config.theme
          );

          if (item.config.module) {
            this.codxSvc.cacheService
              .functionList(item.config.module)
              .subscribe((f: any) => {
                if (f) {
                  if (f.functionType == 'S')
                    this.codxSvc.layout.showIconBack = true;
                    
                  if(this.codxSvc.layout.showIconBack)
                    this.codxSvc.layout.setLogo(null);

                  this.codxSvc.page.setTitle(f.customName);
                  this.codxSvc.layout.setUrl(f.url);
                }
              });
          }

          this.codxSvc.autoSetTitle = item.config.codxSvc.autoSetTitle;
        }
      }
    } 
    
    if (funcID) {
      if (
        this.codxSvc &&
        item.config.codxSvc &&
        (!item.config.codxSvc || item.config.codxSvc.funcID == funcID)
      ) {
        this.codxSvc.funcID = funcID;
        this.codxSvc.activeViews = item.config.codxSvc.activeViews;
        this.codxSvc.onActiveMenu = item.config.codxSvc.onActiveMenu;
        this.codxSvc.activeFav = item.config.codxSvc.activeMenu.fav;
        (this.codxSvc.predicate = item.config.codxSvc.predicate),
          (this.codxSvc.dataValue = item.config.codxSvc.dataValue),
          (this.codxSvc.autoSetTitle = item.config.codxSvc.autoSetTitle);
        //this.codxSvc.page.setTitle(item.config.codxSvc.pageTitle);
        //this.codxSvc.page.setSubTitle(item.config.codxSvc.pageSubTitle);
        //this.codxSvc.layout.setUrl(item.config.codxSvc.layoutUrl);
        //this.codxSvc.layout.setLogo(item.config.codxSvc.layoutLogo);
        this.codxSvc.layout.showIconBack = item.config.codxSvc.showIconBack;
        this.codxSvc.page.setBreadcrumbs(item.config.codxSvc.breadcrumbs);
        this.codxSvc.activeMenu = item.config.codxSvc.activeMenu;
        this.codxSvc.asideKeepActive = item.config.codxSvc.asideKeepActive;

        this.codxSvc.cacheService.functionList(funcID).subscribe((f: any) => {
          if (f) {
            if (f.functionType == 'S') this.codxSvc.layout.showIconBack = true;

            if(this.codxSvc.layout.showIconBack) this.codxSvc.layout.setLogo(null);

            this.codxSvc.page.setSubTitle(f.customName);
            this.codxSvc.layout.setUrl(f.url);

            this.codxSvc.setMenu(funcID, this.codxSvc.activeFav);
          }
        });
      }
    }

    return item.handle;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    // const ok =
    //   ((future.routeConfig === curr.routeConfig &&
    //     JSON.stringify(future.params) === JSON.stringify(curr.params)) ||
    //     (!!future.routeConfig?.component &&
    //       future.routeConfig?.component === curr.routeConfig?.component)) &&
    //   !future.data['alwaysRefresh'];
    const ok = future.routeConfig === curr.routeConfig && !future.data['alwaysRefresh'];
    const key = this.getPath(curr);
    if (!ok && this.codxSvc) {
      const codxSvcConfig = {
        funcID: curr.params['funcID'],
        activeViews: this.codxSvc.activeViews,
        onActiveMenu: this.codxSvc.onActiveMenu,
        predicate: this.codxSvc.predicate,
        dataValue: this.codxSvc.dataValue,
        autoSetTitle: this.codxSvc.autoSetTitle,
        pageTitle: this.codxSvc.page.title.value,
        pageSubTitle: this.codxSvc.page.subTitle.value,
        showIconBack: this.codxSvc.layout.showIconBack,
        layoutUrl: this.codxSvc.layout.url.value,
        layoutLogo: this.codxSvc.layout.logo.value,
        breadcrumbs: this.codxSvc.page.breadcrumbs.value,
        asideKeepActive: this.codxSvc.asideKeepActive,
        activeMenu: {}
      };
      if(this.codxSvc.activeMenu){
        if(this.codxSvc.activeMenu.old)
        codxSvcConfig.activeMenu = JSON.parse(JSON.stringify(this.codxSvc.activeMenu.old));
        else
        codxSvcConfig.activeMenu = JSON.parse(JSON.stringify(this.codxSvc.activeMenu));
      }
      this.codxSvcConfigs.set(key, codxSvcConfig);
    }

    return ok;
  }

  private getPath(route: ActivatedRouteSnapshot): string {
    var key = route.pathFromRoot
      .filter((u) => u.url)
      .map((u) => u.url)
      .join('/');

    if(route.routeConfig){
      if(route.routeConfig.children)
        return (
          key +
          '|' +
          route.routeConfig?.children
            ?.filter((u) => u.path)
            .map((u) => u.path)
            .join('/')
        );
      else if(route.routeConfig.loadChildren){
        return "";
      }
    }
    
    return key;
  }
}
