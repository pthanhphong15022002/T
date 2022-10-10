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
import { CodxFdService } from 'projects/codx-fd/src/public-api';

@Component({
  selector: 'lib-add-gift-group',
  templateUrl: './add-gift-group.component.html',
  styleUrls: ['./add-gift-group.component.scss'],
})
export class AddGiftGroupComponent extends UIComponent implements OnInit {
  header = '';
  title = '';
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
    private fdSV: CodxFdService,
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
    this.title = dt.data?.headerText;
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

  onInit(): void {}

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
        .save((option: any) => this.beforeSave(option), 0)
        .subscribe((res) => {
          if (this.isModeAdd) {
            if (res && res.save[2]) this.dialog.close(res.save[2]);
            else this.notification.notifyCode('SYS023');
          } else {
            if (res && res.update[2]) this.dialog.close(res.update[2]);
            else this.notification.notifyCode('SYS007');
          }
        });
    } else this.fdSV.notifyInvalid(this.form.formGroup, this.formModel);
  }

  beforeSave(option) {
    option.methodName = 'AddEditGiftGroupAsync';
    if (this.user.userName) this.dataUpdate.createdName = this.user.userName;
    option.data = [this.dataUpdate, this.isModeAdd];
    return true;
  }
}
