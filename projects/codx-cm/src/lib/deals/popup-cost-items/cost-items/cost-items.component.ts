import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ApiHttpService, CacheService, NotificationsService } from 'codx-core';
import { CM_CostItems } from '../../../models/cm_model';
import { CodxCmService } from '../../../codx-cm.service';

@Component({
  selector: 'crud-cost-items',
  templateUrl: './cost-items.component.html',
  styleUrls: ['./cost-items.component.css'],
})
export class CostItemsComponent implements OnInit {
  @Input() costInfos = [];
  @Input() isLoadedData = true; // đã load data
  @Input() transID: string;
  @Input() grViewCost: any;
  @Input() isAutoSave = false; // save ở đây và trả về
  @Input() viewOnly = false;
  @Input() dealValueTo = 0;
  @Input() planceHolderDealValueTo = 'Nhập ngân sách'; //truyền plance hodeler cho ngân sách
  @Input() maxHeight: any;
  @Output() dataCostItems = new EventEmitter<any>();
  @Output() totalDataCost = new EventEmitter<any>();
  @Output() dataDealValueTo = new EventEmitter<any>();

  cost: any;
  tmpCost: CM_CostItems;
  totalCost = 0;
  action = 'edit';
  formModel: any;
  costIDOld = [];
  dealValueToOld = 0;

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private notiService: NotificationsService,
    private detectorRef: ChangeDetectorRef,
    private codxCmService: CodxCmService
  ) {
    if (!this.grViewCost)
      this.cache
        .gridViewSetup('CMCostItems', 'grvCMCostItems')
        .subscribe((grvCost) => {
          this.grViewCost = grvCost;
        });
  }

  ngOnInit(): void {
    this.dealValueToOld = this.dealValueTo;
    if (this.isLoadedData) {
      if (this.costInfos?.length > 0)
        this.costIDOld = this.costInfos.map((x) => x.recID);
      this.calculateTotalCost();
      return;
    }
    if (!this.transID) return;
    this.loadCostItems();
  }

  loadCostItems() {
    this.codxCmService.getCostItemsByTransID(this.transID).subscribe((res) => {
      if (res) {
        this.costInfos = res;
        this.costIDOld = this.costInfos.map((x) => x.recID);
        this.calculateTotalCost();
      }
    });
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
    let newCost = new CM_CostItems();
    newCost.transID = this.transID;
    newCost.quantity = 1;
    newCost.unitPrice = 0;
    if (!this.costInfos) this.costInfos = [];

    this.costInfos.push(newCost);
    this.cost = newCost;
    this.calculateTotalCost();
    // if (this.isAutoSave) {
    //   this.autoSaveData();
    // }
    this.detectorRef.detectChanges();
  }

  changeCost(evt: any) {
    if (evt) {
    }
  }
  deleteCost(index: number) {
    if (this.costInfos?.length > index) {
      this.cost = this.costInfos[index];
      if (this.isAutoSave) {
        if (!this.costIDOld.includes(this.cost.recID)) {
          this.cost = null;
          return;
        }
        if (this.cost) this.autoDeleted(index);
      } else {
        this.costInfos?.splice(index, 1);
        this.cost = null;
        this.calculateTotalCost();
      }
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
      if (this.isAutoSave) {
        this.autoSaveData();
      } else this.calculateTotalCost();
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
    if (!this.isAutoSave) {
      this.dataCostItems.emit(this.costInfos);
      this.totalDataCost.emit(this.totalCost);
    }
  }

  //save ở đây và trả về
  autoSaveData() {
    if (!this.validateCost()) {
      this.notiService.notify(
        'Chưa nhập nội dung chi phí, hãy hoàn thiện chi phí trước khi thêm chi phí mới !',
        '3'
      );
      return;
    }
    //save cost
    let methol = 'AddCostAsync';
    let isAdd = true;
    if (this.costIDOld.includes(this.cost.recID)) {
      methol = 'EditCostAsync';
      isAdd = false;
    }
    this.api
      .exec<any>('CM', 'CostItemsBusiness', methol, this.cost)
      .subscribe((res) => {
        if (res) {
          if (isAdd) this.costIDOld.push(res.recID);
          this.dataCostItems.emit(this.costInfos);
          this.totalDataCost.emit(this.totalCost);
        }
      });
  }
  validateCost() {
    return (
      this.cost &&
      (!this.cost.costItemName || this.cost?.costItemName.trim() == '')
    );
    // let check = this.costInfos.some(
    //   (x) => !x.costItemName || x.costItem.trim() == ''
    // );
    //return !check;
  }

  autoDeleted(index) {
    this.api
      .exec<any>('CM', 'CostItemsBusiness', 'DeletedCostAsync', this.cost.recID)
      .subscribe((res) => {
        if (res) {
          this.costInfos?.splice(index, 1);
          this.costIDOld = this.costIDOld.filter(
            (x) => x.recID != this.cost.recID
          );
          this.cost = null;
          this.calculateTotalCost();
          this.dataCostItems.emit(this.costInfos);
          this.totalDataCost.emit(this.totalCost);
        }
      });
  }

  valueChange(e) {
    this.dealValueTo = e.data;
  }
  valueChangeDVT(e) {
    // this.dealValueTo = e.data;
    if (this.dealValueToOld == this.dealValueTo) return;
    if (!this.isAutoSave) {
      this.dataDealValueTo.emit(this.dealValueTo);
      this.dealValueToOld = this.dealValueTo;
    } else {
      this.api
        .exec<any>('CM', 'DealsBusiness', 'UpdateDealValueToAsync', [
          this.transID,
          this.dealValueTo,
        ])
        .subscribe((res) => {
          if (res) {
            this.dataDealValueTo.emit(this.dealValueTo);
            this.dealValueToOld = this.dealValueTo;
            this.notiService.notifyCode('SYS007');
          }
        });
    }
  }

  //---------------------------------------------//
}
