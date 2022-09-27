import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthService, CacheService, CallFuncService, CRUDService, DialogData, DialogRef, NotificationsService, ViewsComponent } from 'codx-core';
import { FD_Permissions } from '../../models/FD_Permissionn.model';
import { FED_Card } from '../../models/FED_Card.model';
import { CardType, Valuelist } from '../../models/model';

@Component({
  selector: 'lib-popup-add-cards',
  templateUrl: './popup-add-cards.component.html',
  styleUrls: ['./popup-add-cards.component.scss']
})
export class PopupAddCardsComponent implements OnInit {
  funcID:string ="";
  entityName = "FD_Cards"
  gridViewName:string = "";
  formName:string = "";

  lstPattern:any[] = [];
  parameter: any = null;
  totalCoint:number = 0;
  givePoint:number = 0;
  quantity:number = 0;
  quantityOld:number = 0;
  situation:string = "";
  ratting:string = "";
  isWalletReciver = false;
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
  @ViewChild("tmpViewCard") tmpViewCard : TemplateRef<any>;
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
          this.title = func.description
          this.cache.gridViewSetup(this.formName,this.gridViewName)
          .subscribe((grdSetUp:any) => {
            if(grdSetUp && grdSetUp?.Rating?.referedValue){
              this.ratingVll = grdSetUp.Rating.referedValue;
              this.cache.valueList(this.ratingVll)
              .subscribe((vll:any) => {
                if(vll){
                  this.lstRating = vll.datas;
                  console.log(vll);
                }
              })
              this.dt.detectChanges();
            }
          })
          this.loadParameter(this.cardType);
          if(this.cardType  == this.CARDTYPE_EMNUM.Commendation ||
            this.cardType  == this.CARDTYPE_EMNUM.Congratulation || 
            this.cardType  == this.CARDTYPE_EMNUM.Thankyou || 
            this.cardType  == this.CARDTYPE_EMNUM.CommentForChange )
          {
            this.loadDataPattern(this.cardType);
          }
        }
      })
    }
  }
  loadParameter(cardType:string){
    this.api.execSv("SYS","ERM.Business.SYS","SettingValuesBusiness","GetParameterByFDAsync",["FDParameters",cardType])
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
  countCardSend:number = 0;
  getCountCardSend(senderID:string,cardType:string){
    this.api.execSv("FD","ERM.Business.FD","CardsBusiness","GetCountCardSendAsync",[senderID,cardType])
    .subscribe((res:number) => {
      if(res >=0 ){
        this.countCardSend = res;
      }
    })
  }
  countCardReive:number = 0;
  getCountCardRecive(reciverID:string,cardType:string){
    this.api.execSv("FD","ERM.Business.FD","CardsBusiness","GetCountCardReciveAsync",[reciverID,cardType])
    .subscribe((res:number) => {
      if(res >=0 ){
        this.countCardReive = res;
      }
    })
  }
  countPointSend:number = 0;
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
          this.lstPattern = res;
          this.patternSelected = this.lstPattern.find((e:any)=>{return e.isDefault});
          this.dt.detectChanges();
        }
      });
  }
  initForm(){
    this.form = new FormGroup({
      receiver: new FormControl(""),
      behavior : new FormControl(null),
      situation : new FormControl(""),
      industry: new FormControl(null),
      patternID: new FormControl(""),
      rating: new FormControl(""),
      giftID:new FormControl(""),
      quanlity: new FormControl(0),
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
        this.ratting = data;
        this.form.patchValue({rating : data});
        break;
      case "giftID":
        break;
      case "quantity":
        if(!this.gift){
          this.form.patchValue({ quanlity : 0});
          this.notifySV.notify("Vui lòng chọn quà tặng trước!");
          return;
        }
        let quantity = data;
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

  Save() {
    if (!this.userReciver && this.cardType != "5" && this.cardType != "4") {
      this.notifySV.notify("Vui lòng chọn người nhận !");
      return;
    }
    else if (!this.refValue && this.cardType != "5" && this.cardType != "4") {
      if (!this.form.value["behavior"]) {
        this.notifySV.notify("Vui lòng chọn qui tắc ứng xử!");
        return;
      }
    }
    else if (!this.situation) {
      this.notifySV.notify("Vui lòng nhập nội dụng!");
      return;
    }
    else
    {
      let card = new FED_Card();
      card = this.form.value;
      card.functionID = this.funcID;
      card.entityPer = this.entityName;
      card.cardType = this.cardType;
      card.listShare = this.lstShare;
      card.objectType = this.objectType;
      card.pattern = this.patternSelected.patternID;
      if(this.parameter){
        // max send
        if(this.parameter.MaxSendControl === "1")
        {
          if(this.countCardSend > this.parameter.MaxSends){
            this.notifySV.notify("Bạn đã gửi tối đa số phiểu cho phép");
            return;
          }
        }
        // max recive
        if(this.parameter.MaxReceiveControl === "1")
        {
          if(this.countCardReive > this.parameter.MaxReceives){
            this.notifySV.notify("Người nhận đã nhận tối đa số phiểu cho phép");
            return;
          }
        }
        // max point
        if(this.parameter.MaxPointControl === "1")
        {
          if(this.givePoint > this.parameter.MaxPoints){
            this.notifySV.notify("Tặng quá số xu cho phép");
            return;
          }  
        }
        
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

  openFormShare(content: any) {
    this.callfc.openForm(content, '', 420, window.innerHeight);
  }


  eventApply(event: any) {
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

  viewCard(){
    this.callfc.openForm(this.tmpViewCard,"",350,500,"",null,"");
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
}
