import { Component, Injector, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
  LayoutService,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { PopupOrderDetailComponent } from 'projects/codx-ad/src/lib/company-setting/popup-order-detail/popup-order-detail.component';

@Component({
  selector: 'lib-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
})
export class OrderHistoryComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private route: ActivatedRoute,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.auth = authStore.get();
    this.data = dt.data;

    this.cache.gridViewSetup('TNOrders', 'grvTNOrders').subscribe((res) => {
      if (res) {
        this.grvTNOrders = res;
        console.log(res);
      }
    });
  }
  data;
  dialog;
  grvTNOrders;
  auth;
  orderFormodel: FormModel;
  onInit() {}
  closePopup() {
    this.dialog.close();
  }
  popupOrderInfo(order) {
    let data = {
      grvView: this.grvTNOrders,
      formModel: this.orderFormodel,
      orderRecID: order.recID,
      canExtend: false,
    };
    let orderDialog = this.callfc.openForm(
      PopupOrderDetailComponent,
      '',
      650,
      900,
      '',
      data
    );
  }
}
