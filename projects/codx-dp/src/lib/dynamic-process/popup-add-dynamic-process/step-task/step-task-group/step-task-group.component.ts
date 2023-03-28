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
  formModel: FormModel;
  taskGroup: DP_Steps_TaskGroups;
  view = {};
  REQUIRE = ['taskGroupName'];
  days = 0;
  hours = 0;
  minutes = 0;
  type: string;
  timeOld = 0;
  differenceTime = 0;
  step;
  maxTimeGroup = 0;
  isSave = true;
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
    this.formModel = dt?.data?.form;
  }

  ngOnInit(): void {
    this.getFormModel();
    this.type = this.taskGroup['recID'] ? 'edit' : 'add';
    this.hours = Number(this.differenceTime) % 24;
    this.days = Math.floor(this.differenceTime / 24);
    this.timeOld = this.getHour(this.taskGroup);
    if (this.type == 'edit' && this.taskGroup['task']?.length > 0) {
      this.taskGroup['task'].forEach((element) => {
        let time = this.calculateTimeTaskInGroup(
          this.taskGroup['task'],
          element['recID']
        );
        this.maxTimeGroup = Math.max(this.maxTimeGroup, time);
      });
    }
  }

  getFormModel() {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((res) => {
        for (let key in res) {
          if (res[key]['isRequire']) {
            let keyConvert = key.charAt(0).toLowerCase() + key.slice(1);
            this.view[keyConvert] = res[key]['headerText'];
          }
        }
      });
  }

  changeUser(e) {
    let roles = e?.map(role => {
      return {...role, roleType:'P'}
    })
    this.taskGroup['roles'] = roles || [];
  }

  changeValueNumber(event) {
    if (event?.field === 'durationHour' && event?.data >= 24) {
      this.taskGroup['durationDay'] =
        Number(this.taskGroup['durationDay']) + Math.floor(event?.data / 24);
      this.taskGroup['durationHour'] = Math.floor(event?.data % 24);
    } else {
      this.taskGroup[event?.field] = event?.data || 0;
    }

    let time =
      event?.field === 'durationDay'
        ? Number(event?.data) * 24 + this.taskGroup['durationHour']
        : Number(this.taskGroup['durationDay']) * 24 + Number(event?.data);
    this[event?.field] = event?.data;

    if (time < this.maxTimeGroup) {
      this.isSave = false;
      this.notiService.notifyCode('DP012');
    } else {
      this.isSave = true;
    }
  }

  changeValueInput(event, data) {
    data[event?.field] = event?.data;
  }

  changeValueDate(event, data) {
    data[event?.field] = event?.data?.fromDate;
  }

  shareUser(share) {
    this.callfc.openForm(share, '', 500, 500);
  }

  close() {
    this.dialog.close();
  }

  getHour(data) {
    let hour =
      Number(data['durationDay'] || 0) * 24 + Number(data['durationHour'] || 0);
    return hour;
  }

  calculateTimeTaskInGroup(taskList, taskId) {
    let task = taskList.find((t) => t['recID'] === taskId);
    if (!task) return 0;
    if (task['dependRule'] != '1' || !task['parentID']?.trim()) {
      return this.getHour(task);
    } else {
      const parentIds = task.parentID.split(';');
      let maxTime = 0;
      parentIds?.forEach((parentId) => {
        const parentTime = this.calculateTimeTaskInGroup(taskList, parentId);
        maxTime = Math.max(maxTime, parentTime);
      });
      const completionTime = this.getHour(task) + maxTime;
      return completionTime;
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
      this.notiService.notifyCode('DP012');
    } else {
      let difference = this.getHour(this.taskGroup) - this.timeOld;
      if (difference > 0 && difference > this.differenceTime) {
        this.notiService.alertCode('DP010').subscribe((x) => {
          if (x.event && x.event.status == 'Y') {
            let timeStep =
              this.getHour(this.step) + (difference - this.differenceTime);
            this.step['durationDay'] = Math.floor(timeStep / 24);
            this.step['durationHour'] = timeStep % 24;
            this.dialog.close(this.taskGroup);
          }
        });
      } else {
        this.dialog.close(this.taskGroup);
      }
    }
  }
}
