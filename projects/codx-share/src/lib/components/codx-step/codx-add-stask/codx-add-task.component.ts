import {
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import {
  DP_Instances_Steps,
  DP_Instances_Steps_Tasks,
  DP_Instances_Steps_Tasks_Roles,
} from 'projects/codx-dp/src/lib/models/models';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';

@Component({
  selector: 'codx-add-stask',
  templateUrl: './codx-add-task.component.html',
  styleUrls: ['./codx-add-task.component.scss'],
})
export class CodxAddTaskComponent implements OnInit {
  @ViewChild('inputContainer', { static: false }) inputContainer: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  REQUIRE = ['taskName', 'endDate', 'startDate'];
  action = 'add';
  dialog!: DialogRef;
  title = '';
  taskType = '';
  isEditTimeDefault = false;
  vllShare = 'BP021';
  linkQuesiton = 'http://';
  listGroup = [];
  formModelMenu: FormModel;
  recIdEmail = '';
  isNewEmails = true;
  stepsTasks: DP_Instances_Steps_Tasks;
  listTask: DP_Instances_Steps_Tasks[] = [];
  step: DP_Instances_Steps;

  fieldsGroup = { text: 'taskGroupName', value: 'refID' };
  fieldsTask = { text: 'taskName', value: 'refID' };

  dataCombobox = [];
  valueInput = '';
  litsParentID = [];

  showLabelAttachment = false;
  isHaveFile = false;

  folderID = '';
  groupTaskID = null;
  view = [];
  isSaveTimeTask = true;
  isSaveTimeGroup = true;
  groupTask;
  
  isLoadDate = false;
  isTaskDefault = false;
  startDateParent: Date;
  endDateParent: Date;
  listCombobox = {
    U: 'Share_Users_Sgl',
    P: 'Share_Positions_Sgl',
    R: 'Share_UserRoles_Sgl',
    D: 'Share_Departments_Sgl',
    O: 'Share_OrgUnits_Sgl',
  };
  participant: DP_Instances_Steps_Tasks_Roles[] = [];
  owner: DP_Instances_Steps_Tasks_Roles[] = [];
  roles: DP_Instances_Steps_Tasks_Roles[] = [];
  user;
  
  constructor(
    private cache: CacheService,
    private callfunc: CallFuncService,
    private notiService: NotificationsService,
    private authStore: AuthStore,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.authStore.get();
    this.action = dt?.data?.action;
    this.title = dt?.data?.taskType?.text;
    this.taskType = dt?.data?.taskType?.value;
    this.step = dt?.data?.step;
    this.listGroup = dt?.data?.listGroup;
    this.listTask = dt?.data?.listTask;
    this.stepsTasks = dt?.data?.dataTask;
    this.isEditTimeDefault = dt?.data?.isEditTimeDefault;
    this.groupTaskID = dt?.data?.groupTaskID;
  }

  ngOnInit(): void {
    this.roles = this.stepsTasks['roles'] || [];
    this.startDateParent = new Date(this.step['startDate']);
    this.endDateParent = new Date(this.step['endDate']);
    if(!this.stepsTasks['taskGroupID']){
      this.stepsTasks['startDate'] = this.startDateParent;
    }
    this.getFormModel();
    if (this.stepsTasks['parentID']) {
      this.litsParentID = this.stepsTasks['parentID'].split(';');
    }
    this.owner = this.roles?.filter((role) => role.roleType === 'O');
    if(this.taskType == "M"){
      this.participant = this.roles?.filter((role) => role.roleType === 'P');
    }else{
      let role = new DP_Instances_Steps_Tasks_Roles();
      this.setRole(role);
      this.participant = [role]
    }
  }

  setRole<T>(role: T) {
    role['recID'] = Util.uid();
    role['objectName'] = this.user['userName'];
    role['objectID'] = this.user['userID'];
    role['createdOn'] = new Date();
    role['createdBy'] = this.user['userID'];
    role['roleType'] = 'P';
    return role;
  }

  getFormModel() {
    this.cache
      .gridViewSetup('DPInstancesStepsTasks', 'grvDPInstancesStepsTasks')
      .subscribe((res) => {
        for (let key in res) {
          if (res[key]['isRequire']) {
            let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
            this.view[keyConvert] = res[key]['headerText'];
          }
        }
      });
  }

  valueChangeText(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  valueChangeCombobox(event) {
    this.stepsTasks[event?.field] = event?.data;
  }

  filterText(event, key) {
    this.stepsTasks[key] = event;
    if(event){
      this.groupTask = this.listGroup.find((x) => x.refID === event);
      this.startDateParent = new Date(this.groupTask['startDate']);
      this.endDateParent = new Date(this.groupTask['endDate']);
      this.stepsTasks['startDate'] = this.startDateParent || new Date();
      this.stepsTasks['indexNo'] = this.groupTask?.task?.length + 1 || 1;
    }else{
      this.groupTask = this.listGroup.find((x) => x.recID === null);
      this.startDateParent = new Date(this.step['startDate']);
      this.endDateParent = new Date(this.step['endDate']);
      this.stepsTasks['startDate'] = this.startDateParent || new Date();
      this.stepsTasks['indexNo'] = this.groupTask?.task?.length + 1 || 1;
    }
  }
  valueChangeAlert(event) {
    this.stepsTasks[event?.field] = event?.data;
  }
  changeValueDate(event) {
    this.stepsTasks[event?.field] = new Date(event?.data?.fromDate);
    if(this.isLoadDate){
      this.isLoadDate = !this.isLoadDate;
      return;
    }
    const startDate =  new Date(this.stepsTasks['startDate']);
    const endDate = new Date(this.stepsTasks['endDate']);
   
    if (endDate && startDate > endDate){
      this.isSaveTimeTask = false;
      this.isLoadDate = !this.isLoadDate;
      this.notiService.notifyCode('DP019');
      this.stepsTasks['durationHour'] = 0;
      this.stepsTasks['durationDay'] = 0;
      return;
    } else {
      this.isSaveTimeTask = true;
    }

    if (endDate > this.endDateParent) {
      this.isSaveTimeGroup = false;
      this.isLoadDate = !this.isLoadDate;
      this.notiService.notifyCode('DP020');
      this.stepsTasks['durationHour'] = 0;
      this.stepsTasks['durationDay'] = 0;
      return;
    }else{
      this.isSaveTimeGroup = true;
    }
    
    if (new Date(startDate.toLocaleString()).getTime() < new Date(this.startDateParent.toLocaleString()).getTime()) {
      this.isSaveTimeGroup = false;
      this.isLoadDate = !this.isLoadDate;
      this.notiService.notifyCode('DP020');
      this.stepsTasks['durationHour'] = 0;
      this.stepsTasks['durationDay'] = 0;
      return;
    }else{
      this.isSaveTimeGroup = true;
    }
    if(this.stepsTasks['startDate'] && this.stepsTasks['endDate']){
      const endDate = new Date(this.stepsTasks['endDate']);
      const startDate = new Date(this.stepsTasks['startDate']);
      if(endDate >= startDate){
        const duration = endDate.getTime() - startDate.getTime();
        const time = Number((duration / 60 / 1000/ 60).toFixed(1));
        let days = 0;
        let hours = 0;
        if(time < 1){
           hours = time;
        }else{
          hours = Number((time % 24).toFixed(1));
          days = Math.floor(time / 24);
        }   
        this.stepsTasks['durationHour'] = hours;
        this.stepsTasks['durationDay'] = days;
      }
    }else{
      this.stepsTasks['durationHour'] = 0;
      this.stepsTasks['durationDay'] = 0;
    }
    this.isLoadDate = !this.isLoadDate;
  }

  changeRoler(e, datas, type) {    
    if (!e || e?.length == 0) return;
    let listUser = e || [];
    let listRole = [];
    listUser.forEach((element) => {
        listRole.push({
          objectID: element.objectID,
          objectName: element.objectName,
          objectType: element.objectType,
          roleType: type,
          taskID: this.stepsTasks['recID'],
        });
    });
    this.participant = listRole;
  }

  onDeleteOwner(objectID, data) {
    let index = data.findIndex((item) => item.objectID == objectID);
    if (index != -1) data.splice(index, 1);
  }

  async saveData() {
    this.stepsTasks['roles'] = [...this.participant,...this.owner];
    this.stepsTasks['parentID'] = this.litsParentID.join(';');
    let message = [];
    if(!this.isSaveTimeTask){
      this.notiService.notifyCode('DP019');
      return;
    }
    if(!this.isSaveTimeGroup){
      this.notiService.notifyCode('DP020');
      return;
    }
    for (let key of this.REQUIRE) {
      if (
        (typeof this.stepsTasks[key] === 'string' &&
          !this.stepsTasks[key].trim()) ||
        !this.stepsTasks[key] ||
        this.stepsTasks[key]?.length === 0
      ) {
        message.push(this.view[key]);
      }
    }
    if (!this.stepsTasks['durationDay'] && !this.stepsTasks['durationHour']) {
      message.push(this.view['durationDay']);
    }
    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
      return;
    } 

    if (this.attachment && this.attachment.fileUploadList.length) {
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        this.save(this.stepsTasks);
      });
    } else {
      this.save(this.stepsTasks);
    }
  }

  save(task){
    if(this.action == 'add' || this.action == 'copy'){
      this.addTask(task);
    }
    if(this.action == 'edit'){
      this.editTask(task);
    }
  }
  addTask(task){
    this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'AddTaskStepAsync',
      task
    ).subscribe(res => {
      if(res){        
        this.dialog.close({ task:res[0],progressGroup: res[1], progressStep: res[2] });
      }
    });
  }
  editTask(task){
    this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateTaskStepAsync',
      task
    ).subscribe(res => {
      if(res){        
        this.dialog.close({ task:res, progressGroup: null, progressStep: null });
      }
    });
  }

  handelMail() {
    let data = {
      dialog: this.dialog,
      formGroup: null,
      templateID: this.recIdEmail,
      showIsTemplate: true,
      showIsPublish: true,
      showSendLater: true,
      files: null,
      isAddNew: this.isNewEmails,
    };

    let popEmail = this.callfunc.openForm(
      CodxEmailComponent,
      '',
      800,
      screen.height,
      '',
      data
    );
    popEmail.closed.subscribe((res) => {
      if (res && res.event) {
        // this.processSteps['reference'] = res.event?.recID;
        this.recIdEmail = res.event?.recID ? res.event?.recID : '';
        this.isNewEmails = this.recIdEmail ? true : false;
      }
    });
  }
  addFile(evt: any) {
    this.attachment.uploadFile();
  }
  fileAdded(e) {}
  getfileCount(e) {
    if (e > 0 || e?.data?.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    this.showLabelAttachment = this.isHaveFile;
  }
  getfileDelete(event) {
    event.data.length;
  }
}
