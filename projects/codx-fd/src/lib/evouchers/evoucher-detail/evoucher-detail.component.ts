import { Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxFdService } from '../../codx-fd.service';
import { DialogData, DialogRef } from 'codx-core';
import { Observable, isObservable } from 'rxjs';

@Component({
  selector: 'lib-evoucher-detail',
  templateUrl: './evoucher-detail.component.html',
  styleUrls: ['./evoucher-detail.component.scss']
})
export class EvoucherDetailComponent implements OnInit{
  
  dialog:any;
  productID:any;
  headerText:any;
  data:any;

  constructor(
    private FDService: CodxFdService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.productID = dt?.data?.productID;
    this.headerText = dt?.data?.headerText;
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
}
