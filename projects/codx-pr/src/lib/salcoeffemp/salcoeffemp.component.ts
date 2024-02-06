import { AfterViewInit, Component, HostBinding, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, ButtonModel, CRUDService, CodxGridviewV2Component, DataService, DialogModel, NotificationsService, SidebarModel, UIComponent, Util, ViewModel, ViewType } from 'codx-core';
import { PopupAddSalCoeffEmpComponent } from './popup/popup-add-salcoeffemp/popup-add-salcoeffemp.component';
import { PopupCoppySalCoeffEmpComponent } from './popup/popup-coppy-salcoeffemp/popup-coppy-salcoeffemp.component';
import moment from 'moment';

@Component({
  selector: 'pr-salcoeffemp',
  templateUrl: './salcoeffemp.component.html',
  styleUrls: ['./salcoeffemp.component.css']
})
export class SalcoeffempComponent extends UIComponent implements OnInit, AfterViewInit{

  @HostBinding('class') get valid() { return "w-100 h-100"; }
  views:ViewModel[];
  dtServiceOrgUnit:CRUDService;
  columnsGrid:any[] = [];
  dataValues:any;
  filters:any = {};
  loading:boolean = false;
  userPermission:any;
  lstSalCoeffs:any[] = [];
  mssgConfirm:string = "";
  @ViewChild("tmpLeft") tmpLeft:TemplateRef<any>;
  @ViewChild("tmpRight") tmpRight:TemplateRef<any>;
  @ViewChild("tmpEmployee") tmpEmployee:TemplateRef<any>;
  @ViewChild("tmpData") tmpData:TemplateRef<any>;
  @ViewChild("tmpTooltip") tmpTooltip:TemplateRef<any>;
  @ViewChild("codxGridViewV2") codxGridViewV2 : CodxGridviewV2Component;
  constructor
  (
    private injector:Injector,
    private notiSV: NotificationsService,
    private auth:AuthStore
  ) 
  {
    super(injector);
    this.dtServiceOrgUnit = new CRUDService(this.injector);
    this.dtServiceOrgUnit.idField = "orgUnitID";
    this.dtServiceOrgUnit.parentField = "ParentID";
  }

  onInit(): void {
    this.getCurrentDowCode();
    this.cache.message("HR049")
    .subscribe((mssg:any) => {
      if(mssg)
      {
        this.mssgConfirm = mssg.defaultName ?? mssg.customName;
      }
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type:ViewType.content,
        showFilter:true,
        sameData:false,
        model:{
          panelLeftRef: this.tmpLeft,
          panelRightRef: this.tmpRight,
          collapsed: true,
          resizable: true
        }
      }
    ];
    this.getColumns();
    this.getUserPermission();
    this.getListSalCoeff();
    this.detectorRef.detectChanges();
  }

  // get CurrentPayrollDow
  getCurrentDowCode(){
    this.api.execSv("SYS","SYS","SettingValuesBusiness","GetParameterByHRAsync",["PRParameters","1"])
    .subscribe((res:any) => {
      if(res)
      {
        let setting = JSON.parse(res)
        this.filters["DowCode"] = setting["CurrentPayrollDow"];
      }
    });
  }

  // get columns grid
  getColumns(){
    this.api.execSv("HR","ERM.Business.LS","SalCoeffBusiness","GetAsync")
    .subscribe((res:any) => {
      this.columnsGrid.push(
      {
        field: 'employeeID',
        template: this.tmpEmployee,
      });
      if(res.length > 0)
      {
        res.forEach(item => {
          this.columnsGrid.push({
            headerText: item.coeffName,
            field: item.coeffCode,
            refField: 'coeffCode',
            template:this.tmpData,
          });
        });
      }
      this.detectorRef.detectChanges();
    });
  }

  // double click gridview
  onDoubleClick(event){
    if(this.userPermission.write == "9"|| this.userPermission.isAdmin)
    {
      this.view.dataService.addNew()
      .subscribe((model:any) => {
        if(model)
        {
          model.employeeID = event.rowData.employeeID;
          let obj = {
            data:model,
            employeeID : event.rowData.employeeID,
            dowCode:this.filters.DowCode,
            userPermission : this.userPermission,
            headerText : this.view.function.defaultName ?? this.view.function.customName
          };
          let option = new SidebarModel();
          option.Width = '550px';
          option.FormModel = this.view.formModel;
          option.DataService = this.view.dataService;
          this.callfc.openSide(PopupAddSalCoeffEmpComponent,obj,option,this.view.funcID)
          .closed.subscribe((res:any) => {
            if(res.event)
            {
              this.codxGridViewV2?.refresh();
            }
          });
        }
      });
    }
  }

  // filter DowCode || GroupSalCode
  onAction(event){
    if(event && event.data && event.data?.length > 0)
    {
      this.filters["DowCode"] = "";
      this.filters["GroupSalCode"] = "";
      event.data.forEach(x => this.filters[x.field] = x.value);
      this.dataValues = JSON.stringify(this.filters);
      this.detectorRef.detectChanges();
      this.codxGridViewV2?.refresh();
    }
  }

