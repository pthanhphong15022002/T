import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ApiHttpService, CodxListviewComponent, FormModel } from 'codx-core';

@Component({
  selector: 'lib-organization-master-detail',
  templateUrl: './organization-master-detail.component.html',
  styleUrls: ['./organization-master-detail.component.css']
})
export class OrganizationMasterDetailComponent implements OnInit, OnChanges {

  @Input() orgUnitID:string = "";
  @Input() formModel:FormModel = null;
  employeeManager:any = null;
  totalEmployee:number = 0;
  @ViewChild("codxListView") codxListView:CodxListviewComponent;
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
  ) 
  { 
    
  }
  ngOnInit(): void {
    this.getManager(this.orgUnitID);
  }

  //onChange orgUnitID
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orgUnitID.currentValue != changes.orgUnitID.previousValue){
      this.orgUnitID = changes.orgUnitID.currentValue;
      this.getManager(this.orgUnitID);
      if(this.codxListView){
        this.codxListView.dataService.setPredicate("",[this.orgUnitID]).subscribe();
      }
      this.dt.detectChanges();
    }
  }
  // get employee manager by orgUnitID
  getManager(orgUnitID:string){
    if(orgUnitID){
      this.api.execSv("HR","ERM.Business.HR","OrganizationUnitsBusiness","GetEmployeeMasterDetailAsync",[orgUnitID])
      .subscribe((res:any) => {
        if(res)
        {
          this.employeeManager = JSON.parse(JSON.stringify(res));
        }
        else{
          this.employeeManager = null;
        }
        this.dt.detectChanges();
      });
    }
  }
}
