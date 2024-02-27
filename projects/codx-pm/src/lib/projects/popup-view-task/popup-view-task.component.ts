import { Component, ViewEncapsulation, OnInit, AfterViewInit, ChangeDetectorRef, Injector, Optional } from "@angular/core";
import { NotificationsService, AuthService, CacheService, AuthStore, ApiHttpService, CallFuncService, DialogData, DialogRef } from "codx-core";


@Component({
  selector: 'popup-view-task',
  templateUrl: './popup-view-task.component.html',
  styleUrls: ['./popup-view-task.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupViewTaskComponent implements OnInit, AfterViewInit{

  formModel:any;
  title:string='Thông tin công việc';
  dialog:any;
  data:any;
  funcID:any;
  projectData:any;
  listRoles:any=[];
  grvSetup:any;

  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private api: ApiHttpService,
    protected callfc: CallFuncService,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.cacheService.valueList('PM013').subscribe((res:any)=>{
      if(res && res.datas){
        this.listRoles = res.datas
      }
    });

    this.dialog = dialogRef;
    this.formModel = this.dialog?.formModel;
    this.funcID = this.formModel?.funcID;
    this.data = dialogData.data?.data;
    this.projectData = dialogData.data?.data;
    this.cacheService.gridViewSetup(this.formModel.formName,this.formModel.gridViewName).subscribe((res:any)=>{
      if(res){
        this.grvSetup=res;
      }
    })
    if(this.data?.recID){
      this.getTaskUpdate(this.data.recID);
    }
  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }


  listUserDetail:any=[];
  members:any=[];
  todoList:any=[];
  getTaskUpdate(recID:any){
    this.api.execSv('TM','ERM.Business.TM','TaskBusiness','GetTaskUpdateByRecIDAsync',recID).subscribe((res:any)=>{
      if(res  && res.length==4){
        this.listUserDetail=res[1]
        this.members = res[3];
        if(this.members.length){
          for(let i=0;i<this.members.length;i++){
            if(this.members[i].roleType)this.members[i].icon = this.listRoles.find((x:any)=>x.value==this.members[i].roleType)?.icon;
          }
        }
        this.todoList = res[2];
      }
    })
  }

}