  // select orgUnitID
  onSelectionChange(event:any){
    if(event && event?.data && event?.data?.orgUnitID &&  event?.data?.orgUnitID != this.filters["OrgUnitID"])
    {
      this.filters["OrgUnitID"] = event.data.orgUnitID;
      this.dataValues = JSON.stringify(this.filters);
      this.detectorRef.detectChanges();
      this.codxGridViewV2?.refresh();
    }
    if(!this.loading)
    {  this.loading = true;
      this.detectorRef.detectChanges();
    }
  }

  // searchChanged
  searchChanged(event) {
    if(this.codxGridViewV2)
    {
      this.codxGridViewV2.dataService.searchText = event;
      this.codxGridViewV2.refresh();
    }
  }

  // valueChange
  valueChange(event){
    if(event)
    {
      this.filters["IsReadSaved"] = event.data;
      this.dataValues = JSON.stringify(this.filters);
      this.detectorRef.detectChanges();
      this.codxGridViewV2?.refresh();
    }
  }

  // set rowCount when grid refresh
  onDatabound(){
    this.view.dataService.rowCount = this.codxGridViewV2?.dataService.rowCount ?? 0;
    this.view.setBreadcrumbs();
    this.detectorRef.detectChanges();
  }

  // changeDataMF
  changeDataMF(event:any){
    event.forEach((x:any) => { 
      if((x.functionID == 'SYS02' || x.functionID == 'SYS04') && (this.userPermission?.write == "9" || this.userPermission?.isAdmin))
      {
        x.disabled = false;
        x.isbookmark = true;
        x.isblur = false;
      }
      else x.disabled = true;
    });
  }

  // clickMF
  clickMF(event){
    if(!this.codxGridViewV2.selectedIndexes || this.codxGridViewV2.selectedIndexes?.length == 0)
    {
      this.notiSV.notifyCode("HR040");
      return;
    }
    if(event.functionID == "SYS02")
    {
      let mssg = Util.stringFormat(this.mssgConfirm,this.filters["DowCode"]);
      this.notiSV.alertCode(mssg)
      .subscribe((confirm:any) => {
        if(confirm && confirm.event && confirm.event.status == "Y")
        {
          let lstEmployeeID = this.codxGridViewV2.selectedIndexes.map(idx => this.codxGridViewV2.dataSource[idx].employeeID);
          this.api.execSv("HR","PR","SalCoeffEmpBusiness","DeleteAsync",[lstEmployeeID,this.filters["DowCode"]])
          .subscribe((res:any) => {
            if(res)
            {
              this.notiSV.notifyCode("SYS008");
              this.codxGridViewV2.selectedIndexes.forEach((idx:number) => this.codxGridViewV2.deleteRow(this.codxGridViewV2.dataSource[idx],true));
              this.view.dataService.rowCount = this.codxGridViewV2.dataService.rowCount;
              this.view.setBreadcrumbs();
            }
            else this.notiSV.notifyCode("SYS022");
          });
        }
      });
    }
    else if(event.functionID == "SYS04")
    {
      if(this.codxGridViewV2.selectedIndexes.length > 1)
      {
        this.notiSV.notifyCode("HR038");
        return;
      }
      let dataSelected = {...this.codxGridViewV2.rowDataSelected};
      let obj = {
        data: dataSelected,
        dowCode: this.filters.DowCode,
        headerText : event.text + " " + this.view.function.defaultName ?? this.view.function.customName 
      };
      let option = new SidebarModel();
      option.Width = '550px';
      option.FormModel = this.view.formModel;
      option.DataService = this.view.dataService;
      this.callfc.openSide(PopupCoppySalCoeffEmpComponent,obj,option,this.view.funcID)
      .closed.subscribe((res:any) => {
        if(res.event)
        {
          this.codxGridViewV2.refresh();
        }
      });
    }
  }

  // get uer permission
  getUserPermission() {
    this.api.execSv<any>(
      'HR',
      'Core',
      'DataBusiness',
      'GetUserPermissionAsync',
      [this.view.entityName,this.view.funcID]
    ).subscribe((res:any) => {
      this.userPermission = res;
      this.detectorRef.detectChanges();
    });
  }

  // get LS_SalCoeff
  getListSalCoeff(){
    this.api.execSv("HR","LS","SalCoeffBusiness","GetAsync")
    .subscribe((res:any) => {
      if(res && res.length > 0)
      {
        this.lstSalCoeffs = res;
      }
    });
  }

  // clickShowTooltip
  clickShowTooltip(){
    let dialog = new DialogModel();
    dialog.FormModel = this.view.formModel;
    this.callfc.openForm(this.tmpTooltip,"",400,400,this.view.funcID,null,"",dialog);
  }
  
}
