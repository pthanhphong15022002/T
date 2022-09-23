import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Thickness } from '@syncfusion/ej2-charts';
import { ApiHttpService, CacheService, CallFuncService, AuthService, NotificationsService, DialogRef, DialogData, CRUDService } from 'codx-core';
import { tmpAddGiftTrans } from '../../models/tmpAddGiftTrans.model';

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
  quantity:number = 0;
  amount:number = 0
  maxQuantity:number = 0;
  cardTypeDefault:string = "6";
  giftTrans = new tmpAddGiftTrans();
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private dt:ChangeDetectorRef,
    private callfc:CallFuncService,
    private auth:AuthService,
    private notifySV:NotificationsService,
    private route:ActivatedRoute,
    @Optional() dialogRef?: DialogRef,
    @Optional() dd?:DialogData) 
    {
      this.dialogRef = dialogRef;
      this.user = this.auth.userValue;
    }

  ngOnInit(): void {
    this.innitForm();
    this.getMyWalletInfor();
    this.getDataPattern(this.cardTypeDefault);
    this.route.params.subscribe((param:any) => {
      if(param){
        this.giftTrans.EntityName = "FD_GiftTrans";
        this.giftTrans.EntityPer = "FD_GiftTrans";
        this.giftTrans.FunctionID = param["funcID"]
      }
    })
  }

  
  lstPattern:any[] = [];
  getDataPattern(cardType:string){
    if(!cardType) return;
    this.api.execSv("FD","ERM.Business.FD","PatternsBusiness","GetPatternsAsync",[cardType])
    .subscribe((res:any) => {
      if(res)
      {
        this.lstPattern = res;
        this.dt.detectChanges();
      }
    });
  }
  innitForm(){
    this.form = new FormGroup({
      userID: new FormControl(""),
      transType:new FormControl("3"),
      giftID: new FormControl(""),
      quantity: new FormControl(0),
      amount: new FormControl(0),
      status: new FormControl("1"),
      siutuation:new FormControl(""),
    });
  }

  resetForm(){}


  valueChange(event:any){
    if(!event) return;
    let data = event.data;
    let field = event.field;
    switch(field){
      case 'userID':
        this.giftTrans.UserID = data;
        break;
      case 'transType3':
        this.giftTrans.TransType = "3";
        break;
      case 'transType4':
        this.giftTrans.TransType = "4";
        break;
      case 'itemID':
        this.giftTrans.ItemID = data;
        break;
      case 'quantity':
        if(!this.giftTrans || !this.giftTrans.ItemID)
        {
          this.notifySV.notify("Vui lòng chọn quà tặng");
          return;
        }
        this.giftTrans.Quantity = data;
        break;
      case 'status':
        if(data){
          this.giftTrans.Status = "3";
        }
        this.giftTrans.Status = "1";
        break;
      case 'siutuation':
        this.giftTrans.Situation = data;
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
    this.api.execSv("FD","ERM.Business.FD","GiftTransBusiness","AddGiftTransAsync",[this.giftTrans,this.isSharePortal])
    .subscribe((res:any) =>{
      if(res){
        let status = res[0];
        if(status){
          this.notifySV.notify("Thêm thành công!");
        }
        else{
          let message = res[1];
          this.notifySV.notify(message);
        }
      }
      else{
        this.notifySV.notify("Thêm không thành công!")
      }
    });
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
        this.form.patchValue({reciverID: pUserID});
      }
      else
      {
        this.notifySV.notify("Người nhận chưa tích hợp ví");
      }
      this.dt.detectChanges();
    });
  }
  getGiftInfor(giftID:string)
  {
    this.api.execSv("FD","ERM.Business.FD","GiftsBusiness","GetGiftAsync",[giftID])
    .subscribe((res:any) => {
      if(res){
        this.gift = res;
        this.maxQuantity = Math.floor(this.myWallet.coins / this.gift.price); 
        this.form.patchValue({giftID: this.gift.giftID});
        this.dt.detectChanges();
      }
    }); 
  }


  patternIDSeleted:string = null;
  selectedPattern(pattern:any){
    if(!pattern) return;
    if(this.patternIDSeleted = pattern.patternID){
      this.patternIDSeleted = "";
    }
    else{
      this.patternIDSeleted = pattern.patternID;
    }
    this.dt.detectChanges();
  }
}
