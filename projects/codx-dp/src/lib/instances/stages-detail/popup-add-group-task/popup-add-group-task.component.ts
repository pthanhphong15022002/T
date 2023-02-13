import { Component, OnInit, Optional } from '@angular/core';
import { CacheService, DialogData, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { log } from 'console';
import { DP_Instances_Steps_TaskGroups } from '../../../models/models';

@Component({
  selector: 'lib-popup-add-group-task',
  templateUrl: './popup-add-group-task.component.html',
  styleUrls: ['./popup-add-group-task.component.css']
})
export class PopupAddGroupTaskComponent implements OnInit {
  dialog!: DialogRef;
  grvTaskGroupsForm: FormModel;
  taskGroup: DP_Instances_Steps_TaskGroups;
  view = {};
  REQUIRE = ['memo','endDate','startDate','taskGroupName','reminders'];
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { 
   this.dialog = dialog;
   this.taskGroup = dt?.data;
   this.grvTaskGroupsForm = {
    entityName: 'DP_Instances_Steps_TaskGroups',
    formName: 'DPInstancesStepsTaskGroups',
    gridViewName: 'grvDPInstancesStepsTaskGroups',
  };
  }

  ngOnInit(): void {   
    this.getFormModel();
  }

  getFormModel() {
    this.cache.gridView('grvDPInstancesStepsTaskGroups').subscribe((res) => {
      this.cache
        .gridViewSetup('DPInstancesStepsTaskGroups', 'grvDPInstancesStepsTaskGroups')
        .subscribe((res) => {   
          this.grvTaskGroupsForm = {
            entityName: 'DP_Instances_Steps_TaskGroups',
            formName: 'DPInstancesStepsTaskGroups',
            gridViewName: 'grvDPInstancesStepsTaskGroups',
          };
          for(let key in res) {
            if(res[key]['isRequire']){  
              let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);         
              this.view[keyConvert] = res[key]['headerText'];
            }
          }   
        });
    });
  }

  changeValueInput(event, data) {
    data[event?.field] = event?.data;
  }
  changeValueDate(event, data) {
    data[event?.field] = event?.data?.fromDate;
  }
  handleSave(){
    let message = [];
    for(let key of this.REQUIRE){
      if(!this.taskGroup[key]){
        message.push(this.view[key]);
      }
    }
    if(message.length > 0){
      this.notiService.notifyCode(
        'SYS009',
        0,
         message.join(', ')
      );
    }else{
      this.dialog.close(this.taskGroup);
    }
  }
}
