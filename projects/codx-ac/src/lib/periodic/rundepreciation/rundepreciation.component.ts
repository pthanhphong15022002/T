import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CallFuncService, DataRequest, DialogRef, FormModel, NotificationsService, RequestOption, SidebarModel, UIComponent, UrlUtil, ViewModel, ViewType } from 'codx-core';
import { Subject, map, takeUntil } from 'rxjs';
import { DynamicSettingControlComponent } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting-control/dynamic-setting-control.component';

@Component({
  selector: 'lib-run-periodic',
  templateUrl: './rundepreciation.component.html',
  styleUrls: ['./rundepreciation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunDepreciationComponent extends UIComponent{
  //#region Constructor
  breadcumb: any = [];
  numbreadcumb:any = 2;
  sessionID:any;
  private destroy$ = new Subject<void>();
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    private dt: ChangeDetectorRef, 
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    let funcid = this.router.snapshot.params['funcID'];
    let morfunc = this.router.snapshot.params['morfunc'];
    this.sessionID = this.router.snapshot.queryParams['sessionID'];
    if (funcid) {
      this.cache.functionList(funcid).subscribe((res:any)=>{
        let urlRedirect = '/' + UrlUtil.getTenant();
        if (res && res.url && res.url.charAt(0) != '/') urlRedirect += '/ac/periodic/ACP/';
        urlRedirect += res.formName + '/' + res.functionID;
        let link = {
          title: res?.defaultName || res?.customName,
          url: urlRedirect,
          numbreadcumb:this.numbreadcumb - 1
        }
        this.breadcumb.push(link);
        this.cache.moreFunction(res.formName,res.gridViewName).pipe(map((data)=> data.find((m) => m.functionID === morfunc))).subscribe((res:any)=>{
          if (res) {
            let urlRedirect = '/' + UrlUtil.getTenant() + '/';
            urlRedirect += res.url + '/' + res.functionID;
            let link = {
              title: res?.defaultName || res?.customName,
              url: urlRedirect,
              numbreadcumb:this.numbreadcumb
            }
            this.breadcumb.push(link);
          }
        })
      })
    }
  }

  //#endregion Constructor

  //#region Init
  onInit(): void {
  }

  ngAfterViewInit() {
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init
}
