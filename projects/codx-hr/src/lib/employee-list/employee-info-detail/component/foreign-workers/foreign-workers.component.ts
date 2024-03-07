import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { FormModel, ApiHttpService, CacheService, AuthStore, CallFuncService, NotificationsService } from 'codx-core';

@Component({
  selector: 'hr-foreign-workers',
  templateUrl: './foreign-workers.component.html',
  styleUrls: ['./foreign-workers.component.css']
})
export class ForeignWorkersComponent implements OnInit,AfterViewInit {

  @Input() function:any;
  @Input() employeeID:any;


  user:any;
  formModel:FormModel;
  userPermission:any;
  data:any;
  constructor
  (
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
    this.getData(this.employeeID);
  }
  ngAfterViewInit(): void {
  }

  // get data
  getData(employeeID:string){
    
  }

  //openPopupEdit()
  openPopupEdit(){
    
  }

}
