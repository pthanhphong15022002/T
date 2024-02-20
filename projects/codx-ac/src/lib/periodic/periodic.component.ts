import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  FormModel,
  NotificationsService,
  PageLink,
  PageTitleService,
  UIComponent,
  UrlUtil,
  ViewModel,
  ViewType,
} from 'codx-core';
import { Subject, combineLatest, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-periodic',
  templateUrl: './periodic.component.html',
  styleUrls: ['./periodic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodicComponent extends UIComponent {
  //#region Constructor
  @ViewChild('tmpContent') tmpContent?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  user: any;
  headerText: any;
  breadcumb: any = [];
  function: any;
  fmChildren: FormModel = {};
  setting: any;
  dataValue: any = {};
  title: any = '';
  showAll: any = false;
  showLess: any = false;
  oData: any = [];
  functionType: any;
  settingFull: any;
  displayMode: any;
  gridModel: DataRequest = new DataRequest();
  sessionID: any;
  numbreadcumb: any = 0;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private authstore: AuthStore,
    private route: Router,
    private pageTitleService: PageTitleService,
    private notification: NotificationsService,
  ) {
    super(inject);
    this.user = this.authstore.get();
    this.gridModel.pageSize = 10;
    this.route.events.subscribe((val) => {
      if (val && val?.type == 1) {
        let funcID = this.router.snapshot.params['funcID'];
        this.cache.functionList(funcID).subscribe((func) => {
          if (func) {
            let urlRedirect = '/' + UrlUtil.getTenant()+'/'+func.url;
            if (urlRedirect === val.url) {
              this.numbreadcumb = 0;
              this.breadcumb = [];
              this.detectorRef.detectChanges();
            }
          }
        })
      }
    });
  }
  //#region Constructor

  //#region Init
  onInit(): void {
    if (!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.cache
      .functionList(this.funcID)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.function = res;
          this.headerText = res?.defaultName || res?.customName;
        }
      });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.tmpContent,
        },
      },
    ];
  }
  //#region Init

  //#region Events
  click(e, data) {
    this.cache.functionList(data?.functionID).subscribe((func) => {
      if (func) {
        let urlRedirect = '/' + UrlUtil.getTenant();
        if (func && func.url && func.url.charAt(0) != '/') urlRedirect += '/' + this.function.url + '/';
        urlRedirect += func.formName + '/' + func.functionID;
        this.route.navigate([urlRedirect]);
        this.detectorRef.detectChanges();
      }
    });
  }
  //#region Events

  //#region Function
  trackByFn(index, item) {
    return item.recID;
  }


  onFirst() {
    if(this.numbreadcumb = 0) return;
    let urlRedirect = '/' + UrlUtil.getTenant() + '/' + this.function.url;
    this.route.navigate([urlRedirect]);
    this.detectorRef.detectChanges();
  }

  onNavigate(item: any) {
    if(this.numbreadcumb == item.numbreadcumb) return;
    this.route.navigate([item.url]);
    // this.breadcumb.splice(number + 1, 1);
    // this.numbreadcumb = number + 1;
    // this.detectorRef.detectChanges();
  }

  activate(data:any){
    this.numbreadcumb = data?.numbreadcumb;
    this.breadcumb = data?.breadcumb;
    this.detectorRef.detectChanges();
  }
  deactivate(data:any){
  }
  //#endregion
}
