import { Component, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Alert } from 'bootstrap';
import { DialogData, DialogRef, FormModel } from 'codx-core';
import { elementAt } from 'rxjs';
import { CodxEsService } from '../../../codx-es.service';

@Component({
  selector: 'lib-popup-add-email-template',
  templateUrl: './popup-add-email-template.component.html',
  styleUrls: ['./popup-add-email-template.component.scss'],
})
export class PopupAddEmailTemplateComponent implements OnInit {
  headerText: string = 'Thiết lập Email';
  subHeaderText: string = '';
  dialog: DialogRef;
  formModel: FormModel;
  date: any;
  email: any;
  dialogETemplate: FormGroup;
  isAfterRender = false;
  showIsTemplate = true;
  showIsPublish = true;
  showSendLater = true;
  showCC = false;
  showBCC = false;

  sendType = 'to';
  lstFrom = [];
  lstTo = [];
  lstCc = [];
  lstBcc = [];

  constructor(
    private esService: CodxEsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.email = data?.data.dialogEmail;
    this.showIsPublish = data.data?.showIsPublish;
    this.showIsTemplate = data.data?.showIsTemplate;
    this.showSendLater = data.data.showSendLater;
  }

  initForm() {
    this.esService
      .getFormGroup('EmailTemplates', 'grvEmailTemplates')
      .then((res) => {
        if (res) {
          this.dialogETemplate = res;
          this.isAfterRender = true;
          this.esService
            .getEmailTemplate(this.email.TemplateID)
            .subscribe((res1) => {
              if (res1 != null) {
                this.dialogETemplate.patchValue(res1[0]);
                console.log('data', this.dialogETemplate);
              }
            });
        }
      });
  }

  ngOnInit(): void {
    this.initForm();
  }

  onSaveForm() {
    let lstSento = [
      ...this.lstFrom,
      ...this.lstTo,
      ...this.lstCc,
      ...this.lstBcc,
    ];
    console.log(lstSento);

    this.esService
      .addEmailTemplate(this.dialogETemplate.value, lstSento)
      .subscribe((res) => {
        console.log(res);
      });
  }

  valueChange(event) {
    if (event?.field && event.component && event.data) {
      if (event.field == 'sendTime') {
        this.dialogETemplate.patchValue({
          [event['field']]: event.data.fromDate,
        });
      } else if (event.data instanceof Object) {
        this.dialogETemplate.patchValue({
          [event['field']]: event.data,
        });
      } else {
        this.dialogETemplate.patchValue({ [event['field']]: event.data });
      }
    }
  }

  valueSentoChange(event, sendType) {
    if (event?.field && event.component && event.data) {
      switch (event.field) {
        case 'from':
          event.data?.forEach((element) => {
            let index = this.lstFrom.findIndex((p) => p.objectID == element.id);

            if (this.lstFrom.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objectID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstFrom.push(item);
            }
          });
          console.log(this.lstFrom);

          break;
        case 'to':
          event.data?.forEach((element) => {
            let index = this.lstTo.findIndex((p) => p.objectID == element.id);
            if (this.lstTo.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objectID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstTo.push(item);
            }
          });
          break;
        case 'cc':
          event.data?.forEach((element) => {
            let index = this.lstCc.findIndex((p) => p.objectID == element.id);

            if (this.lstCc.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objectID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstCc.push(item);
            }
          });
          break;
        case 'bcc':
          event.data?.forEach((element) => {
            let index = this.lstTo.findIndex((p) => p.objectID == element.id);

            if (this.lstCc.length == 0 || index < 0) {
              let item = new EmailSendTo();
              item.objectID = element.id;
              item.objectType = element.objectType;
              item.text = element.text;
              item.sendType = sendType;
              this.lstBcc.push(item);
            }
          });
          break;
      }
    }
  }

  deleteItem(data, sendType) {
    // var i = -1;
    switch (sendType) {
      case 1:
        var index = this.lstFrom.indexOf(data);
        if (index >= 0) {
          this.lstFrom.splice(index, 1);
        }
        break;
      case 2:
        var index = this.lstTo.indexOf(data);
        if (index >= 0) {
          this.lstTo.splice(index, 1);
        }
        break;
      case 3:
        var index = this.lstCc.indexOf(data);
        if (index >= 0) {
          this.lstCc.splice(index, 1);
        }
        break;
      case 4:
        var index = this.lstBcc.indexOf(data);
        if (index >= 0) {
          this.lstBcc.splice(index, 1);
        }
        break;
    }
  }

  changeSendType(sendType) {
    if (sendType == 'cc') {
      this.showCC = !this.showCC;
    } else if (sendType == 'bcc') {
      this.showBCC = !this.showBCC;
    }
  }

  focusOutFunction() {
    alert('event');
  }
}

export class EmailSendTo {
  transID: string;
  sendType: string;
  objectType: string;
  objectID: string;
  createdOn: Date;
  createdBy: string;
  modifiedOn: Date;
  modifuedBy: string;
  text: string;
}
