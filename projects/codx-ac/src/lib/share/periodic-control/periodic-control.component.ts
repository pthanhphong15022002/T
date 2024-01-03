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
  clickMF(event:any){
    if(event?.data){
      let id = event?.data?.buttonName;
      if (id) {
        switch(id){
          case '1':
            this.api.exec('AC','RunPeriodicBusiness','RunPeriodicAsync',[
              this.dataDefault.refType,
              this.dataDefault.method,
              this.dataDefault.refID,
              '1',
              event.text
            ]).pipe(takeUntil(this.destroy$))
            .subscribe((res:any)=>{
              if (res) {
                this.oData = [res];
                if(this.showLess) this.showLess = false;
                this.notification.notifyCode('AC0029', 0, event.text);
                this.detectorRef.detectChanges();
              }else{
                this.notification.notifyCode('AC0030', 0, event.text);
              }
            })
            break;
          case '2':
            this.api.exec('AC','RunPeriodicBusiness','RunPeriodicAsync',[
              this.dataDefault.refType,
              this.dataDefault.method,
              this.dataDefault.refID,
              '2',
              event.text
            ]).pipe(takeUntil(this.destroy$))
            .subscribe((res:any)=>{
              if (res) {
                this.oData = [res];
                if(this.showLess) this.showLess = false;
                this.notification.notifyCode('AC0029', 0, event.text);
                this.detectorRef.detectChanges();
              }else{
                this.notification.notifyCode('AC0030', 0, event.text);
              }
            })
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

  changeDataMF(event:any){
    console.log(this.functionType);
    event.reduce((pre, element) => {
      element.isblur = false;
      element.isbookmark = true;
      if(this.functionType === 'P'){
        if (element.functionID.includes('SYS')) element.disabled = true;
      }
      }, {});
  }

  onCollaple(){
    this.oData = [this.oData.shift()];
    this.view.dataService.request.page = 1;
    this.showLess = false;
    this.showAll = false;
    this.detectorRef.detectChanges();
  }

  cancel(data:any){
    this.api.exec('AC','RunPeriodicBusiness','CancelAsync',[data,this.dataDefault.refType]).subscribe((res:any)=>{
      if (res) {
        this.notification.notifyCode('AC0029', 0, 'Hủy');
      }else{
        this.notification.notifyCode('AC0030', 0, 'Hủy');
      }
    })
  }
}
