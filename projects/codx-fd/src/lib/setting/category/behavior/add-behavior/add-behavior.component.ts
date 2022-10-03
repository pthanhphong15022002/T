import {
  Component,
  OnInit,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  DialogRef,
  UIComponent,
  DialogData,
  CodxFormComponent,
  NotificationsService,
} from 'codx-core';

@Component({
  selector: 'lib-add-behavior',
  templateUrl: './add-behavior.component.html',
  styleUrls: ['./add-behavior.component.scss'],
})
export class AddBehaviorComponent extends UIComponent implements OnInit {
  header = 'Thêm hành vi ứng xử';
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
    this.isModeAdd = dt.data?.isModeAdd;
    this.formModel = dialog.formModel;
  }

  onInit(): void {
    if (!this.isModeAdd) this.header = 'Cập nhật hành vi ứng xử';
  }

  valueChange(e) {
    if (e) {
      this.dataUpdate[e.field] = e.data;
    }
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
    this.dataUpdate.isGroup = false;
    option.data = [this.dataUpdate, this.isModeAdd, this.formModel];
    return true;
  }
}
