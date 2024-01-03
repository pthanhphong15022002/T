import { Component, OnInit, Optional } from '@angular/core';
import { CodxFdService } from '../../codx-fd.service';
import { DialogData, DialogRef } from 'codx-core';
import { Observable, isObservable } from 'rxjs';

@Component({
  selector: 'lib-evoucher-detail',
  templateUrl: './evoucher-detail.component.html',
  styleUrls: ['./evoucher-detail.component.scss']
})
export class EvoucherDetailComponent implements OnInit{
  
  dialog: DialogRef;
  productID:any;
  headerText:any;
  data:any;
  type: string;
  sizeSelected: any;
  coCoins: number = 0;
  exchangeRateEVoucher: number = 1;

  constructor(
    private FDService: CodxFdService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.productID = dt?.data?.productID;
    this.headerText = dt?.data?.headerText;
    this.type = dt?.data?.type;
    this.sizeSelected = dt?.data?.sizeSelected;
    this.coCoins = dt?.data?.coCoins || 0;
    this.exchangeRateEVoucher = dt?.data?.exchangeRateEVoucher || 0;
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData()
  {
    var detail = this.loadEVoucherDetail(this.productID);
    if(isObservable(detail))
    {
      detail.subscribe(item=>{
        this.data = item;
      })
    }
    else this.data = detail;
  }
  loadEVoucherDetail(productID:any): Observable<any>
  {
    let paras = [productID];
    let keyRoot = "FDEVoucher" + productID;
    return this.FDService.loadData(paras,keyRoot,"FD","FD","VouchersBusiness","GotITGetProductDetail");
  }

  save() {
    this.dialog.close(
      {
        data: this.sizeSelected,
        role: "save"
      }
    );
  }

  selectSize(size:any){
    if(this.sizeSelected?.sizeId == size.sizeId) {
      this.sizeSelected = null;
    } else {
      this.sizeSelected = size;
    }
  }

  checkDisable(size:any) {
    if(this.coCoins > ((size?.pricePrice * this.exchangeRateEVoucher) / 1000 )) { 
      return false;
    }
    return true;
  }
}
