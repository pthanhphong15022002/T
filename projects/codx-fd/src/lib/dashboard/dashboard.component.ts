import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { WPService } from '@core/services/signalr/apiwp.service';
import { SignalRService } from '@core/services/signalr/signalr.service';
import { Post } from '@shared/models/post';
import { CodxListviewComponent, ApiHttpService, AuthService, CodxService, ViewModel, ViewType, UIComponent, ButtonModel, CRUDService, RequestOption, NotificationsService, ViewsComponent, SortModel } from 'codx-core';

@Component({
  selector: 'lib-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent extends UIComponent  {
  dataServiceWP:CRUDService = null;
  predicate = `Category =@0 && Stop=false`;
  dataValue = "3";
  predicateCoins = `Owner =@0   `;
  dataValueCoins = "";
  predicateWP: string = "Category =@0 && Stop=false";
  dataValueWP: string = "3";
  memberType = "3";
  arrVll = ["L1422", "L1419"];
  reciver = [];
  sender = [];
  dataRadio = null;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel;
  user = null;
  pagination = {
    clickable: true,
    renderBullet: function (index, className) {
      return '<span style="cursor: pointer;" class="' + className + '"></span>';
    },
  };

  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  @ViewChild('listview') listview: ViewsComponent;
  dataRef: Post;
  isLoading = true;
  crrId = "";
  constructor(
    private injector: Injector,
    private dt: ChangeDetectorRef,
    private auth: AuthService,
    private signalRApi: WPService,
    private notifiSV: NotificationsService
  ) {
    super(injector)
  }
  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.content,
      active: true,
      model: {
        panelLeftRef: this.panelContent
      }
    }];

  }
  onInit(): void {
    this.user = this.auth.userValue;
    this.dataValueCoins = this.user.userID;
    this.getDataAmountCard();
    this.dataServiceWP = new CRUDService(this.injector);
    this.dataServiceWP.predicate = this.predicateWP;
    this.dataServiceWP.dataValue = this.dataValueWP;
    let arrSort:SortModel[] = [];
    let sort = new SortModel();
    sort.field = "CreatedOn";
    sort.dir = "desc";
    arrSort.push(sort);
    this.dataServiceWP.setSort(arrSort);
    this.dataServiceWP.pageSize = 7;
  }

  lstCountCard:any[] = [];
  getDataAmountCard(){
    this.api.execSv("FD","ERM.Business.FD", "CardsBusiness", "GetDataForWebAsync", [])
    .subscribe((res:any) => {
      if (res) 
      {
        this.lstCountCard = JSON.parse(res);
        this.dt.detectChanges();
      }
    });
  }
  lstTagUser:any[] = [];
  searchField:string ="";
  clickShowTag(card:any) {
    this.lstTagUser = card.listTag;
    this.dt.detectChanges();
  }

  beforDelete(option:RequestOption,data:any){
    option.service = "WP";
    option.assemblyName = "ERM.Business.WP";
    option.className = "CommentsBusiness";
    option.methodName = "DeletePostAsync";
    option.data = data;
    return true;
  }
  removePost(data: any) {
    (this.listview.dataService as CRUDService).
    delete([data],true,(op:any)=>this.beforDelete(op,data)).
    subscribe();
  }

  closeListShare(item:any){
    if(item.isShowShare){
      item.isShowShare = false;
    }
  }
  lstUserShare:any[] = [];
  getShareUser(item:any) {
    if(item.shareControl=='U' ||
      item.shareControl=='G' || item.shareControl=='R' ||
      item.shareControl=='P' || item.shareControl=='D' ||
      item.shareControl=='O')
      {
        item.isShowShare = !item.isShowShare;
        this.lstUserShare = item.permissions.filter((p:any) => {
          return p.memberType == "2";
        });
        this.dt.detectChanges();
    }
  }

}
