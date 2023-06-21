import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, FormModel, NotificationsService, SidebarModel, Util } from 'codx-core';
import { DP_Activities, DP_Activities_Roles, DP_Instances_Steps_Tasks } from 'projects/codx-dp/src/lib/models/models';
import { CodxAddTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-add-stask/codx-add-task.component';
import { CodxTypeTaskComponent } from 'projects/codx-share/src/lib/components/codx-step/codx-type-task/codx-type-task.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit , AfterViewInit, OnChanges{
  @Input() customerID: string;
  activitie: DP_Activities = new DP_Activities();
  listActivitie: DP_Activities[] = [];
  taskType;
  dateFomat = 'dd/MM/yyyy';
  dateTimeFomat = 'HH:mm - dd/MM/yyyy';
  listTaskType = [];
  grvMoreFunction: FormModel;
  isNoData = false;
  titleAction = '';

  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
  ) {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.customerID){
      this.getActivities();
    }
  }

  async ngOnInit(): Promise<void> {
    this.grvMoreFunction = await this.getFormModel('DPT040102');
    this.cache.valueList('DP004').subscribe((res) => {
      if (res.datas) {
        this.listTaskType = res?.datas;
      }
    });
  }

  ngAfterViewInit(): void {
    
  }

  getActivities(): void {
    this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'GetActivitiesAsync',
      [this.customerID]
    ).subscribe(res =>{
      if(res?.length > 0){
       this.listActivitie = res;
      }else{
        this.isNoData = true;
      }
    })   
  }

  async getFormModel(functionID) {
    let f = await firstValueFrom(this.cache.functionList(functionID));
    let formModel = {};
    formModel['formName'] = f?.formName;
    formModel['gridViewName'] = f?.gridViewName;
    formModel['entityName'] = f?.entityName;
    formModel['funcID'] = functionID;
    return formModel;
  }

  getIconTask(task) {
    let color = this.listTaskType?.find((x) => x.value === task.taskType);
    return color?.icon;
  }

  getColor(task) {
    let color = this.listTaskType?.find((x) => x.value === task.taskType);
    return { 'color': color?.color };
  }

  getRole(task, type) {
    let role =
      task?.roles.find((role) => role.roleType == 'O') || task?.roles[0];
    return type == 'ID' ? role?.objectID : role?.objectName;
  }

  async changeDataMFTask(event, task) {
    if (event != null) {
      event.forEach((res) => {
        switch (res.functionID) {
          case 'SYS02': //xóa
            break;
          case 'SYS03': //sửa           
            break;
          case 'SYS04': //copy
            break;
          case 'SYS003': //đính kèm file         
            break;
          case 'DP20': // tiến độ
            break;
          case 'DP13': //giao việc
            if (
              !(task?.createTask)
            ) {
              res.isblur = true;
            }
            break;
          case 'DP12':
            res.disabled = true;
            break;
          case 'DP08':
            res.disabled = true;
            break;
          //tajo cuoc hop
          case 'DP24':
            if (task.taskType != 'M') res.disabled = true;
            break;
          case 'DP25':
          case 'DP20':
          case 'DP26':
          case 'SYS003':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
            res.disabled = true;
            break;
          case 'DP27': // đặt xe
            if (task.taskType != 'B') 
            res.disabled = true;
            break;
        }
      });
    }
  }

  clickMFTask(e: any, task?: any) {
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS02':
        this.deleteTask(task);
        break;
      case 'SYS03': //edit
        this.editTask(task);
        break;
      case 'SYS04': //copy
        this.copyTask(task);
        // this.addTask(groupTask);
        break;
      // case 'DP07': // view
      //   this.viewTask(task, task?.taskType || 'T');
      //   break;
      // case 'DP13': //giao viec
      //   this.assignTask(e.data, task);
      //   break;
      // case 'DP20': // tien do
      //   this.openPopupUpdateProgress(task, 'T');
      //   break;
      // case 'DP24': // tạo lịch họp
      //   this.createMeeting(task);
      //   break;
      // case 'SYS004':
      //   this.sendMail();
      //   break;
      // case 'DP27':
      //   this.addBookingCar();
      //   break;
    }
  }
  deleteTask(task){
    if(!task?.recID){
      return;
    }
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.api.exec<any>(
          'DP',
          'InstanceStepsBusiness',
          'DeleteActivitiesAsync',
          [task?.recID]
        ).subscribe(res =>{
          if(res){
            let index = this.listActivitie?.findIndex(activitie => activitie.recID == task.recID);
            this.listActivitie?.splice(index,1);
            this.notiService.notifyCode('SYS008');
            this.detectorRef.detectChanges();
          }
        })   
      }
    });
  }

  copyTask(task){

  }

  editTask(task){

  }

  async chooseTypeTask() {
      let popupTypeTask = this.callFunc.openForm(
        CodxTypeTaskComponent,
        '',
        450,
        580,
        '',
        {isShowGroup: false},
      );
      let dataOutput = await firstValueFrom(popupTypeTask.closed);
      if (dataOutput?.event?.value) {
        this.taskType = dataOutput?.event;
        this.addTask();
      }
  }
  async addTask() {
    let task = new DP_Instances_Steps_Tasks();
    task['progress'] = 0;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;
    task['taskType'] = this.taskType?.value;

    let taskOutput = await this.openPopupTask('add', task);
    if (taskOutput?.event) {
      let data = taskOutput?.event;
      this.copyData(data, this.activitie);
      let rolesTask = data?.roles;
      let roles: DP_Activities_Roles[] = [];
      if(rolesTask?.length > 0){
        rolesTask.forEach(element => {
          let role = new DP_Activities_Roles;
          this.copyData(element, role);
          roles.push(role);
        });
      } 
      this.activitie.roles = roles;   
      this.activitie.objectID = this.customerID;  
    }
    this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'AddActivitiesAsync',
      [this.activitie]
    ).subscribe(res =>{
      if(res){
       this.listActivitie.push(res);
      }
    })   
  }

  copyData(datacopy,data){
    if(datacopy && data){
      for(let key in datacopy){
        data[key] = datacopy[key];
      }
    }
  }

  async openPopupTask(action, dataTask, groupTaskID = null) {
    let dataInput = {
      action,
      taskType: this.taskType,
      step: null,
      listGroup: null,
      dataTask: dataTask || {},
      listTask: null,
      isEditTimeDefault: null,
      groupTaskID, // trường hợp chọn thêm từ nhóm
      isSave: false
    };
    let frmModel: FormModel = {
      entityName: 'DP_Instances_Steps_Tasks',
      formName: 'DPInstancesStepsTasks',
      gridViewName: 'grvDPInstancesStepsTasks',
    };
    let option = new SidebarModel();
    option.Width = '550px';
    option.zIndex = 1011;
    option.FormModel = frmModel;
    let popupTask = this.callFunc.openSide(
      CodxAddTaskComponent,
      dataInput,
      option
    );
    let dataPopupOutput = await firstValueFrom(popupTask.closed);
    return dataPopupOutput;
  }
}
