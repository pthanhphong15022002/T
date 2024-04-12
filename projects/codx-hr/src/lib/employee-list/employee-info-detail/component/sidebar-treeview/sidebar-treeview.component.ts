import { AfterViewInit, Component, HostBinding, Injector, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, ButtonModel, CRUDService, CodxGridviewV2Component, CodxService, NotificationsService, RequestOption, ResourceModel, SidebarModel, UIComponent, Util, ViewModel, ViewType } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-sidebar-treeview',
  templateUrl: './sidebar-treeview.component.html',
  styleUrls: ['./sidebar-treeview.component.css']
})
export class SidebarTreeviewComponent extends UIComponent implements AfterViewInit {
  
  @HostBinding('class') get valid() { return "w-100 h-100"; }
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
}