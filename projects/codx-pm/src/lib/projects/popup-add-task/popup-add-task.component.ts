import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild, ViewEncapsulation } from "@angular/core";
import { NotificationsService, AuthService, CacheService, AuthStore, DialogData, DialogRef, DialogModel, CallFuncService } from "codx-core";
import { CodxCommonService } from "projects/codx-common/src/lib/codx-common.service";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { L10n,setCulture } from '@syncfusion/ej2-base';
import { PopupSelectUserComponent } from "../popup-select-user/popup-select-user.component";
import { AttachmentComponent } from "projects/codx-common/src/lib/component/attachment/attachment.component";
@Component({
  selector: 'popup-add-task',
  templateUrl: './popup-add-task.component.html',
  styleUrls: ['./popup-add-task.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupAddTaskComponent implements OnInit, AfterViewInit{

  @ViewChild('attachment') attachment: AttachmentComponent;

  entityName:string = 'TM_Tasks';
  action:string='add';
  formModel:any;
  title:string='Thêm mới công việc';
  dialog:any;
  data:any;
  funcID:string;
  projectData:any;
  projectMemberType:any;
  fields: any ={ text: 'objectName', value: 'objectID' }
  listRoles:any=[];
  members:any=[];
  enableAttachment:boolean=false;
  enableChecklist:boolean=false;


  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    protected callfc: CallFuncService,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialog = dialogRef;
    this.formModel = this.dialog?.formModel;
    this.funcID = this.formModel?.funcID;
    this.data = dialogData.data[0];
    if(dialogData.data[1]){
      this.action = dialogData.data[1];
    }
    if(dialogData.data[2]){
      this.projectData = dialogData.data[2];
      if(this.projectData.settings){
        let memberType = this.projectData.settings.find((x:any)=> x.fieldName=="MemberType");
        if(memberType){
          this.projectMemberType = memberType.fieldValue;
        }
      }
    }
    this.cacheService.valueList('PM013').subscribe((res:any)=>{
      if(res && res.datas){
        this.listRoles = res.datas
      }
    })
  }
  ngOnInit(): void {
    L10n.load({
      'vi': {
      'multi-select': {
              'noRecordsTemplate': "Không có dữ liệu",
              'actionFailureTemplate': "Thất bại",
              'overflowCountTemplate': "+${count}",
              'totalCountTemplate': "${count} được chọn",
              'selectAllText': "Chọn tất cả",
          }
      }
  });
  }
  ngAfterViewInit(): void {

  }

  valueChange(e:any){
    this.data[e.field]=e.data;
  }
  valueDateChange(e:any){
    this.data[e.field]=e.data.fromDate;
  }

  selectUser(){
    let option = new DialogModel;
    option.zIndex=9999;
    let dialog = this.callfc.openForm(PopupSelectUserComponent,'',500,600,'',{projectData:this.projectData,projectMemberType:this.projectMemberType},'',option);
    dialog.closed.subscribe((res:any)=>{
      if(res.event){
        if(this.projectMemberType == '1'){
          for(let i=0;i<res.event.length;i++){
            let member:any={};
           let item =  this.projectData.permissions.find((x:any)=>x.objectID==res.event[i])
           if(item){
            member.resourceID=item.objectID;
            member.resourceName=item.objectName;
            member.roleType = 'A';
            member.icon = this.listRoles.find((x:any)=>x.value=='A')?.icon;
            this.members.push(member);
           }
          }
          this.changeDetectorRef.detectChanges();
        }
      }
    })
  }

  attach(){
    this.enableAttachment = true;
    this.attachment.uploadFile();
  }

  fileAdded(e) {
    console.log(e);
  }

  getfileCount(e) {
    // if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    // else this.isHaveFile = false;
    // this.showLabelAttachment = this.isHaveFile;
  }

  checklist(){
    this.enableChecklist=true;
  }

  newTask:any;
  todoList:any=[]
  addTask(input:any) {
    if (this.newTask.trim() !== '') {
      const newTask: any = {
        memo: this.newTask,
        status: '1',
        taskID:this.data.recID
      };
      this.todoList.push(newTask);
      this.newTask = '';
    }
    setTimeout(()=>{input.focus()},500)
  }

  removeTask(task: any) {
    const taskIndex = this.todoList.indexOf(task);
    if (taskIndex !== -1) {
      this.todoList.splice(taskIndex, 1);
    }
  }

  toggleCompleted(task:any){
    if(task.status == '1'){
      task.status='90';
    }
    else{
      task.status='1'
    }
    this.todoList = this.todoList.slice();
    this.changeDetectorRef.detectChanges();
  }

  checkboxChange(e:any){
    if(e.data){
      this.data[e.field]='90';
    }
    else{
      this.data[e.field]='90';
    }
  }

  save(){
    if(this.action == 'add'){
      this.data.status='10';
      this.data.category='3';
      this.data.projectID=this.projectData.projectID;
    }
    debugger
  }

}
