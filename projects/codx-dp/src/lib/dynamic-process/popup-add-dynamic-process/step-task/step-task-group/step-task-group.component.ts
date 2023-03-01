import { change } from '@syncfusion/ej2-grids';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import {
  CacheService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { DP_Steps_TaskGroups } from 'projects/codx-dp/src/lib/models/models';

@Component({
  selector: 'lib-step-task-group',
  templateUrl: './step-task-group.component.html',
  styleUrls: ['./step-task-group.component.css'],
})
export class StepTaskGroupComponent implements OnInit {
  dialog!: DialogRef;
  grvTaskGroupsForm: FormModel;
  taskGroup: DP_Steps_TaskGroups;
  view = {};
  REQUIRE = ['taskGroupName'];
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  clear: any;
  type: string;
  timeOld = 0;
  differenceTime = 0;
  step;
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private callfc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.taskGroup = dt?.data?.taskGroup;
    this.differenceTime = dt?.data?.differenceTime;
    this.step = dt?.data?.step;
    this.grvTaskGroupsForm = {
      entityName: 'DP_Steps_TaskGroups',
      formName: 'DPStepsTaskGroups',
      gridViewName: 'grvDPStepsTaskGroups',
    };
  }

  ngOnInit(): void {
    this.getFormModel();
    this.type = this.taskGroup['recID'] ? 'edit' : 'add'
    this.hours = Number(this.differenceTime)%24;
    this.days = Math.floor(this.differenceTime / 24);
    this.timeOld = this.getHour(this.taskGroup);
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
          for (let key in res) {
            if (res[key]['isRequire']) {
              let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
              this.view[keyConvert] = res[key]['headerText'];
            }
          }
          console.log(res);
        });
    });
  }

  changeUser(e) {
    this.taskGroup['roles'] = e;
  }

  changeValueInput(event, data) {
    if (event?.field === 'durationHour' && event?.data >= 24) {
      this.taskGroup['durationDay'] =
        Number(this.taskGroup['durationDay']) + Math.floor(event?.data / 24);
      this.taskGroup['durationHour'] = Math.floor(event?.data % 24);
    } else {
      data[event?.field] = event?.data;
    }
  }
  changeValueDate(event, data) {
    data[event?.field] = event?.data?.fromDate;
  }

  handleSave() {
    let message = [];
    for (let key of this.REQUIRE) {
      if (!this.taskGroup[key]) {
        message.push(this.view[key]);
      }
    }
    if (!this.taskGroup['durationDay'] && !this.taskGroup['durationHour']) {
      message.push(this.view['durationDay']);
    }
    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
    } else {
      let difference = this.getHour(this.taskGroup) - this.timeOld;
      if(difference > 0 && difference > this.differenceTime){
        this.notiService.alertCode("DP010").subscribe((x) => {
          if (x.event && x.event.status == 'Y') {
            // this.step['durationDay'] = Math.floor(maxtime / 24);
            // this.step['durationHour'] = maxtime % 24;
            this.dialog.close(this.taskGroup);
          }
        });
      }
    }
  }

  close() {
    this.dialog.close();
  }
  shareUser(share) {
    this.callfc.openForm(share, '', 500, 500);
  }

  getHour(data) {
    let hour =
      Number(data['durationDay'] || 0) * 24 + Number(data['durationHour'] || 0);
    return hour;
  }

}
