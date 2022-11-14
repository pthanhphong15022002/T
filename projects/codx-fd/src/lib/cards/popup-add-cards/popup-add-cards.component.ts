import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthService, CacheService, CallFuncService, CRUDService, DialogData, DialogRef, NotificationsService, Util, ViewsComponent } from 'codx-core';
import { FD_Permissions } from '../../models/FD_Permissionn.model';
import { FED_Card } from '../../models/FED_Card.model';
import { CardType, Valuelist } from '../../models/model';

@Component({
  selector: 'lib-popup-add-cards',
  templateUrl: './popup-add-cards.component.html',
  styleUrls: ['./popup-add-cards.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PopupAddCardsComponent implements OnInit {
  funcID:string ="";
  entityName = "FD_Cards"
  gridViewName:string = "";
  formName:string = "";
  lstPattern:any[] = [];
  parameter: any = null;
  givePoint:number = 0;
  quantity:number = 0;
  quantityOld:number = 0;
  amount:number = 0;
  situation:string = "";
  rating:string = "";
  isWalletReciver = false;
  myWallet:any = null;
  user:any;
  wallet:any;
  behavior = [];
  industry = "";
  price:number = 0;
  showNavigationArrows:boolean = false;
  dialog: DialogRef;
  title:string ="";
  cardType:string ="";
  CARDTYPE_EMNUM = {
    Commendation : "1",
    Thankyou : "2",
    CommentForChange : "3",
    SuggestionImprovement : "4",
    Share : "5",
    Congratulation : "6",
    Radio : "7"
  };
  form: FormGroup;
  refValue = "Behaviors_Grp";
  userReciver:string = "";
  userReciverName:string ="";
  lstShare:any[] = [];
  gift:any;
  giftCount:number;
  shareControl:string = "9";
  objectType:string ="";
  totalRecorItem = 4;
  patternSelected: any;
  ratingVll:string ="";
  lstRating:any= null;
  mssgNoti:string = "";
  countCardReive:number = 0;
  countCardSend:number = 0;
  countPointSend:number = 0;

  MEMBERTYPE = {
    CREATED: "1",
    SHARE: "2",
    TAGS: "3"
  }
  SHARECONTROLS = {
    OWNER: "1",
    MYGROUP: "2",
    MYTEAM: "3",
    MYDEPARMENTS: "4",
    MYDIVISION: "5",
    MYCOMPANY: "6",
    EVERYONE: "9",
    OGRHIERACHY: "O",
    DEPARMENTS: "D",
    POSITIONS: "P",
    ROLES: "R",
    GROUPS: "G",
    USER: "U",
  }
  @ViewChild("popupViewCard") popupViewCard : TemplateRef<any>;
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private dt:ChangeDetectorRef,
    private callfc:CallFuncService,
    private auth:AuthService,
    private notifySV:NotificationsService,
    @Optional() dialogRef?: DialogRef,
    @Optional() dd?:DialogData
  ) 
  {
    this.funcID = dd.data;
    this.dialog = dialogRef;
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDataAsync(this.funcID);
    this.getMessageNoti("SYS009");
    this.getMyWallet(this.user.userID);
  }
  loadDataAsync(funcID:string){
    if(funcID){
      this.cache.functionList(funcID)
      .subscribe((func:any) => {
        if(func && func?.formName && func?.gridViewName && func?.entityName && func?.description){
          this.cardType = func.dataValue;
          this.formName = func.formName;
          this.gridViewName = func.gridViewName;
          this.entityName = func.entityName;
          this.title = func.description;
          this.cache.gridViewSetup(this.formName,this.gridViewName)
          .subscribe((grdSetUp:any) => {
            if(grdSetUp && grdSetUp?.Rating?.referedValue){
              this.ratingVll = grdSetUp.Rating.referedValue;
              this.cache.valueList(this.ratingVll)
              .subscribe((vll:any) => {
                if(vll){
                  this.lstRating = vll.datas;
                }
              })
            }
          })
          this.loadParameter(this.cardType);
          if(this.cardType  != this.CARDTYPE_EMNUM.Share && this.cardType  != this.CARDTYPE_EMNUM.Radio)
          {
            this.loadDataPattern(this.cardType);
          }
        }
      })
    }
  }
  loadParameter(cardType:string){
    this.api.execSv(
      "SYS",
      "ERM.Business.SYS",
      "SettingValuesBusiness",
      "GetParameterAsync",
      ["FDParameters",cardType])
    .subscribe((res:any)=>{
      if(res){
        this.parameter = JSON.parse(res);
        if(this.parameter.MaxSendControl === "1"){
          this.getCountCardSend(this.user.userID, this.cardType);
        }
        if(this.parameter.MaxPointControl === "1"){
          if(this.parameter.ActiveCoins){
            this.getCountPointSend(this.user.userID, this.cardType,this.parameter.ActiveCoins);
          }
        }
        console.log(this.parameter);
        this.dt.detectChanges();
      }
    })
  }
  getCountCardSend(senderID:string,cardType:string){
    this.api.execSv("FD","ERM.Business.FD","CardsBusiness","GetCountCardSendAsync",[senderID,cardType])
    .subscribe((res:number) => {
      if(res >=0 ){
        this.countCardSend = res;
      }
    })
  }
  getCountCardRecive(reciverID:string,cardType:string){
    this.api.execSv("FD","ERM.Business.FD","CardsBusiness","GetCountCardReciveAsync",[reciverID,cardType])
    .subscribe((res:number) => {
      if(res >=0 ){
        this.countCardReive = res;
      }
    })
  }
  getCountPointSend(userID:string,cardType:string,activeCoins:string){
    this.api.execSv("FD","ERM.Business.FD","CardsBusiness","GetCountPointSendAsync",[userID,cardType,activeCoins])
    .subscribe((res:number) => {
      if(res >=0 ){
        this.countPointSend = res;
      }
    })
  }
  loadDataPattern(cardType:string) {
    this.api
      .execSv("FD","ERM.Business.FD", "PatternsBusiness", "GetPatternsAsync", [
        cardType,
      ])
      .subscribe((res:any) => {
        if (res && res.length > 0)
        {
          debugger
          this.lstPattern = res;
          let patternDefault = this.lstPattern.find((e:any)=> e.isDefault == true);
          this.patternSelected = patternDefault ? patternDefault : this.lstPattern[0]; 
          this.dt.detectChanges();
        }
      });
  }
  getMyWallet(userID:string){
    this.api.execSv(
      "FD",
      "ERM.Business.FD",
      "WalletsBusiness",
      "GetWalletsAsync",
      [userID]
    ).subscribe((res:any)=>{
      if(res){
        this.myWallet = res;
      }
    })
  }
  initForm(){
    this.form = new FormGroup({
      receiver: new FormControl(null),
      behavior : new FormControl(null),
      situation : new FormControl(""),
      industry: new FormControl(null),
      patternID: new FormControl(""),
      rating: new FormControl(""),
      giftID:new FormControl(""),
      quantity: new FormControl(0),
      coins: new FormControl(0)
    })
  }
  valueChange(e:any)
  {
    if(!e?.field || !e?.data){
      return;
    }
    let data = e.data;
    let field = e.field;
    switch(field){
      case "rating":
        this.rating = data;
        this.form.patchValue({rating : data});
        break;
      case "giftID":
        this.getGiftInfor(data);
        break;
      case "quantity":
        if(!this.gift || !this.gift?.availableQty || !this.gift?.price){
          this.form.patchValue({ quanlity : 0});
          this.notifySV.notify("Vui lòng chọn quà tặng");
          return;
        }
        else if(data > this.gift.availableQty){
          this.form.patchValue({ quanlity : this.quantityOld});
          this.notifySV.notify("Vượt quá số dư quà tặng");
          return;
        }
        else{
          this.quantityOld = data - 1;
          this.quantity = data;
          this.amount = this.quantity * this.gift.price;
          this.form.patchValue({ quantity : data});
        }
        break;
      case "behavior":
        this.behavior = data;
        this.form.patchValue({behavior: this.behavior});
        break;
      case "industry":
        this.industry = data;
        let obj = {};
        obj[field] = this.industry;
        this.api.execSv("BS", "ERM.Business.BS", "IndustriesBusiness", "GetListByID", this.industry).subscribe(
          (res:any) => {
            if(res){
              this.userReciver = res[0].description;
              this.api.callSv("SYS", "ERM.Business.AD", "UsersBusiness", "GetAsync", this.userReciver).subscribe(res2 => {
                  if (res2.msgBodyData.length) {
                    this.userReciverName = res2.msgBodyData[0].userName;
                    this.form.patchValue({receiver: this.userReciver});
                  }
                })
            }
          }
        )
        this.form.patchValue(obj);
        break;
      case "situation":
        this.situation = data;
        this.form.patchValue({situation: this.situation});
        break;
      case "receiver":
        this.userReciver = data;
        this.form.patchValue({receiver: this.userReciver});
        if(this.parameter.MaxReceiveControl == "1"){
          this.getCountCardRecive(data,this.cardType);
        }
        this.checkValidateWallet(this.userReciver);
        break;
      default:
        break;
    }
    this.dt.detectChanges();
  }

  checkValidateWallet(receiverID:string) {
    this.api
      .execSv<any>(
        "FD",
        "ERM.Business.FD",
        "WalletsBusiness",
        "CheckWallet",
        receiverID
      )
      .subscribe((res) => {
        if (res) {
          this.isWalletReciver = true;
        } else {
          this.isWalletReciver = false;
          this.notifySV.notify("Người nhận chưa tích hợp ví");
        }
      });
  }

  getMessageNoti(mssgCode:string){
    this.cache.message(mssgCode).subscribe((mssg:any)=>{
      if(mssg){
        this.mssgNoti = mssg.defaultName;
        this.dt.detectChanges();
      }
    })
  }
  Save() 
  {
    debugger
    if (!this.form.controls['receiver'].value) 
    {
      let mssg  = Util.stringFormat(this.mssgNoti, "Người nhận");
      this.notifySV.notify(mssg);
      return;
    }
    else if (!this.form.controls['situation'].value) 
    {
      let mssg  = Util.stringFormat(this.mssgNoti, "Nội dung");
      this.notifySV.notify(mssg);
      return;
    }
    if(this.parameter)
    {
      switch(this.parameter.RuleSelected){
        case "0":
          break;
        case "1":
          if (!this.form.controls["behavior"].value) {
            let mssg  = Util.stringFormat(this.mssgNoti, "Qui tắc ứng xử");
            this.notifySV.notify(mssg);
            return;
          }
          break;
        case "2":
          if (!this.form.controls["industry"].value) {
            let mssg  = Util.stringFormat(this.mssgNoti, "Hành vi ứng xử");
            this.notifySV.notify(mssg);
            return;
          }
          break;
        default:
          break;
      };
        
    }
    if(!this.myWallet)
    {
      this.notifySV.notify("Bạn chưa tích hợp ví");
      return; 
    }
    else if(this.myWallet.coins < this.amount)
    {
      this.notifySV.notify("Số dư ví của bạn không đủ");
      return;
    }
    else
    {
      let card = new FED_Card();
      card = this.form.value;
      card.functionID = this.funcID;
      card.entityPer = this.entityName;
      card.cardType = this.cardType;
      card.shareControl = this.shareControl;
      card.objectType = this.objectType;
      card.listShare = this.lstShare;
      if(this.cardType != this.CARDTYPE_EMNUM.SuggestionImprovement || this.cardType != this.CARDTYPE_EMNUM.Share ){
        if(this.patternSelected?.patternID){
          card.pattern = this.patternSelected.patternID;
        }
      }
      if(this.gift){
        card.hasGifts = true;
      }
      if(this.givePoint > 0){
        card.hasPoints = true;
        card.coins = this.givePoint
      }
      // if(this.parameter){
      //   // max send
      //   if(this.parameter.MaxSendControl === "1")
      //   {
      //     if(this.countCardSend > this.parameter.MaxSends){
      //       this.notifySV.notify("Bạn đã gửi tối đa số phiểu cho phép");
      //       return;
      //     }
      //   }
      //   // max recive
      //   if(this.parameter.MaxReceiveControl === "1")
      //   {
      //     if(this.countCardReive > this.parameter.MaxReceives){
      //       this.notifySV.notify("Người nhận đã nhận tối đa số phiểu cho phép");
      //       return;
      //     }
      //   }
      //   // max point
      //   if(this.parameter.MaxPointControl === "1")
      //   {
      //     if(this.givePoint > this.parameter.MaxPoints){
      //       this.notifySV.notify("Tặng quá số xu cho phép");
      //       return;
      //     }  
      //   }
      // }
      this.api
        .execSv<any>("FD", "ERM.Business.FD", "CardsBusiness", "AddAsync", card)
        .subscribe((res:any[]) => {
          if (res && res[0] && res[1]) {
            (this.dialog.dataService as CRUDService).add(res[1], 0).subscribe();
            this.dialog.close();
          }
          else
          {
            this.notifySV.notify(res[1]);
          }
        });
    }
    
  }
  postFeedBack(cardID:string,shareControl:string){
    this.api
      .execSv("WP", "ERM.Business.WP", "CommentsBusiness", "FeedBackPostAsync", [cardID,shareControl])
      .subscribe((res) => {
        if(res){
          this.notifySV.notify("Thêm thành công!");
        }
      })
  }
  openFormShare(content: any) {
    this.callfc.openForm(content, '', 420, window.innerHeight);
  }


  eventApply(event: any) {
    debugger
    if (!event) {
      return;
    }
    this.lstShare = [];
    let data = event;
    this.shareControl = data[0].objectType;
    this.objectType = data[0].objectType;
    switch(this.shareControl){
      case this.SHARECONTROLS.OWNER:
      case this.SHARECONTROLS.EVERYONE:
      case this.SHARECONTROLS.MYCOMPANY:
      case this.SHARECONTROLS.MYDEPARMENTS:
      case this.SHARECONTROLS.MYDIVISION:
      case this.SHARECONTROLS.MYGROUP:
      case this.SHARECONTROLS.MYTEAM:
        let p = new FD_Permissions();
          p.objectType = this.objectType;
          this.lstShare.push(p);
        break;
      case this.SHARECONTROLS.DEPARMENTS:
      case this.SHARECONTROLS.GROUPS:
      case this.SHARECONTROLS.ROLES:
      case this.SHARECONTROLS.OGRHIERACHY:
      case this.SHARECONTROLS.POSITIONS:
      case this.SHARECONTROLS.USER:
        data.forEach((x: any) => {
          let p = new FD_Permissions();
          p.objectType = x.objectType;
          p.objectID = x.id;
          p.objectName = x.text;
          this.lstShare.push(p);
        });
        break;
      default:
        break;
    }
    this.dt.detectChanges();
  }

  removeUser(user:any){
    this.lstShare = this.lstShare.filter((x:any) => x.objectID != user.objectID);
    this.dt.detectChanges();
  }

  selectCard(item) {
    if (!item)
    {
      return;
    }
    this.patternSelected = item;
    this.dt.detectChanges();
  }

  previewCard(){
    if(this.popupViewCard){
      this.callfc.openForm(this.popupViewCard,"",350,500,"",null,"");
    }
  }

  closeViewCard(dialogRef:DialogRef){
    dialogRef.close();
  }

  subPoint(){
    this.givePoint--;
    this.dt.detectChanges();
  }
  addPoint(){
    // max points
    let point = this.givePoint + 1;
    if(this.parameter.MaxPointPerOnceControl === "1")
    {
      if(point > this.parameter.MaxPointPerOnce){
        this.notifySV.notify("Vượt quá số xu cho phép tặng");
        return;
      }
    }
    this.givePoint++;
    this.dt.detectChanges();
  }

  // get gift infor
  getGiftInfor(giftID:string){
    if(giftID){
      this.api.execSv(
        "FD",
        "ERM.Business.FD",
        "GiftsBusiness",
        "GetAsync",
        [giftID]
      ).subscribe((res:any)=>{
        if(res)
        {
          if(res.availableQty <= 0){
            this.notifySV.notify("Số dư quà tặng không đủ");
          }
          else{
            this.gift = res;
            this.form.patchValue({giftID : giftID});
          }
        }
      });
    }
  }
}
