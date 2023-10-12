import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { WPService } from '@core/services/signalr/apiwp.service';
import {
  AuthService,
  ViewModel,
  ViewType,
  UIComponent,
  ButtonModel,
  CRUDService,
  RequestOption,
  NotificationsService,
  ViewsComponent,
  SortModel,
  DataRequest,
} from 'codx-core';
import { CodxFdService } from '../codx-fd.service';

@Component({
  selector: 'lib-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent extends UIComponent {
  dataServiceWP: CRUDService;
  predicate = `Category="@0" && Stop=false `;
  dataValue = '';
  predicateCard = ``;
  dataValueCard = '';
  predicateCoins = `Owner =@0  `;
  dataValueCoins = '';
  // predicatesWP = 'Category =@0 && Stop=false';
  // dataValuesWP = '3';

  memberType = '3';
  arrVll = ['L1422', 'L1419'];
  reciver = [];
  sender = [];
  dataRadio = null;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel;
  user = null;

  /* #region filter */
  entityName: string = 'FD_Cards';
  functionID: string;
  favoriteID: string;
  date: Date = new Date();
  fromDateDropdown: string;
  toDateDropdown: string;
  radio: string = 'MyPermission';
  /* #endregion */

  /* #region request get list post */
  predicatesWP = '';
  dataValuesWP = '';
  predicateWP = '';
  dataValueWP = '';
  service: string = 'FD';
  assembly: string = 'FD';
  className: string = 'CardsBusiness';
  method: string = 'GetListPostAsync';
  /* #endregion */

  predicateReceive = '';
  dataValueReceive = '';
  predicateSend = '';
  dataValueSend = '';

  listRadio = [
    { label: 'Theo phân quyền', data: 'MyPermission' },
    { label: 'Phiếu của tôi', data: 'myCard' },
  ];

  listFavIcon = [
    '../../assets/themes/fd/default/img/Receive.svg',
    '../../assets/themes/fd/default/img/Send.svg',
  ];

  showPosts: boolean = false;

  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  @ViewChild('listview') listview: ViewsComponent;

  constructor(
    private injector: Injector,
    private dt: ChangeDetectorRef,
    private auth: AuthService,
    private signalRApi: WPService,
    private notifiSV: NotificationsService,
    private fdService: CodxFdService
  ) {
    super(injector);
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        model: {
          panelLeftRef: this.panelContent,
          // panelLeftRef: this.panelLeft,
        },
      },
    ];
  }
  onInit(): void {
    this.user = this.auth.userValue;
    this.dataValueCoins = this.user.userID;
    this.getTop5Radio();
    this.initDate();
    this.getDataAmountCard();
    this.getCardType();
  }

  initDate() {
    // this.date = new Date();
    const firstDay = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
    const lastDay = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    );
    this.fromDateDropdown = new Date(firstDay).toISOString();
    this.toDateDropdown = new Date(lastDay).toISOString();
  }

  lstCountCard: any[] = [];
  getDataAmountCard() {
    this.setPredicateCountCard();
    this.fdService
      .countCardByCardType(
        this.predicateReceive,
        this.dataValueReceive,
        this.predicateSend,
        this.dataValueSend
      )
      .subscribe((res: any) => {
        if (res) {
          this.lstCountCard = JSON.parse(res);
          this.dt.detectChanges();
        }
      });
  }

  lstCardType: any[] = [];
  getCardType() {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'FunctionListBusiness',
        'GetByFuncAsync',
        ['FD']
      )
      .subscribe((res) => {
        this.lstCardType = res[4]?.childs;
        // this.entityName = this.lstCardType[0]?.entityName;
        this.functionID = this.lstCardType[0]?.functionID;
        this.getFavorite();
      });
  }

  lstFavorite: any[] = [];
  getFavorite() {
    this.fdService
      .getFavorite(this.entityName, '1', null, true)
      .subscribe((res: any) => {
        this.lstFavorite = res.favs;
        this.favoriteID = res.defaultId;
        this.setPredicates();
        this.showPosts = true;
      });
  }

  lstTopRadio: any[] = [];
  getTop5Radio() {
    const model: DataRequest = {
      page: 1,
      pageLoading: true,
      pageSize: 5,
      funcID: 'FDT08',
      entityName: 'FD_Cards',
      entityPermission: 'FD_Cards_Radio',
      gridViewName: 'grvRadio',
      favoriteID: 'c052aa8c-0937-ed11-9460-00155d035517',
      sort: [{ field: 'CreatedOn', dir: 'desc' }],
    };
    this.fdService.getListCard(model).subscribe((res) => {
      if (res) this.lstTopRadio = res[0];
      this.lstTopRadio.forEach((item) => {
        let listShare = item.permissions.filter(
          (x) => x.memberType == '3' && x.objectType != '7'
        );
        if (listShare && listShare.length > 0) {
          let fItem = listShare[0];
          if (listShare.length == 1) {
            if (fItem.objectName) {
              item.type = 2;
              item.objectName = fItem.objectName;
              item.objectID = fItem.objectID;
            } else {
              item.type = 1;
              this.cache.valueList('L1901').subscribe((res) => {
                let datas = res.datas;
                if (datas && datas.length > 0) {
                  let parent = datas.find((x) => x.value == fItem.objectType);
                  if (parent) {
                    item.objectName = parent.text;
                    item.icon = parent.icon;
                  }
                }
              });
            }
          } else {
            item.type = 1;
            this.cache.valueList('L1901').subscribe((res) => {
              let datas = res.datas;
              if (datas && datas.length > 0) {
                let parent = datas.find((x) => x.value == fItem.objectType);
                if (parent) {
                  item.objectName = parent.text;
                  item.icon = parent.icon;
                }
              }
            });
          }
        } else {
          item.type = 1;
          item.icon = 'share_owner.svg';
        }
      });
    });
  }

  setPredicateCountCard() {
    this.predicateReceive = '';
    this.dataValueReceive = '';
    this.predicateSend = '';
    this.dataValueSend = '';

    if (this.fromDateDropdown && this.toDateDropdown) {
      this.predicateReceive += 'CreatedOn >= @0 && CreatedOn < @1';
      this.dataValueReceive += `${this.fromDateDropdown};${this.toDateDropdown}`;
      this.predicateSend += 'CreatedOn >= @0 && CreatedOn < @1';
      this.dataValueSend += `${this.fromDateDropdown};${this.toDateDropdown}`;
    }

    switch (this.radio) {
      case this.listRadio[0]?.data:
        break;
      case this.listRadio[1]?.data:
        this.predicateReceive += ' && ObjectID = @2';
        this.dataValueReceive += `;${this.user.userID}`;
        this.predicateSend += ' && CreatedBy = @2';
        this.dataValueSend += `;${this.user.userID}`;
        break;
    }
  }

  setPredicates() {
    this.cache.functionList(this.functionID).subscribe((res) => {
      this.predicateWP = res?.predicate;
      this.dataValueWP = res?.dataValue;

      this.predicatesWP = '';
      this.dataValuesWP = '';

      if (this.fromDateDropdown && this.toDateDropdown) {
        this.predicatesWP += 'CreatedOn >= @0 && CreatedOn < @1';
        this.dataValuesWP += `${this.fromDateDropdown};${this.toDateDropdown}`;
      }

      switch (this.radio) {
        case this.listRadio[0]?.data:
          break;
        case this.listRadio[1]?.data:
          if (this.favoriteID == this.lstFavorite[0]?.recID) {
            this.predicatesWP += ' && ObjectID = @2';
            this.dataValuesWP += `;${this.user.userID}`;
          } else {
            this.predicatesWP += ' && CreatedBy = @2';
            this.dataValuesWP += `;${this.user.userID}`;
          }
          break;
      }
    });
  }

  lstTagUser: any[] = [];
  searchField: string = '';
  clickShowTag(card: any) {
    this.lstTagUser = card.listTag;
    this.dt.detectChanges();
  }

  clickCardType(item) {
    this.entityName = item.entityName;
    this.functionID = item.functionID;
    this.setPredicates();
  }

  clickFavorite(item) {
    if (item) {
      this.favoriteID = item.recID;
      this.setPredicates();
    }
  }

  changeRadio(e, data: string) {
    this.radio = data;
    this.setPredicates();
    this.getDataAmountCard();
  }

  changeCalendar(e) {
    if (e?.fromDate || e?.toDate) {
      this.fromDateDropdown = new Date(e.fromDate).toISOString();
      this.toDateDropdown = new Date(e.toDate).toISOString();
      this.setPredicates();
      this.getDataAmountCard();
    }
  }

  beforDelete(option: RequestOption, data: any) {
    option.service = 'WP';
    option.assemblyName = 'ERM.Business.WP';
    option.className = 'CommentsBusiness';
    option.methodName = 'DeletePostAsync';
    option.data = data;
    return true;
  }
  removePost(data: any) {
    (this.listview.dataService as CRUDService)
      .delete([data], true, (op: any) => this.beforDelete(op, data))
      .subscribe();
  }

  closeListShare(item: any) {
    if (item.isShowShare) {
      item.isShowShare = false;
    }
  }
  lstUserShare: any[] = [];
  getShareUser(item: any) {
    if (
      item.shareControl == 'U' ||
      item.shareControl == 'G' ||
      item.shareControl == 'R' ||
      item.shareControl == 'P' ||
      item.shareControl == 'D' ||
      item.shareControl == 'O'
    ) {
      item.isShowShare = !item.isShowShare;
      this.lstUserShare = item.permissions.filter((p: any) => {
        return p.memberType == '2';
      });
      this.dt.detectChanges();
    }
  }
}
