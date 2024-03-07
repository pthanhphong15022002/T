import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
import {
  BP_Processes_Steps_EventControl,
  BP_Processes_Steps_Reminder,
} from 'projects/codx-bp/src/lib/models/BP_Processes.model';

@Component({
  selector: 'lib-form-setting-advanced-tasks',
  templateUrl: './form-setting-advanced-tasks.component.html',
  styleUrls: ['./form-setting-advanced-tasks.component.scss'],
})
export class FormSettingAdvancedTasksComponent implements OnInit {
  dialog: any;
  title = 'Thiết lập nâng cao';
  tabInfos: any[] = [
    {
      icon: 'icon-notifications',
      text: 'Thông báo công việc',
      name: 'notifiTask',
    },
    {
      icon: 'icon-i-alarm-outline',
      text: 'Nhắc nhở quá hạn',
      name: 'reminderOver',
    },
  ];
  isAlert: boolean = false;
  isSendMail: boolean = false;
  dataReminder = new BP_Processes_Steps_Reminder();
  dataEventControl = new BP_Processes_Steps_EventControl();
  vllDurations = [];
  countTime = 1;
  checkValidate: boolean = true;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private notiSv: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    if (dt?.data?.dataReminder)
      this.dataReminder = JSON.parse(JSON.stringify(this.dataReminder));
    if (dt?.data?.dataEventControl)
      this.dataEventControl = JSON.parse(JSON.stringify(this.dataEventControl));
  }
  ngOnInit(): void {
    this.dataReminder.control = '0';
    this.countTime = this.vllDurations.length + 1;
  }

  changeRadio(e) {}

  valueChange(e) {
    if (e.field === 'reminder0' && e.component.checked === true) {
      this.dataReminder.control = '0';
    } else if (e.field === 'reminder1' && e.component.checked === true) {
      this.dataReminder.control = '1';
    } else if (e.field === 'reminder2' && e.component.checked === true) {
      this.dataReminder.control = '2';
    }
    this.detectorRef.detectChanges();
  }

  addNNewReminder() {
    var check = this.checkValidateTimes();
    if(check == false) return;
    var obj = {};
    obj['time'] = this.countTime;
    obj['duration'] = '';
    obj['alertType'] = '';
    this.vllDurations.push(obj);
    this.countTime++;
    this.checkValidate = false;
    this.detectorRef.detectChanges();
  }

  checkType(item, type) {
    let check = false;
    if (item) {
      check = item?.split(';').some((x) => x == type);
    }
    return check;
  }

  valueChangeAlertType(e, index) {
    if(index != -1){

    }
  }

  checkValidateTimes(){
    if (this.vllDurations.length > 0) {
      let check = this.vllDurations.findIndex(
        (x) => x.duration == '' && x.alertType == ''
      );
      if (check != -1) {
        this.notiSv.notifyCode(
          'Vui lòng nhập thời gian ở lần ' + this.vllDurations[check].time + ' đầy đủ'
        );
        this.checkValidate = false;
        return false;
      }else{
        this.checkValidate = true;
      }
    }
    return true;
  }

  onSave() {}
}
