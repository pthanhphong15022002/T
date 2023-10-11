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
  // predicateWP = 'Category =@0 && Stop=false';
  // dataValueWP = '3';

  memberType = '3';
  arrVll = ['L1422', 'L1419'];
  reciver = [];
  sender = [];
  dataRadio = null;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel;
  user = null;

  /* #region filter */
  entityName: string;
  functionID: string;
  favoriteID: string;
  date: Date = new Date();
  fromDateDropdown: string;
  toDateDropdown: string;
  radio: string = 'MyPermission';
  /* #endregion */

  /* #region request get list post */
  predicateWP = '';
  dataValueWP = '';
  service: string = 'FD';
  assembly: string = 'FD';
  className: string = 'CardsBusiness';
  method: string = 'GetListPostAsync';
  /* #endregion */

  listRadio = [
    { label: 'Theo phân quyền', data: 'MyPermission' },
    { label: 'Phiếu của tôi', data: 'myCard' },
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
    this.getDataAmountCard();
    this.initDate();
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
    this.api
      .execSv(
        'FD',
        'ERM.Business.FD',
        'CardsBusiness',
        'GetDataForWebAsync',
        []
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
        this.entityName = this.lstCardType[0]?.entityName;
        this.functionID = this.lstCardType[0]?.functionID;
        this.getFavorite();
      });
  }

  lstTop5Radio: any[] = [];
  getTop5Radio() {
    const model: DataRequest = {
      page: 1,
      pageLoading: true,
      pageSize: 5,
      funcID: 'FDT08',
      entityName: 'FD_Cards_Radio',
      sort: [{ field: 'CreatedOn', dir: 'desc' }],
    };
    this.fdService.getListCard(model).subscribe((res) => {
      this.lstTop5Radio = res[0];
    });
  }

  lstFavorite: any[] = [];
  getFavorite() {
    this.fdService
      .getFavorite(this.entityName, '1', null, true)
      .subscribe((res: any) => {
        this.lstFavorite = res.favs;
        this.favoriteID = res.defaultId;
        this.loadPosts();
      });
  }

  setPredicates() {
    this.predicateWP = '';
    this.dataValueWP = '';

    if (this.fromDateDropdown && this.toDateDropdown) {
      this.predicateWP += 'CreatedOn >= @0 && CreatedOn < @1';
      this.dataValueWP += `${this.fromDateDropdown};${this.toDateDropdown}`;
    }

    switch (this.radio) {
      case this.listRadio[0]?.data:
        break;
      case this.listRadio[1]?.data:
        if (this.favoriteID == this.lstFavorite[0]?.recID) {
          this.predicateWP += ' && ObjectID = @2';
          this.dataValueWP += `;${this.user.userID}`;
        } else {
          this.predicateWP += ' && CreatedBy = @2';
          this.dataValueWP += `;${this.user.userID}`;
        }
        break;
    }
  }

  loadPosts() {
    this.setPredicates();
    this.showPosts = false;
    this.dt.detectChanges();
    this.showPosts = true;
    this.dt.detectChanges();
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
    this.loadPosts();
  }

  clickFavorite(item) {
    if (item) {
      this.favoriteID = item.recID;
      this.loadPosts();
    }
  }

  changeRadio(e, data: string) {
    this.radio = data;
    this.loadPosts();
  }

  changeCalendar(e) {
    if (e?.fromDate || e?.toDate) {
      this.fromDateDropdown = new Date(e.fromDate).toISOString();
      this.toDateDropdown = new Date(e.toDate).toISOString();
      this.loadPosts();
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
