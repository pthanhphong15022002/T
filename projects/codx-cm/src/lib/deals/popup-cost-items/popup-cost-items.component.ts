import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { CM_CostItems } from '../../models/cm_model';
import { dateToInt } from '@syncfusion/ej2-angular-spreadsheet';
import { CostItemsComponent } from './cost-items/cost-items.component';

@Component({
  selector: 'lib-popup-cost-items',
  templateUrl: './popup-cost-items.component.html',
  styleUrls: ['./popup-cost-items.component.css'],
})
export class PopupCostItemsComponent implements OnInit {
  @ViewChild('costItems') costItems: CostItemsComponent;
  dialog: DialogRef;

  title = 'Chi phí';
  viewOnly = false;
  costInfos = [];
  grViewCost: any;
  cost: any;
  tmpCost: CM_CostItems;
  totalCost = 0;
  transID: string;
  dealValueTo: any;
  isUpDealCost = false;
  isUpDealValueTo = false;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.cache
      .gridViewSetup('CMCostItems', 'grvCMCostItems')
      .subscribe((grvCost) => {
        this.grViewCost = grvCost;
      });
    this.dialog = dialog;
    this.costInfos = dt?.data?.listCosts;
    this.transID = dt?.data?.transID;
    this.dealValueTo = dt?.data?.dealValueTo;
    // this.calculateTotalCost();
    this.title = dt?.data?.title;
  }
  ngOnInit(): void {
    // var num = 23566666;
    // console.log(num.toLocaleString('vi-VN'));
    // console.log(this.readNumber(23566666));
  }

  //đọc số cho vui
  readNumber(number) {
    const words = [
      'không',
      'một',
      'hai',
      'ba',
      'bốn',
      'năm',
      'sáu',
      'bảy',
      'tám',
      'chín',
    ];
    const units = [
      '',
      'mươi',
      'trăm',
      'nghìn',
      'triệu',
      'tỷ',
      'nghìn tỷ',
      'triệu tỷ',
      'nghìn triệu tỷ',
    ];

    let result = '';
    let numberStr = number.toString();

    for (let i = 0; i < numberStr.length; i++) {
      const digit = numberStr[i];
      const index = digit - 0;

      if (index > 0) {
        result += words[index];

        if (i < numberStr.length - 1) {
          result += units[numberStr.length - i - 1];
        }
      }
    }

    return result;
  }

  totalDataCost(e) {
    this.totalCost = e;
    this.isUpDealCost = true;
  }
  changeDealValueTo(e) {
    this.dealValueTo = e;
    this.isUpDealValueTo = true;
  }

  actionEvent(e) {
    debugger;
  }

  closePopup(timeOut = 500) {
    // if (this.costItems && this.costItems.isSavingData) {
    //   setTimeout(() => {
    //     if (timeOut > 1000) return;
    //     timeOut += 500;
    //     this.closePopup(timeOut);
    //     console.log(timeOut);
    //   }, timeOut);
    //   return;
    // }
    if (this.viewOnly || (!this.isUpDealCost && !this.isUpDealValueTo)) {
      this.dialog.close();
      return;
    }
    let obj = {
      dealCost: this.totalCost,
      isUpDealCost: this.isUpDealCost,
      dealValueTo: this.dealValueTo,
      isUpDealValueTo: this.isUpDealValueTo,
    };
    this.dialog.close(obj);
  }
}
