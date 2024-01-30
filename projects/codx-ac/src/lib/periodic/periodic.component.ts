import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
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
        let funcid = this.router.snapshot.params['funcID'];
        let urlRedirect = '/' + UrlUtil.getTenant() + '/' + this.function.url;
        if (funcid && this.function && funcid == this.function.functionID && urlRedirect == val?.url) {
          this.numbreadcumb = 0;
          this.breadcumb = [];
          this.detectorRef.detectChanges();
        }
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
        active: false,
        sameData: true,
        showFilter: false,
        showSearchBar: false,
        showButton: false,
        model: {
          panelRightRef: this.tmpContent
        },
      },
    ];
  }
  //#region Init

  //#region Events
  click(e, data) {
    this.cache.functionList(data?.functionID).subscribe((func) => {
      if (func) {
        //this.isbreadcumb = true;
        this.breadcumb = [];
        let link = {
          title: func?.defaultName,
        }
        this.breadcumb.push(link);
        // this.functionType = func?.functionType;
        // this.displayMode = func?.displayMode;
        // this.fmChildren.formName = func.formName;
        // this.fmChildren.entityName = func.entityName;
        // this.fmChildren.gridViewName = func.gridViewName;
        // this.gridModel.page = 1; 
        // this.gridModel.predicates = func.predicate;
        // this.gridModel.dataValues = func.dataValue;
        // this.gridModel.entityName = func.entityName;
        // combineLatest({
        //   setting: this.api.execSv('BG', 'BG', 'ScheduleTasksBusiness', 'GetScheduleTasksAsync', func.functionID),
        //   oData: this.api.exec('AC', 'RunPeriodicBusiness', 'GetDataAsync', [this.gridModel])
        // }).subscribe(({ setting,oData }) => {
        //   if (setting) {
        //     let res1:any = setting;
        //     this.settingFull = res1;
        //     this.setting = res1?.paras || [];
        //     this.dataValue = JSON.parse(res1?.paraValues);
        //     this.title = res1?.taskName;
        //   }else{
        //     this.setting = [];
        //     this.settingFull = undefined;
        //   }
        //   if (oData && oData[0].length) {
        //     this.showLess = true;
        //     this.view.dataService.request.page += 1;
        //     let data = oData[0];
        //     data.reduce((pre, item) => {
        //       let i = this.oData.findIndex(x => x.recID == item.recID);
        //       if (i == -1) this.oData.push(item);
        //     }, this.oData)
        //     let total = data[1];
        //     if (this.oData.length <= total) this.showAll = true;
        //   }else{
        //     this.oData = [];
        //   }
        //   this.numbreadcumb = 1;
        //   this.detectorRef.detectChanges();
        // })
      }
      this.numbreadcumb = 1;
      let urlRedirect = '/' + UrlUtil.getTenant();
      if (func && func.url && func.url.charAt(0) != '/') urlRedirect += '/' + this.function.url + '/';
      urlRedirect += func.formName + '/' + func.functionID;
      this.route.navigate([urlRedirect]);
      this.detectorRef.detectChanges();
    });
  }

  valuechange(event: any) {
    this.dataValue[event.field] = event.data;
    this.settingFull.paraValues = JSON.stringify(this.dataValue);
    this.api
      .execAction(
        'BG_ScheduleTasks',
        [this.settingFull],
        'UpdateAsync'
      )
      .subscribe((res: any) => {
        if (res) {
          this.api.exec('AC', 'RunPeriodicBusiness', 'UpdateAsync', [this.settingFull.refID, this.settingFull.paraValues]).subscribe();
        }
      });
  }

  changeAutoSchedules(event: any) {
    this.settingFull = event;
    this.api
      .execAction(
        'BG_ScheduleTasks',
        [this.settingFull],
        'UpdateAsync'
      )
      .subscribe((res: any) => { });
  }
  //#region Events

  //#region Function
  trackByFn(index, item) {
    return item.recID;
  }

  changeDataMF(event: any, type) {
    console.log(event);
    event.reduce((pre, element) => {
      element.isblur = false;
      if (type === 'M') element.isbookmark = true;
      if (this.functionType === 'P') {
        if (element.functionID.includes('SYS')) element.disabled = true;
      }
      if (type != element.data.tabControl) element.disabled = true;
    }, {});
  }

  clickMF(event: any, data: any = null) {
    if (event?.data) {
      let id = event?.data?.buttonName;
      if (id) {
        switch (id.toLowerCase()) {
          case 'm1':
            this.runPeriodic(this.settingFull.refType, this.settingFull.refID, '1', event.text);
            break;
          case 'm2':
            this.runPeriodic(this.settingFull.refType, this.settingFull.refID, '2', event.text);
            break;
          case 'd1':
            this.viewResult(data, event.text);
            break;
          case 'd3':
            this.runPeriodic(this.settingFull.refType, this.settingFull.refID, '3', event.text);
            break;

        }
      }
    }
  }

  loadData() {
    this.api.exec('AC', 'RunPeriodicBusiness', 'GetDataAsync', [this.view.dataService.request]).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && res[0].length) {
        this.showLess = true;
        this.gridModel.page += 1;
        let data = res[0];
        data.reduce((pre, item) => {
          let i = this.oData.findIndex(x => x.recID == item.recID);
          if (i == -1) this.oData.push(item);
        }, this.oData)
        let total = res[1];
        if (this.oData.length <= total) this.showAll = true;
        this.detectorRef.detectChanges();
      }
    });
  }

  loadSetting(funcID: any) {
    this.api.execSv('BG', 'BG', 'ScheduleTasksBusiness', 'GetScheduleTasksAsync', funcID).subscribe((res: any) => {
      if (res) {
        this.settingFull = res;
        this.setting = res?.paras || [];
        this.dataValue = JSON.parse(res?.paraValues);
        this.title = res?.taskName;
        this.detectorRef.detectChanges();
      } else {
        this.setting = [];
        this.detectorRef.detectChanges();
      }
    });
  }

  onFirst() {
    let urlRedirect = '/' + UrlUtil.getTenant() + '/' + this.function.url;
    this.route.navigate([urlRedirect]);
    // this.setting = [];
    // this.settingFull = undefined;
    // this.breadcumb = [];
    // this.fmChildren = {};
    // this.numbreadcumb = 0;
    // this.detectorRef.detectChanges();

  }

  onNavigate(number: any) {
    this.breadcumb.splice(number + 1, 1);
    this.numbreadcumb = number + 1;
    this.detectorRef.detectChanges();
  }

  runPeriodic(runtype: any, recID: any, runMode: any, text: any) {
    let storeName = (runMode === '1' || runMode === '2') ? 'AC_spRunPeriodic' : 'AC_spCancelPeriodic';
    this.api.exec('AC', 'RunPeriodicBusiness', 'RunPeriodicAsync', [
      runtype,
      storeName,
      recID,
      runMode,
      JSON.stringify(this.dataValue),
      text,
    ]).pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res && !res.isError) {
          this.notification.notifyCode('AC0029', 0, text);
          if (res.data) {
            this.oData = [res?.data];
            this.detectorRef.detectChanges();
          }
        } else {
          this.notification.notifyCode('AC0030', 0, text);
        }
      })
  }

  viewResult(data: any, text: any) {
    this.sessionID = data.recID;
    this.numbreadcumb = 2;
    let link = {
      title: text,
    }
    this.breadcumb.push(link);
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Method
  //#region Method
}
