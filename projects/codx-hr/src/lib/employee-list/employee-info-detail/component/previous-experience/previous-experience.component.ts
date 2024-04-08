import { AfterViewInit, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { FormModel, ApiHttpService, CacheService, AuthStore, CallFuncService, NotificationsService, SidebarModel, CRUDService, CodxFormDynamicComponent } from 'codx-core';

@Component({
  selector: 'lib-previous-experience',
  templateUrl: './previous-experience.component.html',
  styleUrls: ['./previous-experience.component.css']
})
export class PreviousExperienceComponent implements OnInit,AfterViewInit {

  @Input() function:any;
  @Input() employeeID:any;


  user:any;
  formModel:FormModel;
  CRUDService:CRUDService;
  userPermission:any;
  data:any;
  lstExperiences:any=[];
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
    if(this.function && this.function?.functionID)
    {
      this.formModel = new FormModel();
      this.formModel.funcID = this.function.functionID;
      this.formModel.formName = this.function.formName;
      this.formModel.gridViewName = this.function.gridViewName;
      this.formModel.entityName = this.function.entityName;
      this.CRUDService = new CRUDService(this.injector);
      this.CRUDService.service = "HR";
      this.CRUDService.request.entityName = this.formModel.entityName;
      this.CRUDService.request.entityPermission = this.formModel.entityPer;
      this.CRUDService.request.formName = this.formModel.formName;
      this.CRUDService.gridView = this.formModel.gridViewName;
    }
    
    this.getData(this.employeeID);
  }

  ngAfterViewInit(): void {
  }

  // get data
  getData(employeeID:string){
    if(employeeID)
    {
      this.api.execSv("HR","HR","EExperiencesBusiness_Old","GetByEmployeeIDAsync",[employeeID])
      .subscribe((res:any) => {
        if(res && res.length > 0)
        {
          this.lstExperiences = res;
          this.dt.detectChanges();
        }
      });
    }
  }

  //openPopupEdit()
  openPopupEdit(){
    
  }

  clickMF(event, item){
    if(event && item)
    {
      switch(event.functionID)
      {
        case"SYS01": // add
          this.add();
        break;
        case"SYS02": // delete
          this.delete();
        break;
        case"SYS03": // edit
          this.edit();
        break;
      }
    }
  }

  add(){
    if(this.CRUDService){
      let option = new SidebarModel();
      option.FormModel = this.formModel;
      option.DataService = this.CRUDService;
      this.CRUDService.addNew().subscribe((model:any) => {
        if(model)
        {
          this.callFSV.openSide
          (
            CodxFormDynamicComponent,
            {
              formModel: option.FormModel,
              data: model,
              function: null,
              dataService: option.DataService,
              headerText: 'Thêm Kinh nghiệm',
            },
            option
          )
        }
      });
      
    }
  }
  edit(){

  }
  delete(){

  }
}
