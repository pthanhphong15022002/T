import {
  Component,
  OnInit,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  UIComponent,
  NotificationsService,
} from 'codx-core';
import { CodxFdService } from 'projects/codx-fd/src/public-api';

@Component({
  selector: 'lib-add-proposed-field',
  templateUrl: './add-proposed-field.component.html',
  styleUrls: ['./add-proposed-field.component.scss'],
})
export class AddProposedFieldComponent extends UIComponent implements OnInit {
  header = '';
  dialog: DialogRef;
  formModel: any;
  dataUpdate: any;
  isModeAdd = true;
  title = '';

  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notification: NotificationsService,
    private fdSV: CodxFdService,
    @Optional() dt: DialogData,
    @Optional() dialog: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.dataUpdate = JSON.parse(
      JSON.stringify(dialog.dataService.dataSelected)
    );
    this.formModel = dialog.formModel;
    this.isModeAdd = dt.data?.isModeAdd;
    this.cache.functionList(this.formModel.funcID).subscribe((res) => {
      if (res) {
        this.header =
          this.title +
          ' ' +
          res?.customName.charAt(0).toLocaleLowerCase() +
          res?.customName.slice(1);
      }
    });
  }

  onInit(): void {
    if (this.isModeAdd) this.dataUpdate.owner = null;
    if (!this.dataUpdate.owner) this.dataUpdate.owner = null;
  }

  valueChange(e) {
    if (e) {
      this.dataUpdate[e.field] = e.data;
    }
  }

  onSave() {
    var formGroup = this.form.formGroup.controls;
    if (
      formGroup.industryID.status == 'VALID' &&
      formGroup.industryName.status == 'VALID' &&
      formGroup.owner.status == 'VALID'
    ) {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option), 0)
        .subscribe((res) => {
          if (this.isModeAdd) {
            if (res && res.save[3][0]) this.dialog.close(res.save[3][0]);
            else this.notification.notifyCode('SYS023');
          } else {
            if (res && res.update[3][0]) this.dialog.close(res.update[3][0]);
            else this.notification.notifyCode('SYS023');
          }
        });
    } else this.fdSV.notifyInvalid(this.form.formGroup, this.formModel);
  }

  beforeSave(option) {
    debugger;
    option.methodName = 'AddEditIndustryAsync';
    this.dataUpdate.category = '1';
    this.dataUpdate.isGroup = false;
    option.data = [this.dataUpdate, this.isModeAdd, this.formModel];
    return true;
  }
}
