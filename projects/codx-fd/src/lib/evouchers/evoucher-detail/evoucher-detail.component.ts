import { Component, OnInit, Optional } from '@angular/core';
import { CodxFdService } from '../../codx-fd.service';
import { ApiHttpService, AuthService, DialogData, DialogRef, NotificationsService, UserModel } from 'codx-core';
import { Observable, isObservable } from 'rxjs';
import moment from 'moment';

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
  sizeSelected = null;
  coins: number = 0;
  coinsUsed: number = 0;
  exchangeRateEVoucher: number = 1;
  myWallet: any = null;
  user: UserModel;
  isLoadingEvoucher: boolean = false;
  formName: string;
  funcID: string;
  entityName: string;
  quantity: number = 1;
  maxQuantity: number = 1;

  constructor(
    private FDService: CodxFdService,
    private api: ApiHttpService,
    private auth: AuthService,
    private noti: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
    this.productID = dt?.data?.productID;
    this.headerText = dt?.data?.headerText;
    this.type = dt?.data?.type;
    this.sizeSelected = dt?.data?.sizeSelected;
    this.formName = dt?.data?.formName;
    this.funcID = dt?.data?.funcID;
    this.entityName = dt?.data?.entityName;
    this.quantity = dt?.data?.quantity;
    this.user = this.auth.userValue;
    console.log(this.formName, this.funcID, this.entityName)
  }
  ngOnInit(): void {
    this.loadData();
    this.getMyWallet(this.user.userID);
    this.getExchangeRateEVoucher();
  }

  loadData()
  {
    var detail = this.loadEVoucherDetail(this.productID);
    if(isObservable(detail))
    {
      detail.subscribe(item=>{
        this.data = item;
        this.data.quantity = this.quantity;
        this.updateMaxQuantity();
      })
    } else {
      this.data = detail;
      this.data.quantity = this.quantity;
      this.updateMaxQuantity();
    }
  }

  updateMaxQuantity() {
    if(this.coinsUsed > 0) {
      this.maxQuantity = Math.floor(this.coins / (this.coinsUsed * 1));
    } else {
      this.maxQuantity = 1;
    }
  }

  loadEVoucherDetail(productID:any): Observable<any>
  {
    let paras = [productID];
    let keyRoot = "FDEVoucher" + productID;
    return this.FDService.loadData(paras,keyRoot,"FD","FD","VouchersBusiness","GotITGetProductDetail");
  }

  save() {
    if(!this.sizeSelected?.sizeId) {
      this.dialog.close(
        {
          data: this.data,
          role: "save",
          selectSize: this.sizeSelected
        }
      );
      return;
    }
    let curentMonth = moment().month() + 1;
    let currentYear = moment().year();
    let productID = this.data?.productId;
    let productPriceId = this.sizeSelected.sizeId;
    let categoryId = this.data?.categoryId;
    let quantity = this.data?.quantity;
    let campaignNm = 'LV E-Voucher ' + curentMonth + ' ' + currentYear;
    let use_otp = 0;
    let otp_type = 1;
    let receiver_name = this.user.userName;
    let phone = this.user.mobile;
    this.isLoadingEvoucher = true;
    this.api.execSv<any>('FD', 'FD', 'VouchersBusiness', 'GotITTransaction', 
      [
        productID, 
        productPriceId, 
        categoryId, 
        quantity, 
        campaignNm, 
        use_otp, 
        otp_type, 
        receiver_name, 
        phone, 
        this.formName, 
        this.funcID, 
        this.entityName, 
        '4', 
        '2'
      ]).subscribe((data) => {
        if (data.length != 0 && data[0] != null) {
          data[0].quantity = quantity;
          this.dialog.close(
            {
              data: data[0],
              role: "save",
              selectSize: this.sizeSelected
            }
          );
        }
        this.isLoadingEvoucher = false;
      });
  }

  selectSize(size:any){
    if(this.sizeSelected?.sizeId == size.sizeId) {
      this.sizeSelected = null;
      this.coinsUsed = 0;
      this.updateMaxQuantity();
    } else {
      this.sizeSelected = size;
      this.coinsUsed = ((size?.pricePrice * this.exchangeRateEVoucher) / 1000 );
      this.updateMaxQuantity();
    }
  }

  checkDisable(size:any) {
    if(this.coins > ((size?.pricePrice * this.exchangeRateEVoucher) / 1000 )) { 
      return false;
    }
    return true;
  }

  getMyWallet(userID: string) {
    this.api
      .execSv('FD', 'ERM.Business.FD', 'WalletsBusiness', 'GetWalletsAsync', [
        userID,
      ])
      .subscribe((res: any) => {
        if (res) {
          this.myWallet = res;
          this.coins = this.myWallet.coins;
        }
      });
  }

  getExchangeRateEVoucher() {
    this.api.execSv<any>('SYS', 'SYS', 'SettingValuesBusiness', 'GetByModuleAsync', [
      'FDParameters',
      'ActiveCoins',
    ])
    .subscribe((res) => {
      if (res) {
        let data = JSON.parse(res.dataValue);
        if (data) {
          // tỷ lệ giữa 1 xu và 1.000 vnđ
          this.exchangeRateEVoucher = parseInt(data.ExchangeRateEVoucher);
          if(this.sizeSelected) {
            this.coinsUsed = ((this.sizeSelected?.pricePrice * this.exchangeRateEVoucher) / 1000 );
            this.updateMaxQuantity();
          }
        }
      }
    });
  }

  updateQuantityEvoucher(e: any) {
    let quantity = e?.component?.crrValue || 1;
    if(quantity != this.data?.quantity) {
      if(this.coinsUsed * quantity < this.coins) {
        this.data.quantity = quantity;
      } else {
        this.data.quantity = this.maxQuantity;
        this.noti.notify("Số xu không đủ để mua số lượng này", "3");
      }
    }
  }
}
