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
  entityName:string = 'TM_Tasks';
  approveControl:any;
  crrUser:any;

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
    this.crrUser = this.authStore.get();
    this.dialog = dialogRef;
    this.formModel = this.dialog?.formModel;
    this.funcID = this.formModel?.funcID;
    this.data = dialogData.data?.data;
    this.projectData = dialogData.data?.data;
    if(this.projectData.settings && this.projectData.settings.length){
      let approve = this.projectData.settings.find((x:any)=>x.fieldName=="ApproveControl");
      if(approve){
        this.approveControl = approve.fieldValue;
      }
    }
    this.cacheService.gridViewSetup(this.formModel.formName,this.formModel.gridViewName).subscribe((res:any)=>{
      if(res){
        this.grvSetup=res;
      }
    })
    if(this.data?.recID){
      this.title = this.data.taskName;
      this.getTaskUpdate(this.data.recID,true);
    }
  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }


  listUserDetail:any=[];
  members:any=[];
  todoList:any=[];
  executor:any;
  initComplete:boolean=false;
  getTaskUpdate(recID:any,isNotValidate:boolean=false){
    this.api.execSv('TM','ERM.Business.TM','TasksBusiness','GetTaskUpdateByRecIDAsync',[recID,isNotValidate]).subscribe((res:any)=>{
      if(res  && res.length==4){
        this.listUserDetail=res[1]
        this.members = res[3];
        if(this.members.length){
          this.executor = this.members.find(x=>x.roleType=="A");
          for(let i=0;i<this.members.length;i++){
            if(this.members[i].roleType)this.members[i].icon = this.listRoles.find((x:any)=>x.value==this.members[i].roleType)?.icon;
          }
        }
        this.todoList = res[2];
        this.updateStatusCheck();
        this.initComplete=true;
      }
    })
  }
  toggleCompleted(task:any){
    if(task.status == '10'){
      task.status='90';
    }
    else{
      task.status='10'
    }
    this.todoList = this.todoList.slice();
    this.changeDetectorRef.detectChanges();
  }
  showInprogress:boolean=false;
  showReport:boolean=false;
  showFinish:boolean=false;
  isSendReport:boolean=false;
  isFinish:boolean=false;
  isInProgress:boolean=false;
  userRole:any;
  updateStatusCheck(){
    this.userRole = this.members.find((x:any)=>x.resourceID == this.crrUser.userID)?.roleType;
    if(this.userRole){
      switch (this.userRole) {
        case 'A':
          this.showInprogress=true;
          if(this.approveControl=='1'){
            this.showReport =true;
            this.showFinish=false;
          }
          else{
            this.showReport=false;
            this.showFinish=true;
          }
          break;
        case 'R':
          this.showInprogress=false;
          this.showReport=false;
          this.showFinish=true;
        break;
        case 'I':
          this.showInprogress=false;
          this.showReport=false;
          this.showFinish=false;
        break;

      }
    }
    else{
          this.showInprogress=false;
          this.showReport=false;
          this.showFinish=false;
    }
  }

  checkStatusChange(e:any){
    switch (e.field) {
      case 'inProgress':
        this.isInProgress=e.data;
        if(this.isInProgress){
          this.isFinish=false;
          this.isSendReport=false;
        }
        break;

      case 'finish':
        this.isFinish=e.data;
        if(this.isFinish){
          this.isInProgress=false;
          this.isSendReport=false;
        }
        break;

      case 'report':
        this.isSendReport=e.data;
        if(this.isSendReport){
          this.isInProgress=false;
          this.isFinish=false;
        }
        break;

    }
  }

  commentTyped(e: any, key: string) {
    let isCheckChangeStatus=false;
    if(this.isInProgress || this.isSendReport || this.isInProgress) isCheckChangeStatus = true;
    if(e.comment){
      if(!this.checkEditPermission()) return;
      let status="00";
      let hours="8";
      if(this.isInProgress) status="20";
      if(this.isFinish) status ="90";
      if(this.data && this.data.status !="90"){
        if(this.todoList?.length){

          if(this.todoList.filter((x:any)=>x.status=='90').length == this.todoList.length){
            let dialogConfirm =  this.notificationsService.alert('PMT001','Danh sách công việc cần làm đã hoàn tất, bạn có muốn hoàn tất công việc này?',null,'6');
            dialogConfirm.closed.subscribe((res:any)=>{
            if(res.event.status=='Y'){
              status = '90';
            }
            this.updateTaskStatus(this.data.recID,status,e.comment);
            })
          }
          else{
            isCheckChangeStatus &&  this.updateTaskStatus(this.data.recID,status,e.comment);
          }
        }
        else{
          isCheckChangeStatus && this.updateTaskStatus(this.data.recID,status,e.comment);
        }

      }
    }

  }
  updateTaskStatus(recID:any, status:any,comment:any){
    let hours="8";
    this.api.execSv("TM","ERM.Business.TM","TasksBusiness","GetTaskAsync",recID).subscribe((res:any)=>{
      if(res){
        this.api.execSv<any>(
          'TM',
          'TM',
          'TasksBusiness',
          'SetStatusTaskAsync',
          [this.funcID, res.taskID, status, new Date, hours, comment]
        ).subscribe((result) => {
          if (result && result.length > 0) {
            this.data.status=status;
            this.dialog.close(this.data);
            this.notificationsService.notifyCode('TM009');
          } else {
            //this.dialog.close();
            this.notificationsService.notifyCode('TM008');
          }
        });
      }
    })
  }
  checkEditPermission(){
    if(this.data){
      if(this.crrUser.administrator || this.crrUser.functionAdmin || this.crrUser.systemAdmin) return true;
      if(this.crrUser.userID == this.data.createdBy) return true;
      if(this.members.find((x:any)=>x.roleType=='A' && x.resourceID==this.crrUser.userID)) return true;
      return false;
    }
    else{
      return false;
    }
  }
  closeForm(){
    if(this.dialog) this.dialog.close()
  }
}
