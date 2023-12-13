import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthService, AuthStore, CacheService, CodxService, DataRequest, DialogData, DialogModel, DialogRef, NotificationsService, ScrollComponent, SidebarModel, CallFuncService, FormModel } from 'codx-core';
import { PopupSignForApprovalComponent } from 'projects/codx-es/src/lib/sign-file/popup-sign-for-approval/popup-sign-for-approval.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';

@Component({
  selector: 'lib-activies-slider',
  templateUrl: './activies-slider.component.html',
  styleUrls: ['./activies-slider.component.scss']
})

export class ActiviesSliderComponent implements OnInit {
  
  dialog: DialogRef;
  user:any = null;
  lstApproval:any[] = [];
  formModel = new FormModel();
  
  model:DataRequest = {
    entityName:"BG_Notification",
    predicate: "(ActionType = @0 or ActionType = @1) && x.Deleted = false",
    dataValue: "AP;ES;",
    formName:"Notification",
    gridViewName:"grvNotification",
    srtColumns:"CreatedOn",
    srtDirections:"desc",
    pageLoading: true,
    pageSize:20,
    page: 1,
  }
  loaded:boolean = false;
  totalPage:number = 0;
  isScroll = true;
  pageIndex:number = 0;
  valueSelected:any = null;
  datas:any[] = [];
  headerText="";
  constructor
  (
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private notiSV:NotificationsService,
    private codxShareService: CodxShareService,
    private codxCommonService: CodxCommonService,
    private auth:AuthStore,
    private codxService:CodxService,
    private cache:CacheService,
    private callFuncService : CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  )
  {
    this.dialog = dialog;
    this.user = this.auth.get();
    this.formModel.funcID= 'BGT002';
    this.formModel.entityName="BG_Notification";
    this.formModel.formName="Notification";
    this.formModel.gridViewName="grvNotification";
    this.cache.functionList('BGT002').subscribe(func=>{
      if(func?.customName){
        this.headerText = func?.customName;
      }
    })
  }

  ngOnInit(): void {
    this.getDataAsync();
    this.cache.valueList("SYS055").subscribe(vll => {
      if(vll)
      {
        this.datas = vll.datas;
        let _defaultVLL  = vll.datas.find(x => x.value == "");
        if(_defaultVLL)
          this.valueSelected = _defaultVLL;
        else
          this.valueSelected = vll.datas[0];
      }
    });
  }

  ngAfterViewInit(){
    ScrollComponent.reinitialization();
  }
  //get data approval 
  getDataAsync(){
    this.loaded = true;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetApprovalAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res[1] > 0)
      {
        this.lstApproval = res[0];
        let totalRecord = res[1];
        this.totalPage = totalRecord / this.model.pageSize;
        this.dt.detectChanges();
      }
      else{
        this.loaded = false;
      }
    });
  }
  //close
  clickCloseFrom(){
    this.dialog.close();
  }
  //scroll
  onScroll(event: any) 
  {
    let dcScroll = event.srcElement;
    if ((dcScroll.scrollTop + dcScroll.clientHeight < dcScroll.scrollHeight - 150) || this.isScroll || (this.model.page > this.totalPage)) return;
    this.isScroll = true;
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
        this.isScroll = false;
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
  //xét duyệt
  approvalAsync(item:any,status:string,index:number){
    if(item.recID && item.transID && status)
    {
      item["blocked"] = true;
      this.codxCommonService
        .codxApprove(
            item.transID,
            status,
            null,
            null,
            null,
          )
          .subscribe((res: any) => {
          if (!res?.msgCodeError) 
          {
            let mssgCodeNoti = status == ApprovalStatus.approved ? "WP005" : "WP007";
            this.lstApproval.splice(index,1);
            this.notiSV.notifyCode(mssgCodeNoti);
            if(index > -1){
              this.api.execSv(
                'BG',
                'ERM.Business.BG',
                'NotificationBusinesss',
                'UpdateAsync', 
                [item.recID]).subscribe();
            }
          }
          item["blocked"] = false;
          this.dt.detectChanges();
        });
    }
  }

  setStyles(value){
    let vll = this.datas.find(x => x.value == value);
    if(!vll) vll = this.datas.find(x => x.value == "");
    let styles = {
      backgroundColor: vll.color ,
      color: vll.textColor,
    };
    return styles;
  }

  // filter selected change
  valueChange(event:any){
    if(event.value == ""){
      this.model.predicates = "";
      this.model.dataValues = "";
    }
    else
    {
      this.model.predicates = "EntityName = @0";
      this.model.dataValues = event.value;
    }
    this.valueSelected = event;
    this.loaded = true;
    this.totalPage = 0;
    this.model.page = 1;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetApprovalAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res && res[1] > 0)
      {
        this.lstApproval = res[0];
        let totalRecord = res[1];
        this.totalPage = totalRecord / this.model.pageSize;
        this.isScroll = false;
        this.dt.detectChanges();
      }
      else
      {
        this.loaded = false;
      }
    });
  }

  // xem trình ký
  viewSignature(data:any){
    this.codxShareService.getApprovalTrans(data?.transID).subscribe((trans:any)=>{
      if(trans){
        // gọi hàm xử lý xem trình ký
        let dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        var listApproveMF = this.codxShareService.getMoreFunction(null,trans?.stepType);

        let dialogApprove = this.callFuncService.openForm(
          PopupSignForApprovalComponent,
          'Thêm mới',
          700,
          650,
          'EST021',
          {
            funcID: 'EST021',
            sfRecID: trans?.transID,
            title: trans?.htmlView,
            status: trans?.status,
            stepType: trans?.stepType,
            stepNo: trans?.stepNo,
            transRecID: trans?.recID,
            oTrans: trans,
            lstMF: listApproveMF,
          },
          '',
          dialogModel
        );
        dialogApprove.closed.subscribe((res) => {
          if (!res?.event?.msgCodeError && res?.event?.rowCount>0) {
            //let mssgCodeNoti = res?.event?.returnStatus == ApprovalStatus.approved ? "WP005" : "WP007";
            this.lstApproval=this.lstApproval.filter(x=>x?.transID != data?.transID);
            //this.notiSV.notifyCode(mssgCodeNoti);            
            this.api.execSv(
              'BG',
              'ERM.Business.BG',
              'NotificationBusinesss',
              'UpdateAsync', 
              [data?.recID]).subscribe();
            this.dt.detectChanges();
            
          }
        });
      }
      else{
        this.notiSV.notifyCode("SYS001");
        return;
      }
    });
    
  }
}

enum ApprovalStatus {
  approved = "5",
  denied = "4"
};

