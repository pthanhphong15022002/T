import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { DialogModel, FormModel, NotificationsService, UIComponent, UrlUtil, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { PeriodicComponent } from '../../periodic/periodic.component';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';
import { Router } from '@angular/router';
import { ViewresultComponent } from './viewresult/viewresult.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'lib-periodic-control',
  templateUrl: './periodic-control.component.html',
  styleUrls: ['./periodic-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodicControlComponent extends UIComponent{
  //#region Contrucstor
  views: Array<ViewModel> = [];
  setting: any;
  dataValue: any = {};
  title: any = '';
  showAll: any = true;
  oData: any = [];
  functionType:any;
  settingFull:any;
  displayMode:any;
  formModel:FormModel = {};
  titleResult:any;
  functionID:any;
  breadcumb: any = [];
  numbreadcumb:any = 1;
  @ViewChild('template') template?: TemplateRef<any>;
  private destroy$ = new Subject<void>();
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
    private route: Router,
    private ngxLoader: NgxUiLoaderService,
  ) {
    super(inject);
  }
  //#endregion Contrucstor
  //#region Init
  onInit(): void {
    if (!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.api.execSv('BG', 'BG', 'ScheduleTasksBusiness', 'GetScheduleTasksAsync', this.funcID).subscribe((res: any) => {
      if (res) {
        this.settingFull = res;
        this.setting = res?.paras || [];
        this.dataValue = JSON.parse(res?.paraValues);
        this.title = res?.taskName;
        this.detectorRef.detectChanges();
      }else{
        this.setting = [];
        this.detectorRef.detectChanges();
      }
    });
    this.cache.functionList(this.funcID).subscribe((res:any)=>{
      this.functionType = res?.functionType;
      this.displayMode = res?.displayMode;
      this.formModel.formName = res?.formName;
      this.formModel.entityName = res?.entityName;
      this.formModel.gridViewName = res?.gridViewName;
      let urlRedirect = '/' + UrlUtil.getTenant();
      if (res && res.url && res.url.charAt(0) != '/') urlRedirect += '/ac/periodic/ACP/';
      urlRedirect += res.formName + '/' + res.functionID;
      let link = {
        title: res?.defaultName || res?.customName,
        url:urlRedirect,
        numbreadcumb:this.numbreadcumb
      }
      this.breadcumb.push(link);
    })
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: false,
        sameData: true,
        showFilter: false,
        showSearchBar: false,
        showButton:false,
        model: {
          panelRightRef: this.template
        },
      },
    ];
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Event
  viewChanged(event){
    // if (event?.view) {
    //   (this.view as any).pageTitle.showBreadcrumbs(false);
    // }
  }

  clickMF(event:any,data:any=null){
    if(event?.data){
      let id = event?.data?.buttonName;
      if (id) {
        switch(id.toLowerCase()){
          case 'm1':
            this.runPeriodic(this.settingFull.refType,this.settingFull.refID,'1',event.text);
            break;
          case 'm2':
            this.runPeriodic(this.settingFull.refType,this.settingFull.refID,'2',event.text);
            break;
          case 'd1':
            this.viewResult(data, event);
            break;
          case 'd3':
            this.runPeriodic(this.settingFull.refType,this.settingFull.refID,'3',event.text);
            break;
          case 'd4':
            this.deletePeriodic(data);
            break;
        }
      }
    }
  }

  valuechange(event:any){
    this.dataValue[event.field] = event.data;
    this.settingFull.paraValues = JSON.stringify(this.dataValue);
    this.api
      .execAction(
        'BG_ScheduleTasks',
        [this.settingFull],
        'UpdateAsync'
      )
      .subscribe((res:any)=>{
        if (res) {
          this.api.exec('AC','RunPeriodicBusiness','UpdateAsync',[this.settingFull.refID,this.settingFull.paraValues]).subscribe();
        }
      });
  }

  changeAutoSchedules(event:any){ 
    this.settingFull = event;
    this.api
      .execAction(
        'BG_ScheduleTasks',
        [this.settingFull],
        'UpdateAsync'
      )
      .subscribe((res:any)=>{});
  }

  requestEnded(event: any) {
    if (event.data) {
      if (event.data.length) {
        let data = event.data[0];
        this.oData = [data];
        if(event.data.length == 1) this.showAll = false;
        this.detectorRef.detectChanges();
      }else{
        this.showAll = false;
      }
    }
  }
  //#endregion Event

  //#region Function
  loadData() {
    if(this.oData.length != 1) this.view.dataService.request.page += 1;
    this.api.exec('AC', 'RunPeriodicBusiness', 'GetDataAsync', [this.view.dataService.request]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && res[0].length) {
        let data = res[0];
        data.reduce((pre,item) => {
          let i = this.oData.findIndex(x => x.recID == item.recID);
          if(i == -1) this.oData.push(item);
        },this.oData)
        let total = res[1];
        if(this.oData.length == total) this.showAll = false;
        this.detectorRef.detectChanges();
      }
    });
  }

  trackByFn(index, item) {
    return item.recID;
  }

  changeDataMF(event:any,type){
    event.reduce((pre, element) => {
      element.isblur = false;
      if(type === 'M') element.isbookmark = true;
      if(this.functionType === 'P'){
        if (element.functionID.includes('SYS')) element.disabled = true;
      }
      if(type != element.data.tabControl) element.disabled = true;
      }, {});
  }

  runPeriodic(runtype:any,recID:any,runMode:any,text:any){
    this.ngxLoader.start();
    let storeName = (runMode === '1' || runMode === '2') ? 'AC_spRunPeriodic' : 'AC_spCancelPeriodic';
    this.api.exec('AC','RunPeriodicBusiness','RunPeriodicAsync',[
      runtype,
      storeName,
      recID,
      runMode,
      JSON.stringify(this.dataValue),
      text
    ]).pipe(takeUntil(this.destroy$))
    .subscribe((res:any)=>{
      if (res) {
        switch(runMode){
          case '1':
          case '2':
            if (this.oData.length == 1) {
              let i = this.oData.findIndex(x => x.recID == res.recID);
              if(i == -1) this.oData[0] = res;
            }else{
              let i = this.oData.findIndex(x => x.recID == res.recID);
              if(i == -1) this.oData.unshift(res);
            }
            this.detectorRef.detectChanges();
            break;
          case '3':

            break;
        }
        
      }
      this.ngxLoader.stop();
    })
  }

  viewResult(data: any, event: any) {
    switch(this.funcID){
      case 'ACP107':
        this.openFormViewResult(data,event.text);
        break;
    }
  }

  deletePeriodic(data:any){
    this.notification.alertCode('AC0014', null).subscribe((res) => {
      if (res.event.status === 'Y') {
        this.api.exec('AC','RunPeriodicBusiness','DeletelAsync',[
          data.recID,
          this.view.dataService.request
        ]).pipe(takeUntil(this.destroy$))
        .subscribe((res:any)=>{
          if (res) {
            if (this.oData.length == 1) {
              if (res[0].length) {
                this.oData = [res[0][0]];
                let total = res[1];
                if(total == 1) this.showAll = false;
              }else{
                this.oData = [];
                this.showAll = false;
              }
            }else{
              this.oData = res[0];
              let total = res[1];
              if (this.oData.length <= total) this.showAll = false; 
            }
            this.detectorRef.detectChanges();
          }
        })
      }
    })
  }

  openFormViewResult(datas:any,text:any){
    let data = {
      headerText: text,
      sessionID : datas.recID
    }
    let opt = new DialogModel();
    opt.FormModel = this.view.formModel;
    let dialog = this.callfc.openForm(
      ViewresultComponent,
      null,
      null,
      null,
      '',
      data,
      '',
      opt
    );
  }
  //#endregion Function
}
