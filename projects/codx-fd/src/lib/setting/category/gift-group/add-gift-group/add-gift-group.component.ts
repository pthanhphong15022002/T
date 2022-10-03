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
  selector: 'lib-add-gift-group',
  templateUrl: './add-gift-group.component.html',
  styleUrls: ['./add-gift-group.component.scss'],
})
export class AddGiftGroupComponent extends UIComponent implements OnInit {
  header = 'Thêm nhóm quà tặng';
  dialog: DialogRef;
  formModel: any;
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
    this.user = this.authStore.get();
    this.dialog = dialog;
    this.dataUpdate = JSON.parse(
      JSON.stringify(dialog.dataService.dataSelected)
    );
    this.formModel = dialog.formModel;
    this.isModeAdd = dt.data?.isModeAdd;
  }

  onInit(): void {
    if (!this.isModeAdd) this.header = 'Cập nhật nhóm quà tặng';
  }

  valueChange(e) {
    if (e) {
      this.dataUpdate[e.field] = e.data;
    }
  }

  onSave() {
    var formGroup = this.form.formGroup.controls;
    if (
      formGroup.giftID.status == 'VALID' &&
      formGroup.giftName.status == 'VALID' &&
      formGroup.memo.status == 'VALID'
    ) {
      this.dialog.dataService
        .save((option: any) => this.beforeSave(option))
        .subscribe((res) => {
          if (this.isModeAdd) {
            if (res && res.save[2]) this.dialog.close(res.save[2]);
            else this.notification.notifyCode('SYS023');
          } else {
            if (res && res.update[2]) this.dialog.close(res.update[2]);
            else this.notification.notifyCode('SYS007');
          }
        });
    } else this.notification.notify('Vui lòng kiểm tra lại thông tin nhập');
  }

  beforeSave(option) {
    option.methodName = 'AddEditGiftGroupAsync';
    if (this.user.userName) this.dataUpdate.createdName = this.user.userName;
    option.data = [this.dataUpdate, this.isModeAdd];
    return true;
  }
}
