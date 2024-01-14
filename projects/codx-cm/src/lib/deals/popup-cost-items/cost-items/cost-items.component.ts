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

  @Output() dataCostItems = new EventEmitter<any>();
  @Output() totalDataCost = new EventEmitter<any>();

  cost: any;
  tmpCost: CM_CostItems;
  totalCost = 0;
  action = 'edit';
  formModel:any

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
    if (this.isLoadedData) {
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
    if (this.isAutoSave) {
      this.autoSaveData();
    } else this.calculateTotalCost();
    this.detectorRef.detectChanges();
  }

  changeCost(evt: any) {
    if (evt) {
    }
  }
  deleteCost(index: number) {
    if (this.costInfos?.length > index) {
      // if (this.costInfos?.length == 0) this.cost = null;
      if (this.isAutoSave) {
        this.cost = this.costInfos[index];
        if(this.cost)
        this.autoDeleted(index);
      } else {
        this.costInfos?.splice(index, 1);
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
    this.dataCostItems.emit(this.costInfos);
    this.totalDataCost.emit(this.totalCost);
  }

  //save ở đây và trả về
  autoSaveData() {
    if(this.validateCost()){
      //save dong cost
    }
  }
  validateCost(){
    return true
  }

  autoDeleted(index) {
    this.api
      .exec<any>('CM', 'CostItemsBusiness', 'DeletedCostAsync', this.cost.recID)
      .subscribe((res) => {
        if (res) {
          this.costInfos?.splice(index, 1);
           this.calculateTotalCost();
        }
      
      });
  }
  //---------------------------------------------//
}
