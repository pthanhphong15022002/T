import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Component, Injector, Optional } from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogRef,
  UIComponent,
  UserModel,
} from 'codx-core';

@Component({
  selector: 'popup-add-quota',
  templateUrl: './popup-add-quota.component.html',
  styleUrls: ['./popup-add-quota.component.scss'],
})
export class PopupAddQuotaComponent extends UIComponent {
  title = 'Thiết lập định mức VPP';
  subHeader = 'Cho phép thiết lập định mức cho theo cấp bậc nhân viên';
  dialog!: DialogRef;
  data;
  user: UserModel;
  dialogAddQuota: FormGroup;
  isAfterRender = false;

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private auth: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.data = dt?.data[0];
    this.user = this.auth.get();
  }

  onInit(): void {
    this.initForm();
  }

  initForm() {
    this.dialogAddQuota = this.fb.group({
      ruleType: ['', Validators.compose([Validators.required])],
      quantity: ['', Validators.compose([Validators.required])],
    });
    this.dialogAddQuota.patchValue({ ruleType: '1' });
    this.dialogAddQuota.patchValue({ quantity: 1 });
    this.dialogAddQuota.addControl('itemLevel', new FormControl('9'));
    this.dialogAddQuota.addControl(
      'itemSelect',
      new FormControl(this.data.resourceID)
    );
    this.dialogAddQuota.addControl('objectType', new FormControl('9'));
    this.dialogAddQuota.addControl('status', new FormControl('1'));
    this.dialogAddQuota.addControl(
      'createdBy',
      new FormControl(this.user.userID)
    );
    this.isAfterRender = true;
  }

  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogAddQuota.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.dialogAddQuota.patchValue({ [event['field']]: event.data });
      }
    }
  }

  onSaveForm() {
    if (this.dialogAddQuota.invalid) {
      return;
    }
    this.api
      .exec('EP', 'ResourceQuotaBusiness', 'AddResourceQuotaAsync', [
        this.dialogAddQuota.value,
      ])
      .subscribe((res) => {
        console.log(res);
      });
  }
}
