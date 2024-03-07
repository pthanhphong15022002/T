import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild, ViewEncapsulation } from "@angular/core";
import { NotificationsService, AuthService, CacheService, AuthStore, DialogData, DialogRef, DialogModel, CallFuncService, ApiHttpService, RequestOption, SidebarModel, Util } from "codx-core";
import { CodxCommonService } from "projects/codx-common/src/lib/codx-common.service";
import { CodxShareService } from "projects/codx-share/src/public-api";
import { L10n,setCulture } from '@syncfusion/ej2-base';
import { PopupSelectUserComponent } from "../popup-select-user/popup-select-user.component";
import { AttachmentComponent } from "projects/codx-common/src/lib/component/attachment/attachment.component";
import moment from "moment";
import { PopupAddMemoComponent } from "../popup-add-memo/popup-add-memo.component";
import { CodxHistoryComponent } from "projects/codx-share/src/lib/components/codx-history/codx-history.component";
@Component({
  selector: 'popup-add-task',
  templateUrl: './popup-add-task.component.html',
  styleUrls: ['./popup-add-task.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupAddTaskComponent implements OnInit, AfterViewInit{

  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('history') history: CodxHistoryComponent;

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
  validEditStatus:any=['00','07','09','10','20'];
  crrUser:any;
  parentTask:any;
  isAssign:boolean=false;
  enableEdit:boolean=true;
  viewTree:any;
  approveControl:any;

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
    this.funcID = this.formModel?.functionID;
    this.data = dialogData.data[0];

    this.crrUser = this.authStore.get();
    if(dialogData.data[1]){
      this.action = dialogData.data[1];
      if(this.action!='add'){
        this.enableAttachment=true;
        this.enableChecklist=true;
        this.getTaskUpdate(this.data.recID);
      }
      if(this.action=="view"){
        this.enableEdit=false;
        this.title ='Thông tin công việc'
      }
      if(this.action == 'edit'){
        this.title = 'Chỉnh sửa công việc'
      }
    }
    if(this.data.parentID && this.action=='add') this.isAssign=true;
    if(this.data.parentID){
      this.api.execSv('TM','ERM.Business.TM','TasksBusiness','GetTaskByRecIDAsync',this.data.parentID).subscribe((res:any)=>{
        if(res){
          this.parentTask = res;
        }
      })
    }
    if(dialogData.data[2]){
      this.projectData = dialogData.data[2];
      if(this.projectData.settings){
        let memberType = this.projectData.settings.find((x:any)=> x.fieldName=="MemberType");
        if(memberType){
          this.projectMemberType = memberType.fieldValue;
        }
        if(this.projectData.settings.find((x:any)=>x.fieldName=='ApproveControl')){
          this.data.approveControl = this.projectData.settings.find((x:any)=>x.fieldName=='ApproveControl').fieldValue;
          this.approveControl = this.projectData.settings.find((x:any)=>x.fieldName=='ApproveControl').fieldValue;
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
    if(dialogData.data[3]){
      this.viewTree =dialogData.data[3]
    }
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
    if(!this.enableEdit) return;
    let option = new DialogModel;
    option.zIndex=9999;
    let dialog = this.callfc.openForm(PopupSelectUserComponent,'',500,600,'',{projectData:this.projectData,projectMemberType:this.projectMemberType, roleType: this.selectedRole ? this.selectedRole : 'A',listRoles:this.listRoles},'',option);
    dialog.closed.subscribe((res:any)=>{
      if(res.event){
        if(this.projectMemberType == '1'){
          for(let i=0;i<res.event.length;i++){
            let member:any={};
           let item =  this.projectData.permissions.find((x:any)=>x.objectID==res.event[i])
           if(item){
            let roleType = 'A';
            member.resourceID=item.objectID;
            member.resourceName=item.objectName;
            if(this.selectedRole){
             roleType = this.selectedRole;

            }
            member.roleType = roleType;
            member.icon = this.listRoles.find((x:any)=>x.value==roleType)?.icon;
            let idx=this.members.findIndex((x:any)=>x.resourceID==member.resourceID);
            if(idx==-1){
              this.members.push(member);
              this.data.assignTo= this.members.map((x:any)=> x.resourceID).join(';')
            }
            else{
              if(this.members[idx].roleType != member.roleType){
                this.members[idx]=member
              }
            }

           }
          }
          this.getListUser(this.members.map((x:any)=>x.resourceID).join(';'));
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
  addTask(input:any,cancel:boolean=false) {
    if(!this.enableEdit) return;
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
      if(!cancel){
        setTimeout(()=>{input.focus()},500)
      }
    }

  deletedTodo:any=[]
  removeTask(task: any) {
    const taskIndex = this.todoList.indexOf(task);
    if (taskIndex !== -1) {
      this.todoList.splice(taskIndex, 1);
      if(task.recID) this.deletedTodo.push(task.recID);
    }
  }

  isEditTodo:boolean=false;
  todoSeleted:any;
  todoSelectedIndex:any;
  editTodo(task:any,input:any){
    if(!this.enableEdit) return;
    this.newTask = task.text;
    this.isEditTodo=true;
    this.todoSeleted=task;
    this.todoSelectedIndex = this.todoList.indexOf(task);
    if(input){
      input.focus();
    }
  }

  toggleCompleted(task:any){
    if(!this.enableEdit) return;
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
    if(!this.enableEdit) return;
    if(e.data){
      this.data[e.field]='1';
    }
    else{
      this.data[e.field]='0';
    }
  }

  async save(){
    if(!this.enableEdit) return;
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
            if(this.parentTask){
              if(this.parentTask.startDate &&  this.data.startDate ){
                if(moment(this.parentTask.startDate).isAfter(this.data.startDate)){
                  this.notificationsService.notify('Thời gian bắt đầu phải nằm trong thời gian của công việc cha!','2');
                  return;
               }
              }
              if(this.parentTask.endDate && this.data.endDate){
                if(moment(this.parentTask.endDate).isBefore(this.data.endDate)){
                  this.notificationsService.notify('Thời gian kết thúc phải nằm trong thời gian của công việc cha!','2');
                  return;
               }
              }
            }
            break;


        }
      }
    }
    if(this.grvSetup['TaskName']?.isRequire && !this.data.taskName){
      this.notificationsService.notifyCode('TM027');
      return
    }

    if(this.members?.length && this.members.findIndex((x:any)=>x.roleType =='A')==-1){
      this.notificationsService.notify("Phải có người thực hiện công việc!",'2');
      return
    }

    if (this.attachment && this.attachment.fileUploadList.length)
    (await this.attachment.saveFilesObservable()).subscribe((res) => {
      if (res) {
        let attachments = Array.isArray(res) ? res.length : 1;
        if (this.action == 'edit') {
          this.data.attachments += attachments;
          //this.checkUpdateStatusTask();
           this.updateTask();
        } else {
          this.data.attachments = attachments;
          this.createTask();
        }
      }
    });
  else {
    if (this.action == 'edit') {
      //this.checkUpdateStatusTask();
      this.updateTask();
    } else{
      this.createTask();
    }
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
        this.checkAllowedEdit();
        this.updateStatusCheck();
      }
    })
  }

  oCountFooter:any;
  commentTyped(value: number, key: string) {
    if(this.history) this.history.refresh();
    debugger
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
    //var crrRole = this.crrRole;
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

          // for (var i = 0; i < res.length; i++) {
          //   let emp = res[i];
          //   var taskResource:any={};
          //   taskResource.resourceID = emp?.userID;
          //   taskResource.resourceName = emp?.userName;
          //   taskResource.positionName = emp?.positionName;
          //   taskResource.departmentName = emp?.departmentName;
          //   taskResource.roleType = crrRole ?? 'R';
          //   //this.listTaskResources.push(taskResource);
          // }
          if (arrUser.length != res.length) {
            arrUser = res.map((x) => x.userID);
          }
          this.listUser = arrUser;
          this.data.assignTo = this.listUser.join(';');
          this.selectedRole=undefined;
        }
      });
  }

  assignTask(){
    this.dialog.close('assignTask');
    // let _dialog = this.dialog;
    // setTimeout(()=>{
    //   _dialog.dataService.addNew().subscribe((res) => {
    //     let option = new SidebarModel();
    //     option.DataService = _dialog?.dataService;
    //     option.FormModel = this.formModel;
    //     option.Width = '550px';
    //     option.zIndex=9998;
    //     res.parentID = this.data.recID;
    //     res.projectID = this.data.projectID;
    //     let dialogAdd = this.callfc.openSide(
    //       PopupAddTaskComponent,
    //       [res,'add',this.projectData],
    //       option
    //     );
    //     dialogAdd.closed.subscribe((returnData) => {
    //       if (returnData?.event) {
    //         //this.view?.dataService?.update(returnData?.event);
    //       } else {
    //         _dialog.dataService.clear();
    //       }
    //     });

    //   })
    // },500)


  }

  createTask(){
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

        if (res) {
          if(res.length){
            let item= res.find((x:any)=>x.category=='3');
            if(item){

              this.dialog.dataService.add(item, 0, false).subscribe();
              this.dialog.close(item);
            }
          }
          this.notificationsService.notifyCode('SYS006');
        } else this.notificationsService.notifyCode('SYS023');
      });
    }

  }

  updateTask(){
    if(this.action=='edit'){
      this.data.assignTo = this.members.map((x:any)=>x.resourceID).join(';');
      if(this.todoList?.length){
        if(this.todoList.filter((x:any)=>x.status=='90').length == this.todoList.length){
         let abc =  this.notificationsService.alert('PMT001','hehehe',null,'6');
         abc.closed.subscribe((res:any)=>{
          if(res.event.status=='Y'){
            this.data.status = '90';
          }
          else this.data.status='20';
         this.api
            .exec('TM', 'TasksBusiness', 'UpdateTaskAsync', [
              this.data,
              this.funcID,
              this.members,
              this.todoList,
              this.deletedMembers,
              this.deletedTodo.length ? this.deletedTodo.join(';') : null
            ])
            .subscribe((res: any) => {
              this.dialog.dataService.update(this.data, 0, false).subscribe();
              this.dialog.close(this.data);

            });
         })
            // debugger;

        }
        else{
          this.data.status='20';
          this.api
            .exec('TM', 'TasksBusiness', 'UpdateTaskAsync', [
              this.data,
              this.funcID,
              this.members,
              this.todoList,
              this.deletedMembers,
              this.deletedTodo.length ? this.deletedTodo.join(';') : null
            ])
            .subscribe((res: any) => {
              this.dialog.dataService.update(this.data, 0, false).subscribe();
              this.dialog.close(this.data);

            });
        }
      }

    }
  }

  selectRoseType(value) {
    if(this.memberID){
      let member = this.members.find((x:any)=>x.resourceID == this.memberID)
      if(member){
        if(value == 'A' && member.roleType !='A' && this.members.some((x:any)=>x.roleType=='A')){
          this.notificationsService.notifyCode('TM078');
          this.popover.close();
        return;
        }
        if(member.roleType == value) return;
        member.roleType=value;
        member.icon = this.listRoles.find((x:any)=>x.value==value)?.icon
        this.members = this.members.slice();
        this.popover.close();
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  popover:any;
  memberID:any
  showPopover(p, userID) {
    this.memberID =userID;
    if (this.popover) this.popover.close();
    p.open();
    this.popover = p;
  }

  selectedRole:any;
  openControlShare(selectedRole:any){
    this.selectedRole = selectedRole;
    this.selectUser();
  }


  checkAllowedEdit(){
    if(this.action=='add'){
      this.enableEdit=true;
      return
    }
    if(this.action=='view'){
      this.enableEdit=false;
      return
    }
    if(!this.crrUser){
      this.enableEdit = false;
      return;
    }
    if(this.data){
      if(this.validEditStatus.indexOf(this.data.status)==-1){
        this.enableEdit = false;
        return;
      }
      if(this.data.createdBy == this.crrUser.userID && this.action=='edit'){
        this.enableEdit = true;
        return;
      }
      if(this.members.length){
        let userRole = this.members.find((x:any)=>x.resourceID==this.crrUser.userID);
        if(userRole && userRole.roleType=='A' && this.action=='edit'){
          this.enableEdit=true;
        }
        else this.enableEdit = false;
      }
    }
  }

  deletedMembers:any=[];
  removeMember(e:any){
    if(e){
      let item = this.members.find((x:any)=>x.resourceID == e.resourceID);
      if(item) this.deletedMembers.push(item);
      this.deletedMembers = this.getUniqueListBy(this.deletedMembers,'resourceID');
      this.members = this.members.filter((x:any)=>x.resourceID != e.resourceID);
      this.getListUser(this.members.map((x:any)=>x.resourceID).join(';'));
      this.changeDetectorRef.detectChanges();
    }
  }

  extendMemo(memo){
    let option = new DialogModel;
    option.zIndex=9999;
    let dialog = this.callfc.openForm(PopupAddMemoComponent,'',800,600,'',{data:memo},'',option);
    dialog.closed.subscribe((res:any)=>{
      if(res.event){
        this.data.memo = res.event;
      }
    })
  }

  isHtmlContent(memo:any){
    if(!memo) return false;
    return /<\/?[a-z][\s\S]*>/i.test(memo)
  }

  getUniqueListBy(arr: any, key: any) {
    return [
      ...new Map(arr.map((item: any) => [item[key], item])).values(),
    ] as any;
  }

  checkAssignPermission(){
    if(this.data){
      if(this.crrUser.administrator || this.crrUser.functionAdmin || this.crrUser.systemAdmin) return true;
      if(this.crrUser.userID == this.data.createdBy) return true;
      if(this.members.length && this.members.find((x:any)=>x.roleType=='A' && x.resourceID==this.crrUser.userID)) return true;
      return false;
    }
    else{
      return false;
    }
  }

  checkEditPermission(){
    if(this.data){
      if(this.crrUser.administrator || this.crrUser.functionAdmin || this.crrUser.systemAdmin) return true;
      if(this.crrUser.userID == this.data.createdBy) return true;
      if(this.projectData &&
         this.projectData.settings.length &&
         this.projectData.settings.find((x:any)=>x.fieldName=='EditControlControl')?.fieldValue == 1 &&
         this.members.find((x:any)=>x.roleType=='A' && x.resourceID==this.crrUser.userID)) return true;
      return false;
    }
    else{
      return false;
    }
  }

  onCbxDataAdded(e:any){

    if(e && this.viewTree){
      this.viewTree?.treeView?.setNodeTree(e);
    }
  }

  showInprogress:boolean=false;
  showReport:boolean=false;
  showFinish:boolean=false;
  updateStatusCheck(){
    let userRole = this.members.find((x:any)=>x.resourceID == this.crrUser.userID)?.roleType;
    if(userRole){
      switch (userRole) {
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
}
