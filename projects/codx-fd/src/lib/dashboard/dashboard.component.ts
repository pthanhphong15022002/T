import { ChangeDetectorRef, Component, Injector, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { WPService } from '@core/services/signalr/apiwp.service';
import {  AuthService, ViewModel, ViewType, UIComponent, ButtonModel, CRUDService, RequestOption, NotificationsService, ViewsComponent, SortModel } from 'codx-core';

@Component({
  selector: 'lib-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent extends UIComponent  {
  dataServiceWP:CRUDService;
  predicate = `Category="@0" && Stop=false `;
  dataValue = "";
  predicateCoins = `Owner =@0  `;
  dataValueCoins = "";
  predicateWP = "Category =@0 && Stop=false";
  dataValueWP = "3";
  memberType = "3";
  arrVll = ["L1422", "L1419"];
  reciver = [];
  sender = [];
  dataRadio = null;
  views: Array<ViewModel> = [];
  buttonAdd: ButtonModel;
  user = null;

  //#region Đát Bo

  panels:any = JSON.parse(
    '[{"id":"0.1636284528927885_layout","row":0,"col":0,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.5801149283702021_layout","row":0,"col":8,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.6937258303982936_layout","row":4,"col":0,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.5667390469747078_layout","row":4,"col":8,"sizeX":8,"sizeY":4,"minSizeX":8,"minSizeY":4,"maxSizeX":null,"maxSizeY":null},{"id":"0.4199281088325755_layout","row":0,"col":16,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ công việc được giao"},{"id":"0.4592017601751599_layout","row":0,"col":32,"sizeX":16,"sizeY":8,"minSizeX":16,"minSizeY":8,"maxSizeX":null,"maxSizeY":null,"header":"Theo nguồn công việc"},{"id":"0.06496875406606994_layout","row":8,"col":16,"sizeX":16,"sizeY":12,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Hiệu suất làm việc"},{"id":"0.21519762020962552_layout","row":8,"col":0,"sizeX":16,"sizeY":12,"minSizeX":16,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ hoàn thành công việc"},{"id":"0.3516224838830073_layout","row":20,"col":0,"sizeX":32,"sizeY":12,"minSizeX":32,"minSizeY":12,"maxSizeX":null,"maxSizeY":null,"header":"Thống kê công việc hoàn thành và số giờ thực hiện"},{"id":"0.36601875176456145_layout","row":8,"col":32,"sizeX":16,"sizeY":24,"minSizeX":16,"minSizeY":24,"maxSizeX":null,"maxSizeY":null,"header":"Tỷ lệ công việc theo nhóm"}]'
  );
  datas:any = JSON.parse(
    '[{"panelId":"0.1636284528927885_layout","data":"1"},{"panelId":"0.5801149283702021_layout","data":"1"},{"panelId":"0.6937258303982936_layout","data":"1"},{"panelId":"0.5667390469747078_layout","data":"1"},{"panelId":"0.4199281088325755_layout","data":"1"},{"panelId":"0.4592017601751599_layout","data":"1"},{"panelId":"0.21519762020962552_layout","data":"1"},{"panelId":"0.06496875406606994_layout","data":"1"},{"panelId":"0.36601875176456145_layout","data":"1"},{"panelId":"0.3516224838830073_layout","data":"1"}]'
  );

  //#endregion


  @ViewChild('panelContent') panelContent: TemplateRef<any>;
  @ViewChild('listview') listview: ViewsComponent;
  @ViewChildren('templates') templates: QueryList<any>;
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
