import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { Component, OnInit, Optional } from '@angular/core';
import { CacheService, CallFuncService, DialogData, DialogRef, FormModel, NotificationsService } from 'codx-core';
import { DP_Steps_TaskGroups } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-step-task-group',
  templateUrl: './step-task-group.component.html',
  styleUrls: ['./step-task-group.component.css']
})
export class StepTaskGroupComponent implements OnInit {
    dialog!: DialogRef;
    grvTaskGroupsForm: FormModel;
    taskGroup: DP_Steps_TaskGroups;
    view = {};
    REQUIRE = ['memo','endDate','startDate','taskGroupName','reminders'];
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private callfc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.taskGroup = dt?.data;
    this.grvTaskGroupsForm = {
      entityName: 'DP_Steps_TaskGroups',
      formName: 'DPStepsTaskGroups',
      gridViewName: 'grvDPStepsTaskGroups',
   };
   }

  ngOnInit(): void {
    this.getFormModel();
  }

  getFormModel() {
    this.cache.gridView('grvDPStepsTaskGroups').subscribe((res) => {
      this.cache
        .gridViewSetup('DPStepsTaskGroups', 'grvDPStepsTaskGroups')
        .subscribe((res) => {   
          this.grvTaskGroupsForm = {
            entityName: 'DP_Steps_TaskGroups',
            formName: 'DPStepsTaskGroups',
            gridViewName: 'grvDPStepsTaskGroups',
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

  savePopupGroupJob(){
    
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
  shareUser(share) {
    this.callfc.openForm(share, '', 500, 500);
  }

}
