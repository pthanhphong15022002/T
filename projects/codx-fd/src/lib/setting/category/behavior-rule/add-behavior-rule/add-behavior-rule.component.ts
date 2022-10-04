import {
  Component,
  OnInit,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CodxFormComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-add-behavior-rule',
  templateUrl: './add-behavior-rule.component.html',
  styleUrls: ['./add-behavior-rule.component.scss'],
})
export class AddBehaviorRuleComponent extends UIComponent implements OnInit {
  header = 'Thêm bộ hành vi ứng xử';
  formModel: any;
  dialog: DialogRef;
  dataUpdate: any;
  isModeAdd = true;
  user: any;

  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private notification: NotificationsService,
    private authStore: AuthStore,
    @Optional() dt: DialogData,
    @Optional() dialog: DialogRef
  ) {
    super(injector);
    this.user = authStore.get();
    this.dialog = dialog;
    this.dataUpdate = JSON.parse(
      JSON.stringify(dialog.dataService.dataSelected)
    );
    this.formModel = dialog.formModel;
    this.isModeAdd = dt.data?.isModeAdd;
  }

  onInit(): void {
    if (!this.isModeAdd) this.header = 'Cập nhật bộ hành vi ứng xử';
  }

  onSave() {
    var formGroup = this.form.formGroup.controls;
    if (formGroup.competenceID.status == 'VALID') {
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
    } else this.notification.notify('Vui lòng kiểm tra lại thông tin nhập');
  }

  beforeSave(option) {
    option.methodName = 'AddEditCompetencesAsync';
    this.dataUpdate.category = '1';
    this.dataUpdate.isGroup = true;
    option.data = [this.dataUpdate, this.isModeAdd, this.formModel];
    return true;
  }

  valueChange(e) {}
}
