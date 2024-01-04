import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CallFuncService, DataRequest, DialogRef, FormModel, NotificationsService, RequestOption, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { RunPeriodicAddComponent } from './run-periodic-add/run-periodic-add.component';
import { DynamicSettingControlComponent } from 'projects/codx-share/src/lib/components/dynamic-setting/dynamic-setting-control/dynamic-setting-control.component';

@Component({
  selector: 'lib-run-periodic',
  templateUrl: './run-periodic.component.html',
  styleUrls: ['./run-periodic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunPeriodicComponent extends UIComponent{
  //#region Constructor
  views: Array<ViewModel> = [];
  @ViewChild('templateCard') templateCard?: TemplateRef<any>;
  @ViewChild('templateGrid') templateGrid?: TemplateRef<any>;
  @ViewChild('template') template?: TemplateRef<any>;
  headerText:any;
  itemSelected:any;
  setting:any;
  dataValue :any = {};
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
  }

  //#endregion Constructor

  //#region Init
  onInit(): void {
    if(!this.funcID) this.funcID = this.router.snapshot.params['funcID'];
    this.api.execSv('BG','BG','ScheduleTasksBusiness','GetScheduleTasksAsync',this.funcID).subscribe((res:any)=>{
      if (res) {
        this.setting = res?.paras || [];
        this.dataValue = JSON.parse(res?.paraValues);
      }
    })
  }

  ngAfterViewInit() {
    this.views = [
      // {
      //   type: ViewType.grid,
      //   active: true,
      //   sameData: true,
      //   model: {
      //     template2: this.templateGrid,
      //     frozenColumns: 1,
      //   },
      // },
      {
        type: ViewType.content,
        active: false,
        sameData: true,
        showFilter:false,
        showSearchBar:false,
        model: {
          //template: this.templateCard,
          panelRightRef: this.template
        },
      },
    ];
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Event
  clickMF(e,data:any) {
    switch (e.functionID) {
      case 'ACP10200':
        this.calcPrice(e.text);
        break;
      case 'ACP10202':
        this.runSimulation(e.text);
        break;
      case 'ACP10203':
        this.cancel(e.text,data);
        break;
    }
  }

  changeMF(event:any,type:any =''){
    event.reduce((pre, element) => {
      element.isblur = false;
      if (element.functionID == 'ACP10203' && type === 'views') {
        if (this.view.dataService.dataSelected) {
          element.disabled = false;
        }else{
          element.disabled = true;
        }
      }
      if(type === 'viewgrid'){
        element.isbookmark = false;
        if (element.functionID == 'ACP10200' || element.functionID == 'ACP10202') {
          element.disabled = true;
        }
      }
      if (!['ACP10200','ACP10202','ACP10203'].includes(element.functionID)) element.disabled = true;
      }, {});
  }
  //#endregion Event

  //region Function
  
  /**
   * * Hàm get data và get dữ liệu chi tiết của chứng từ khi được chọn
   * @param event
   * @returns
   */
  onSelectedItem(event) {
    this.itemSelected = event;
    this.detectorRef.detectChanges();
  }


  calcPrice(text) {
    this.api.exec('AC','RunPeriodicBusiness','CalcPriceAsync',text).subscribe((res:any)=>{
      if (res) {
        this.view.dataService.add(res).subscribe();
        this.notification.notifyCode('AC0029', 0, text);
      }
    })
  }

  runSimulation(text){
    this.view.dataService
    .addNew()
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      let data = {
        headerText: text.toUpperCase(),
        dataDefault : res,
        morName : text
      }
      let optionSidebar = new SidebarModel();
      optionSidebar.DataService = this.view?.dataService;
      optionSidebar.FormModel = this.view?.formModel;
      let dialog = this.callfc.openSide(
        RunPeriodicAddComponent,
        data,
        optionSidebar,
        this.view.funcID
      );
    })
  }

  cancel(text,data){
    this.api.exec('AC','RunPeriodicBusiness','CancelAsync',[data,text]).subscribe((res:any)=>{
      if (res) {
        this.notification.notifyCode('AC0029', 0, text);
      }else{
        this.notification.notifyCode('AC0030', 0, text);
      }
    })
  }
  
  //endRegion Function
}
