import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogRef, FormModel } from 'codx-core';
import { CodxEsService } from 'projects/codx-es/src/public-api';

@Component({
  selector: 'lib-popup-add-approver',
  templateUrl: './popup-add-approver.component.html',
  styleUrls: ['./popup-add-approver.component.scss'],
})
export class PopupAddApproverComponent implements OnInit {
  fgroupApprover: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  data: any = {};
  isAddNew: boolean = true;
  isAfterRender: boolean = false;
  headerText = 'Thiết lập số tự động';
  subHeaderText = '';
  constructor(
    private cr: ChangeDetectorRef,
    private esService: CodxEsService
  ) {}

  ngOnInit(): void {}

  initForm() {
    this.formModel = new FormModel();
    this.formModel.entityName = 'AD_AutoNumbers';
    this.formModel.formName = 'AutoNumbers';
    this.formModel.gridViewName = 'grvAutoNumbers';
    this.dialog.formModel = this.formModel;

    this.esService.setCacheFormModel(this.formModel);
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        console.log(fg);
        if (fg) {
          this.fgroupApprover = fg;
          this.isAfterRender = true;
        }
      });
  }

  valueChange(event: any, field: string = '') {
    if (!field) field = event?.field;
    if (field && event.component) {
      this.data[field] = event.data;
      this.cr.detectChanges();
    }
  }

  onSaveForm() {}
}
