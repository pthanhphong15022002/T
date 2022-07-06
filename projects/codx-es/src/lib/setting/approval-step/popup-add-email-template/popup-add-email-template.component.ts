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
  dialogETemplate: FormGroup;
  isAfterRender = false;

  constructor(
    private esService: CodxEsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
  }

  initForm() {
    this.esService
      .getFormGroup('EmailTemplates', 'grvEmailTemplates')
      .then((res) => {
        if (res) {
          this.dialogETemplate = res;
          this.isAfterRender = true;
          console.log(this.dialogETemplate);
        }
      });
  }

  ngOnInit(): void {
    this.initForm();
  }

  onSaveForm() {}

  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogETemplate.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.dialogETemplate.patchValue({ [event['field']]: event.data });
      }
    }
  }
}
