import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WPService } from '@core/services/signalr/apiwp.service';
import { NgbCarousel, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permission } from '@shared/models/file.model';
import { ButtonModel, ViewModel, CodxListviewComponent, ViewsComponent, ApiHttpService, NotificationsService, AuthStore, CallFuncService, FilesService, CacheService, DataRequest, ViewType, UIComponent, SidebarModel } from 'codx-core';
import { FD_Permissions } from '../models/FD_Permissionn.model';
import { FED_Card } from '../models/FED_Card.model';
import { CardType, FunctionName, Valuelist } from '../models/model';
import { PopupAddCardsComponent } from './popup-add-cards/popup-add-cards.component';

@Component({
  selector: 'lib-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent extends UIComponent implements OnInit {


  public ratingVll: string = "";
  CARDTYPE_EMNUM = CardType;
  readonly STATUS_ACTIVE = {
    CARD: "1",
    APPROVER: "2",
  };
  readonly CARD_TYPE = {
    COMMENT_FOR_CHANGE: "4",
    SHARE: "6",
  };
  user = null;
  tabActive = this.STATUS_ACTIVE.CARD; // 2 là phiếu nhận; 1 là phiếu cho
  predicate = "CardType = @0 && Deleted == false";
  dataValue = "";
  entityName = "FD_Cards"
  buttonAdd: ButtonModel;
  views: Array<ViewModel> = [];
  totalRecorItem = 4;
  showNavigationArrows = false;
  itemSelected :any;
  cardType = "";
  gridViewName = "";
  formName = "";
  entityPer = "";
  tabApproval = false;
  approver: string;
  policyControl: any;
  activeCoins: any;
  activeMyKudos: any;
  userGroupOfAccount: string;
  isShowCard: boolean = true;
  NameValuelistStatus = "";
  TypeValuelistStatus = "";
  functionID = "FD";
  isOpen = false;
  quantity = 1;
  price = 0;
  totalCoint = 0;
  givePrice = 0;
  lstCard = [];
  field = "";
  form: FormGroup;
  lstUser = [];
  refValue = "Behaviors_Grp";
  activeCoCoins = "1";
  wallet: any = {};
  vll = "L1441";
  vllData: any;
  userReciver = "";
  situation = "";
  cardSelected: any;
  itemIDOld = "";
  quantityOld = 0;
  itemIDNew = "";
  quantityNew = 0;
  title = "";
  gift: any = null;
  giftID = "";
  giftCount = 0;
  behavior = [];
  industry = "";
  typeCheck = "";
  objectID = "";
  objectIDReciver = "";
  userReciverName = "";
  currentlyChecked: CardType;
  @ViewChild("templateChooseUser") chooseUser;
  @ViewChild("templateGivePrice") tmlgivePrice;
  @ViewChild('sideBarRightRef') sideBarRightRef: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('codxViews') codxViews: ViewsComponent;
  @ViewChild('carousel') carousel:NgbCarousel;
  @ViewChild("itemTemplate") itemTemplate : TemplateRef<any>;
  menuAppend = []
  moreFunction = [];
  isDropdowMenu = false;
  constructor(
    private injector:Injector,
    private dt: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private auth: AuthStore,
    private callc:CallFuncService,
    private fileSV: FilesService,
    private at: ActivatedRoute,
    private modalService: NgbModal,
  ) {
    super(injector)
    this.user = this.auth.get();
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
  }


  onInit(): void {
    this.userGroupOfAccount = this.user.groupID;
    this.at.params.subscribe((params) => {
      var funcID = params.funcID;
      if (params.funcID != this.functionID) {
        this.functionID = funcID;
        this.vll = "";
        this.vllData = [];
        switch(funcID){
          case "FDT02":
            this.title ="Tuyên dương";
            this.dataValue = "1";
            break;
          case "FDT03":
            this.title = "Lời cảm ơn";
            this.vll = 'L1419';
            break;
          case "FDT04":
            this.title = "Góp ý thay đổi";
            this.vll = "L1424";
            break;
          case "FDT05":
            this.title = "Đề xuất cải tiến";
            this.isShowCard = false;

            break;
          case "FDT06":
            this.title = "Chia sẻ";
            this.isShowCard = false;
            break;
          case "FDT07":
            this.title = "Chúc mừng";
            break;
          case "FDT06":
            this.title = "Radio yêu thương";
            break;
          default:
            this.title = "";
            break;
        }
        this.functionID = params.funcID;
        this.cache.functionList(this.functionID).subscribe(res => {
          if(res){
            this.cardType = res.dataValue;
            // this.dataValue = res.dataValue;
            this.entityPer =  res.entityName;
            if(this.vll != ""){
              this.cache.valueList(this.vll).subscribe((res) => {
                if (res)
                {
                  this.vllData = res.datas;
                }
              });
            }
            this.loadParameter("FED_Parameters",this.cardType,"1");
            this.checkTabApporval(this.cardType);
            this.getStatusValuelistName();
            this.isShowCard = true;
            if (this.functionID != this.functionName.Improvement && this.functionID != this.functionName.Share) {
              this.LoadDataCard();
            }
            else 
            { 
              var tabInput = this.tabActive;
              tabInput = "3"; 
            }
          }
        })
      }
      this.getMyWallet();
      this.itemSelected = null;
      this.gift = null;
      this.cardSelected = null;
      this.initForm();
      this.dt.detectChanges();

    });

  }
  ngAfterViewInit() {
    this.buttonAdd = {
      id: 'btnAdd',
    };
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelLeftRef: this.panelLeftRef,
          panelRightRef: this.panelRightRef
        }
      }
    ];

  }
  changeModelPage(modelPage: DataRequest) {
    this.formName = modelPage.formName;
    this.gridViewName = modelPage.gridViewName;
    this.entityPer = modelPage.entityName;
    this.predicate = "CardType = @0 && Deleted == false";
    this.dataValue = this.cardType;
    this.dt.detectChanges();
  }


    


  openUser(field) {
    console.log(this.chooseUser);
    this.field = field;
    this.modalService.open(this.chooseUser, { centered: true });
  }
  isWalletReciver = false;
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
            this.notificationsService.notify("Người nhận chưa tích hợp ví");
          }
        });
    } else {
      this.notificationsService.notify("Vui lòng chọn người nhận trước !");
    }
  }

  clear() {
    this.givePrice = 0;
  }
  subPoint() {
    if (this.givePrice == 0) return;
    this.givePrice -= 1;
  }
  addPoint() {
    if(this.isWalletReciver){
      this.givePrice += 1;
      this.submit();
    }
    else{
      this.notificationsService.notify("Người nhận chưa tích hợp ví");
    }
  }

  getMyWallet() {
    this.api
      .execSv<any>(
        "FD",
        "ERM.Business.FD",
        "WalletsBusiness",
        "GetParamsAndWallet",
        this.user.userID
      )
      .subscribe((res) => {
        if (res && res.length) {
          this.activeCoCoins = res[0];
          this.wallet = res[1];
        }
      });
  }

  parameterFD: any;
  getParameter(){
    this.api
    .execSv("SYS","ERM.Business.CM","SettingsBusiness","GetParameterByFDAsync",["FED_Parameters",this.cardType,"1"])
    .subscribe((res) => {
      if(res)
      {
        this.parameterFD = res;
      }
    })
  }
  submit() {
    if (this.givePrice > this.wallet.coCoins) {
      this.notificationsService.notify("Vượt quá số xu trong ví");
      return;
    }
    let module = "FED_Parameters";
    let refType = this.cardType;
    let transType = this.activeCoCoins == "0" ? "1" : "4";
    let transPoint = this.givePrice;

    this.api
      .execSv<any>(
        "FED",
        "ERM.Business.FED",
        "WalletsBusiness",
        "CheckValidPoint",
        [module, transPoint, refType, transType]
      )
      .subscribe((res) => {
        if (res.error) this.notificationsService.notify(res.message);
      });
  }

  DeleteCard(item) {
    // this.notificationsService.alert("DoYouWantToDelete", "Bạn có muốn xóa ?").subscribe((confirmed) => {
    //   if (confirmed) {
    //     this.api
    //       .execSv<any>(
    //         "FED",
    //         "ERM.Business.FED",
    //         "CardsBusiness",
    //         "DeleteCardAsync",
    //         item.recID
    //       )
    //       .subscribe((res) => {
    //         this.listviewComponent.onChangeSearch();
    //       });
    //   }
    // });
    
  }
  selectedItem(data:any){
    console.log('selectedItem: ',data);
    return this.api
    .execSv("FD", "ERM.Business.FD", "CardsBusiness", "GetCardAsync", data.recID)
    .subscribe((res) => {
      if (res) {
        this.isShowCard = true;
        console.log('getOneCard: ',res);
        this.itemSelected = res;
        this.handleVllRating(this.itemSelected.cardType);
        if (this.itemSelected.temp) {
          this.getBehavior(this.itemSelected.temp);
        }
        if (this.itemSelected.industry) {
          this.getIndustry(this.itemSelected.industry);
        }
        this.dt.detectChanges();
      } else 
        this.itemSelected = null;
    });
  }
  applyData(e) {
    this.lstUser = e;
    if (e && e.length > 0) {
      var arrData = [];
      e.forEach((element) => {
        var obj = {};
        obj["id"] = element.objectID;
        obj["name"] = element.objectName;
        arrData.push(obj);
        this.form.patchValue({
          refType: element.objectType,
        });
      });
      this.form.patchValue({
        comment: JSON.stringify(arrData),
      });
    }
  }

  removeUserRight(index) {
    if (this.lstUser.length > 0) {
      this.lstUser.splice(index, 1);
      if (this.lstUser && this.lstUser.length > 0) {
        var arrData = [];
        this.lstUser.forEach((element) => {
          var obj = {};
          obj["id"] = element.objectID;
          obj["name"] = element.objectName;
          arrData.push(obj);
        });
        this.form.patchValue({
          comment: JSON.stringify(arrData),
        });
      }
      this.dt.detectChanges();
    }
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
        this.getGiftInfor(giftID)
      } 
      else if (field == "quantity") {
        if(!this.gift){
          this.form.patchValue({ quanlity : 0});
          this.notificationsService.notify("Vui lòng chọn quà tặng trước!");
          return;
        }
        
        let quantity = e.data.value;
        if(quantity > this.giftCount){
          this.quantity = this.quantityOld + 1;
          this.totalCoint = this.quantity * this.gift.Price;
          this.form.patchValue({ quanlity : this.quantity});
          this.notificationsService.notify("Vượt quá số lượng tồn kho!");
          return;
        }
        let priceGiftGive = this.gift.Price * quantity;
        if(priceGiftGive > this.wallet.coins){
          this.quantity = this.quantityOld + 1;
          this.totalCoint = this.quantity * this.gift.Price;
          this.form.patchValue({ quanlity : this.quantity});
          this.notificationsService.notify("Số dư ví của bạn không đủ");
          return;
        }
        this.quantityOld = this.quantity;
        this.quantity = quantity;
        this.totalCoint = this.quantity * this.gift.Price;
        this.form.patchValue({ quanlity : this.quantity});
      } 
      else if (field == "behavior") {
        this.behavior = e[0];
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
        this.situation = e.data.value;
        this.form.patchValue({situation: this.situation});
      } 
      else if (field == "receiver")
      {
        this.userReciver = e[0];
        this.form.patchValue({receiver: this.userReciver});
        this.checkValidateWallet(this.userReciver);
      }    
      else{ return}
  }


  getGiftInfor(giftID:string){
    if(this.giftID == giftID) return;
    this.api
    .execSv("FD","ERM.Business.FD","GiftsBusiness", "GetAsync", [giftID])
    .subscribe((res)=>{
      if(res){
        this.gift = res;
        this.giftID = this.gift.giftID;
        this.price = this.gift.Price;
        this.giftCount = this.gift.availableQty;
        this.dt.detectChanges();
      }
    })
  }

  extendShow(): void {
    //this.loadAttachment();
    // var body = $("#FormEdit");
    // if (body.length == 0) return;
    // if (body.hasClass("extend-show")) body.removeClass("extend-show");
    // else body.addClass("extend-show");
  }

  Save() {
    if (!this.userReciver && this.cardType != "5" && this.cardType != "4") {
      this.notificationsService.notify("Vui lòng chọn người nhận trước !");
      return;
    }

    else if (!this.refValue && this.cardType != "5" && this.cardType != "4") {
      if (!this.form.value["behavior"]) {
        this.notificationsService.notify("Vui lòng chọn hành vi!");
        return;
      }
    }
    else if (!this.situation) {
      this.notificationsService.notify("Vui lòng nhập nội dụng!");
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
      card.functionID = this.functionID;
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
      per3.createdOn = new Date();
      lstPermissions.push(per1);
      lstPermissions.push(per2);
      lstPermissions.push(per3)
      card.permissions = lstPermissions;
      if(!card.pattern && this.cardType != this.CARDTYPE_EMNUM.Share && this.cardType != this.CARDTYPE_EMNUM.Congratulation){
        card.pattern = this.cardSelected.patternID;
      }
      // this.api
      //   .execSv<any>("FD", "ERM.Business.FD", "CardsBusiness", "AddAsync", card)
      //   .subscribe((res) => {
      //     if (res) {
      //       var cardID = res[1];
      //       this.listviewComponent.addHandler(res[4], true, "recID");
      //       this.closeForm();
      //       this.dt.detectChanges();
      //       this.postFeedBack(cardID);
      //     }
      //   });
    }
    
  }


  postFeedBack(cardID, type = "3"){
    this.api
      .execSv("WP", "ERM.Business.WP", "CommentBusiness", "FeedBackPostAsync", [cardID,type])
      .subscribe((res) => {
        if(res){
          this.notificationsService.notify("Thêm thành công!");
        }
      })
  }
  closeForm(check = false): void {
    if (check) {
      this.itemIDNew = "";
      this.quantityNew = 0;
      this.updateQuantity();
    }
    this.gift = null;
    // this.codxViews.currentView.closeSidebarRight();
  }


  updateQuantity() {
    this.quantityNew = this.quantity;
    if (this.itemIDNew == this.itemIDOld) return;
    this.api.call("FD", "GiftsBusiness", "UpdateQuantityAsync", [this.itemIDNew, this.quantityNew, this.itemIDOld, this.quantityOld]).subscribe((res) => {
      if (res && res.msgBodyData[0]) {
        this.itemIDOld = this.itemIDNew;
        this.quantityOld = res.msgBodyData[0];
      }
    });
  }

  parameter: any;
  totalCointGived = 0;
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
  
  LoadDataCard() {
    this.api
      .execSv("FD","ERM.Business.FD", "PatternsBusiness", "GetCardTypeAsync", [
        this.cardType,
      ])
      .subscribe((res:any) => {
        if (res && res.length > 0) {
          this.lstCard = res;
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

  nextPaginationCard() {
  }
  backPaginationCard() {
  }

  onEmitWhenEmpty(data) {
    if (data == null) this.itemSelected = null;
  }

  public get functionName(): typeof FunctionName {
    return FunctionName;
  }
  getStatusValuelistName() {
    if (this.tabActive == this.STATUS_ACTIVE.APPROVER) {
      this.TypeValuelistStatus = "approveStatus";
      this.NameValuelistStatus = "L1425";
      return;
    }
    this.TypeValuelistStatus = "status";
    if (this.tabActive != this.STATUS_ACTIVE.APPROVER) {
      if (this.cardType == this.CARD_TYPE.COMMENT_FOR_CHANGE) {
        this.NameValuelistStatus = "L1421";
      } else {
        this.NameValuelistStatus = "L1420";
      }
      return;
    }
  }
  checkTabApporval(refType) {
    let module = "FED_Parameters";
    this.api
      .execSv<any>(
        "SYS",
        "ERM.Business.AD",
        "UsersBusiness",
        "CheckTabApproval",
        [module, refType]
      )
      .subscribe((res) => {
        if (res !== null) {
          this.tabApproval = true;
          this.approver = res.userGroup;
          this.changeOptionStatus(this.tabActive);
          return;
        }
        this.tabApproval = false;
        if (this.tabActive == this.STATUS_ACTIVE.APPROVER) {
          this.changeOptionStatus(this.STATUS_ACTIVE.CARD);
          this.dt.detectChanges();
        } else {
        }
        return;
      });
  }

  open(content) {
    var userReciver = { userID: this.userReciver };
    var obj = {
      title : this.title,
      selectCard: this.cardSelected,
      user: this.user,
      userReciver: userReciver,
      situation : this.situation
    }
    // this.callc.openForm(ViewCardComponent,"",300,0,this.functionID,obj).subscribe((dt) => {
    // });
    this.dt.detectChanges();
  }

  setGridviewSettup(valuelist:string) {
    this.cache.valueList(valuelist).subscribe((res) => {
      if (res) this.vllData = res.datas;
    });
    this.dt.detectChanges();
  }

  changeOptionStatus(status: string) {
    // this.listviewComponent.currentValue = status;
    // this.listviewComponent.onChangeSearch();
    // this.dt.detectChanges();
    // return;
  }
  parseJson(data) {
    var name = JSON.parse(data);
    return name[0];
  }
  getParams() {
    const t = this;
    let predicate =
      "FormName=@0 and FieldName=@1 or FieldName=@2 or FieldName=@3";
    let dataValue = "FED_Parameters;PolicyControl;ActiveCoins;ActiveMyKudos";
    this.api
      .execSv<any>(
        "SYS",
        "ERM.Business.CM",
        "ParametersBusiness",
        "GetByPredicate",
        [predicate, dataValue]
      )
      .subscribe((res) => {
        // if (res) {
        //   _.filter(res, function (o) {
        //     if (
        //       o.fieldName === "PolicyControl" &&
        //       o.refType == t.itemSelected.cardType
        //     )
        //       t.policyControl = o.fieldValue;
        //     if (o.fieldName === "ActiveCoins") t.activeCoins = o.fieldValue;
        //     if (o.fieldName === "ActiveMyKudos") t.activeMyKudos = o.fieldValue;
        //   });
        // }
      });
  }
  changeStatusApprovel(status) {
    let notification =
      status == "1" ? "Xác nhận đồng thuận?" : "Xác nhận không đồng thuận";
    // this.notificationsService
    //   .alert("Thông báo", notification)
    //   .subscribe((ok) => {
    //     if (ok) {
    //       if (status == "2") this.approvalCard(status);
    //       else {
    //         switch (this.policyControl) {
    //           case "0":
    //             //this.openSendPoint();
    //             console.log("");
    //             break;
    //           case "1":
    //             this.approvalCard(status);
    //             break;
    //           case "2":
    //             if (this.activeMyKudos == "1")
    //               //this.openSendPoint();
    //               console.log("");
    //             else this.approvalCard(status);
    //             break;
    //           case "3":
    //             if (this.activeCoins == "1")
    //               //this.openSendPoint();
    //               console.log("");
    //             else this.approvalCard(status);
    //             break;
    //         }
    //       }
    //     }
    //   });
  }
  approvalCard(status) {
    this.api
      .execSv<any>(
        "FED",
        "ERM.Business.FED",
        "CardsBusiness",
        "ApprovalAsync",
        [this.itemSelected.recID, status]
      )
      .subscribe((res) => {
        if (res.error == false) {
          // let indexChange = this.listviewComponent.data.findIndex(
          //   (obj) => obj.recID == this.itemSelected.recID
          // );
          // this.listviewComponent.data[indexChange].approveStatus = status;
          this.dt.detectChanges();
          this.itemSelected.approveStatus = status;
          if (status == "1") this.notificationsService.notify("Đã đồng thuận");
          else
            this.notificationsService.notify("Phiếu này không được đồng thuận");
        } else {
          this.notificationsService.notify(res.message);
        }
      });
  }
  getBehavior(str) {
    return this.api
      .execSv<any>(
        "BS",
        "ERM.Business.BS",
        "CompetencesBusiness",
        "GetBehaviorByListID",
        [str, false, this.typeCheck]
      )
      .subscribe((result) => {
        this.itemSelected.behavior = result;
        this.dt.detectChanges();
      });
  }
  clickItem(item) {
    return this.api
    .execSv("FD", "ERM.Business.FD", "CardsBusiness", "GetCardAsync", item)
    .subscribe((res) => {
      if (res) {
        this.isShowCard = true;
        console.log('getOneCard: ',res);
        this.itemSelected = res;
        this.handleVllRating(this.itemSelected.cardType);
        this.dt.detectChanges();
        if (this.itemSelected.temp) {
          this.getBehavior(this.itemSelected.temp);
        }
        if (this.itemSelected.industry) {
          this.getIndustry(this.itemSelected.industry);
        }
        // if (this.approver) {
        //   this.getParams();
        // }
        return;
      } else {
        this.itemSelected = null;
      }
    });
  }
  getOneCard(recID) {
   
  }
  handleVllRating(cardType: string): void {
    if (cardType == CardType.Thankyou) {
      this.ratingVll = Valuelist.RatingThankYou;
      return;
    }
    if (cardType == CardType.CommentForChange) {
      this.ratingVll = Valuelist.RatingCommentForChange;
      return;
    }
  }
  getAvatar(ext) {
    // return this.fileSV.getAvatar(ext);
  }
  getIndustry(industry) {
    return this.api
      .execSv<any>("BS", "BS", "IndustriesBusiness", "GetAsync", industry)
      .subscribe((res) => {
        if (res) this.itemSelected.industryName = res.industryName;
        this.dt.detectChanges();
      });
  }
  downloadFile(data) {
    let json = JSON.parse(data.fileBytes);
    var bytes = this.fileSV.base64ToArrayBuffer(json);
    let blob = new Blob([bytes], { type: data.fileType });
    let url = window.URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", data.fileName);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  selectCheckBox(targetType: CardType) {
    if (this.currentlyChecked === targetType) {
      this.currentlyChecked = null;
      return;
    }

    this.currentlyChecked = targetType;
  }


  clickShowAssideRight(){
    let option = new SidebarModel();
    option.DataService = this.codxViews.dataService;
    option.FormModel = this.codxViews.formModel;
    option.Width = '550px';
    let data = {
      funcID: this.functionID,
      title: this.title,
      cardType: this.cardType,
      valueList: this.vll
    };
    this.callc.openSide(PopupAddCardsComponent,data,option);
  }
  clickCloseAssideRight(){
    this.clearValueForm();
    // this.codxViews.currentView.closeSidebarRight();
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
  clearValueForm(){
    this.form.reset();
    this.dt.detectChanges();
  }

}
