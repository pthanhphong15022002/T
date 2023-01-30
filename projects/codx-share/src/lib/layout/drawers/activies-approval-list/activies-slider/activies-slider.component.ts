import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthService, AuthStore, CodxService, DataRequest, DialogData, DialogRef, NotificationsService, ScrollComponent } from 'codx-core';

@Component({
  selector: 'lib-activies-slider',
  templateUrl: './activies-slider.component.html',
  styleUrls: ['./activies-slider.component.scss']
})

export class ActiviesSliderComponent implements OnInit {
  
  dialog: DialogRef;
  user:any = null;
  lstApproval:any[] = [];
  model:DataRequest = {
    entityName:"BG_Notification",
    predicate: "ActionType = @0",
    dataValue: "AP",
    formName:"Notification",
    gridViewName:"grvNotification",
    srtColumns:"CreatedOn",
    srtDirections:"desc",
    pageLoading: true,
    pageSize:20,
    page: 1
  }
  loaded:boolean = false;
  totalPage:number = 0;
  isScroll = true;
  pageIndex:number = 0;

  constructor
  (
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private notiSV:NotificationsService,
    private auth:AuthStore,
    private codxService:CodxService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  )
  {
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.user = this.auth.get();
    this.getDataAsync();
  }

  ngAfterViewInit(){
    ScrollComponent.reinitialization();
  }
  getDataAsync(){
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetApprovalAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res)
      {
        this.lstApproval = res[0];
        this.loaded = true;
        this.dt.detectChanges();
      }
    });
  }
  clickCloseFrom(){
    this.dialog.close();
  }
  onScroll(event: any) 
  {
    let dcScroll = event.srcElement;
    if (dcScroll.scrollTop + dcScroll.clientHeight < dcScroll.scrollHeight - 150) return;
    this.model.page = this.model.page + 1;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetApprovalAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res && res[0].length > 0){
        let notifications = res[0];
        this.lstApproval = this.lstApproval.concat(notifications);
        this.dt.detectChanges();
      }
    });

    
  }

  //view detail
  clickViewDetail(item){
    if(item.transID){
      let query = {
        predicate:"RecID=@0",
        dataValue:item.transID
      };
      this.codxService.openUrlNewTab(item.function,"",query);
    }
  }
  approvalAsync(item:any,status:string){
    if(item.recID && item.transID && status)
    {
      item["blocked"] = true;
      if(status == ApprovalStatus.approved || status == ApprovalStatus.denied)
      {
        this.api
        .execSv(
          'ES',
          'ERM.Business.ES',
          'ApprovalTransBusiness',
          'ApproveAsync',
          [item.transID, status, '', ''])
          .subscribe((res: any) => {
          if (!res?.msgCodeError) 
          {
            let mssgCodeNoti = status == ApprovalStatus.approved ? "WP005" : "WP007";
            this.notiSV.notifyCode(mssgCodeNoti);
            let index = this.lstApproval.findIndex(x => x.recID == item.recID);
            if(index > -1)
            {
              this.lstApproval.splice(index,1);
              this.lstApproval = JSON.parse(JSON.stringify(this.lstApproval));
              this.api.execSv(
                'BG',
                'ERM.Business.BG',
                'NotificationBusinesss',
                'UpdateNotificationAsync', 
                [item.recID]).subscribe();
            }
          }
          item["blocked"] = false;
          this.dt.detectChanges();
        });
      }
    }
  }

  setStyles(data) 
  {
    let styles = {
      backgroundColor: data ? data : '#1E8449',
      color: 'white',
    };
    return styles;
  }
}

enum ApprovalStatus {
  approved = "5",
  denied = "4"
};

