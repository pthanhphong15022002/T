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

@Component({
  selector: 'lib-add-proposed-field',
  templateUrl: './add-proposed-field.component.html',
  styleUrls: ['./add-proposed-field.component.scss'],
})
export class AddProposedFieldComponent extends UIComponent implements OnInit {
  header = 'Thêm mới lĩnh vực đề xuất';
  dialog: DialogRef;
  formModel: any;
  dataUpdate: any;
  isModeAdd = true;

  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notification: NotificationsService,
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
  }

  onInit(): void {
    if (!this.isModeAdd) this.header = 'Cập nhật lĩnh vực đề xuất';
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
        .save((option: any) => this.beforeSave(option))
        .subscribe((res) => {
          if (this.isModeAdd) {
            if (res && res.save[3][0]) this.dialog.close(res.save[3][0]);
            else this.notification.notifyCode('SYS023');
          } else {
            if (res && res.update[3][0]) this.dialog.close(res.update[3][0]);
            else this.notification.notifyCode('SYS023');
          }
        });
    } else this.notification.notifyCode('SYS028', null);
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
