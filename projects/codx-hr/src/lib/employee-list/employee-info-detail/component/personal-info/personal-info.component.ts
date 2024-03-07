import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { ApiHttpService, AuthStore, CRUDService, CacheService, CallFuncService, CodxFormDynamicComponent, DataRequest, FormModel, NotificationsService, SidebarModel } from 'codx-core';

@Component({
  selector: 'hr-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit,AfterViewInit {

  @Input() function:any;
  @Input() employeeID:any;


  user:any;
  formModel:FormModel;
  userPermission:any;
  data:any;
  constructor
  (
    private injector:Injector,
    private api:ApiHttpService,
    private cache:CacheService,
    private auth:AuthStore,
    private callFSV:CallFuncService,
    private notiSV:NotificationsService,
    private dt:ChangeDetectorRef,
  )
  {
    this.user = this.auth.get();
  }
  
  ngOnInit(): void {
    if(this.function && this.function.functionID)
    {
      this.formModel = new FormModel();
      this.formModel.funcID = this.function.functionID;
      this.formModel.formName = this.function.formName;
      this.formModel.gridViewName = this.function.gridViewName;
      this.formModel.entityName = this.function.entityName;
    }
    this.getDataEmployee(this.employeeID);
  }


  ngAfterViewInit(): void {
  }


  // get personal and contact information
  getDataEmployee(employeeID:string){
    if(employeeID){
      this.api.execSv("HR","HR","EmployeesBusiness","GetPersonalAndContactAsync",[employeeID])
      .subscribe((res:any) => {
        if(res)
        {
          this.data = res;
          this.dt.detectChanges();
        }
      });
    }
  }

  //
  openPopupEdit(){
    var dataService = new CRUDService(this.injector);
    let request = new DataRequest(
      this.function?.formName,
      this.function?.gridViewName,
      this.function?.entityName
    );
    request.funcID = this.function?.functionID;
    dataService.service = 'HR';
    dataService.request = request;
    dataService.edit(this.data)
    .subscribe((res) => {
      let option = new SidebarModel();
      option.FormModel = this.formModel;
      option.Width = '850px';
      this.callFSV.openSide(
        CodxFormDynamicComponent,
        {
          formModel: option.FormModel,
          data: res,
          function: null,
          dataService: dataService,
          isView: false,
          titleMore: "Edit",
        },
        option
      ).closed.subscribe((res) => {
        if (res && res?.event && res?.event?.update) 
        {
          this.data = res.event.update.data;
          this.dt.detectChanges();
        }
        dataService.clear();
      });
    });
  }
}
