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
  viewOnly = true;
  costInfos = [];
  grViewCost: any;
  cost: any;
  tmpCost: CM_CostItems;
  totalCost = 0;
  transID: string;

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
    this.calculateTotalCost();
    this.title = dt?.data?.title;
  }
  ngOnInit(): void {
    var num = 23566666;
    console.log(num.toLocaleString('vi-VN'));
    console.log(this.readNumber(23566666));
  }

  //----------------Cost Items -----------------//

  addCost() {
    if (this.cost && !this.cost.costItemName) {
      this.notiService.notify(
        'Chưa nhập nội dung chi phí, hãy hoàn thiện chi phí trước khi thêm chi phí mới !',
        '3'
      );
      return;
    }
    let newCost = { ...this.tmpCost };
    newCost.transID = this.transID;
    newCost.quantity = 1;
    newCost.unitPrice = 0;
    if (!this.costInfos) this.costInfos = [];

    this.costInfos.push(newCost);
    this.cost = newCost;
    this.calculateTotalCost();
    this.detectorRef.detectChanges();
  }

  changeCost(evt: any) {
    if (evt) {
    }
  }
  deleteCost(index: number) {
    if (this.costInfos?.length > index) {
      this.costInfos?.splice(index, 1);
      this.calculateTotalCost();
      this.detectorRef.detectChanges();
    }
  }
  editCost(evt: any, index: number) {
    if (evt && this.costInfos?.length > index) {
      switch (evt?.field) {
        case 'quantity':
          this.costInfos[index].quantity = evt?.data;
          break;

        case 'unitPrice':
          this.costInfos[index].unitPrice = evt?.data;
          break;

        case 'costItemName':
          this.costInfos[index].costItemName = evt?.data;
          break;

        case 'costItemID':
          this.costInfos[index].costItemID = evt?.data;
          break;
      }

      this.cost = this.costInfos[index];
      this.calculateTotalCost();
    }
  }
  calculateTotalCost() {
    this.totalCost = 0;
    if (this.costInfos?.length > 0) {
      this.costInfos?.forEach((cost) => {
        if (cost?.quantity && cost?.unitPrice)
          cost.amount = cost?.quantity * cost?.unitPrice;
        else cost.amount = 0;
        this.totalCost += cost.amount;
      });
    }
  }
  //---------------------------------------------//

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
}
