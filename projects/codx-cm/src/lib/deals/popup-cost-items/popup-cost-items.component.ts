import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
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

@Component({
  selector: 'lib-popup-cost-items',
  templateUrl: './popup-cost-items.component.html',
  styleUrls: ['./popup-cost-items.component.css'],
})
export class PopupCostItemsComponent implements OnInit {
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
  isUpdate = false;

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
    this.isUpdate = true;
  }
  changeDealValueTo(e) {
    this.dealValueTo = e;
    this.isUpdate = true;
  }

  actionEvent(e) {
    debugger;
  }

  closePopup() {
    if (this.viewOnly || !this.isUpdate) {
      this.dialog.close();
      return;
    }
    let obj = {
      dealCost: this.totalCost,
      dealValueTo: this.dealValueTo,
    };
    this.dialog.close(obj);
  }
}
