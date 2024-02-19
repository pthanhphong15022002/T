import { Component, HostBinding, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CRUDService,
  CallFuncService,
  CodxGridviewV2Component,
  CodxService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RealHub,
  RealHubService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupKowdDayComponent } from './popup/popup-kowd-day/popup-kowd-day.component';
import { PopupCopyEkowdsComponent } from './popup/popup-copy-kowd/popup-copy-kowd.component';
import moment from 'moment';
import { PopupKowdMonthComponent } from './popup/popup-kowd-month/popup-kowd-month.component';
import { PopupRequestKowdComponent } from './popup/popup-request-kowd/popup-request-kowd.component';

@Component({
  selector: 'pr-kowds',
  templateUrl: './kowds.component.html',
  styleUrls: ['./kowds.component.css'],
})
export class KowdsComponent extends UIComponent {

  @HostBinding('class') get valid() { return "w-100 h-100"; }
  views: Array<ViewModel>;
  detailByDayColoumns: any = [];
  summaryColumns = [];
  dataValues: any;
  userPermission: any;
  dtService: CRUDService;
  loadedGridSummary:boolean = false;
  loadedGridDetail: boolean = false;;
  function: any;
  vllDayOfWeek:any = [];
  detailByDateRowCount:number = 0;
  summaryKowDRowCount:number = 0;
  messageHR060:string = "HR060";
  filters:any = {};
  vllHR033:any = {};
  lstHRKow:any = [];
  kowDOption:string = "";
  kowCode:string = "";
  UIMode:string = "";
  modeView:string = ""; // 1: Chi tiết theo ngày; 2: Bảng công tổng hợp
  mssgConfirmDelete:string = "HR039";

  @ViewChild('codxGrvDetailDay') codxGrvDetailDay: CodxGridviewV2Component;
  @ViewChild('codxGrvSummaryKow') codxGrvSummaryKow: CodxGridviewV2Component;
  @ViewChild('tmpPanelLeft') tmpPanelLeft: TemplateRef<any>;
  @ViewChild('tmpPanelRight') tmpPanelRight: TemplateRef<any>;
  @ViewChild('tempEmployee') tempEmployee: TemplateRef<any>;
  @ViewChild('tempCellSummary') tempCellSummary: TemplateRef<any>;
  @ViewChild('tempCellDetail') tempCellDetail: TemplateRef<any>;
  @ViewChild('tmpPopupKowD') tmpPopupKowD: TemplateRef<any>;
  @ViewChild("tmpPopupNoteKow") tmpPopupNoteKow:TemplateRef<any>;
  constructor(
    inject: Injector,
    public override codxService: CodxService,
    private notify: NotificationsService,
    private routeActive: ActivatedRoute,
    private realHub: RealHubService,
  ) 
  {
    super(inject);
    this.funcID = this.routeActive.snapshot.params['funcID'];
    this.dtService = new CRUDService(inject);
    this.dtService.idField = 'orgUnitID';
  }


