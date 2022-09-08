import { ViewEncapsulation } from '@angular/core';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WPService } from '@core/services/signalr/apiwp.service';
import { NgbCarousel, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permission } from '@shared/models/file.model';
import { ButtonModel, ViewModel, CodxListviewComponent, ViewsComponent, ApiHttpService, NotificationsService, AuthStore, CallFuncService, FilesService, CacheService, DataRequest, ViewType, UIComponent, SidebarModel, AuthService } from 'codx-core';
import { FD_Permissions } from '../models/FD_Permissionn.model';
import { FED_Card } from '../models/FED_Card.model';
import { CardType, FunctionName, Valuelist } from '../models/model';
import { PopupAddCardsComponent } from './popup-add-cards/popup-add-cards.component';

@Component({
  selector: 'lib-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardsComponent implements OnInit {
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
  itemSelected: any = null;
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
  functionID:string = "";
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
  isWalletReciver = false;

  @ViewChild("templateChooseUser") chooseUser;
  @ViewChild("templateGivePrice") tmlgivePrice;
  @ViewChild('sideBarRightRef') sideBarRightRef: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('codxViews') codxViews: ViewsComponent;
  @ViewChild('carousel') carousel: NgbCarousel;
  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private auth: AuthService,
    private callcSV: CallFuncService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
  ) {
    this.user = this.auth.userValue;
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


  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      var funcID = params.funcID;
      if (params.funcID != this.functionID) {
        this.functionID = funcID;
        this.vll = "";
        this.vllData = [];
        switch (funcID) {
          case "FDT02":
            this.title = "Tuyên dương";
            this.dataValue = this.CARDTYPE_EMNUM.Commendation;
            break;
          case "FDT03":
            this.title = "Lời cảm ơn";
            this.vll = 'L1419';
            this.dataValue = this.CARDTYPE_EMNUM.Thankyou;
            break;
          case "FDT04":
            this.title = "Góp ý thay đổi";
            this.vll = "L1424";
            this.dataValue = this.CARDTYPE_EMNUM.CommentForChange;
            break;
          case "FDT05":
            this.title = "Đề xuất cải tiến";
            this.isShowCard = false;
            this.dataValue = this.CARDTYPE_EMNUM.SuggestionImprovement;
            break;
          case "FDT06":
            this.title = "Chia sẻ";
            this.isShowCard = false;
            this.dataValue = this.CARDTYPE_EMNUM.Share;
            break;
          case "FDT07":
            this.title = "Chúc mừng";
            this.dataValue = this.CARDTYPE_EMNUM.Congratulation;
            break;
          case "FDT06":
            this.title = "Radio yêu thương";
            this.dataValue = this.CARDTYPE_EMNUM.Radio;
            break;
          default:
            this.title = "";
            break;
        }
        this.userGroupOfAccount = this.user.groupID;
        this.functionID = params.funcID;
        this.cache.functionList(this.functionID).subscribe(res => {
          if (res) {
            this.cardType = res.dataValue;
            this.entityPer = res.entityName;
            if (this.vll != "") {
              this.cache.valueList(this.vll).subscribe((res) => {
                if (res) {
                  this.vllData = res.datas;
                }
              });
            }
            this.getStatusValuelistName();
            this.isShowCard = true;
          }
        })
      }
      this.getMyWallet();
      this.itemSelected = null;
      this.gift = null;
      this.cardSelected = null;
      this.dt.detectChanges();
      if(this.codxViews){
        this.codxViews.dataService.setPredicate(this.predicate,[this.dataValue]);
        this.codxViews.load();
      }
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
  openUser(field) {
    console.log(this.chooseUser);
    this.field = field;
    this.modalService.open(this.chooseUser, { centered: true });
  }
  checkValidateWallet(receiverID: string) {
    if (receiverID) {
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
    if (this.isWalletReciver) {
      this.givePrice += 1;
      this.submit();
    }
    else {
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
  getParameter() {
    this.api
      .execSv("SYS", "ERM.Business.CM", "SettingsBusiness", "GetParameterByFDAsync", ["FED_Parameters", this.cardType, "1"])
      .subscribe((res) => {
        if (res) {
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

  DeleteCard(item) {}
  selectedItem(data: any) {
    return this.api
      .execSv("FD", "ERM.Business.FD", "CardsBusiness", "GetCardAsync", data.recID)
      .subscribe((res) => {
        if (res) {
          this.isShowCard = true;
          console.log('getOneCard: ', res);
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

  valueChange(e, element = null) {
    if (e[0] == "") {
      return;
    }
    let field = e.field ? e.field : element?.field;
    if (field == "rating") {
      this.form.patchValue({ rating: e });
    }
    else if (field == "giftID") {
      var giftID = e[0];
      this.getGiftInfor(giftID)
    }
    else if (field == "quantity") {
      if (!this.gift) {
        this.form.patchValue({ quanlity: 0 });
        this.notificationsService.notify("Vui lòng chọn quà tặng trước!");
        return;
      }

      let quantity = e.data.value;
      if (quantity > this.giftCount) {
        this.quantity = this.quantityOld + 1;
        this.totalCoint = this.quantity * this.gift.Price;
        this.form.patchValue({ quanlity: this.quantity });
        this.notificationsService.notify("Vượt quá số lượng tồn kho!");
        return;
      }
      let priceGiftGive = this.gift.Price * quantity;
      if (priceGiftGive > this.wallet.coins) {
        this.quantity = this.quantityOld + 1;
        this.totalCoint = this.quantity * this.gift.Price;
        this.form.patchValue({ quanlity: this.quantity });
        this.notificationsService.notify("Số dư ví của bạn không đủ");
        return;
      }
      this.quantityOld = this.quantity;
      this.quantity = quantity;
      this.totalCoint = this.quantity * this.gift.Price;
      this.form.patchValue({ quanlity: this.quantity });
    }
    else if (field == "behavior") {
      this.behavior = e[0];
      this.form.patchValue({ behavior: this.behavior });
    }
    else if (field == "industry") {
      this.industry = e[0];
      var obj = {};
      obj[field] = this.industry;
      if (!this.industry) {
        return;
      }
      this.api.execSv("BS", "ERM.Business.BS", "IndustriesBusiness", "GetListByID", this.industry).subscribe(
        (res: any) => {
          if (res) {
            this.userReciver = res[0].description;
            this.api.callSv("SYS", "ERM.Business.AD", "UsersBusiness", "GetAsync", this.userReciver).subscribe(res2 => {
              if (res2.msgBodyData.length) {
                this.userReciverName = res2.msgBodyData[0].userName;
                this.form.patchValue({ receiver: this.userReciver });
              }
            })

          }
        }
      )
      this.form.patchValue(obj);

    }
    else if (field == "situation") {
      this.situation = e.data.value;
      this.form.patchValue({ situation: this.situation });
    }
    else if (field == "receiver") {
      this.userReciver = e[0];
      this.form.patchValue({ receiver: this.userReciver });
      this.checkValidateWallet(this.userReciver);
    }
    else { return }
  }


  getGiftInfor(giftID: string) {
    if (this.giftID == giftID) return;
    this.api
      .execSv("FD", "ERM.Business.FD", "GiftsBusiness", "GetAsync", [giftID])
      .subscribe((res) => {
        if (res) {
          this.gift = res;
          this.giftID = this.gift.giftID;
          this.price = this.gift.Price;
          this.giftCount = this.gift.availableQty;
          this.dt.detectChanges();
        }
      })
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
  LoadDataCard() {
    this.api
      .execSv("FD", "ERM.Business.FD", "PatternsBusiness", "GetCardTypeAsync", [
        this.cardType,
      ])
      .subscribe((res: any) => {
        if (res && res.length > 0) {
          this.lstCard = res;
          if (this.lstCard.length > this.totalRecorItem) {
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
  setGridviewSettup(valuelist: string) {
    this.cache.valueList(valuelist).subscribe((res) => {
      if (res) this.vllData = res.datas;
    });
    this.dt.detectChanges();
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
          this.itemSelected = res;
          this.handleVllRating(this.itemSelected.cardType);
          this.dt.detectChanges();
          if (this.itemSelected.temp) {
            this.getBehavior(this.itemSelected.temp);
          }
          if (this.itemSelected.industry) {
            this.getIndustry(this.itemSelected.industry);
          }
        } else {
          this.itemSelected = null;
        }
      });
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
  getIndustry(industry) {
    return this.api
      .execSv<any>("BS", "BS", "IndustriesBusiness", "GetAsync", industry)
      .subscribe((res) => {
        if (res) this.itemSelected.industryName = res.industryName;
        this.dt.detectChanges();
      });
  }
  clickShowAssideRight() {
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
    this.callcSV.openSide(PopupAddCardsComponent, data, option);
  }

}
