import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { FormModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { PeriodicComponent } from '../../periodic/periodic.component';
import { TreeMapModule } from '@syncfusion/ej2-angular-treemap';

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
  showLess:any = false;
  oData: any = [];
  functionType:any;
  settingFull:any;
  displayMode:any;
  formModel:FormModel = {};
  isViewResult:any = false;
  titleResult:any;
  sessionID:any;
  @ViewChild('template') template?: TemplateRef<any>;
  private destroy$ = new Subject<void>();
  constructor(
    private inject: Injector,
    private notification: NotificationsService,
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
            this.viewResult(data, event.text);
            break;
          case 'd3':
            this.runPeriodic(this.settingFull.refType,this.settingFull.refID,'3',event.text);
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
    this.view.dataService.request.pageSize = 10;
    this.api.exec('AC', 'RunPeriodicBusiness', 'GetDataAsync', [this.view.dataService.request]).pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res && res[0].length) {
        this.showLess = true;
        this.view.dataService.request.page += 1;
        let data = res[0];
        data.reduce((pre,item) => {
          let i = this.oData.findIndex(x => x.recID == item.recID);
          if(i == -1) this.oData.push(item);
        },this.oData)
        let total = res[1];
        if(this.oData.length <= total) this.showAll = false;
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

  // onCollaple(){
  //   this.oData = [this.oData.shift()];
  //   this.view.dataService.request.page = 1;
  //   this.showLess = false;
  //   this.showAll = false;
  //   this.detectorRef.detectChanges();
  // }

  runPeriodic(runtype:any,recID:any,runMode:any,text:any){
    let storeName = (runMode === '1' || runMode === '2') ? 'AC_spRunPeriodic' : 'AC_spCancelPeriodic';
    this.api.exec('AC','RunPeriodicBusiness','RunPeriodicAsync',[
      runtype,
      storeName,
      recID,
      runMode,
      JSON.stringify(this.dataValue),
      text,
    ]).pipe(takeUntil(this.destroy$))
    .subscribe((res:any)=>{
      if (res && !res.isError) {
        this.notification.notifyCode('AC0029', 0, text);
        if (res.data) {
          this.oData = [res?.data];
          this.detectorRef.detectChanges();
        }
      }else{
        this.notification.notifyCode('AC0030', 0, text);
      }
    })
  }

  // cancel(text:any,data:any){
  //   this.api.exec('AC','RunPeriodicBusiness','CancelAsync',[data,this.dataDefault.refType,text]).subscribe((res:any)=>{
  //     if (res) {
  //       this.notification.notifyCode('AC0029', 0, text);
  //     }else{
  //       this.notification.notifyCode('AC0030', 0, text);
  //     }
  //   })
  // }

  viewResult(data: any, text: any) {
    this.sessionID = data.recID;
    this.titleResult = text;
    this.isViewResult = true;
    this.detectorRef.detectChanges();
  }

  onBack(){
    this.isViewResult = false;
    this.detectorRef.detectChanges();
  }
  //#endregion Function
}
