import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { FormModel, ApiHttpService, CacheService, AuthStore, CallFuncService, NotificationsService } from 'codx-core';

@Component({
  selector: 'hr-legal-info',
  templateUrl: './legal-info.component.html',
  styleUrls: ['./legal-info.component.css']
})
export class LegalInfoComponent implements OnInit,AfterViewInit{

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

  // get legal information
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

  //openPopupEdit()
  openPopupEdit(){
    
  }
}
