declare var window: any;

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import {
  ApiHttpService,
  ButtonModel,
  CacheService,
  CodxService,
  CRUDService,
  DataRequest,
  DrawerComponent,
  LayoutService,
  MenuComponent,
  PageTitleService,
  ScrollComponent,
  TenantStore,
  ToggleComponent,
  UrlUtil,
} from 'codx-core';

import { finalize, map, Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'codx-aside-custom',
  templateUrl: './codx-aside-custom.component.html',
  styleUrls: ['./codx-aside-custom.component.css'],
  host: { class: 'aside' },
})
export class CodxAsideCustomComponent implements OnInit, OnDestroy, OnChanges {
  asideTheme: string = '';
  asideMinimize: string = 'none';
  asideMinimized: boolean = false;
  asideMenuCSSClasses: string = '';
  @ViewChild('ktAsideScroll', { static: true }) ktAsideScroll?: ElementRef;
  @Input() asideMenu: TemplateRef<any> | null = null;
  @Input() asideMenuHeader: TemplateRef<any> | null = null;
  @Input() asideMenuFooter: TemplateRef<any> | null = null;
  @Input() asideSecond: TemplateRef<any> | null = null;
  @Input() asideSecondHeader: TemplateRef<any> | null = null;
  @Input() asideSecondFooter: TemplateRef<any> | null = null;
  @Input() hasSecond: boolean = true;
  private unsubscribe: Subscription[] = [];
  @Output() resizedEvent: EventEmitter<{ w: number; h: number }> =
    new EventEmitter();
  @Output() secondClickEvent: EventEmitter<ButtonModel> = new EventEmitter();
  @Output() childMenuClick: EventEmitter<any> = new EventEmitter();
  @Output() menuClick: EventEmitter<any> = new EventEmitter();
  @Output() favoriteClick: EventEmitter<any> = new EventEmitter();

  logo$: Observable<string> = of('');
  title$: Observable<string> = of('');
  url$: Observable<string> = of('');
  settingFunc?: any;
  menuClass: string[] = [];
  funcs: any[] = [];
  loaded = false;
  tenant: string | undefined | null;
  @HostBinding('attr.data-kt-drawer') dataKtMenu = 'true';
  @HostBinding('attr.data-kt-drawer-name') dataKtName = 'aside';
  @HostBinding('attr.data-kt-drawer-activate') dataKtActive =
    '{default: true, lg: false}';
  @HostBinding('attr.data-kt-drawer-overlay') dataKtOverlay = 'true';

  @HostBinding('attr.data-kt-drawer-width') get drawerWidth() {
    if (this.hasSecond) return null;
    else return "{default:'200px', '300px': '250px'}";
  }
  @HostBinding('attr.data-kt-drawer-direction') dataKtDirection = 'start';
  @HostBinding('attr.data-kt-drawer-toggle') dataKtToggle =
    '#kt_aside_mobile_toggle';
  @HostBinding('class') get hostClasses() {
    const classList = [];
    if (this.hasSecond) classList.push('aside-extended');
    if (this.asideTheme) classList.push(`aside-${this.asideTheme}`);

    return classList;
  }

  services = 'DP';
  idFieldTemp = 'RecID';
  serviceTemp: string = 'DP';
  assemblyNameTemp: string = 'DP';
  classNameTemp: string = 'ProcessesBusiness';
  methodTemp: string = 'GetListSubMenuAsync';
  requestMenuCustom = new DataRequest();
  dataMenuCustom = [];
  dataMenuCustom1 = [];
  funcOld = '';

  constructor(
    private pageTitle: PageTitleService,
    private layout: LayoutService,
    public codxService: CodxService,
    private cache: CacheService,
    private changDefector: ChangeDetectorRef,
    private router: Router,
    private elRef: ElementRef,
    private api: ApiHttpService,
    private tenantStore: TenantStore
  ) {
    this.tenant = this.tenantStore.get()?.tenant;
    if (!this.tenant) this.tenant = UrlUtil.getTenant();
  }

