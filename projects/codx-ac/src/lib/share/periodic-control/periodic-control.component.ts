import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-periodic-control',
  templateUrl: './periodic-control.component.html',
  styleUrls: ['./periodic-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodicControlComponent extends UIComponent {
  //#region Contrucstor
  views: Array<ViewModel> = [];
  setting: any;
  dataValue: any = {};
  title: any = '';
  showAll: any = false;
  showLess:any = false;
  oData: any = [];
  functionType:any;
  dataDefault:any;
  displayMode:any;
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
        this.dataDefault = res;
        this.setting = res?.paras || [];
        this.dataValue = JSON.parse(res?.paraValues);
        this.title = res?.taskName;
      }else{
        this.setting = [];
      }
    });
    this.cache.functionList(this.funcID).subscribe((res:any)=>{
      this.functionType = res?.functionType;
      this.displayMode = res?.displayMode;
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
        switch(id){
          case '1':
            this.runPeriodic(this.dataDefault.refType,this.dataDefault.method,this.dataDefault.refID,'1',event.text);
            break;
          case '2':
            this.runPeriodic(this.dataDefault.refType,this.dataDefault.method,this.dataDefault.refID,'2',event.text);
            break;
          case '3':
            this.cancel(event.text,data);
            break;
        }
      }
    }
  }

  valuechange(event:any){
    this.dataValue[event.field] = event.data;
    this.dataDefault.paraValues = JSON.stringify(this.dataValue);
    this.api
      .execAction(
        'BG_ScheduleTasks',
        [this.dataDefault],
        'UpdateAsync'
      )
      .subscribe((res:any)=>{
        if (res) {
          this.api.exec('AC','RunPeriodicBusiness','UpdateAsync',[this.dataDefault.refID,this.dataDefault.paraValues]).subscribe();
        }
      });
  }

  requestEnded(event: any) {
    if (event.data) {
      if (event.data.length) {
        let data = event.data[0];
        this.oData = [data];
        if(event.data.length == 1) this.showAll = true;
        this.detectorRef.detectChanges();
      }else{
        this.showAll = true;
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
        if(res[0].length < this.view.dataService.request.pageSize) this.showAll = true;
        this.detectorRef.detectChanges();
      }
    });
  }

  trackByFn(index, item) {
    return item.recID;
  }

  changeDataMF(event:any,type='view'){
    console.log(event);
    event.reduce((pre, element) => {
      element.isblur = false;
      element.isbookmark = true;
      if(this.functionType === 'P'){
        if (element.functionID.includes('SYS')) element.disabled = true;
      }
      if(type === 'view' && element.data?.buttonName === '3') element.disabled = true;
      }, {});
  }

  onCollaple(){
    this.oData = [this.oData.shift()];
    this.view.dataService.request.page = 1;
    this.showLess = false;
    this.showAll = false;
    this.detectorRef.detectChanges();
  }

  runPeriodic(runtype:any,storeName:any,recID:any,runMode:any,text:any){
    this.api.exec('AC','RunPeriodicBusiness','RunPeriodicAsync',[
      runtype,
      storeName,
      recID,
      runMode,
      text
    ]).pipe(takeUntil(this.destroy$))
    .subscribe((res:any)=>{
      if (res && !res.isError) {
        if (res.data) {
          this.oData = [res?.data];
          if (this.showLess) this.showLess = false;
          this.notification.notifyCode('AC0029', 0, text);
          this.detectorRef.detectChanges();
        }
      }else{
        this.notification.notifyCode('AC0030', 0, text);
      }
    })
  }

  cancel(text:any,data:any){
    this.api.exec('AC','RunPeriodicBusiness','CancelAsync',[data,this.dataDefault.refType,text]).subscribe((res:any)=>{
      if (res) {
        this.notification.notifyCode('AC0029', 0, text);
      }else{
        this.notification.notifyCode('AC0030', 0, text);
      }
    })
  }

  showMFCancel(event:any){
    event.reduce((pre, element) => {
      element.isblur = false;
      element.isbookmark = false;
      if(this.functionType === 'P'){
        if (element.functionID.includes('SYS')) element.disabled = true;
      }
      if(element.data?.buttonName != '3') element.disabled = true;
      }, {});
  }

  //#endregion Functione
}
