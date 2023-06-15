import {
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxAdService } from '../../codx-ad.service';
import { PopupExtendModuleComponent } from '../popup-extend-module/popup-extend-module.component';
import { TN_OrderModule } from '../../models/tmpModule.model';

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
  clmnGrid;

  // <!-- Column Name -->

  @ViewChild('moduleHT', { static: true }) moduleHT: TemplateRef<any>;
  @ViewChild('operatorHT', { static: true }) operatorHT: TemplateRef<any>;
  @ViewChild('employeeHT', { static: true }) employeeHT: TemplateRef<any>;
  @ViewChild('totalHT', { static: true }) totalHT: TemplateRef<any>;

  @ViewChild('totalTmp', { static: true }) totalTmp: TemplateRef<any>;
  @ViewChild('operatorTmp', { static: true }) operatorTmp: TemplateRef<any>;
  @ViewChild('emplTmp', { static: true }) emplTmp: TemplateRef<any>;
  @ViewChild('moduleTmp', { static: true }) moduleTmp: TemplateRef<any>;

  onInit(): void {
    this.adServices.getOrderDetail(this.orderRecID).subscribe((orderDetail) => {
      if (orderDetail) {
        this.order = orderDetail[0];
        this.lstOrderModule = orderDetail[1];
        this.payment = orderDetail[2];
        this.lstModule = orderDetail[3];
        this.detectorRef.detectChanges();
      }
    });
    this.clmnGrid = [
      {
        headerTemplate: this.moduleHT,
        width: 90,
        template: this.moduleTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.operatorHT,
        width: 30,
        template: this.operatorTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.employeeHT,
        width: 30,
        template: this.emplTmp,
        textAlign: 'center',
      },
      {
        headerTemplate: this.totalHT,
        width: 30,
        template: this.totalTmp,
        textAlign: 'center',
      },
    ];
  }

  onClose() {
    this.dialog.close();
  }

  extendOrder() {
    let lstPModule: TN_OrderModule[] = [];
    this.lstModule.forEach((md: any) => {
      md.quantity = md.qty;
      if (md.refID == null) {
        if (!lstPModule.find((x) => x.boughtModule.moduleID == md.moduleID)) {
          let tmpMD: TN_OrderModule = {
            bought: true,
            boughtModule: md,
            expiredOn: md.expiredOn,
          };
          lstPModule.push(tmpMD);
        }
      } else {
        let parentMD = lstPModule.find(
          (x) => x.boughtModule.moduleID == md.refID
        );
        if (parentMD) {
          let childMD: TN_OrderModule = {
            bought: true,
            boughtModule: md,
            expiredOn: md.expiredOn,
          };
          parentMD.childModule = childMD;
        } else {
          let childMD: TN_OrderModule = {
            bought: true,
            boughtModule: md,
            expiredOn: md.expiredOn,
          };

          let pMD = this.lstModule.find((x) => x.moduleID == md.moduleID);
          parentMD = {
            bought: true,
            boughtModule: pMD,
            expiredOn: pMD.expiredOn,
            childModule: childMD,
          };
          lstPModule.push(parentMD);
        }
      }
    });
    console.log('pMds', lstPModule);

    let data = {
      grvView: this.grvTNOrders,
      lstModule: lstPModule,
      extendMode: 'order',
    };
    let orderDialog = this.callfc.openForm(
      PopupExtendModuleComponent,
      '',
      900,
      900,
      '',
      data
    );
  }
}
