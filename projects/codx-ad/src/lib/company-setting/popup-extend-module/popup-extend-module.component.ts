import { Component, Injector, Optional } from '@angular/core';
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
  selector: 'lib-popup-extend-module',
  templateUrl: './popup-extend-module.component.html',
  styleUrls: ['./popup-extend-module.component.scss'],
})
export class PopupExtendModuleComponent extends UIComponent {
  dialog;
  module;
  childModule;
  grvTNOrders;
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
    this.module = dt.data.module;
    this.childModule = dt.data.childModule;
    this.grvTNOrders = dt?.data?.grvView;

    console.log('module', this.module);
    console.log('childModule', this.childModule);
  }

  onInit() {}
  closePopup() {
    this.dialog.close();
  }
}
