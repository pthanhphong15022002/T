import { firstValueFrom } from 'rxjs';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ApiHttpService,
  CodxInputComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import {
  BP_Processes_EventControl,
  BP_Processes_Steps_Reminder,
} from 'projects/codx-bp/src/lib/models/BP_Processes.model';
import { ContentEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/content-email/content-email.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-form-setting-advanced-tasks',
  templateUrl: './form-setting-advanced-tasks.component.html',
  styleUrls: ['./form-setting-advanced-tasks.component.scss'],
})
export class FormSettingAdvancedTasksComponent implements OnInit {
  @ViewChild('mailControl') mailControl: ContentEmailComponent;
  @ViewChild('mailReminder') mailReminder: ContentEmailComponent;
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
  dataEventControl = new BP_Processes_EventControl();
  vllDurations = [];
  countTime = 1;
  checkValidate: boolean = false;
  templateID = 'BP001';
  templateIDReminder = 'BP001';
  dataMail: any = {};
  dialogETemplate: FormGroup;
  lstTo = [];
  lstReminderTo = [];
  lstFrom = [];
  lstCc = [];
  lstBcc = [];
  controlCurrent = '0';
  formModelMail: FormModel;
  loaded: boolean;
  dataEmail: any;
  dataEmailReminder: any;
  data: any;
  isAddControl: boolean = true;
  loadMail: boolean = false;
  isAddReminder: boolean = true;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private notiSv: NotificationsService,
    private codxService: CodxShareService,
    private api: ApiHttpService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    if (dt?.data?.dataReminder)
      this.dataReminder = JSON.parse(JSON.stringify(dt?.data?.dataReminder));
    if (dt?.data?.dataEventControl)
      this.dataEventControl = JSON.parse(
        JSON.stringify(dt?.data?.dataEventControl)
      );
  }
  ngOnInit(): void {
    this.formModelMail = new FormModel();
    this.formModelMail.entityName = 'AD_EmailTemplates';
    this.formModelMail.formName = 'EmailTemplates';
    this.formModelMail.gridViewName = 'grvEmailTemplates';
    this.dataReminder.control = this.dataReminder?.control ?? '0';
    this.dataReminder.type = this.dataReminder.type ?? '1';
    this.controlCurrent = this.dataReminder.control;
    if (
      this.dataReminder?.times != null &&
      this.dataReminder?.times?.trim() != ''
    ) {
      this.vllDurations = JSON.parse(this.dataReminder.times);
      if(this.vllDurations?.length > 0){
        let mailID = this.vllDurations.filter(x => x.email != null && x.email?.trim() != '');
        if(mailID?.length > 0){
          this.templateIDReminder = mailID[0]?.email;
          this.isAddReminder = false;
        }
      }
      this.countTime = this.vllDurations.length + 1;
    }

    if (this.dataEventControl && this.dataEventControl?.startEmail) {
      let startEmail = JSON.parse(this.dataEventControl?.startEmail);
      let alertType = startEmail['alertType'];
      this.isAlert = alertType?.split(';')?.some((x) => x == '1') ?? false;
      this.isSendMail = alertType?.split(';')?.some((x) => x == '2') ?? false;
      this.templateID = startEmail?.email;
      this.isAddControl =
        this.templateID != null && this.templateID?.trim() != '' ? false : true;
    }

    let id = this.templateID.concat(';', this.templateIDReminder);
    if (this.isAddControl) {
      this.dataEmail = {
        recID: Util.uid(),
        category: '2',
        templateName: this.data?.stepName,
        message: ''
      };
    }
    if (this.isAddReminder) {
      this.dataEmailReminder = {
        recID: Util.uid(),
        category: '2',
        templateName: this.data?.stepName,
        message: ''
      };
    }
    this.loadMail = false;
    this.api
      .execSv<any[]>(
        'BG',
        'BG',
        'EmailsBusiness',
        'GetListItemByRecIDLogicAsync',
        id
      )
      .subscribe((item) => {
        if (item?.length > 0) {
          this.dataEmail = item.find((x) => x.recID == this.templateID) ? item.find((x) => x.recID == this.templateID) : this.dataEmail;
          this.dataEmailReminder = item.find(
            (x) => x.recID == this.templateIDReminder
          ) ? item.find(
            (x) => x.recID == this.templateIDReminder
          ) : this.dataEmailReminder;

          if (this.dataEmail.sendTo && this.dataEmail.sendTo.length > 0) {
            this.lstTo = this.dataEmail?.sendTo || [];
          }
          if (
            this.dataEmailReminder?.sendTo &&
            this.dataEmailReminder.sendTo.length > 0
          ) {
            this.lstReminderTo = this.dataEmailReminder?.sendTo || [];
          }
          if (this.isAddReminder) {
            this.dataEmailReminder.recID = Util.uid();
          }
          if (this.isAddControl) {
            this.dataEmail.recID = Util.uid();
          }
        }
        this.loadMail = true;
      });
  }

  changeRadio(e) {
    if (e?.field) {
      this[e?.field] = e?.data ?? false;
    }
  }

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

  valueChangeAuto(e) {
    this.dataReminder.autoComplete = e?.data;
    this.detectorRef.detectChanges();
  }

  addNNewReminder() {
    // this.checkValidate = this.checkValidateTimes(false);
    // if (this.checkValidate == false) {
    //   return;
    // }
    var obj = {};
    obj['time'] = this.countTime;
    obj['duration'] = '';
    obj['alertType'] = '';
    obj['email'] = '';
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
    if (index != -1) {
      let data = this.vllDurations[index];
      let alertTypes =
        data?.alertType?.trim() != '' && data.alertType != null
          ? data.alertType?.split(';')
          : [];
      switch (e?.field) {
        case 'duration':
          data.duration = e?.data;
          break;
        case 'noti':
          let indexTypeNoti = alertTypes?.findIndex((x) => x == '1');
          if (indexTypeNoti != -1) {
            if (!e?.data) {
              alertTypes.splice(indexTypeNoti, 1);
            }
          } else {
            if (e?.data) alertTypes.push('1');
          }
          break;
        case 'alertMail':
          let indexTypeMail = alertTypes?.findIndex((x) => x == '2');
          if (indexTypeMail != -1) {
            if (!e?.data) {
              alertTypes.splice(indexTypeMail, 1);
            }
          } else {
            if (e?.data) alertTypes.push('2');
          }
          break;
        default:
          break;
      }
      let alert = data?.alertType ?? '';
      if (alertTypes?.length > 0) {
        alertTypes.forEach((ele) => {
          if (ele?.trim() != '' && ele != null) {
            if (alert != '') {
              if (!alert.split(';').some((x) => x == ele)) {
                alert = alert + ';' + ele;
              }
            } else {
              alert = ele;
            }
          }
        });
      }
      data.alertType = alert;
      this.vllDurations[index] = data;
      this.checkValidate = this.checkValidateTimes(false);
    } else {
      var obj = {};
      obj['time'] = this.countTime;
      let alertType = '';
      let duration = '';
      if (typeof e?.data == 'string') {
        if (e?.field == 'duration') duration = e?.data;
      } else {
        switch (e?.field) {
          case 'noti':
            alertType = e?.data ? '1' : '';
            break;
          case 'alertMail':
            alertType = e?.data ? '2' : '';
            break;
        }
      }
      obj['duration'] = duration;
      obj['alertType'] = alertType;
      obj['email'] = '';
      this.vllDurations.push(obj);
      this.checkValidate = this.checkValidateTimes(false);
      this.countTime++;
    }
    this.detectorRef.detectChanges();
  }

  checkValidateTimes(showNoti = true) {
    if (this.vllDurations.length > 0) {
      let check = this.vllDurations.findIndex((x) => x.duration == '');
      if (check != -1) {
        if (showNoti)
          this.notiSv.notifyCode(
            'Vui lòng nhập thời gian ở lần ' +
              this.vllDurations[check].time +
              ' đầy đủ'
          );
        return false;
      }
    }
    return true;
  }

  deleteValues(index) {
    if (index != -1) {
      this.vllDurations.splice(index, 1);
      this.countTime--;
      if (this.vllDurations?.length > 0) {
        for (let i = 0; i < this.vllDurations?.length; i++) {
          this.vllDurations[i].time = i + 1;
        }
      }
      this.checkValidate = this.checkValidateTimes(false);
      this.detectorRef.detectChanges();
    }
  }

  async onSave() {
    if (this.mailControl) {
      this.dataEmail = this.mailControl.data;
      let lstSendTo = [
        ...this.mailControl.lstTo,
        ...this.mailControl.lstCc,
        ...this.lstBcc,
      ];
      this.dataEmail.sendTo = lstSendTo;

      if (this.isAddControl) {
        this.addMail(this.dataEmail);
      } else {
        this.updateMail(this.dataEmail);
      }
    }

    if (this.dataReminder?.control == '0') {
      this.dataReminder.times = '';
      this.dataReminder.autoComplete = '';
    }
    if (this.dataReminder?.control == '1') {
      if (this.mailReminder) {
        this.dataEmailReminder = this.mailReminder.data;
        let lstSend = [
          ...this.mailReminder.lstTo,
          ...this.mailReminder.lstCc,
          ...this.lstBcc,
        ];
        this.dataEmailReminder.sendTo = lstSend;
      }
      if (this.vllDurations?.length > 0) {
        if (this.isAddReminder) {
          this.addMail(this.dataEmailReminder);
        } else {
          this.updateMail(this.dataEmailReminder);
        }

        this.vllDurations.forEach((ele) => {
          ele.email = this.dataEmailReminder?.recID;
        });

        this.dataReminder.times =
          this.vllDurations?.length > 0
            ? JSON.stringify(this.vllDurations)
            : '';
      }

      this.dataReminder.autoComplete = '';
    }

    if (this.dataReminder?.control == '2') {
      this.dataReminder.times = '';
    }

    let alertType = '';
    if (this.isAlert) {
      alertType = '1';
    }
    if (this.isSendMail) {
      if (alertType != '') {
        alertType += ';2';
      } else {
        alertType = '2';
      }
    }

    let objControl = {
      alertType: alertType,
      email: this.dataEmail?.recID,
    };
    this.dataEventControl.startEmail = JSON.stringify(objControl);
    let jsonReminder = JSON.stringify(this.dataReminder);
    this.dialog.close([jsonReminder, this.dataEventControl]);
  }

  addMail(data) {
    this.api.execSv('BG', 'BG', 'EmailsBusiness', 'SaveAsync', data).subscribe();
  }

  updateMail(data) {
    this.api.execSv('BG', 'BG', 'EmailsBusiness', 'UpdateMailSettingAsync', data).subscribe();
  }
}
