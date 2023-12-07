import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild, ViewEncapsulation, } from '@angular/core';
import { SpeedDialItemModel } from '@syncfusion/ej2-angular-buttons';
import { CalendarComponent } from '@syncfusion/ej2-angular-calendars';
import { EventSettingsModel, ScheduleComponent, View } from '@syncfusion/ej2-angular-schedule';
import { AuthStore, CRUDService, CodxFormDynamicComponent, CodxListviewComponent, CodxScheduleComponent, DataRequest, FormModel, NotificationsService, SidebarModel, UIComponent, Util, ViewModel, ViewType, } from 'codx-core';
import { of } from 'rxjs';

@Component({
  selector: 'hr-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.scss'],
  
})
export class HolidayComponent extends UIComponent {
  
  views:ViewModel[] = null;
  user:any = null;
  selectedDate:Date
  selectYear:number;
  mssgHolidayYear:string = "Chi tiết ngày nghỉ lễ trong năm {0}";
  headerText:string = "";
  sysHolidayTypeSelected:any = null;
  FMSysHoliday:FormModel = null;
  FMSysHolidayConfig:FormModel = null;
  speedDialItems: SpeedDialItemModel[] = [];
  sysMoreFunc:any[] = [];
  @ViewChild("ejCalendar") ejCalendar:CalendarComponent;
  @ViewChild("scheduleObj") scheduleObj:ScheduleComponent;
  @ViewChild("codxListView") codxListView:CodxListviewComponent;
  @ViewChild("tmpContent") tmpContent:TemplateRef<any>;
  fields:any = {
    id: 'recID',
    subject: { name: 'dateName' },
    startTime: { name: 'dateID' },
    endTime: { name: 'dateID' },
    status: {name : 'isExtraHoliday'}
  };
  statusColor = [
    {
      borderColor: "#1640D6", // default
      status : 0
    },
    {
      borderColor: "#FF6C22", // custom
      status : 1
    }
  ]
  dataSource:any[] = [];
  eventSettings:EventSettingsModel = {dataSource: this.dataSource, fields: this.fields };
  constructor(
    private injector:Injector,
    private notiSV:NotificationsService,
    private auth:AuthStore,
    private dt:ChangeDetectorRef
  ) 
  {
    super(injector);
    this.user = auth.get();
  }
  
