import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, CodxFormDynamicComponent, CodxListviewComponent, CRUDService, FormModel, RequestOption, SidebarModel } from 'codx-core';

@Component({
  selector: 'lib-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.css']
})
export class OrganizationListComponent implements OnInit,OnChanges,AfterViewInit {

  @Input() orgUnitID:string = "";
  @Input() formModel:FormModel = null;
  @Input() dataService: CRUDService = null
  @ViewChild("codxListView") codxListView:CodxListviewComponent;
  constructor
  (
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private callFC:CallFuncService
  )
  { }


  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
  }
  // change orgUnitID
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.orgUnitID)
    {
      this.dataService.setPredicate("",[this.orgUnitID]).subscribe();
    }
  }
  //loadEmployList
  loadEmployList(h, orgUnitID:string,abc){

  }
  // click moreFC
  clickMF(event:any, data:any){
    if(event){
      switch(event.functionID){
        case "SYS02": //delete
          this.deleteData(data);
          break;
        case "SYS03": // edit
          this.editData(data,event.text);
          break;
        case "SYS04": // copy
          this.copyData(data,event.text);
          break;
        default:
          break;  
      }
    }
  }

  // delete data
  deleteData(data:any){
    if(data)
    {
      (this.codxListView.dataService as CRUDService)
      .delete([data],true,(option:RequestOption) => this.beforeDelete(option))
      .subscribe();
    }
  }
  // before delete
  beforeDelete(opt: RequestOption){
    opt.service = 'HR';
    opt.assemblyName = 'ERM.Business.HR';
    opt.className = 'OrganizationUnitsBusiness';
    opt.methodName = 'DeleteOrgUnitAsync';
    opt.data = [this.codxListView.dataService.dataSelected.orgUnitID]
    return true;
  }
  // edit data 
  editData(data:any,text:string){
    if(data && text){
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.codxListView.dataService;
      option.FormModel = this.codxListView.formModel;
      (this.codxListView.dataService as CRUDService)
      .edit(data)
      .subscribe((result: any) => {
        if (result) 
        {
          let data = {
            dataService: this.codxListView.dataService,
            formModel: this.codxListView.formModel,
            data: result,
            function: this.formModel.funcID,
            isAddMode: false,
            titleMore: text,
          };
          let popup = this.callFC.openSide(
            CodxFormDynamicComponent,
            data,
            option,
            this.formModel.funcID
          );
        }
      });
    }
  }
  // copy data
  copyData(data:any,text:string){
    if(data && text){
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.codxListView.dataService;
      option.FormModel = this.codxListView.formModel;
      this.codxListView.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      (this.codxListView.dataService as CRUDService)
      .copy(data)
      .subscribe((result: any) => {
        if (result) {
          let data = {
            dataService: this.codxListView.dataService,
            formModel: this.codxListView.formModel,
            data: result,
            function: this.formModel.funcID,
            isAddMode: true,
            titleMore: text,
          };
          let popup = this.callFC.openSide(
            CodxFormDynamicComponent,
            data,
            option,
            this.formModel.funcID
          );
        }
      });
    }
  }
}
