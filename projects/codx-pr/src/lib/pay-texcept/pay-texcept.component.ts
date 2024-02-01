import { AfterViewInit, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, CRUDService, CodxGridviewV2Component, DialogModel, NotificationsService, SidebarModel, UIComponent, Util, ViewModel, ViewType } from 'codx-core';
import moment from 'moment';

@Component({
  selector: 'pr-pay-texcept',
  templateUrl: './pay-texcept.component.html',
  styleUrls: ['./pay-texcept.component.css']
})
export class PayTExceptComponent extends UIComponent implements AfterViewInit {
  
  views:ViewModel[];
  columnsGrid:any[] = [];
  gridViewSetup:any;
  dtServiceOrgUnit:CRUDService;
  dataValues:any;
  filters:any = {};
  loading:boolean = false;
  userPermission:any;
  mssgConfirm:string = "";
  @ViewChild("tmpLeft") tmpLeft:TemplateRef<any>;
  @ViewChild("tmpRight") tmpRight:TemplateRef<any>;
  @ViewChild("codxGridViewV2") codxGridViewV2 : CodxGridviewV2Component;
  @ViewChild("tmpColEmployee") tmpColEmployee:TemplateRef<any>;
  @ViewChild("tmpColCategory") tmpColCategory:TemplateRef<any>;
  @ViewChild("tmpColAmountF") tmpColAmountF:TemplateRef<any>;
  @ViewChild("tmpColGenDate") tmpColGenDate:TemplateRef<any>;
  @ViewChild("tmpColDowCode") tmpColDowCode:TemplateRef<any>;

  constructor(
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

  override onInit(): void {
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
    this.cache.gridViewSetup("PayTExcept","grvPayTExcept")
    .subscribe((grd:any) => {
      if(grd)
      {
        this.gridViewSetup = grd;
        this.columnsGrid = [
          {
            field: 'employeeID',
            template: this.tmpColEmployee,
            headerText: this.gridViewSetup["EmployeeID"]?.description ,
            width:250
          },
          {
            field: 'exceptCode',
            template: this.tmpColCategory,
            headerText: this.gridViewSetup["ExceptCode"]?.description,
            width:250
          },
          {
            field: 'amountF',
            template: this.tmpColAmountF,
            headerText: this.gridViewSetup["AmountF"]?.description,
          },
          {
            field: 'genDate',
            template: this.tmpColGenDate,
            headerText: this.gridViewSetup["GenDate"]?.description,
          },
          {
            field: 'dowCode',
            template: this.tmpColDowCode,
            headerText: this.gridViewSetup["DowCode"]?.description,
          },
        ];
        this.detectorRef.detectChanges();
      }
    });
    this.getUserPermission();
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
          // this.callfc.openSide(PopupAddSalCoeffEmpComponent,obj,option,this.view.funcID)
          // .closed.subscribe((res:any) => {
          //   if(res.event)
          //   {
          //     this.codxGridViewV2?.refresh();
          //   }
          // });
        }
      });
    }
  }

  // filter DowCode || GroupSalCode
  onAction(event){
    if(event && event.data && event.data?.length > 0)
    {
      this.filters["DowCode"] = "";
      this.filters["ExceptCode"] = "";
      event.data.forEach(x => this.filters[x.field] = x.value);
      this.dataValues = JSON.stringify(this.filters);
      this.detectorRef.detectChanges();
      this.codxGridViewV2?.refresh();
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
  
  // select orgUnitID
  onSelectionChange(event:any){
    if(event && event.data && event.data.orgUnitID && event.data.orgUnitID != this.filters["OrgUnitID"])
    {
      this.filters["OrgUnitID"] = event.data.orgUnitID;
      this.dataValues = JSON.stringify(this.filters);
      this.detectorRef.detectChanges();
      this.codxGridViewV2?.refresh();
    }
    if(!this.loading)
    {  
      this.loading = true;
      this.detectorRef.detectChanges();
    }
  }

  //valueChange
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
      if(x.functionID == 'SYS02' || x.functionID == 'SYS04' && (this.userPermission.write == "9" || this.userPermission.isAdmin))
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
      // this.callfc.openSide(PopupCoppySalCoeffEmpComponent,obj,option,this.view.funcID)
      // .closed.subscribe((res:any) => {
      //   if(res.event)
      //   {
      //     this.codxGridViewV2.refresh();
      //   }
      // });
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

}