  onInit(): void {
    this.selectedDate = new Date();
    this.selectYear = this.selectedDate.getFullYear();
    this.headerText = Util.stringFormat(this.mssgHolidayYear, this.selectYear);
    // cache grdview trước để dynamicform get dc grdViewsetup
    this.cache.gridViewSetup("SysHoliday","grvSysHoliday").subscribe((res:any) => {
      this.FMSysHoliday = new FormModel();
      this.FMSysHoliday.formName = "SysHoliday";
      this.FMSysHoliday.gridViewName = "grvSysHoliday";
      this.FMSysHoliday.entityName = "LS_SysHoliday";
    });
    this.cache.gridViewSetup("SysHolidayConfig","grvSysHolidayConfig").subscribe((res:any) => {
      this.FMSysHolidayConfig = new FormModel();
      this.FMSysHolidayConfig.formName = "SysHolidayConfig";
      this.FMSysHolidayConfig.gridViewName = "grvSysHolidayConfig";
      this.FMSysHolidayConfig.entityName = "LS_SysHolidayConfig";
    });
    // get sys more function
    this.cache.moreFunction('CoDXSystem', '').subscribe((res:any) => {
      this.sysMoreFunc = res;
    });
    // LS_SysHolidayConfig & LS_SysHoliday ko có functionID -> ko có functionName
    this.speedDialItems.push({id:"LS_SysHoliday",text:"Ngày cụ thể theo năm"});
    this.speedDialItems.push({id:"LS_SysHolidayConfig",text:"Ngày lễ quy định hàng năm"});
    // this.testGenTable();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: true,
        showFilter: false,
        model: {
          panelLeftRef: this.tmpContent
        }
      }
    ];
    this.view.dataService.methodSave = "SavedAsync";
    this.view.dataService.methodUpdate = "UpdatedAsync";
  }
  
  // get LS_SysHoliday
  getSysHoliday(sysHolidayCode:string,year:number){
    this.api.execSv("HR","ERM.Business.LS","SysHolidayBusiness","GetAsync",[sysHolidayCode,year])
    .subscribe((res:any) => {
      if(res)
      {
        this.dataSource = res;
        this.eventSettings = {...{ dataSource : this.dataSource, fields: this.fields}}
        // if(this.scheduleObj)
        // {
        //   this.scheduleObj.eventSettings.dataSource  = this.dataSource;
        //   this.scheduleObj.refreshEvents();
        // }
      }
    });
  }

  // change date
  changeDay(evt:any){
    this.selectedDate = evt;
    if(this.sysHolidayTypeSelected && (this.selectYear != evt.getFullYear() || this.dataSource.length == 0))
    {
      this.selectYear = this.selectedDate.getFullYear();
      this.headerText = Util.stringFormat(this.mssgHolidayYear, this.selectYear);
      this.getSysHoliday(this.sysHolidayTypeSelected.sysHolidayCode,this.selectYear);
    }
  }

  // clickMF SysHolidayType
  clickMFSysHolidayType(moreFunction:any,data:any){
    if(moreFunction.functionID == "SYS03")
    {
      this.openPopupEditSysHolidayType(data,moreFunction);
    }
    else if(moreFunction.functionID == "SYS02")
    {
      this.view.dataService.delete([data],true).subscribe();
    }
  }

  // openPopupAdd SysHolidayType
  openPopupAddSysHolidayType(){
    if(this.view){
      let addMoreFunction = this.sysMoreFunc.find(x => x.functionID == "SYS01");
      this.view.dataService.addNew()
      .subscribe((res:any) => {
        if(res){
          let option = new SidebarModel();
          option.Width = '550px';
          option.FormModel = this.view.formModel;
          option.DataService = this.view.dataService;
          let obj = {
            dataService : option.DataService,
            formModel : this.view.formModel,
            functionID : this.view.funcID,
            isAddMode : true,
            titleMore: addMoreFunction ? addMoreFunction.defaultName : "",
            data : res
          }
          this.callfc.openSide(CodxFormDynamicComponent,obj,option,this.view.funcID)
          .closed.subscribe((res2:any) => {
            if(res2?.event?.save)
            {
              (this.view.dataService as CRUDService).add(res2.event.save).subscribe();
              this.detectorRef.detectChanges();
            }
          }); 
        }
      });
    }
  }

  // openPopupEdit SysHolidayType
  openPopupEditSysHolidayType(data:any,moreFunction:any){
    if(this.view){
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      this.view.dataService.edit(this.view.dataService.dataSelected)
      .subscribe((res:any) => {
        if(res)
        {
          let option = new SidebarModel();
          option.Width = '550px';
          option.FormModel = this.view.formModel;
          option.DataService = this.view.dataService;
          this.callfc.openSide(
            CodxFormDynamicComponent ,
            {
              formModel: option.FormModel,
              dataService: option.DataService,
              data: res,
              function: moreFunction,
              isAddMode: false,
              titleMore: moreFunction ? moreFunction.text : '',
            },
            option
            ).closed.subscribe((res2:any) => {
              if(res2?.event?.save)
              {
                (this.view.dataService as CRUDService).update(res2.event.save).subscribe();
                this.detectorRef.detectChanges();
              }
            }); 
        }
      });
    }
  }

  // clickMF SysHoliday
  clickMFSysHoliday(moreFunction:any,data:any){
    if(moreFunction.functionID == "SYS03")
    {
      this.openPopupEditSysHoliday(data,moreFunction);
    }
    else if(moreFunction.functionID == "SYS04")
    {
      this.openPopupAddSysHoliday();
    }
    else if(moreFunction.functionID == "SYS02")
    {
      let dataService = new CRUDService(this.injector);
      dataService.service = 'HR';
      dataService.assemblyName = 'ERM.Business.LS';
      dataService.className = 'SysHolidayBusiness';
      dataService.dataSelected = Object.assign({},data);
      dataService.request.entityName = this.FMSysHoliday.entityName;
      dataService.delete([data],true).subscribe((res:any) => {
        if(res){
          this.dataSource = this.dataSource.filter(x => x.recID != data.recID);
          this.eventSettings.dataSource = this.dataSource;
          this.scheduleObj.eventSettings.dataSource  = this.dataSource;
          this.scheduleObj.refreshEvents();
        }
      })
    }
  }

  // openPopupAdd SysHoliday
  openPopupAddSysHoliday(){
    let addMoreFunction = this.sysMoreFunc.find(x => x.functionID == "SYS01");
    let dataService = new CRUDService(this.injector);
    dataService.service = 'HR';
    dataService.assemblyName = 'ERM.Business.LS';
    dataService.className = 'SysHolidayBusiness';
    dataService.methodSave = 'SavedAsync';
    dataService.idField = "recID";
    dataService.request.entityName = this.FMSysHoliday.entityName;
    dataService.addNew()
    .subscribe((res) => {
      if(res){
        res.sysHolidayCode = this.sysHolidayTypeSelected.sysHolidayCode;
        let option = new SidebarModel();
        option.Width = '550px';
        option.FormModel = this.FMSysHoliday;
        option.DataService = dataService;
        this.callfc.openSide(
          CodxFormDynamicComponent ,
          {
            formModel: this.FMSysHoliday,
            dataService: dataService,
            data: res,
            isAddMode: true,
            titleMore: addMoreFunction ? addMoreFunction.defaultName : '',
          },
          option
          ).closed.subscribe((res2:any) => {
            if(res2?.event?.save)
            {
              if(!this.dataSource) this.dataSource = [];
              this.dataSource.push(res2?.event?.save);
              this.eventSettings.dataSource = this.dataSource;
              this.scheduleObj.eventSettings.dataSource  = this.dataSource;
              this.scheduleObj.refreshEvents();
            }
          }); 
      }
    });
  }

  // openPopupEdit SysHoliday
  openPopupEditSysHoliday(data:any,moreFunction:any){
    if(data){
      let dataService = new CRUDService(this.injector);
      dataService.service = 'HR';
      dataService.assemblyName = 'ERM.Business.LS';
      dataService.className = 'SysHolidayBusiness';
      dataService.methodUpdate = 'UpdatedAsync';
      dataService.idField = "recID";
      dataService.data = [...this.dataSource];
      dataService.dataSelected = Object.assign({},data);
      dataService.request.entityName = this.FMSysHoliday.entityName;
      dataService.edit(dataService.dataSelected)
      .subscribe((res:any) => {
        if(res)
        { 
          let option = new SidebarModel();
          option.Width = '550px';
          option.FormModel = this.FMSysHoliday;
          option.DataService = dataService;
          this.callfc.openSide(
            CodxFormDynamicComponent ,
            {
              formModel: option.FormModel,
              dataService: option.DataService,
              data: res,
              function: moreFunction,
              isAddMode: false,
              titleMore: moreFunction ? moreFunction.text : '',
            },
            option
            ).closed.subscribe((res2:any) => {
              if(res2?.event?.update)
              {
                let idx = this.dataSource.findIndex(x => res2.event.update.recID == x.recID)
                if(idx > 0){
                  this.dataSource[idx] = res2.event.update;
                  this.eventSettings.dataSource = this.dataSource;
                  this.scheduleObj.eventSettings.dataSource  = this.dataSource;
                  this.scheduleObj.refreshEvents();
                }
              }
            }); 
          }
      });
    }
  }

  // openPopupAdd SysHoliday
  openPopupAddSysHolidayConfig(){
    let addMoreFunction = this.sysMoreFunc.find(x => x.functionID == "SYS01");
    let dataService = new CRUDService(this.injector);
    dataService.service = 'HR';
    dataService.assemblyName = 'ERM.Business.LS';
    dataService.className = 'SysHolidayConfigBusiness';
    dataService.methodSave = 'SavedAsync';
    dataService.idField = "recID";
    dataService.request.entityName = this.FMSysHolidayConfig.entityName;
    dataService.addNew()
    .subscribe((res) => {
      if(res)
      {
        res.sysHolidayCode = this.sysHolidayTypeSelected.sysHolidayCode;
        let option = new SidebarModel();
        option.Width = '550px';
        option.FormModel = this.FMSysHolidayConfig;
        option.DataService = dataService;
        this.callfc.openSide(
          CodxFormDynamicComponent ,
          {
            formModel: this.FMSysHolidayConfig,
            dataService: dataService,
            data: res,
            isAddMode: true,
            titleMore: addMoreFunction ? addMoreFunction.defaultName : '',
          },
          option
          ); 
      }
    });
  }

  // eventRendered
  eventRendered(args:any){
    if(args?.data?.isExtraHoliday == 1)
    {
      (args.element.firstChild as HTMLElement).style.borderLeftColor = "#FF6C22";
    }
  }

  // selectedChange
  selectedChange(event:any){
    if(event?.data)
    {
      this.sysHolidayTypeSelected = event.data;
      this.getSysHoliday(this.sysHolidayTypeSelected.sysHolidayCode,this.selectYear);
    }
  }

  // changeDataMF
  changeDataMFSysHolidayType(event:any){
    event.map(x => {
      x.disabled = !(x.functionID == 'SYS02' || x.functionID == 'SYS03')
    });
  }

  // changeDataMF
  changeDataMFSysHoliday(event:any){
    event.map(x => {
      x.disabled = !(x.functionID == 'SYS02' || x.functionID == 'SYS03' || x.functionID == 'SYS04')
    });
  }

  //
  speedDialClick(event){
    if(event.item.id == "LS_SysHoliday")
    {
      this.openPopupAddSysHoliday();
    }
    else if(event.item.id == "LS_SysHolidayConfig")
    {
      this.openPopupAddSysHolidayConfig();
    }
  }


  // test gen tabl db cho SP tính phép
  testGenTable(){
    this.api.execSv("HR","LS","SysHolidayBusiness","TestGenTable")
    .subscribe();
    this.api.execSv("HR","HR","HRBusiness","TestGenTable")
    .subscribe();
  }
}
