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
  lstUser:any[] = [];
  gift:any;
  giftCount:number;
  typeCheck:string = "";
  myPermission:Permission = null;
  adminPermission:Permission = null;
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
        "FED_Parameters",
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
        this.getStatusValuelistName();
      }
    })
    this.myPermission = new Permission();
    this.myPermission.objectType = this.SHARECONTROLS.OWNER;
    this.myPermission.memberType = this.MEMBERTYPE.CREATED;
    this.myPermission.objectID = this.user.userID;
    this.myPermission.objectName = this.user.userName;
    this.myPermission.create = true;
    this.myPermission.update = true;
    this.myPermission.delete = true;
    this.myPermission.upload = true;
    this.myPermission.download = true;
    this.myPermission.assign = true;
    this.myPermission.share = true;
    this.myPermission.read = true;
    this.myPermission.isActive = true;
    this.myPermission.createdBy = this.user.userID;
    this.myPermission.createdOn = new Date();
    //admin
    this.adminPermission = new Permission();
    this.adminPermission.objectType = "7";
    this.adminPermission.memberType = this.MEMBERTYPE.SHARE;
    this.adminPermission.create = true;
    this.adminPermission.update = true;
    this.adminPermission.delete = true;
    this.adminPermission.upload = true;
    this.adminPermission.download = true;
    this.adminPermission.assign = true;
    this.adminPermission.share = true;
    this.adminPermission.read = true;
    this.adminPermission.isActive = true;
    this.adminPermission.createdBy = this.user.userID;
    this.adminPermission.createdOn = new Date();
    this.permissions.push(this.myPermission);
    this.permissions.push(this.adminPermission);
    this.initForm();
  }

  getStatusValuelistName() {
    // if (this.tabActive == this.STATUS_ACTIVE.APPROVER) {
    //   this.TypeValuelistStatus = "approveStatus";
    //   this.NameValuelistStatus = "L1425";
    //   return;
    // }
    // this.TypeValuelistStatus = "status";
    // if (this.tabActive != this.STATUS_ACTIVE.APPROVER) {
    //   if (this.cardType == this.CARD_TYPE.COMMENT_FOR_CHANGE) {
    //     this.NameValuelistStatus = "L1421";
    //   } else {
    //     this.NameValuelistStatus = "L1420";
    //   }
    //   return;
    // }
  }
  open(cardDisplay:any){

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

  valueChange(e, element = null)
  {
    if(e[0] == ""){
      return;
    }
    let field = e.field ? e.field : element?.field;
      if(field == "rating"){
        this.form.patchValue({rating : e});
      }
      else if (field == "giftID") {
        var giftID = e[0];
        // this.getGiftInfor(giftID)
      } 
      else if (field == "quantity") {
        if(!this.gift){
          this.form.patchValue({ quanlity : 0});
          this.notifySV.notify("Vui lòng chọn quà tặng trước!");
          return;
        }
        
        let quantity = e.data.value;
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
      } 
      else if (field == "behavior") {
        this.behavior = e.data;
        this.form.patchValue({behavior: this.behavior});
      } 
      else if (field == "industry") {
        this.industry = e[0];
        var obj = {};
        obj[field] = this.industry;
        if(!this.industry){
          return;
        }
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
  
      } 
      else if (field == "situation") {
        this.situation = e.data;
        this.form.patchValue({situation: this.situation});
      } 
      else if (field == "receiver")
      {
        this.userReciver = e.data;
        this.form.patchValue({receiver: this.userReciver});
        this.checkValidateWallet(this.userReciver);
      }    
      else{ return}
  }

  clickCloseAssideRight(){

  }
  checkValidateWallet(receiverID:string) {
    if (receiverID) 
    {
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
    else {
      this.notifySV.notify("Vui lòng chọn người nhận trước !");
    }
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
  price:number = 0;
  entityName = "FD_Cards"

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
      card.entityName = this.entityName;
      card.entityPer = this.entityPer;
      card.cardType = this.cardType;
      card.coins = this.givePrice;
      card.gifts = lstGift;
      card.shareds = card.comment;
      var lstPermissions: FD_Permissions[]  = [];
      // sender
      var per1 = new FD_Permissions();
      per1.objectType = '1';
      per1.objectID = this.user.userID;
      per1.objectName = this.user.userName;
      per1.memberType = "1";
      per1.read = true;
      per1.update = true;
      per1.delete = true;
      per1.share = true;
      per1.createdBy = this.user.userID;
      per1.isActive = true;
      per1.createdOn = new Date();
      // reciver
      var per2 = new FD_Permissions();
      per2.objectType = 'U';
      per2.objectID = this.userReciver;
      per2.objectName  = this.userReciver;
      per2.isActive = true;
      per2.read = true;
      per2.share = true;
      per2.createdBy = this.user.userID;
      per2.createdOn = new Date();
      if(this.cardType == this.CARDTYPE_EMNUM.Congratulation){
        per2.memberType = "3";
      }
      else
      {
        per2.memberType = "2";
      }
      // ADMIN
      var per3 = new FD_Permissions();
      per3.objectType = '7';
      per3.memberType = "3";
      per3.read = true;
      per3.share = true;
      per3.isActive = true;
      per3.createdBy = this.user.userID;
      per3.createdOn = new Date();
      lstPermissions.push(per1);
      lstPermissions.push(per2);
      lstPermissions.push(per3)
      this.lstUser.forEach((x:any) => {
        var p = new FD_Permissions();
        p.userID = x.userID;
        p.objectType = x.objectType;
        p.objectID = x.objectID;
        p.objectName  = x.objectName;
        p.isActive = true;
        p.read = true;
        p.share = true;
        p.memberType = "3";
        p.createdBy = this.user.userID;
        p.createdOn = new Date();
        lstPermissions.push(p)
      });
      card.permissions = lstPermissions;
      if(!card.pattern && this.cardType != this.CARDTYPE_EMNUM.Share && this.cardType != this.CARDTYPE_EMNUM.Congratulation){
        card.pattern = this.cardSelected.patternID;
      }
      console.log('card: ', card);
      this.api
        .execSv<any>("FD", "ERM.Business.FD", "CardsBusiness", "AddAsync", card)
        .subscribe((res) => {
          if (res) {
            var cardID = res[1];
            (this.dialog.dataService as CRUDService).add(res[4], 0).subscribe();
            this.dialog.close();
            this.dt.detectChanges();
            this.postFeedBack(cardID);
          }
        });
    }
    
  }
  postFeedBack(cardID, type = "3"){
    this.api
      .execSv("WP", "ERM.Business.WP", "CommentsBusiness", "FeedBackPostAsync", [cardID,type])
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

  permissions:any[] = [];
  shareControl:string = "";
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
  eventApply(event: any) {
    if (!event) {
      return;
    }
    this.permissions = [];
    let data = event[0];
    this.shareControl = data.objectType;
    data.dataSelected.forEach((x: any) => {
      let p = new FD_Permissions();
      p.userID = x.userID;
      p.objectType = this.shareControl;
      p.objectID = x.UserID;
      p.objectName = x.UserName;
      p.memberType = this.MEMBERTYPE.SHARE;
      p.read = true;
      p.share = true;
      p.isActive = true;
      p.createdBy = this.user.userID;
      p.createdOn = new Date();
      this.permissions.push(p);
      this.lstUser.push(p);
    });
    this.dt.detectChanges();
  }

  removeUser(user:any){
    this.lstUser = this.lstUser.filter((x:any) => x.objectID != user.objectID);
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
