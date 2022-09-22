import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiHttpService, CacheService, CallFuncService, AuthService, NotificationsService, DialogRef, DialogData } from 'codx-core';

@Component({
  selector: 'lib-popup-add-gift',
  templateUrl: './popup-add-gift.component.html',
  styleUrls: ['./popup-add-gift.component.scss']
})
export class PopupAddGiftComponent implements OnInit {

  user:any = null;
  dialogRef:DialogRef = null;
  form:FormGroup = null;  
  transType:string = "3";
  isSharePortal:boolean = true;
  myWallet:any = null;
  reciverWallet:any = null;
  gift:any = null;
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private dt:ChangeDetectorRef,
    private callfc:CallFuncService,
    private auth:AuthService,
    private notifySV:NotificationsService,
    @Optional() dialogRef?: DialogRef,
    @Optional() dd?:DialogData) 
    {
      this.dialogRef = dialogRef;
      this.user = this.auth.userValue;
    }

  ngOnInit(): void {
    this.innitForm();
    this.getMyWalletInfor();
  }
  
  innitForm(){
    this.form = new FormGroup({
      userID: new FormControl(""),
      userName: new FormControl(""),
      transType:new FormControl("3"),
      giftID: new FormControl(""),
      quantity: new FormControl(0),
      amount: new FormControl(0),
      status: new FormControl(""),
      siutuation:new FormControl(""),
      isSharePortal: new FormControl(true)
    });
  }

  resetForm(){}


  valueChange(event:any){
    if(!event || !event.data) return;
    let data = event.data;
    let field = event.field;
    switch(field){
      case 'userID':
        this.getReciverWallet(data);
        break;
      case 'transType':
        this.form.patchValue({transType: data});
        break;
      case 'giftID':
        this.getGiftInfor(data);
        break;
      case 'quantity':
        this.checkGiftAndWallet(this.myWallet,this.gift,data);
        break;
      case 'status':
        this.form.patchValue({status: data});
        break;
      case 'siutuation':
        this.form.patchValue({siutuation: data});
        break;
      case 'isSharePortal':
        this.isSharePortal = data;
        break;
      default:
        break;
    }
    this.dt.detectChanges();
  }
  save(){
    if(!this.form.controls['userID'].value){
      this.notifySV.notify("Vui lòng chọn người nhận");
      return;
    }
    if(!this.form.controls['giftID'].value){
      this.notifySV.notify("Vui lòng chọn quà tặng");
      return;
    }
    if(!this.reciverWallet){
      this.notifySV.notify("Người nhận chưa tích hợp ví");
      return;
    }
    if(!this.form.controls['quantity'].value){
      this.notifySV.notify("Vui lòng chọn số lượng quà tặng");
      return;
    }
    if(!this.form.controls['siutuation'].value){
      this.notifySV.notify("Nội dung không được bỏ trống");
      return;
    }
    if(!this.gift)
    var giftTrans = this.form.value;
    giftTrans.gift = this.gift;
    giftTrans.reciverWallet = this.reciverWallet;
    console.log(giftTrans);
  }
  
  getMyWalletInfor(){
    this.api.execSv("FD","ERM.Business.FD","WalletsBusiness","GetWalletsAsync",this.user.userID)
    .subscribe((res:any) => {
      if(res){
        this.myWallet = res;
        this.dt.detectChanges();
      }
    });
  }
  getReciverWallet(pUserID:string){
    if(!pUserID) return;
    this.api.execSv("FD","ERM.Business.FD","WalletsBusiness","GetWalletsAsync",pUserID)
    .subscribe((res:any) => {
      if(res){
        this.reciverWallet = res;
        this.form.patchValue({userID: pUserID});
      }
      else
      {
        this.notifySV.notify("Người nhận chưa tích hợp ví");
      }
      this.dt.detectChanges();
    });
  }
  checkCoinWallet(wallet:any,gift:any,quantity:number):boolean{
    if(!wallet || !gift || !quantity) return false;
    let amount = gift.price * quantity
    if(wallet.coins < amount){
        return false;
    }
    return true;
  }
  getGiftInfor(giftID:string){
    this.api.execSv("FD","ERM.Business.FD","GiftsBusiness","GetGiftAsync",giftID)
    .subscribe((res:any) => {
      if(res){
        this.gift = res;
        this.form.patchValue({giftID: this.gift.giftID});
        this.dt.detectChanges();
      }
    });
  }
  checkGiftAvailableQty(gift:any,quantity:number):boolean{
    if(!gift) return false;
    if(quantity > gift.availableQty){
      return false;
    }
    return true;
  }
  checkGiftAndWallet(wallet:any,gift:any,quantity:number){
    if(!wallet || !gift || !quantity) return;
    let isCheckWallet = this.checkCoinWallet(wallet,gift,quantity);
    if(isCheckWallet){
      this.notifySV.notify("Vượt quá số dư ví");
      return;
    }
    let isCheckGift = this.checkGiftAvailableQty(gift,quantity);
    if(isCheckGift){
      this.notifySV.notify("Vượt quá số lượng tồn kho");
      return;
    }
    this.form.patchValue({quantity: quantity});
  }
}
