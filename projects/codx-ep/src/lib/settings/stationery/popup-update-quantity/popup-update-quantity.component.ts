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
  NotificationsService,
  UIComponent,
  UserModel,
} from 'codx-core';

@Component({
  selector: 'popup-update-quantity',
  templateUrl: './popup-update-quantity.component.html',
  styleUrls: ['./popup-update-quantity.component.scss'],
})
export class PopupUpdateQuantityComponent extends UIComponent {
  title = 'Cập nhật số lượng tồn kho';
  subHeader = 'Cập nhật số lượng tồn kho cho từng mặt hàng';
  dialog!: DialogRef;
  data;
  user: UserModel;
  dialogUpdateQuantity: FormGroup;
  isAfterRender = false;

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private auth: AuthStore,
    private notificationsService: NotificationsService,
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
    this.dialogUpdateQuantity = this.fb.group({
      oldQuantity: [''],
      quantity: ['', Validators.compose([Validators.required])],
      note: [''],
    });
    this.dialogUpdateQuantity.patchValue({ oldQuantity: this.data.currentQty });
    this.dialogUpdateQuantity.patchValue({ quantity: 1 });
    this.dialogUpdateQuantity.addControl('itemLevel', new FormControl('9'));
    this.dialogUpdateQuantity.addControl(
      'itemSelect',
      new FormControl(this.data.resourceID)
    );
    this.dialogUpdateQuantity.addControl('objectType', new FormControl('9'));
    this.dialogUpdateQuantity.addControl('status', new FormControl('1'));
    this.dialogUpdateQuantity.addControl(
      'createdBy',
      new FormControl(this.user.userID)
    );
    this.isAfterRender = true;
  }

  valueChange(event) {
    if (event?.field) {
      if (event.data instanceof Object) {
        this.dialogUpdateQuantity.patchValue({
          [event['field']]: event.data.value,
        });
      } else {
        this.dialogUpdateQuantity.patchValue({ [event['field']]: event.data });
      }
    }
  }

  onSaveForm() {
    if (this.dialogUpdateQuantity.invalid) {
      return;
    }
    this.api
      .exec('EP', 'ResourceTransBusiness', 'ImportAsync', [
        this.data.resourceID,
        this.dialogUpdateQuantity.value.quantity,
      ])
      .subscribe((res) => {
        this.view.dataService.update(res).subscribe((res) => {
          if (res) {
            this.notificationsService.notify(
              'Cập nhật tồn kho thành công',
              '1',
              0
            );
            this.detectorRef.detectChanges();
            this.dialog.close();
          }
         
        });
      });
  }
}
