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
  funcID:string = "";
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

  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('codxViews') codxViews: ViewsComponent;
  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private dt: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private auth: AuthService,
    private callcSV: CallFuncService,
    private route: ActivatedRoute,
  ) {
    this.user = this.auth.userValue;
  }


  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      var funcID = param.funcID;
      if (funcID != this.funcID) {
        this.funcID = funcID;
        switch (funcID) {
          case "FDT02":
            this.title = "Tuyên dương";
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
            break;
          case "FDT06":
            this.title = "Chia sẻ";
            break;
          case "FDT07":
            this.title = "Chúc mừng";
            break;
          case "FDT06":
            this.title = "Radio yêu thương";
            break;
          default:
            this.title = "";
            this.vll = "";
            break;
        }
      }
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

  selectedID:string = "";
  selectedItem(event: any) {
    if(!event || !event.data){
      this.selectedID = "";
    }
    else {
      this.selectedID = event.data.recID;
    }
    this.dt.detectChanges();
  }
  clickShowAssideRight() {
    let option = new SidebarModel();
    option.DataService = this.codxViews.dataService;
    option.FormModel = this.codxViews.formModel;
    option.Width = '550px';
    let data = {
      funcID: this.funcID,
      title: this.title,
      cardType: this.cardType,
      valueList: this.vll
    };
    this.callcSV.openSide(PopupAddCardsComponent, data, option);
  }


  clickMF(event:any,data:any){
    switch(event.functionID){
      case "SYS02":
        break;
      case "SYS03":
        break;
      default:
        break;

    }
  }

  deleteCard(card:any) {
  }

}
