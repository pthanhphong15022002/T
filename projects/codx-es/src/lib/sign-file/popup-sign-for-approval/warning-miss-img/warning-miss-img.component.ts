import { Component, Injector, OnInit, Optional } from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxEsService } from '../../../codx-es.service';

@Component({
  selector: 'lib-warning-miss-img',
  templateUrl: './warning-miss-img.component.html',
  styleUrls: ['./warning-miss-img.component.scss'],
})
export class WarningMissImgComponent extends UIComponent {
  dialog;
  data;
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private authStore: AuthStore,
    private notify: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
  }

  title;
  onInit(): void {
    this.title = this.data.title;
  }

  confirmSignWithoutImg(isConfirm) {
    if (isConfirm) {
      this.dialog.close(isConfirm);
    } else {
      this.dialog.close();
    }
  }
}
