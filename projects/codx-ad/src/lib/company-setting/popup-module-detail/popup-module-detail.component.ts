import { Component, Injector, OnInit, Optional } from '@angular/core';
import {
  UIComponent,
  AuthStore,
  NotificationsService,
  DialogData,
  DialogRef,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';
import { TN_OrderModule } from '../../models/tmpModule.model';

@Component({
  selector: 'lib-popup-module-detail',
  templateUrl: './popup-module-detail.component.html',
  styleUrls: ['./popup-module-detail.component.scss'],
})
export class PopupModuleDetailComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private adService: CodxAdService,
    private authStore: AuthStore,
    private notify: NotificationsService,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.module = dt.data.module as TN_OrderModule;
    this.currency = dt.data.currency;
    this.vllL1449 = dt.data.vllL1449;
    this.lstModule = dt.data.lstModule as Array<TN_OrderModule>;
    this.childMD = this.lstModule.find(
      (md: TN_OrderModule) =>
        md.boughtModule.refID == this.module.boughtModule.moduleID
    );
  }
  dialog;
  module;
  childMD;
  lstModule;
  currency: string = '';
  vllL1449;

  onInit(): void {}
  getInterval(interval) {
    return this.vllL1449?.find((x) => x.value == interval)?.text;
  }

  closePopup() {
    this.dialog.close();
  }
}
