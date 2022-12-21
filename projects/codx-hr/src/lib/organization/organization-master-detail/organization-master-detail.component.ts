import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CacheService, CodxGridviewComponent, FormModel } from 'codx-core';

@Component({
  selector: 'lib-organization-master-detail',
  templateUrl: './organization-master-detail.component.html',
  styleUrls: ['./organization-master-detail.component.css']
})
export class OrganizationMasterDetailComponent implements OnInit, OnChanges{

  @Input() orgUnitID:string = "";
  @Input() formModel:FormModel = null;
  employeeManager:any = null;
  totalEmployee:number = 0;
  columnsGrid:any[] = null;
  grvSetup:any = {};
  predicates:string = "@0.Contains(EmployeeID) || EmployeeID != @1";
  formModelEmp:FormModel = new FormModel();
  @ViewChild("grid") grid:CodxGridviewComponent;
  @ViewChild("templateName",{ static: true }) templateName:TemplateRef<any>;
  @ViewChild("templateBirthday",{ static: true }) templateBirthday:TemplateRef<any>;
  @ViewChild("templatePhone",{ static: true }) templatePhone:TemplateRef<any>;
  @ViewChild("templateEmail",{ static: true }) templateEmail:TemplateRef<any>;
  @ViewChild("templateJoinedOn",{ static: true }) templateJoinedOn:TemplateRef<any>;
  @ViewChild("templateStatus",{ static: true }) templateStatus:TemplateRef<any>;
  @ViewChild("templateMoreFC",{ static: true }) templateMoreFC:TemplateRef<any>;

  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private dt:ChangeDetectorRef,
  ) 
  { 
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orgUnitID){
      this.getManager(this.orgUnitID);
      if(this.grid){
        this.grid.dataService.setPredicates([],[this.orgUnitID]).subscribe();
      }
    }
  }
  ngOnInit(): void {
    // lấy grvSetup của employee để view và format data theo thiết lập
    this.formModelEmp.formName = "Employees";
    this.formModelEmp.gridViewName = "grvEmployees" 
    this.formModelEmp.entityName = "HR_Employees";
    this.cache.gridViewSetup(this.formModelEmp.formName,this.formModelEmp.gridViewName)
    .subscribe((grd:any) => {
      if(grd){
        this.grvSetup = grd;
        console.log(grd);
        this.columnsGrid = [
          {
            headerText: grd["EmployeeName"]["headerText"],
            field:"EmployeeName",
            template:this.templateName,
            width: '30%',
          },
          {
            headerText: grd["Birthday"]["headerText"],
            field:"Birthday",
            template:this.templateBirthday,
            width: '10%',
          },
          {
            headerText: grd["Phone"]["headerText"],
            field:"Phone",
            template:this.templatePhone,
            width: '10%',
          },
          {
            headerText: grd["Email"]["headerText"],
            field:"Email",
            template:this.templateEmail,
            width: '10%',
          },
          {
            headerText: grd["JoinedOn"]["headerText"],
            field:"JoinedOn",
            template:this.templateJoinedOn,
            width: '10%',
          },
          {
            headerText: grd["Status"]["headerText"],
            field:"Status",
            template:this.templateStatus,
            width: '15%',
          },
          {
            template:this.templateMoreFC,
            width: '5%',
          }
        ];
        this.dt.detectChanges();
      }
    });
  }
  // get employee manager by orgUnitID
  getManager(orgUnitID:string){
    if(orgUnitID){
      this.api.execSv("HR","ERM.Business.HR","OrganizationUnitsBusiness","GetManagerAsync",[orgUnitID])
      .subscribe((res:any) => {
        if(res)
        {
          this.employeeManager = JSON.parse(JSON.stringify(res));
        }
        else
        {
          this.employeeManager = null;
        }
        this.dt.detectChanges();
      });
    }
  }

  // clickMFC
  clickMF(event:any,item:any){

  }
  
}
