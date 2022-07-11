import { Component, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogData, DialogRef, FormModel } from 'codx-core';
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
  lstSendTo = [];

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

  onSaveForm() {}

  valueChange(event) {
    if (event?.field) {
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

  changeSendType(sendType) {
    if (sendType == 'cc') {
      this.showCC = !this.showCC;
    } else if (sendType == 'bcc') {
      this.showBCC = !this.showBCC;
    }
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
}
