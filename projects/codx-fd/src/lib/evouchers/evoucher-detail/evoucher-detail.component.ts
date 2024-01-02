import { Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxFdService } from '../../codx-fd.service';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
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
  type: string;
  sizeSelected: any;

  constructor(
    private FDService: CodxFdService,
    private notifySV: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.productID = dt?.data?.productID;
    this.headerText = dt?.data?.headerText;
    this.type = dt?.data?.type;
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
    if(this.sizeSelected) {
      this.dialog.close(this.sizeSelected);
    } else {
      this.notifySV.notify("Vui lòng chọn giá", "3");
    }
  }

  selectSize(size:any){
    this.sizeSelected = size;
  }
}
