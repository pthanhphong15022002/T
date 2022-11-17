import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthService, AuthStore, DataRequest, DialogData, DialogRef, ScrollComponent } from 'codx-core';

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
  totalPage:number = 0;
  isScroll = true;
  pageIndex:number = 0;

  constructor
  (
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthStore,
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
      [this.model]
    ).subscribe((res:any[]) => {
      if(res){
        this.lstApproval = res[0];
        let totalRecord = res[1];
        this.totalPage = totalRecord / this.model.pageSize;
        this.isScroll = false;
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
    if(this.model.page > this.totalPage || this.isScroll) return;
    this.isScroll = true;
    this.model.page = this.model.page + 1;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetApprovalAsync',
      [this.model]
    ).subscribe((res:any[]) => {
      if(res && res[0].length > 0){
        let notifications = res[0];
        this.lstApproval = this.lstApproval.concat(notifications);
        this.isScroll = false;
        this.dt.detectChanges();
      }
    });
  }

  approvalAsync(recID:string ,transID:string, status:string){
    if(transID && status){
      this.api
        .execSv(
          'ES',
          'ERM.Business.ES',
          'ApprovalTransBusiness',
          'ApproveAsync',
          [transID, status, '', '']
        )
        .subscribe((res: any) => {
          if (!res?.msgCodeError) 
          {
            
          } 
        });
    }
  }
}