  onInit(): void {
    this.getUserPermission(this.funcID);
    this.getTimeKeepingMode();

    this.cache.valueList("HR033")
    .subscribe((vll:any) => {
      if(vll && vll.datas)
      {
        vll.datas.forEach((element) => {
          this.vllHR033[element.value] = element;
        });
      }
    });
    this.cache.message("HR060")
    .subscribe((mssg:any) => {
      if(mssg)
        this.messageHR060 = mssg.customName ?? mssg.defaultName;
    });
    this.cache.message("HR039")
    .subscribe((mssg:any) => {
      if(mssg)
        this.mssgConfirmDelete = mssg.customName ?? mssg.defaultName;
    });
    this.cache.functionList("PRTPro18a")
    .subscribe((func:any) => {
      if(func)
      {
        this.FMRequestPro = new FormModel();
        this.FMRequestPro.funcID = "PRTPro18a";
        this.FMRequestPro.entityName = func.entityName;
        this.FMRequestPro.formName = func.formName;
        this.FMRequestPro.gridViewName = func.gridViewName;
      }
    });

    this.realHub.start("hr")
    .then((x: RealHub) => {
      if(x)
      {
        x.$subjectReal.asObservable().subscribe((z) => {
          // process 
          if(z && (z.event == 'GenKowDsAsync' || z.event == 'UpDateDayOffToKowD') && z.message == this.session) 
          {
            let idx = z.data["id"] - 1;
            let value =  z.data["value"];
            let iteration =  z.data["iteration"];
            let totalIteration =  z.data["totalIteration"];

            if(this.processObj[idx])
            {
              this.processObj[idx].value = value.toFixed(2);
              this.processObj[idx].iteration = iteration;
              this.processObj[idx].totalIteration = totalIteration;
            }
            if(value == 100)
            {
              setTimeout(() => {
                this.clickRemoveProcess(idx);
              },3000);
            }
            this.detectorRef.detectChanges();
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        sameData: false,
        model: {
          panelRightRef: this.tmpPanelRight,
          panelLeftRef: this.tmpPanelLeft,
          collapsed: true,
          resizable: true,
        },
      },
    ];
    this.getCurrentDowCode();
    this.getColSummaryKowd();   
  }

  // get UIMode
  getTimeKeepingMode(){
    let formName = "TRParameters", category = "1";
    this.api.execSv("SYS","SYS","SettingValuesBusiness","GetParameterByHRAsync",[formName,category])
    .subscribe((setting:any) => {
      if(setting)
      {
        let jsSetting = JSON.parse(setting);
        if(jsSetting && jsSetting["TimeKeepingMode"] == "1")
        {
          this.UIMode = "1";
          this.modeView = "1";
        }
        else
        {
          this.UIMode = "2";
          this.modeView = "2";
        }
        let ivt = setInterval(() => {
          let toolBar = document.getElementsByTagName("codx-toolbar");
          if(this.UIMode == "2" && toolBar)
          {
            clearInterval(ivt);
            if(toolBar && toolBar?.length > 0)
            {
              let icon = toolBar[0].getElementsByClassName("icon-navigate_next")
              if(icon && icon?.length > 0)
                icon[0].remove();
            }
          }
        },1000);
        this.detectorRef.detectChanges();
      }
    });
  }

  // get CurrentPayrollDow
  getCurrentDowCode(){
    let formName = "PRParameters", category = "1";
    this.api.execSv("SYS","SYS","SettingValuesBusiness","GetParameterByHRAsync",[formName,category])
    .subscribe((setting:any) => {
      if(setting)
      {
        let jsSetting = JSON.parse(setting)
        this.filters["DowCode"] = jsSetting["CurrentPayrollDow"];
        this.dataValues = JSON.stringify(this.filters);
        this.getColGridDetailDay();
      }
    });
  }

  // show/hide moreFunc
  changeDataMF(event) {
    if(event && event.length > 0)
    {
      event.forEach((mfc:any) => {
        switch(mfc.functionID)
        {
          case "SYS104":
          case "SYS102":
          case "HRTPro18A03":
            if(this.userPermission?.delete == "9" || this.userPermission?.isAdmin == true)
            {
              mfc.disabled = false;
              mfc.isbookmark = true;
              mfc.isblur = false;
            } 
            else mfc.disabled = false;
            break;
          case "HRTPro18A14":
            if(this.UIMode == "1" && this.modeView == "1" && (this.userPermission?.write == "9" || this.userPermission?.isAdmin == true))
            {
              mfc.disabled = false;
              mfc.isbookmark = true;
              mfc.isblur = false;
            }
            else mfc.disabled = true;
            break;
          default:
            mfc.disabled = true;
            break;
        }
      });
    }
  }

  // click MF
  clickMF(event) {
    switch (event && event?.functionID) 
    {
      case 'SYS104': // coppy
        this.coppy();
        break;
      case 'SYS102': // delete
        this.delete();
        break;
      case 'HRTPro18A14': // open popup gen or update dayOff to KowD
        this.openPopupGenKowD();
        break;
      case 'HRTPro18A03': // open popup request KowD
        this.request();
        break;
    }
  }

  // coppy data
  coppy() {
    let selectedIndexs = [];
    if(this.modeView == "1") // công chi tiết
      selectedIndexs = [...this.codxGrvDetailDay.selectedIndexes];
    else if(this.modeView == "2") // công tổng hợp
      selectedIndexs = [...this.codxGrvSummaryKow.selectedIndexes];

    if(selectedIndexs.length <= 0)
    {
      this.notify.notifyCode('HR040');
      return;
    }
    else if (selectedIndexs.length > 1) 
    {
      this.notify.notifyCode('HR038');
      return;
    } 
    else if(selectedIndexs.length == 1)
    {
      let idx = selectedIndexs[0];
      let data = this.modeView == "1" ? this.codxGrvDetailDay.dataSource[idx] : this.codxGrvSummaryKow.dataSource[idx];
      let option = new SidebarModel();
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      let emp = {
        employeeID: data.EmployeeID,
        employeeName: data.EmployeeName,
        positionName: data.PositionName,
      };
      let dialog = this.callfc.openSide(
        PopupCopyEkowdsComponent,
        {
          data: emp,
          dowCode: this.filters["DowCode"],
          headerText: 'Sao chép Dữ liệu công',
          userPermission : this.userPermission
        },
        option
      );

      dialog.closed.subscribe((res) => {
        if (res && res?.event) 
        {
          this.refeshGrid();
        }
      });
    }
  }

  // delete data
  delete(){
    let selectedIndexs = [];
    let strEmpIDs = "";
    if(this.modeView == "1") // công chi tiết
    {
      selectedIndexs = [...this.codxGrvDetailDay.selectedIndexes];
      strEmpIDs = selectedIndexs.map((idx) => this.codxGrvDetailDay.dataSource[idx].EmployeeID).join(";");
    }
    else if(this.modeView == "2") // công tổng hợp
    {
      selectedIndexs = [...this.codxGrvSummaryKow.selectedIndexes];
      strEmpIDs = selectedIndexs.map((idx) => this.codxGrvSummaryKow.dataSource[idx].EmployeeID).join(";");
    }
    if(selectedIndexs.length > 0 && strEmpIDs)
    {
      this.notify.alertCode('HR039',null,this.filters["DowCode"])
      .subscribe((res:any) => {
        if (res && res?.event?.status == 'Y') 
        {
          this.api.execSv<any>(
            'HR',
            'PR',
            'KowDsBusiness',
            'DeteleByKowCodeAsync',
            [strEmpIDs,this.filters["DowCode"]]
          ).subscribe((res) => {
            if(res) 
            {
              this.notify.notifyCode('SYS008');
              this.refeshGrid();
            }
            else this.notify.notifyCode('SYS022');
          });
        }
      });
    }
    else this.notify.notifyCode('HR040');
  }

  FMRequestPro:FormModel;
  request(){
    if(this.FMRequestPro)
    {
      this.cache.gridViewSetup(this.FMRequestPro.formName,this.FMRequestPro.gridViewName)
      .subscribe((grv) => {
        let option = new SidebarModel();
        option.FormModel = this.FMRequestPro;
        let obj = {
          headerText: "Gửi duyệt bảng công",
          dowCode: this.filters["DowCode"],
          orgUnitID: this.filters["OrgUnitID"],
          orgUnitName: this.orgUnitName,
          gridViewSetUp: grv,
          userPermission: this.userPermission
        };
        this.callfc.openSide(PopupRequestKowdComponent,obj,option);
      });
    }
  }

  // searchChanged
  searchChanged(event:any){
    this.codxGrvDetailDay.dataService.searchText = event;
    this.codxGrvSummaryKow.dataService.searchText = event;
    this.refeshGrid();
  }

  //change mode view grid
  switchModeView(mode) {
    this.modeView = mode;
    this.view.hideMoreFuncs = this.modeView != this.UIMode; 
    this.detectorRef.detectChanges();
  }

  // selected orgUnitID
  orgUnitName:string = "";
  onSelectionChanged(event) {
    if(event && event?.data && event?.data?.orgUnitID && event.data.orgUnitID != this.filters["OrgUnitID"])
    {
      this.filters["OrgUnitID"] = event.data.orgUnitID;
      this.orgUnitName = event.data.orgUnitName;
      this.dataValues = JSON.stringify(this.filters);
      this.detectorRef.detectChanges();
      this.refeshGrid();
    }
  }

  // thay doi gia tri filter
  onAction(event) {
    if(event && event.data && event.data?.length > 0)
    {
      this.filters["DowCode"] = "";
      this.filters["GroupSalCode"] = "";
      event.data.forEach(x => this.filters[x.field] = x.value);
      this.dataValues = JSON.stringify(this.filters);
      this.detectorRef.detectChanges();
      this.refeshGrid();
    }
  }

  // click open popup note
  openPopupNote() {
    if(this.lstHRKow && this.lstHRKow?.length > 0)
    {
      this.callfc.openForm(this.tmpPopupNoteKow,'',400,500);
    }
  }

  // double click on codxGrvDetailDay
  grvDetailDoubleClick(event:any) {
    if(this.UIMode == "1" && event && event?.column && (this.userPermission && (this.userPermission?.isAdmin || this.userPermission?.write == "9")))
    {
      let year = Number.parseInt(this.filters["DowCode"].split("/")[0]) , month = Number.parseInt(this.filters["DowCode"].split("/")[1]) - 1;
      let obj = {
        headerText:"Dữ liệu công theo ngày", // chưa có function name or mssg
        employeeID : event.rowData.EmployeeID,
        dowCode: this.filters["DowCode"],
        workDate:  new Date(year,month,event.column?.field),
        userPermission: this.userPermission
      }
      let option = new SidebarModel();
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.callfc.openSide(PopupKowdDayComponent,obj,option)
      .closed.subscribe((res:any) => {
        if(res && res?.event)
        {
          this.refeshGrid();
        }
      });
    }
  }

  // double click on codxGrvSummary
  grvSummaryDoubleClick(event:any){
    if(this.UIMode == "2" && event && event?.column && (this.userPermission && (this.userPermission?.isAdmin || this.userPermission?.write == "9")))
    {
      let employee = {
        employeeID : event.rowData.EmployeeID,
        employeeName : event.rowData.EmployeeName,
        positionName : event.rowData.PositionName
      };
      let obj = {
        headerText:"Dữ liệu công theo tháng", // chưa có function name or mssg
        employee : employee,
        dowCode: this.filters["DowCode"],
        kowCode: event.column.field,
        userPermission: this.userPermission
      };
      let option = new SidebarModel();
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.callfc.openSide(PopupKowdMonthComponent,obj,option)
      .closed.subscribe((res:any) => {
        if(res && res?.event)
        {
          this.refeshGrid();
        }
      });
    }
  }

  //get user permission function
  getUserPermission(funcID) {
    this.cache.functionList(funcID)
    .subscribe((func:any) => {
      if(func)
      {
        this.function = func;
        this.api.execSv(
          'HR',
          'Core',
          'DataBusiness',
          'GetUserPermissionAsync',
          [funcID, func.entityName])
        .subscribe((permisison:any) => 
        {
          this.userPermission = permisison;
          this.detectorRef.detectChanges();
        });
      }
    });
  }

  //onDatabound(modeView)
  onDatabound(modeview){
    if(modeview == 1)
      this.detailByDateRowCount = this.codxGrvDetailDay.dataService.rowCount;
    else
      this.summaryKowDRowCount = this.codxGrvSummaryKow.dataService.rowCount;
  }

  // get column grid for gridview detail by day
  getColGridDetailDay(){
    this.detailByDayColoumns = [];
    this.detailByDayColoumns.push({
      template: this.tempEmployee,
      field: 'employeeID'
    });
    let year = Number.parseInt(this.filters["DowCode"].split("/")[0]), month = Number.parseInt(this.filters["DowCode"].split("/")[1]) - 1;              
    let dayNums = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= dayNums; day++) {
      let dayOffWeek =  this.capitalize(moment(new Date(year,month,day)).format('dddd'));
      this.detailByDayColoumns.push({
        field: day.toString(),
        refField: 'workDate',
        headerTemplate: 
        `<div class="text-center">
          <div class="text-gray-600">${dayOffWeek}</div>
          <div class="fw-bold text-dark">${day}</div>
        </div>`,
        template: this.tempCellDetail
      });
    }
    this.loadedGridDetail = true;
    this.detectorRef.detectChanges();
  }

  capitalize(text:string):string
  {
    return text[0].toUpperCase() + text.slice(1);
  }

  // get column grid for gridview summary kowd
  getColSummaryKowd(){
    this.summaryColumns = [];
    this.summaryColumns.push({
      template: this.tempEmployee,
      field: 'employeeID'
    });
    this.api.execSv("HR","HR","KOWsBusiness","GetAsync")
    .subscribe((res:any) => {
        if (res && res?.length > 0) 
        {
          this.lstHRKow = res;
          this.lstHRKow.forEach((kow) => {
            this.summaryColumns.push({
              headerTemplate: `<div class="fw-bolder text-primary text-center">${kow.kowID}</div>`,
              template: this.tempCellSummary,
              field: kow.kowID,
              refField: 'kowCode'
            });
          });
          this.loadedGridSummary = true;
          this.detectorRef.detectChanges();
        }
    });
  }

  // open popup gen KowD or fill dayoff to KowD
  openPopupGenKowD(){
    let arrIdx = this.codxGrvDetailDay.selectedIndexes;
    if(arrIdx && arrIdx.length > 0)
    {
      let dialog = new DialogModel();
      dialog.FormModel = this.view.formModel;
      this.kowDOption = "1";
      this.callfc.openForm(this.tmpPopupKowD,"",500,300,"",null,"",dialog);
    }
    else this.notify.notifyCode("HR040");
    
  } 

  // value input change
  valueChange(event){
    let field = event.field;
    let value = event.data;
    switch(field)
    {
      case "kowDOption":
        this.kowDOption = value;
        break;
      case "kowCode":
        this.kowCode = value;
        break;
      case "isReadData":
        this.filters["IsReadSaved"] = event.data;
        this.dataValues = JSON.stringify(this.filters);
        this.detectorRef.detectChanges();
        this.refeshGrid();
        break;
    }
  }

  //refesh codxGrid
  refeshGrid(){
    if(this.UIMode == "1")
    {
      this.codxGrvDetailDay?.refresh();
      this.codxGrvSummaryKow?.refresh();
    }
    else
      this.codxGrvSummaryKow?.refresh();
  }

  // click gen KowD or Fill DayOff to KowD
  clickBtn(dialog:DialogRef){
    if(this.UIMode == "1" && this.modeView == "1" && (this.userPermission && (this.userPermission?.isAdmin || this.userPermission?.write == "9")))
    {
      if(!this.filters["DowCode"])
      {
        this.notify.notify("Vui lòng chọn kỳ công");
        return;
      }
      let empIDs = this.codxGrvDetailDay.selectedIndexes.map(idx => this.codxGrvDetailDay.dataSource[idx].EmployeeID);
      if(empIDs.length > 0)
      {
        if(this.kowDOption == "1")
        {
          if(!this.kowCode)
          {
            this.notify.notifyCode("HR041");
            return;
          }
          this.processObj = [];
          this.genKowD(empIDs.join(";"),this.filters["DowCode"],this.kowCode);
        }
        else if(this.kowDOption == "2")
        {
          this.processObj = [];
          this.updateDayOffToKowD(empIDs.join(";"),this.filters["DowCode"]);
        }
        dialog.close();
      }
      else this.notify.notifyCode("HR040");
    }
  }
  
  processing:boolean = false;
  processObj:any[] = [];
  session:string = "";
  // click gen kowDs with dowCode and kowCode
  genKowD(employeeIDs:any,dowCode:string,kowCode:string){
    if(employeeIDs && dowCode && kowCode)
    {
      this.api.execSv("HR","PR","KowDsBusiness","GenKowDsAsync",[employeeIDs,dowCode,kowCode])
      .subscribe((res:boolean) => {
        if(res)
        {
          this.session = res[0];
          for (let index = 0; index < res[1]; index++) 
          {
            let obj = {
              id : index + 1,
              value : 0,
              iteration: 0,
              totalIteration: 0,
            };
            this.processObj.push(obj);
          }
          this.processing = true;
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  // click update data dayOff to KowDs
  updateDayOffToKowD(employeeIDs:any,dowCode:string){
    if(employeeIDs && dowCode)
    {
      this.api.execSv("HR","PR","KowDsBusiness","UpDateDayOffToKowDAsync",[employeeIDs,dowCode])
      .subscribe((res:boolean) => {
        if(res)
        {
          this.session = res[0];
          for (let index = 0; index < res[1]; index++) {
              let obj = {
                id : index + 1,
                value : 0,
                iteration: 0,
                totalIteration: 0,
              };
            this.processObj.push(obj);
          }
          this.processing = true;
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  // click remove proccess
  clickRemoveProcess(idx:number){
    if(idx > -1 && idx < this.processObj.length)
    {
      this.processObj = this.processObj.filter(x => x.value != 100);
      if(this.processObj.length == 0)
      {
        this.processing = false;
        this.refeshGrid();
      }
      this.detectorRef.detectChanges();
    }
  }


}
