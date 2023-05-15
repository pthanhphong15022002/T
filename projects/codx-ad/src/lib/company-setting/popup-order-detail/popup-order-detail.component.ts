import { Component, Injector, Optional } from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';

@Component({
  selector: 'lib-popup-order-detail',
  templateUrl: './popup-order-detail.component.html',
  styleUrls: ['./popup-order-detail.component.scss'],
})
export class PopupOrderDetailComponent extends UIComponent {
  constructor(
    private inJector: Injector,
    private authStore: AuthStore,
    private notify: NotificationsService,
    private adServices: CodxAdService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inJector);
    this.grvTNOrders = dt?.data?.grvView;
    this.orderFormodel = dt?.data?.formModel;
    this.orderRecID = dt?.data?.orderRecID;
    this.dialog = dialog;
    console.log('data', dt);
  }
  orderFormodel: FormModel;
  grvTNOrders;
  order;
  orderRecID;
  payment;
  lstOrderModule;
  lstModule;
  dialog;
  onInit(): void {
    this.adServices.getOrderDetail(this.orderRecID).subscribe((orderDetail) => {
      if (orderDetail) {
        this.order = orderDetail[0];
        this.lstOrderModule = orderDetail[1];
        this.payment = orderDetail[2];
        this.lstModule = orderDetail[3];
        console.log('order', this.order);
        console.log('lstOrderModule', this.lstOrderModule);
        console.log('payment', this.payment);
        console.log('lstModule', this.lstModule);
      }
    });
  }

  onClose() {
    this.dialog.close();
  }
}
