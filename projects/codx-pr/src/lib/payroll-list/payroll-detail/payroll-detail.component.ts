import { AfterViewInit, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CRUDService, CodxGridviewV2Component, CodxService, DialogModel, NotificationsService, RealHubService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddPayrollListComponent } from '../popup/popup-add-payroll-list/popup-add-payroll-list.component';

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
    private notiSV:NotificationsService
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
      this.api.execSv("HR","HR","TemplateExcelBusiness_Old","GetTemplateFieldByIDAsync",hrTemplateID)
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

  navigatePayroll(){
    this.codxService.navigate(this.view.funcID);
  }

  changeDataMF(event:any){
    event.forEach(element => {
     if(element.functionID === "PRTPro19A15" || element.functionID === "SYS02")
     {
       element.disabled = false;
       element.isbookmark = true;
       element.isblur = false;
     }
     else element.disabled = true;
    }); 
  }

  clickMF(event:any){
    switch(event.functionID)
    {
      case"PRTPro19A15":
        this.add();
        break;
      case"SYS02":
        this.delete(this.payrollID);
        break;
    }
  }

  add(){
    let arrIdx = this.codxGridView.selectedIndexes;
    if(arrIdx && arrIdx.length > 0)
    {
      this.view.dataService.addNew()
      .subscribe((model:any) => {
        if(model)
        {
          let dialogModel = new DialogModel();
          dialogModel.FormModel = this.view.formModel;
          dialogModel.DataService = this.view.dataService;
          let obj = {
            data: model,
            headerText: "Tính lương"
          };
          this.callfc.openForm(PopupAddPayrollListComponent,"",500,500,this.view.funcID,obj,"",dialogModel)
          .closed.subscribe((res:any) => {
            if(res && res?.event)
            {
              this.view.dataService.add(res.event).subscribe();
            }
          });
        }
      });
    }
    else this.notify.notifyCode("HR040");
  }

  delete(payrollID:string){
    if(payrollID)
    {
      this.api.execSv("HR","PR","PayrollListBusiness","DeleteByIDAsync",payrollID)
      .subscribe((res:any) => {
        if(res) 
        {
          this.notiSV.notifyCode("SYS008");
          this.navigatePayroll();
        }
        else this.notiSV.notifyCode("SYS022");
      });
    }
    
  }
}
