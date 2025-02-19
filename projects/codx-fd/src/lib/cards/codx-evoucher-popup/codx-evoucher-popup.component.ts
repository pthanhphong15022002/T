import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Optional, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Dialog, PositionDataModel, ResizeDirections } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthStore, CRUDService, CacheService, CallFuncService, CodxComboboxPopupComponent, CodxListviewComponent, DialogModel, EnvironmentConfig, LayoutService, UrlUtil, Util } from 'codx-core';
import { Subject } from 'rxjs';
import { EvoucherDetailComponent } from '../../evouchers/evoucher-detail/evoucher-detail.component';

@Component({
  selector: 'codx-evoucher-popup',
  templateUrl: './codx-evoucher-popup.component.html',
  styleUrls: ['./codx-evoucher-popup.component.css']
})
export class CodxEvoucherPopupComponent implements OnInit {
  @Input() height: string = '100%';
  @Input() width: string = '100%';
  @Input() dataSelcected: any[] = [];
  @Input() evoucherGift: any[] = [];
  @Input() formName: string = '';
  @Input() funcID: string = '';
  @Input() entityName: string = '';

  @Output() onSaveData: EventEmitter<any> = new EventEmitter<any>();
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  position: PositionDataModel = { X: 'center', Y: 'center' };
  resizeHandles: ResizeDirections[] = ['All'];
  zIndex?: number;
  subHeader: string = '';
  title: string = 'Chọn E-Voucher';
  arrDisplay: any[] = [
    "productNm",
    "categoryNm",
    "brandNm",
  ];
  dataItems: any[] = [];
  request: any = {
    categoryID: 0,
    brandID: 0,
    pageSize: 20,
    page: 1,
  };
  isLoad = true;
  constructor(
    private api: ApiHttpService,
    private callFunc: CallFuncService,
  ) {}

  ngOnInit(): void {
    var highestZ = 1000;
    var lowestZ = 0;
    var onefound = false;
    var divs = document.getElementsByTagName('*');
    for (var i = 0; i < divs.length; i++) {
      if (
        (divs[i] as HTMLElement).style.position &&
        (divs[i] as HTMLElement).style.zIndex
      ) {
        if (!onefound) {
          highestZ = lowestZ = parseInt((divs[i] as HTMLElement).style.zIndex);
          onefound = true;
        } else {
          var ii = parseInt((divs[i] as HTMLElement).style.zIndex);
          if (ii > highestZ) {
            highestZ = ii;
          }
          if (ii < lowestZ) {
            lowestZ = ii;
          }
        }
      }
    }
    this.zIndex = highestZ - 1;
    this.dataSelcected = [...this.dataSelcected];
    this.evoucherGift = [...this.evoucherGift];
    this.loadDataEvocher();
  }

  loadDataEvocher() {
    this.api
      .execSv<any>('FD', 'FD', 'VouchersBusiness', 'GotITProductList', [
        0,
        0,
        this.request.categoryID,
        'asc',
        this.request.brandID,
        this.request.pageSize,
        this.request.page,
      ])
      .subscribe((data) => {
        if (data) {
          if(data?.productList && data?.productList.length > 0) {
            this.dataItems = this.dataItems.concat(data.productList);
          } else this.isLoad = false;
        }
      });
  }

  changeValue(e:any)
  {
    if(e?.data)
    {
      if(e?.field == "categories")  this.request.categoryID = e?.data;
      else if(e?.field == "brands") this.request.brandID = e?.data;
      this.dataItems = [];
      this.request.page = 1;
      this.isLoad = true;
      this.loadDataEvocher();
    }
  }

  checkSelected(item: any) {
    return this.dataSelcected.findIndex((x) => x.productId == item.productId) > -1;
  }

  selectItem(item: any) {
    let sizeSelected = null;
    const index = this.dataSelcected.findIndex((x) => x.productId == item.productId);
    if(index > -1) {
      sizeSelected = this.dataSelcected[index].selectedSize;
    }

    let dialogModel: DialogModel = new DialogModel();
    dialogModel.zIndex = this.zIndex + 1;
    const modal = this.callFunc.openForm(EvoucherDetailComponent,"",900 , 800 , "" , {
      productID : item.productId,
      headerText: "Chi tiết thẻ quà tặng",
      type: 'getPrice',
      sizeSelected: sizeSelected,
      formName: this.formName,
      funcID: this.funcID,
      entityName: this.entityName,
      quantity: this.evoucherGift[index]?.quantity || 1,
    }, null, dialogModel)
    modal.closed.subscribe((data:any)=>{
      if(data?.event){
        if(data.event?.role == "save" && data.event?.selectSize) {
          item.selectedSize = data.event?.selectSize;
          if(index == -1) {
            this.dataSelcected.push(item);
            this.evoucherGift.push(data.event?.data);
          } else {
            this.dataSelcected[index] = item;
            this.evoucherGift[index] = data.event?.data;
          }
        } else {
          item.selectedSize = null;
          if(index > -1) {
            this.dataSelcected.splice(index, 1);
            this.evoucherGift.splice(index, 1);
          }
        }
      }
    })
  }

  beforeOpen(evt: any) {
    if (evt) evt.maxHeight = '600px';
  }

  close(dialog: Dialog) {
    this.onClose.emit(true);
    dialog.hide();
    dialog.destroy();
  }

  onSave(dialog: Dialog) {
    this.onSaveData.emit({
      evoucherGift: this.evoucherGift,
      dataSelcected: this.dataSelcected,
    });
    dialog.hide();
    dialog.destroy();
  }

  scrollData(event:any) {
    const dcScroll = event.srcElement;
    if (
      dcScroll.scrollTop < dcScroll.scrollHeight - dcScroll.clientHeight ||
      dcScroll.scrollTop == 0
    ) return;

    this.request.page ++;
    if(this.isLoad) this.loadDataEvocher();
  }
}
