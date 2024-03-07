import { AfterViewInit, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CRUDService, CodxGridviewV2Component, CodxService, NotificationsService, RealHubService, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'pr-payroll-detail',
  templateUrl: './payroll-detail.component.html',
  styleUrls: ['./payroll-detail.component.css']
})
export class PayrollDetailComponent extends UIComponent implements AfterViewInit  {
  
  
  views:ViewModel[];
  dataValues:string = "";
  dtService:CRUDService;
  payrollID:string = "";
  filters:any= {};

  @ViewChild("tmpPanelLeft") tmpPanelLeft:TemplateRef<any>;
  @ViewChild("tmpPanelRight") tmpPanelRight:TemplateRef<any>;
  @ViewChild("tempCellData") tempCellData:TemplateRef<any>;
  @ViewChild('tempEmployee') tempEmployee: TemplateRef<any>;
  @ViewChild("codxGridView") codxGridView: CodxGridviewV2Component;

  constructor(
    inject: Injector,
    public override codxService: CodxService,
    private notify: NotificationsService,
    private routeActive: ActivatedRoute,
  ) 
  {
    super(inject);
    this.funcID = this.routeActive.snapshot.params['funcID'];
    this.dtService = new CRUDService(inject);
    this.dtService.idField = 'orgUnitID';
  }


  override onInit(): void {
    this.router.params.subscribe((params:any) => {
      if(params && params["recID"])
      {
        this.payrollID = params["recID"];
        this.getPayroll(this.payrollID);
      }
    })
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        sameData: false,
        model : 
        {
          panelLeftRef: this.tmpPanelLeft,
          panelRightRef: this.tmpPanelRight,
          collapsed: true,
          resizable: true
        }
      }
    ];
  }

  data:any;
  getPayroll(payrollID:string){
    if(payrollID)
    {
      this.api.execSv("HR","PR","PayrollListBusiness","GetByIDAsync",payrollID)
      .subscribe((res:any) => {
        if(res)
        {
            this.data = res;
            this.filters["PayrollID"] = res.payrollID;
            this.filters["DowCode"] = res.dowCode;
            this.dataValues = JSON.stringify(this.filters);
            this.getColumnGrid(res.hrTemplateID);
            this.detectorRef.detectChanges();
        }
      });
    }
  }

  columnGrid:any[];
  getColumnGrid(hrTemplateID){
    if(hrTemplateID)
    {
      this.api.execSv("HR","HR","TemplateExcelBusiness","GetTemplateFieldByIDAsync",hrTemplateID)
      .subscribe((res:any) => {
        if(res && res.length > 0)
        {
          this.columnGrid = [];
          res.forEach(ele => {
            this.columnGrid.push({
              field: ele.fieldName,
              headerText: ele.headerText,
              template: ele.fieldName == "Emp.EmployeeID" ? this.tempEmployee : this.tempCellData,
              width: ele.fieldName == "Emp.EmployeeID" ? 250 : 100
            });
          });
          this.codxGridView?.refresh();
          this.detectorRef.detectChanges();
        }
      });
    }
  }


  onSelectionChanged(event) {
    if(event && event?.data && event?.data?.orgUnitID && event.data.orgUnitID != this.filters["OrgUnitID"])
    {
      this.filters["OrgUnitID"] = event.data.orgUnitID;
      this.dataValues = JSON.stringify(this.filters);
      this.detectorRef.detectChanges();
      this.codxGridView?.refresh();
    }
  }
}
