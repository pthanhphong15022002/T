import { Component, OnInit, Optional } from '@angular/core';
import {
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { log } from 'console';
import { DP_Instances_Steps_TaskGroups } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-popup-add-group-task',
  templateUrl: './popup-add-group-task.component.html',
  styleUrls: ['./popup-add-group-task.component.css'],
})
export class PopupAddGroupTaskComponent implements OnInit {
  dialog!: DialogRef;
  grvTaskGroupsForm: FormModel;
  taskGroup: DP_Instances_Steps_TaskGroups;
  view = {};
  REQUIRE = ['endDate', 'startDate', 'taskGroupName'];
  isSave = true;
  isEditTime = false;
  checkShow = false;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.taskGroup = dt?.data?.taskGroup;
    this.isEditTime = dt?.data?.isEditTime;
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
    this.checkShow = !this.checkShow;
    data[event?.field] = event?.data?.fromDate;
    if (
      this.taskGroup['startDate'] > this.taskGroup['endDate'] &&
      this.taskGroup['endDate']
    ) {
      this.isSave = false;
      this.notiService.notifyCode('DP019');
    } else {
      this.isSave = true;
    }
  }
  handleSave() {
    let message = [];
    for (let key of this.REQUIRE) {
      if((typeof this.taskGroup[key] === 'string' && !this.taskGroup[key].trim()) || !this.taskGroup[key]) {
        message.push(this.view[key]);
      }
    }
    if (!this.taskGroup['durationDay'] && !this.taskGroup['durationHour']) {
      message.push(this.view['durationDay']);
    }
    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
    } else if (!this.isSave) {
      this.notiService.notifyCode('DP019');
    } else {
      this.dialog.close(this.taskGroup);
    }
  }
}