  ngOnInit(): void {
    this.logo$ = this.layout.logo.asObservable();
    this.url$ = this.layout.url.asObservable();
    this.title$ = this.pageTitle.title.asObservable();
    this.asideTheme = this.layout.getProp('aside.theme') as string;
    this.asideMinimize = this.layout.getProp('aside.minimize') as string;
    this.asideMinimized = this.layout.getProp('aside.minimized') as boolean;
    this.asideMenuCSSClasses = this.layout.getStringCSSClasses('asideMenu');

    if (this.asideSecond) this.hasSecond = true;

    if (this.hasSecond) {
      const aside = this.elRef.nativeElement.closest('.aside-enabled');
      if (aside) aside.classList.add('aside-secondary-enabled');
    }

    if (this.asideTheme == 'transparent') {
      this.menuClass.push('menu-title-gray-800');
      this.menuClass.push('menu-arrow-gray-500');
    } else if (this.asideTheme == 'light') {
      this.menuClass.push('menu-title-light');
      this.menuClass.push('menu-arrow-light');
    }

    this.routingChanges();

    if (this.ktAsideScroll) {
      const t = this;
      this.ktAsideScroll.nativeElement['resizedEvent'] = function (size: any) {
        t.resizedEvent.emit(size);
      };
    }

    var cfg = this.layout.getConfig();
    if (cfg.aside) {
      this.codxService
        .getFuncs(this.codxService.module)
        .subscribe((fs: any[]) => {
          if (!fs) return;
          this.funcs = fs;
          this.settingFunc = fs
            .filter((x) => x.functionType == 'S' && x.treeLevel == 0)
            .shift();

          this.changDefector.detectChanges();
          this.codxService.activeMenu.func0 = 'CM0101';
          this.openSecondFunc(this.codxService.activeMenu.func0);
        });

      this.codxService.setActiveMenu(this.codxService.module, (d) => {
        this.resetActiveMenu();
        this.changDefector.detectChanges();
        if (d.funcId) {
          this.codxService.activeMenu.id = d.funcId;
          this.codxService.funcID = this.codxService.activeMenu.id;
          var func = this.getFunc(d.funcId);
          if (func) func.expanded = false;
          this.openSecondFunc(d.funcId);
        }
        if (d.favId) this.codxService.activeMenu.fav = d.favId;
        //this.checkActive();
        setTimeout(() => {
          this.codxService.activeMenu = JSON.parse(
            JSON.stringify(this.codxService.activeMenu)
          );
          this.changDefector.detectChanges();
        }, 200);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {}

  // calcHeight() {
  //   if (this.settingFunc) {
  //     this.loaded = true;

  //   }
  // }

  openSecondFunc(funcId: string, func?: any) {
    this.dataMenuCustom = [];
    //load menuCus
    if (funcId == 'CM0201' || funcId == 'CM0401' || funcId == 'CM0402')
      this.loadMenuCustom(funcId);
    if (funcId) {
      this.codxService.activeMenu.func0 = funcId;

      if (!this.hasSecond) {
        this.codxService.activeMenu.func1 = null;
        return;
      }
      if (!func) func = this.getFunc(funcId);

      if (func) {
        this.codxService.activeMenu.func0 = func.parentID;
        this.codxService.activeMenu.func1 = funcId;

        if (func.favs || func.formFavs || func.shareFavs) {
          this.codxService.activeMenu.fav = func.favDefault.id;
          this.codxService.activeMenu.favType = func.favDefault.type;
          this.codxService.activeFav = this.codxService.activeMenu.fav;

          this.toggleSecond(this.getFunc(func.parentID));
        } else {
          if (!func.expanded && func.parentID != func.module) {
            if (func.functionType == 'R') {
              if (!func.expanded) {
                this.cache.reportList(funcId).subscribe((x) => {
                  func.expanded = !0;
                  if (x && x.length > 0) {
                    func.reports = x;
                    this.codxService.activeMenu.reportId = x[0].recID;
                  }
                });
              }
            } else {
              this.getFavs(func, this.codxService.activeMenu.fav);
            }
          }

          if (func.parentID != func.module)
            this.toggleSecond(this.getFunc(func.parentID));
          else this.toggleSecond(func);
        }
      }
    }
    ScrollComponent.update('#kt_aside_menu');
  }

  getFavs(func: any, defaultFav?: any) {
    this.codxService.getFavs(func, '1', defaultFav).subscribe((x) => {
      this.codxService.activeMenu.fav = x.defaultId;
      this.codxService.activeMenu.favType = x.defaultType;
      this.codxService.activeFav = this.codxService.activeMenu.fav;

      if (func.favs && func.favs.length > 0) {
        var favIDs: any[] = [];
        func.favs.forEach((x: any) => {
          favIDs.push(x.recID);
        });

        this.codxService
          .getCountFavs(func.functionID, func.entityName, favIDs)
          .subscribe((d) => {
            if (!d) return;

            func.favs.forEach((x: any) => {
              x.count = 0;
              if (d[x.recID]) x.count = d[x.recID];
            });
          });
      }
    });
  }

  getFunc(funcId: string) {
    let func: any = null;
    this.funcs.forEach((x) => {
      if (func) return;
      if (x.functionID == funcId) {
        func = x;
        return;
      }

      if (x.childs) {
        func = x.childs.filter((c: any) => c.functionID == funcId).shift();
        if (func) return;
      }
    });

    return func;
  }

  itemClick(funcId: string, data: any, type?: string) {
    let titleEle = document.querySelector('codx-page-title');
    if (titleEle) {
      let oldBrc = titleEle.querySelector('#breadCrumb');
      if (oldBrc) oldBrc.remove();
    }

    let func = type ? this.getFunc(funcId) : data;
    if (type === 'fv') this.favoriteClick.emit({ func, data });
    else this.menuClick.emit({ func, data, type });

    if (this.codxService.activeMenu.id != funcId) {
      if (type == 'fv' || type == 'sfv') {
        this.codxService.activeMenu.old = JSON.parse(
          JSON.stringify(this.codxService.activeMenu)
        );
        this.codxService.activeFav = data.recID;
        this.codxService.activeMenu.fav = this.codxService.activeFav;
        this.codxService.activeMenu.favType = data.isSystem ? 'Fav' : 'FormFav';
        func.favDefault.id = this.codxService.activeMenu.fav;
        func.favDefault.type = this.codxService.activeMenu.favType;
        this.codxService.navigate(funcId);
        return true;
      } else if (type == 'r') {
        this.codxService.activeMenu.old = JSON.parse(
          JSON.stringify(this.codxService.activeMenu)
        );
        func.activeReportId = data.recID;
        this.codxService.activeMenu.reportID = func.activeReportId;
        this.codxService.activeFav = null;
        this.codxService.activeMenu.favType = 'r';
        this.codxService.activeMenu.fav = this.codxService.activeFav;
        this.codxService.navigate(funcId);
        return true;
      } else if (data.functionType == 'S') {
        this.codxService.activeMenu.old = JSON.parse(
          JSON.stringify(this.codxService.activeMenu)
        );
        this.resetActiveMenu();
        this.codxService.navigate(funcId);
        return true;
      }
    }

    switch (type) {
      case 'r':
        if (this.codxService.activeMenu.reportID == data.recID) return false;
        this.codxService.activeMenu.old = JSON.parse(
          JSON.stringify(this.codxService.activeMenu)
        );
        func.activeReportId = data.recID;
        this.codxService.activeMenu.reportID = func.activeReportId;
        this.codxService.activeFav = null;
        this.codxService.activeMenu.favType = 'r';
        this.codxService.activeMenu.fav = this.codxService.activeFav;
        //Call View Report -- Soon
        //this.codxService.activeViews?.dataService.changeFavorite(data.recID).subscribe();
        break;
      case 'fv':
        if (this.codxService.activeMenu.fav == data.recID) return false;
        this.codxService.activeMenu.old = JSON.parse(
          JSON.stringify(this.codxService.activeMenu)
        );

        this.codxService.activeMenu.fav = data.recID;
        this.codxService.activeMenu.favType = data.isSystem ? 'Fav' : 'FormFav';
        this.codxService.activeFav = this.codxService.activeMenu.fav;

        //func = this.getFunc(funcId);
        func.favDefault.id = this.codxService.activeMenu.fav;
        func.favDefault.type = this.codxService.activeMenu.favType;

        this.codxService.activeViews?.dataService
          .changeFavorite(data)
          .subscribe();
        break;
      case 'sfv':
        if (this.codxService.activeMenu.fav == data.recID) return false;
        this.codxService.activeMenu.old = JSON.parse(
          JSON.stringify(this.codxService.activeMenu)
        );
        this.codxService.activeMenu.favType = 'SharedFav';

        this.codxService.activeMenu.fav = data.recID;
        this.codxService.activeMenu.favType = 'sfv';
        this.codxService.activeFav = this.codxService.activeMenu.fav;

        this.codxService.activeViews?.dataService
          .changeFavorite(data)
          .subscribe();
        break;
      default:
        if (
          data.displayMode == '0' ||
          this.codxService.activeMenu.func0 == data.functionID
        )
          return false;
        this.codxService.activeMenu.old = JSON.parse(
          JSON.stringify(this.codxService.activeMenu)
        );

        if (this.codxService.asideKeepActive) {
          this.codxService.activeMenu.id = data.functionID;
          this.codxService.funcID = this.codxService.activeMenu.id;
          this.codxService.activeMenu.func0 = data.functionID;
        } else {
          this.resetActiveMenu();
        }

        if (data.functionType != 'G') {
          if (this.hasSecond) {
            if (func.childs && func.childs.length > 0) func = func.childs[0];
            else this.toggleSecond(func);

            if (this.codxService.asideKeepActive) {
              this.codxService.activeMenu.id = func.functionID;
              this.codxService.funcID = this.codxService.activeMenu.id;
            }

            this.openChildMenu(func);
          } else this.codxService.navigate(data.functionID);
        } else if (this.hasSecond) {
          //let func = this.getFunc(this.codxService.activeMenu.func0);
          if (func.childs && func.childs.length > 0) func = func.childs[0];

          if (this.codxService.asideKeepActive) {
            this.codxService.activeMenu.id = func.functionID;
            this.codxService.funcID = this.codxService.activeMenu.id;
            this.codxService.activeMenu.fav = null;
          }
          this.openSecondFunc(func.functionID, func);
        }
        break;
    }

    return true;
  }

  openChildMenu(func: any) {
    this.childMenuClick.emit({ func });
    let isNav = func.functionID != this.codxService.activeMenu.func1;
    if (isNav) {
      this.codxService.activeMenu.func1 = func.functionID;
      if (func.expanded) {
        if (func.functionType == 'R') {
          this.codxService.activeMenu.reportId = func.reports[0];
        } else {
          this.codxService.activeMenu.fav = func.favDefault.id;
          this.codxService.activeMenu.favType = func.favDefault.type;
          this.codxService.activeFav = this.codxService.activeMenu.fav;
        }
      } else {
        if (func.functionType == 'R') {
          this.cache.reportList(func.functionID).subscribe((x) => {
            func.expanded = !0;
            if (x && x.length > 0) {
              func.reports = x;
              func.activeReportId = x[0].recID;
              this.codxService.activeMenu.reportId = func.activeReportId;
            }
          });
        } else {
          this.getFavs(func);
          // this.codxService.getFavs(func, '1').subscribe((result: any) => {
          //   this.codxService.activeMenu.fav = result.defaultId;
          //   this.codxService.activeMenu.favType = result.defaultType;
          //   this.codxService.activeFav = this.codxService.activeMenu.fav;
          // });
        }
      }

      this.codxService.navigate(func.functionID);
    }
    return true;
  }

  routingChanges() {
    const routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.menuReinitialization();
      }
    });
    this.unsubscribe.push(routerSubscription);
  }

  menuReinitialization() {
    setTimeout(() => {
      MenuComponent.reinitialization();
      DrawerComponent.reinitialization();
      ToggleComponent.reinitialization();
      ScrollComponent.reinitialization();
      if (this.ktAsideScroll && this.ktAsideScroll.nativeElement) {
        this.ktAsideScroll.nativeElement.scrollTop = 0;
      }
    }, 50);
  }

  ngOnDestroy() {
    this.codxService.activeMenu = {};
    this.settingFunc = undefined;
    this.menuClass = [];
    this.loaded = false;
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.changDefector.detectChanges();
  }

  toggleSecond(data: any) {
    if (!data || !this.hasSecond) return;

    const aside = this.elRef.nativeElement;
    const layout = aside.closest('.aside-enabled');
    var aside2Hide = aside.classList.contains('aside-secondary-hide');

    if (data && data.childs && data.childs.length > 0) {
      if (aside2Hide) {
        aside.classList.remove('aside-secondary-hide');
        layout.removeAttribute('data-kt-aside-minimize');
      }
    } else {
      aside.classList.add('aside-secondary-hide');
      layout.setAttribute('data-kt-aside-minimize', 'on');
    }
  }

  checkActive() {
    var asideMenu = document.getElementById('kt_aside_menu');
    if (asideMenu) {
      var menulink = asideMenu.querySelector(
        '.menu-link[data-funcid="' + this.codxService.activeMenu.func0 + '"]'
      );
      if (menulink) {
        menulink.classList.add('active');
      }
    }
    var subMenu = document.querySelector(
      '.tab-pane[data-funcid="' + this.codxService.activeMenu.func0 + '"]'
    );
    if (subMenu) {
      subMenu.classList.add('active', 'show');
      var subitem = subMenu.querySelector(
        '.menu-item[data-funcid="' + this.codxService.activeMenu.func1 + '"]'
      );
      if (subitem) {
        var ele = subitem as HTMLElement;
        ele.classList.add('here', 'show');
        var sublink = ele.querySelector(
          '.menu-link[data-funcid="' + this.codxService.activeMenu.func0 + '"]'
        );
        if (sublink) sublink.classList.add('active');
        var favlink = ele.querySelector(
          '.menu-link[data-funcid="' + this.codxService.activeMenu.fav + '"]'
        );
        if (favlink) favlink.classList.add('active');
        var reportlink = ele.querySelector(
          '.menu-link[data-funcid="' +
            this.codxService.activeMenu.reportId +
            '"]'
        );
        if (reportlink) reportlink.classList.add('active');
      }
    }
  }

  collapse(e: any) {
    // if(e.currentTarget.classList.contains('active')){
    // }
    // let eleSchedule = document.getElementsByTagName('codx-schedule');
    // setTimeout(() => {
    //   if (eleSchedule.length) {
    //     Array.from(eleSchedule).forEach((ele: any) => {
    //       let scheduleCmp = ele.querySelector('ejs-schedule')!.ej2_instances[0];
    //       // let scheduleCmp = window.ng.getComponent(
    //       //   ele
    //       // ) as CodxScheduleComponent;
    //       if (scheduleCmp) {
    //         // scheduleCmp.scheduleObj!.forEach((item: ScheduleComponent) => {
    //         //   item.refreshEvents();
    //         // });
    //         scheduleCmp.refreshEvents();
    //       }
    //     });
    //   }
    // }, 500);
  }

  private resetActiveMenu() {
    this.codxService.activeMenu.id = '';
    this.codxService.activeMenu.func0 = '';
    this.codxService.activeMenu.func1 = '';
    this.codxService.activeMenu.fav = '';
    this.codxService.activeMenu.favType = '';
    this.codxService.activeMenu.reportID = '';
  }

  //load menu
  loadMenuCustom(fun) {
    if (fun != this.funcOld) {
      this.funcOld = fun;
      this.requestMenuCustom.predicates = 'ApplyFor==@0 && !Deleted';
      switch (fun) {
        case 'CM0201':
          this.requestMenuCustom.dataValues = '1';
          break;
        case 'CM0401':
          this.requestMenuCustom.dataValues = '2';
          break;
        case 'CM0402':
          this.requestMenuCustom.dataValues = '3';
          break;
        default:
          return;
      }
      this.requestMenuCustom.entityName = 'DP_Processes';
      this.fetch().subscribe((item) => {
        this.dataMenuCustom = item;
        this.loaded = true;
      });
    }
  }

  fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.serviceTemp,
        this.assemblyNameTemp,
        this.classNameTemp,
        this.methodTemp,
        this.requestMenuCustom
      )
      .pipe(
        finalize(() => {}),
        map((response: any) => {
          return response[0];
        })
      );
  }

  clickMenuCustom(funcID, data) {
    let titleEle = document.querySelector('codx-page-title');
    if (titleEle) {
      let oldBrc = titleEle.querySelector('#breadCrumb');
      if (oldBrc) oldBrc.remove();
    }
    this.codxService.activeMenu.fav = data.recID;
    (this.codxService.activeViews?.dataService as CRUDService)
      .setPredicates(['ProcessID==@0'], [data.recID])
      .subscribe();

    // let url = this.codxService.activeViews.dataService.codxService.activeViews.function.url
    // this.codxService.navigate('', url +`/${data.recID}`);
  }
}
