import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
  ) {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    
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
      if(res){
       this.listActivitie = res;
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
    return { 'background-color': color?.color };
  }

  getRole(task, type) {
    let role =
      task?.roles.find((role) => role.roleType == 'O') || task?.roles[0];
    return type == 'ID' ? role?.objectID : role?.objectName;
  }

  async chooseTypeTask() {
    setTimeout(async () => {
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
    }, 0);
  }
  async addTask() {
    let task = new DP_Instances_Steps_Tasks();
    task['progress'] = 0;
    task['refID'] = Util.uid();
    task['isTaskDefault'] = false;

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
