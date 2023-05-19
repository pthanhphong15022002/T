import { Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { DP_Instances_Steps_TaskGroups, DP_Instances_Steps_TaskGroups_Roles } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'codx-add-group-task',
  templateUrl: './codx-add-group-task.component.html',
  styleUrls: ['./codx-add-group-task.component.scss'],
})
export class CodxAddGroupTaskComponent implements OnInit {
  dialog!: DialogRef;
  grvTaskGroupsForm: FormModel;
  taskGroup: DP_Instances_Steps_TaskGroups;
  view = {};
  REQUIRE = ['endDate', 'startDate', 'taskGroupName'];
  isSave = true;
  isEditTime = false;
  checkShow = false;
  action = '';
  user;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.taskGroup = dt?.data?.dataGroup;
    this.isEditTime = dt?.data?.isEditTime;
    this.action = dt?.data?.action;
    this.user = this.authStore.get();
    this.grvTaskGroupsForm = {
      entityName: 'DP_Instances_Steps_TaskGroups',
      formName: 'DPInstancesStepsTaskGroups',
      gridViewName: 'grvDPInstancesStepsTaskGroups',
    };
  }

  ngOnInit(): void {
    this.getFormModel();
    let role = new DP_Instances_Steps_TaskGroups_Roles();
    this.setRole(role);
    if(this.action == 'add' || this.action == 'copy'){
      this.taskGroup['roles'] = [role];
    }
  }

  setRole<T>(role: T) {
    role['recID'] = Util.uid();
    role['objectName'] = this.user['userName'];
    role['objectID'] = this.user['userID'];
    role['createdOn'] = new Date();
    role['createdBy'] = this.user['userID'];
    role['roleType'] = 'O';
    return role;
  }

  getFormModel() {
    this.cache.gridView('grvDPInstancesStepsTaskGroups').subscribe((res) => {
      this.cache
        .gridViewSetup(
          'DPInstancesStepsTaskGroups',
          'grvDPInstancesStepsTaskGroups'
        )
        .subscribe((res) => {
          this.grvTaskGroupsForm = {
            entityName: 'DP_Instances_Steps_TaskGroups',
            formName: 'DPInstancesStepsTaskGroups',
            gridViewName: 'grvDPInstancesStepsTaskGroups',
          };
          for (let key in res) {
            if (res[key]['isRequire']) {
              let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
              this.view[keyConvert] = res[key]['headerText'];
            }
          }
        });
    });
  }

  changeValueInput(event, data) {
    if (event?.field === 'endDate') {
    }
    data[event?.field] = event?.data;
  }

  changeValueDate(event, data) {
    if(this.checkShow){
      this.checkShow = !this.checkShow;
      return
    }
    data[event?.field] = event?.data?.fromDate;
    if (
      this.taskGroup['startDate'] > this.taskGroup['endDate'] &&
      this.taskGroup['endDate']
    ) {
      this.isSave = false;
      this.checkShow = !this.checkShow;
      this.notiService.notifyCode('DP019');
      this.taskGroup['durationHour'] = 0;
      this.taskGroup['durationDay'] = 0;
      return;
    } else {
      this.isSave = true;
    }
    if(this.taskGroup['startDate'] && this.taskGroup['endDate']){
      const endDate = new Date(this.taskGroup['endDate']);
      const startDate = new Date(this.taskGroup['startDate']);
      if(endDate >= startDate){
        const duration = endDate.getTime() - startDate.getTime();
        const time = Number((duration / 60 / 1000/ 60).toFixed(1));
        let days = 0;
        let hours = 0;
        if(time < 1){
           hours = time;
        }else{
          hours = time % 24;
          days = Math.floor(time / 24);
        }   
        this.taskGroup['durationHour'] = hours;
        this.taskGroup['durationDay'] = days;
      }
    }
  }

  handleSave() {
    let message = [];
    for (let key of this.REQUIRE) {
      if((typeof this.taskGroup[key] === 'string' && !this.taskGroup[key].trim()) || !this.taskGroup[key]) {
        message.push(this.view[key]);
      }
    }
    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
    } else if (!this.isSave) {
      this.notiService.notifyCode('DP019');
    } else {
      if(this.action == 'add'){
        this.addGroupTask();
      }
      if(this.action == 'edit'){
        this.editGroupTask();
      }
      if(this.action == 'copy'){
        this.copyGroupTask();
      }
    }
  }
  
  addGroupTask(){
    this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'AddGroupTaskStepAsync',
      this.taskGroup
    ).subscribe(res => {
      if(res){        
        this.dialog.close({ groupTask:res[0],progressStep: res[1]});
      }
    });
  }

  editGroupTask(){
    this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'UpdateGroupTaskStepAsync',
      this.taskGroup
    ).subscribe(res => {
      if(res){        
        this.dialog.close({ groupTask:res,progressStep: null});
      }
    });
  }
  copyGroupTask(){
    this.api.exec<any>(
      'DP',
      'InstanceStepsBusiness',
      'copyGroupTaskStepAsync',
      this.taskGroup
    ).subscribe(res => {
      if(res){        
        this.dialog.close({ groupTask:res[0],listTask: res[1], progressStep: res[2]});
      }
    });
  }
}
