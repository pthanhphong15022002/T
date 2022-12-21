import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
  columnsGrid:any[] = []
  gridViweSetUp:any = {};
  predicate:string = "@0.Contains(EmployeeID) || EmployeeID != @1";
  dataValue:string = "";
  @ViewChild("grid") grid:CodxGridviewComponent;
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private dt:ChangeDetectorRef,
  ) 
  { 
    
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.orgUnitID){
      this.getManager(this.orgUnitID);
      if(this.grid){
        this.grid.dataService.setPredicate("",[this.orgUnitID]).subscribe();
      }
    }
  }
  ngOnInit(): void {
    this.setDataDefault(this.formModel);
  }
  setDataDefault(formModel:FormModel){
    if(formModel){
      this.cache.gridViewSetup(formModel.formName,formModel.gridViewName)
      .subscribe((grd:any) => {
        if(grd){
          this.gridViweSetUp = grd;
          this.columnsGrid = [
            {
              headerText: grd["EmployeeName"]["headerText"],
              width: '25%',
            },
            {
              headerText: grd["Birthday"]["headerText"],
              width: '15%',
            },
            {
              headerText: grd["Phone"]["headerText"],
              width: '15%',
            },
            {
              headerText: grd["Email"]["headerText"],
              width: '15%',
            },
            {
              headerText: grd["JoinedOn"]["headerText"],
              width: '15%',
            },
            {
              headerText: grd["Status"]["headerText"],
              width: '15%',
            },
            {
              headerText: "",
              width: '5%',
            },
          ];
        }
      });
    }
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
