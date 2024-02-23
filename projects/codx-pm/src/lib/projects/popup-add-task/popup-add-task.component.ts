import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild, ViewEncapsulation } from "@angular/core";
import { NotificationsService, AuthService, CacheService, AuthStore, DialogData, DialogRef, DialogModel, CallFuncService, ApiHttpService, RequestOption } from "codx-core";
import { CodxCommonService } from "projects/codx-common/src/lib/codx-common.service";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { L10n,setCulture } from '@syncfusion/ej2-base';
import { PopupSelectUserComponent } from "../popup-select-user/popup-select-user.component";
import { AttachmentComponent } from "projects/codx-common/src/lib/component/attachment/attachment.component";
import moment from "moment";
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
  grvSetup:any;
  defaultParams:any;


  constructor(
    injector: Injector,
    private notificationsService: NotificationsService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private authService: AuthService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private api: ApiHttpService,
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
      if(this.action!='add'){
        this.enableAttachment=true;
        this.enableChecklist=true;
        this.getTaskUpdate(this.data.recID);
      }
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
    });
    this.cacheService.gridViewSetup(this.formModel.formName,this.formModel.gridViewName).subscribe((res:any)=>{
      if(res){
        this.grvSetup=res;
      }
    })
    this.getParam();
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
          this.getListUser(res.event.join(';'));
          this.changeDetectorRef.detectChanges();
        }
      }
    })
  }

  attach(){
    this.enableAttachment = true;
    this.attachment && this.attachment.uploadFile();
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
      if(!this.isEditTodo){
        const newTask: any = {
          text: this.newTask,
          status: '1',
          taskID:this.data.recID
        };
        this.todoList.push(newTask);
        this.newTask = '';
      }
      else{
        this.todoSeleted.text = this.newTask;
        this.todoList[this.todoSelectedIndex]={...this.todoSeleted};
        this.newTask = '';
        this.todoSelectedIndex=undefined;
        this.todoSeleted=undefined;
        this.isEditTodo=false;

      }

    }
    setTimeout(()=>{input.focus()},500)
  }

  removeTask(task: any) {
    const taskIndex = this.todoList.indexOf(task);
    if (taskIndex !== -1) {
      this.todoList.splice(taskIndex, 1);
    }
  }

  isEditTodo:boolean=false;
  todoSeleted:any;
  todoSelectedIndex:any;
  editTodo(task:any,input:any){
    this.newTask = task.text;
    this.isEditTodo=true;
    this.todoSeleted=task;
    this.todoSelectedIndex = this.todoList.indexOf(task);
    if(input){
      input.focus();
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
      this.data[e.field]='1';
    }
    else{
      this.data[e.field]='0';
    }
  }

  save(){
    if(this.action == 'add'){
      this.data.status='10';
      this.data.category='3';
      this.data.projectID=this.projectData.projectID;
    }
    if(this.projectData.settings){
      let deadlineControl = this.projectData.settings.find((x:any)=> x.fieldName=="DeadlineControl");
      if(deadlineControl){
        switch (deadlineControl.fieldValue) {
          case '0':

            break;
          case '1':
            if(this.projectData.startDate && this.data.startDate){
             if(moment(this.projectData.startDate).isAfter(this.data.startDate)){
                this.notificationsService.notify('Thời gian bắt đầu phải nằm trong thời gian của dự án!','2');
                return;
             }
            }
            if(this.projectData.finishDate && this.data.endDate){
             if(moment(this.projectData.finishDate).isBefore(this.data.endDate)){
                this.notificationsService.notify('Thời gian kết thúc phải nằm trong thời gian của dự án!','2');
                return;
             }
            }
            break;
          case '2':

            break;


        }
      }
    }
    if(this.grvSetup['TaskName']?.isRequire && !this.data.taskName){
      this.notificationsService.notifyCode('TM027');
      return
    }
    // this.dialog.dataService
    //     .save((opt: RequestOption) => {
    //       opt.methodName = 'AddTaskAsync';
    //       opt.data = [
    //         this.data,
    //         this.funcID,
    //         this.members,
    //         this.todoList,
    //       ];
    //       return true;
    //     })
    //     .subscribe((res) => {
    //       this.attachment?.clearData();
    //       if (res && res.save) {
    //         this.dialog.close(res.save[0]);
    //       }
    //     });
    if(this.action=='add'){
      this.api
      .exec('TM', 'TaskBusiness', 'AddTaskAsync', [
        this.data,
        this.funcID,
        this.members,
        this.todoList,
      ])
      .subscribe((res: any) => {

        this.attachment?.clearData();
        this.dialog.close(res);
        if (res) {
          if(res.length){
            let item= res.find((x:any)=>x.category=='3');
            if(item){
              this.dialog.dataService.add(item, 0, false).subscribe()
            }
          }
          this.notificationsService.notifyCode('SYS006');
        } else this.notificationsService.notifyCode('SYS023');
      });
    }

  }


  getParam(callback = null) {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleWithCategoryAsync',
        ['TMParameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          //var dataValue = JSON.parse(res.dataValue);
          this.defaultParams = JSON.parse(res.dataValue);
        }
      });
  }

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

  oCountFooter:any;
  changeCountFooter(value: number, key: string) {
    if(this.oCountFooter){
      let oCountFooter = JSON.parse(JSON.stringify(this.oCountFooter));
      oCountFooter[key] = value;
      this.oCountFooter = JSON.parse(JSON.stringify(oCountFooter));
      this.changeDetectorRef.detectChanges();
    }

  }

  listUserDetail:any=[];
  crrRole:any='A';
  listUser:any=[]
  getListUser(listUser) {
    while (listUser.includes(' ')) {
      listUser = listUser.replace(' ', '');
    }
    var arrUser = listUser.split(';');
    var crrRole = this.crrRole;
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(listUser.split(';'))
      )
      .subscribe((res) => {
        if (res && res.length > 0) {
          this.listUserDetail = this.listUserDetail.concat(res);

          for (var i = 0; i < res.length; i++) {
            let emp = res[i];
            var taskResource:any={};
            taskResource.resourceID = emp?.userID;
            taskResource.resourceName = emp?.userName;
            taskResource.positionName = emp?.positionName;
            taskResource.departmentName = emp?.departmentName;
            taskResource.roleType = crrRole ?? 'R';
            //this.listTaskResources.push(taskResource);
          }
          if (arrUser.length != res.length) {
            arrUser = res.map((x) => x.userID);
          }
          this.listUser = this.listUser.concat(arrUser);
          this.data.assignTo = this.listUser.join(';');
        }
      });
  }
}
