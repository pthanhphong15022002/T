import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthService, CacheService, CallFuncService, CRUDService, DialogData, DialogRef, NotificationsService, ViewsComponent } from 'codx-core';
import { FD_Permissions } from '../../models/FD_Permissionn.model';
import { FED_Card } from '../../models/FED_Card.model';
import { CardType } from '../../models/model';

@Component({
  selector: 'lib-popup-add-cards',
  templateUrl: './popup-add-cards.component.html',
  styleUrls: ['./popup-add-cards.component.scss']
})
export class PopupAddCardsComponent implements OnInit {
  funcID:string ="";
  entityPer:string = "";
  dataValue:string ="";
  lstCard:any[] = [];
  parameter: any;
  itemIDNew = "";
  totalCoint:number = 0;
  givePrice:number = 0;
  quantity:number = 0;
  quantityOld:number = 0;
  situation = "";
  isWalletReciver = false;
  user:any;
  wallet:any;
  behavior = [];
  industry = "";
  price:number = 0;
  entityName = "FD_Cards"
  showNavigationArrows:boolean = false;
  dialog: DialogRef;
  title:string ="";
  cardType:string ="";
  CARDTYPE_EMNUM = CardType;
  form: FormGroup;
  refValue = "Behaviors_Grp";
  userReciver:string = "";
  userReciverName:string ="";
  vllData: any;
  vll:string = "";
  lstShare:any[] = [];
  gift:any;
  giftCount:number;
  typeCheck:string = "";
  permissions:any[] = [];
  shareControl:string = "";
  MEMBERTYPE = {
    CREATED: "1",
    SHARE: "2",
    TAGS: "3"
  }
  @ViewChild("codxViews") codxViews: ViewsComponent;
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
    this.funcID = dd.data.funcID;
    this.cardType = dd.data.cardType;
    this.title = dd.data.title;
    this.vll = dd.data.valueList;
    this.dialog = dialogRef;
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    this.api
      .callSv("SYS", "ERM.Business.CM", "ParametersBusiness", "GetOneField", [
        "FD_Parameters",
        "1",
        "RuleSelected",
      ])
      .subscribe((res) => {
        if (res && res.msgBodyData[0]) {
          var data = res.msgBodyData[0];
          if (data.fieldValue == "2") this.refValue = "Behaviors";
          if (data.fieldValue == "0") this.refValue = "";
          this.typeCheck = data.fieldValue;
          this.dt.detectChanges();
        }
      });
    this.cache.functionList(this.funcID).subscribe(res => {
      if(res){
        this.cardType = res.dataValue;
        this.dataValue = res.dataValue;
        this.entityPer =  res.entityName;
        if(this.vll != ""){
          this.cache.valueList(this.vll).subscribe((res) => {
            if (res)
            {
              this.vllData = res.datas;
              console.log(this.vll , this.vllData)
            }
          });
        }
        this.LoadDataCard();
        this.loadParameter("FED_Parameters",this.cardType,"1");
      }
    })
    this.initForm();
  }
  loadParameter(formName = "FED_Parameters",transType = "1",category = "1"){
    this.api.execSv("FD","ERM.Business.FD","WalletsBusiness","GetParameterByWebAsync",[formName,transType,category])
    .subscribe((res:any) => 
    {
      if(res){
        console.log('loadParameter: ',res)
        // this.parameter = JSON.parse(res[0]);
        // this.totalCointGived = res[1];
      }
      else{
        this.parameter = null;
      }
    });
    this.dt.detectChanges();
  }

  initForm(){
    this.form = new FormGroup({
      receiver: new FormControl(""),
      behavior : new FormControl(null),
      situation : new FormControl(""),
      industry: new FormControl(null),
      pattern: new FormControl(""),
      rating: new FormControl(""),
      gift:new FormControl(""),
      quanlity: new FormControl(0),
      coins: new FormControl(0)
    })
  }
  valueChange(e, element = null)
  {
    if(!e || !e.data){
      return;
    }
    let value = e;
    let field = value.field;
    switch(field){
      case "rating":
        this.form.patchValue({rating : value.data});
        break;
      case "giftID":
        break;
      case "quantity":
        if(!this.gift){
          this.form.patchValue({ quanlity : 0});
          this.notifySV.notify("Vui lòng chọn quà tặng trước!");
          return;
        }
        let quantity = value.data;
        if(quantity > this.giftCount){
          this.quantity = this.quantityOld + 1;
          this.totalCoint = this.quantity * this.gift.Price;
          this.form.patchValue({ quanlity : this.quantity});
          this.notifySV.notify("Vượt quá số lượng tồn kho!");
          return;
        }
        let priceGiftGive = this.gift.Price * quantity;
        if(priceGiftGive > this.wallet.coins){
          this.quantity = this.quantityOld + 1;
          this.totalCoint = this.quantity * this.gift.Price;
          this.form.patchValue({ quanlity : this.quantity});
          this.notifySV.notify("Số dư ví của bạn không đủ");
          return;
        }
        this.quantityOld = this.quantity;
        this.quantity = quantity;
        this.totalCoint = this.quantity * this.gift.Price;
        this.form.patchValue({ quanlity : this.quantity});
        break;
      case "behavior":
        this.behavior = value.data;
        this.form.patchValue({behavior: this.behavior});
        break;
      case "industry":
        this.industry = value.data;
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
        this.situation = value.data;
        this.form.patchValue({situation: this.situation});
        break;
      case "receiver":
        this.userReciver = value.data;
        this.form.patchValue({receiver: this.userReciver});
        this.checkValidateWallet(this.userReciver);
        break;
      default:
        break;
    }
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

  
  
  objectType:string ="";
  Save() {
    if (!this.userReciver && this.cardType != "5" && this.cardType != "4") {
      this.notifySV.notify("Vui lòng chọn người nhận trước !");
      return;
    }
    else if (!this.refValue && this.cardType != "5" && this.cardType != "4") {
      if (!this.form.value["behavior"]) {
        this.notifySV.notify("Vui lòng chọn hành vi!");
        return;
      }
    }
    else if (!this.situation) {
      this.notifySV.notify("Vui lòng nhập nội dụng!");
      return;
    }
    else
    {
      if (this.gift) {
        this.gift.Quanlity = this.quantity;
        this.gift.Price = this.price * this.quantity;
        var lstGift = [];
        lstGift.push(this.gift);
      }
      let card = new FED_Card();
      card = this.form.value;
      card.functionID = this.funcID;
      card.entityPer = this.entityPer;
      card.cardType = this.cardType;
      card.coins = this.givePrice;
      card.gifts = lstGift;
      card.listShare = this.lstShare;
      card.objectType = this.objectType;
      card.shareds = card.comment;
      if(!card.pattern && this.cardType != this.CARDTYPE_EMNUM.Share && this.cardType != this.CARDTYPE_EMNUM.Congratulation){
        card.pattern = this.cardSelected.patternID;
      }
      this.api
        .execSv<any>("FD", "ERM.Business.FD", "CardsBusiness", "AddAsync", card)
        .subscribe((res) => {
          if (res) {
            var cardID = res[1];
            (this.dialog.dataService as CRUDService).add(res[4], 0).subscribe();
            this.dialog.close();
            this.postFeedBack(cardID,this.shareControl);
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
  subPoint(){

  }
  addPoint(){}


  openFormShare(content: any) {
    this.callfc.openForm(content, '', 420, window.innerHeight);
  }

  eventApply(event: any) {
    if (!event) {
      return;
    }
    let data = event;
    this.shareControl = data[0].objectType;
    this.objectType = data[0].objectType;
    data.forEach((x: any) => {
      let p = new FD_Permissions();
      p.objectType = x.objectType;
      p.objectID = x.id;
      p.objectName = x.text;
      p.memberType = this.MEMBERTYPE.SHARE;
      this.lstShare.push(p);
    });
    this.dt.detectChanges();
  }

  removeUser(user:any){
    this.lstShare = this.lstShare.filter((x:any) => x.objectID != user.objectID);
    this.dt.detectChanges();
  }

  totalRecorItem = 4;
  cardSelected: any;

  LoadDataCard() {
    this.api
      .execSv("FD","ERM.Business.FD", "PatternsBusiness", "GetCardTypeAsync", [
        this.cardType,
      ])
      .subscribe((res:any) => {
        if (res && res.length > 0) {
          this.lstCard = res;
          console.log(this.lstCard)
          if(this.lstCard.length > this.totalRecorItem){
            this.showNavigationArrows = true;
          }
          var cardDefault = this.lstCard.find((item) => item.isDefault == true);
          var cardFirst = this.lstCard[0];
          var cardDefaultIdx;
          if (cardDefault != null) {
            cardDefaultIdx = this.lstCard.findIndex(
              (item) => item == cardDefault
            );
            this.lstCard.splice(cardDefaultIdx, 1);
            this.lstCard.unshift(cardDefault);

            this.cardSelected = cardDefault;
            this.cardSelected.selected = true;
          } else {
            cardDefaultIdx = this.lstCard.findIndex(
              (item) => item == cardFirst
            );
            this.lstCard.splice(cardDefaultIdx, 1);
            this.lstCard.unshift(cardFirst);

            this.cardSelected = cardFirst;
            this.cardSelected.selected = true;
          }
          this.dt.detectChanges();
        }
      });
  }
  selectCard(item, element) {
    if (this.cardSelected) {
      this.cardSelected.selected = false;
    }
    item.selected = true
    this.cardSelected = item;
    this.form.patchValue({ pattern: item.patternID });
    this.dt.detectChanges();
  }
}
