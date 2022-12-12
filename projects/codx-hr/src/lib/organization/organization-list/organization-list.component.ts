import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ApiHttpService, CodxListviewComponent, FormModel } from 'codx-core';

@Component({
  selector: 'lib-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.css']
})
export class OrganizationListComponent implements OnInit,OnChanges {

  @Input() orgUnitID:string = "";
  @Input() formModel:FormModel = null;
  data:any[] = [];
  predicate:string = "OrgUnitID = @0";
  dataValue:string = "";
  @ViewChild("codxListView") codxListView:CodxListviewComponent;
  constructor
  (
    private api:ApiHttpService,
    private dt:ChangeDetectorRef
  )
  { }

  ngOnInit(): void {
    this.getOrgUnitByID(this.orgUnitID);
  }
  // change orgUnitID
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orgUnitID.currentValue != changes.orgUnitID.previousValue){
      this.orgUnitID = changes.orgUnitID.currentValue;
      this.dataValue = this.orgUnitID;
      if(this.codxListView)
      {
        this.codxListView.dataService.setPredicate("",[this.dataValue]).subscribe();
      }
      this.getOrgUnitByID(this.orgUnitID);
      this.dt.detectChanges();
    }
  }
  // get data
  getOrgUnitByID(orgUnitID:string){
    if(orgUnitID)
    {
      // this.api
      // .execSv(
      //   'HR',
      //   'ERM.Business.HR',
      //   'OrganizationUnitsBusiness',
      //   'GetDataTreeListAssync',
      //   [orgUnitID]
      // ).subscribe((res:any) => {
      //     if(res)
      //     {
      //         this.data = JSON.parse(JSON.stringify(res));
      //         this.dt.detectChanges();
      //     }
      //   });
    }
  }

  //loadEmployList
  loadEmployList(h, orgUnitID:string,abc){

  }
  // click moreFC
  clickMF($event, item){

  }
}
