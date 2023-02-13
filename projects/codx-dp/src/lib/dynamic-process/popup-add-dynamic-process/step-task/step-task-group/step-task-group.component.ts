import { change } from '@syncfusion/ej2-grids';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { Component, OnInit, Optional } from '@angular/core';
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
  constructor(
    private notiService: NotificationsService,
    private cache: CacheService,
    private callfc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.taskGroup = dt?.data;
  }

  ngOnInit(): void {
    this.getFormModel();

    this.setTime();
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
        });
    });
  }

  changeUser(e) {
    this.taskGroup['roles'] = e;
  }

  changeValueInput(event, data) {
    data[event?.field] = event?.data;
    // this.hours = data['durationHour'];
    // this.days = data['durationDay'];
    // clearInterval(this.clear);
    // this.setTime();
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
    if (message.length > 0) {
      this.notiService.notifyCode('SYS009', 0, message.join(', '));
    } else {
      this.dialog.close(this.taskGroup);
      clearInterval(this.clear);
    }
  }

  close() {
    this.dialog.close();
    clearInterval(this.clear);
  }

  shareUser(share) {
    this.callfc.openForm(share, '', 500, 500);
  }

  setTime() {
    if (this.taskGroup?.createdOn) {
      let date = new Date(this.taskGroup?.createdOn);
      date.setHours(date.getHours() + this.taskGroup?.durationHour);
      date.setDate(date.getDate() + this.taskGroup?.durationDay);
      let countDownDate = date.getTime();
      this.clear = setInterval(function () {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
        this.hours = (
          (distance % (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60)
        ).toFixed(2);
        document.getElementById('countdown').innerHTML =
          this.days + ' ngày ' + this.hours + ' giờ ';
        if (distance < 0) {
          clearInterval(this.clear);
        }
      }, 1000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.clear);
  }
}
