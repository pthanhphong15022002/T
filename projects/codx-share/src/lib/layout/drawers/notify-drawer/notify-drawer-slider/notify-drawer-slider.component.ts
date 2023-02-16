import { ChangeDetectorRef, Component, OnChanges, OnInit, Optional, SimpleChanges, } from '@angular/core';
import { DialogRef, ApiHttpService, DialogData, ScrollComponent, DataRequest, CacheService, CodxService, AuthStore, DialogModel, CallFuncService, FormModel } from 'codx-core';
import { NotifyDrawerPopupComponent } from '../notify-drawer-popup/notify-drawer-popup.component';

@Component({
  selector: 'lib-notify-drawer-slider',
  templateUrl: './notify-drawer-slider.component.html',
  styleUrls: ['./notify-drawer-slider.component.scss']
})
export class NotifyDrawerSliderComponent implements OnInit {
  dialogRef: DialogRef;
  lstNotify:any[] = [];
  model:DataRequest = {
    entityName:"BG_Notification",
    predicate: "ActionType != @0",
    dataValue: "AP",
    formName:"Notification",
    gridViewName:"grvNotification",
    srtColumns:"CreatedOn",
    srtDirections:"desc",
    pageLoading: true,
    pageSize:20,
    page: 1
  }
  loaded:boolean = true;
  user:any = null;
  totalPage:number = 0;
  isScroll = true;
  messageNoData:string ="";
  vllEntityName:any[] = [];
  entityName:any = null;
  vllIsRead:any[] = [];
  isRead:any = null;
  formModel:FormModel;
  notiMFC:any[] = [];
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthStore,
    private cache:CacheService,
    private codxService:CodxService,
    private callFC:CallFuncService,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {    
    this.dialogRef = dialogRef;
    this.formModel = new FormModel();
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.getNotifyAsync();
    this.getMessage("SYS010");
    this.cache.valueList("SYS055")
    .subscribe((vll:any) => {
      if(vll){
        this.vllEntityName = vll.datas;
        let _default  = vll.datas.find(x => x.value === "");
        if(_default){
          this.entityName = _default;
        }
        else{
          this.entityName = vll.datas[0];
        }
      }
    });
    this.cache.valueList("SYS057")
    .subscribe((vll:any) => {
      if(vll){
        this.vllIsRead = vll.datas;
        let _default  = vll.datas.find(x => x.value === "");
        if(_default){
          this.isRead = _default;
        }
        else{
          this.isRead = vll.datas[0];
        }
      }
    });
    this.cache.functionList("BGT001")
    .subscribe((func:any)=>{
      this.formModel.funcID = func.funcID;
      this.formModel.formName = func.formName;
      this.formModel.gridViewName = func.gridViewName;
      this.formModel.entityName = func.entityName;
      this.formModel.userPermission = func.userPermission;
      this.cache.moreFunction(this.formModel.formName,this.formModel.gridViewName)
      .subscribe((mfc:any) => {
        this.notiMFC = mfc;
      });
    });
  }

  ngAfterViewInit(){
    ScrollComponent.reinitialization();
  }
  // close form
  clickCloseFrom(){
    this.dialogRef.close();
  }
  // load data noti
  getNotifyAsync(){
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetNotiAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res && res[1] > 0)
      {
        this.lstNotify = res[0];
        let totalRecord = res[1];
        this.totalPage = totalRecord / this.model.pageSize;
        this.isScroll = false;
        this.dt.detectChanges();
      }
      else if(this.lstNotify.length == 0){
        this.loaded = false;
      }
    });
  }

  // scroll
  onScroll(event: any) {
    let dcScroll = event.srcElement;
    if (dcScroll.scrollTop + dcScroll.clientHeight < dcScroll.scrollHeight - 150) return;
    if(this.model.page > this.totalPage || this.isScroll) return;
    this.loaded = true;
    this.isScroll = true;
    this.model.page = this.model.page + 1;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetNotiAsync',
      [this.model])
    .subscribe((res:any[]) => {
      if(res && res[1] > 0){
        let notifications = res[0];
        let totalRecord = res[1];
        this.totalPage = totalRecord / this.model.pageSize;
        this.lstNotify = this.lstNotify.concat(notifications);
        this.isScroll = false;
        this.dt.detectChanges();
      }
      else if(this.lstNotify.length == 0)
      {
        this.loaded = false;
      }
    });
  }
  // view detail noti
  clickNotification(item:any,index:number){
    if(item.transID){
      this.api.execSv(
        'BG',
        'ERM.Business.BG',
        'NotificationBusinesss',
        'UpdateNotificationAsync', 
        [item.recID]).subscribe((res:boolean) => {
          if(res)
          {
            item.read = true;
            this.dt.detectChanges();
          }
      });
      let query = {
        predicate:"RecID=@0",
        dataValue:item.transID
      };
      this.lstNotify.splice(index,1);
      this.codxService.openUrlNewTab(item.function,"",query);
    }
  }

  //
  getMessage(mssgCode:string){
    if(mssgCode){
      this.cache.message(mssgCode).subscribe((mssg:any) => {
        if(mssg){
          this.messageNoData = mssg.defaultName;
        }
      });
    }
  }
  // filter selected change
  entityNameChange(event:any){
    this.entityName = event;
    this.model.predicates = "EntityName = @0";
    this.model.dataValues = event.value;
    this.loaded = true;
    this.model.page = 1;
    this.totalPage = 0;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetNotiAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res && res[1] > 0)
      {
        this.lstNotify = res[0];
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
  //filter change
  isReadChange(event:any){
    this.isRead = event;
    this.model.dataObj = event.value;
    this.loaded = true;
    this.model.page = 1;
    this.totalPage = 0;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetNotiAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res && res[1] > 0)
      {
        this.lstNotify = res[0];
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
    this.dt.detectChanges();
  }

  //
  viewAll(){
    let _option = new DialogModel();
    _option.IsFull = true;
    _option.zIndex = 1001;
    _option.IsModal = false;
    this.callFC.openForm(NotifyDrawerPopupComponent,"",0,0,"",null,"",_option);
  }

  clickMF(event,item){
    debugger
    if(event){
      switch(event.functionID){
        case "WP005": // ghim
          this.checkBookmark(item.recID,"add")
          .subscribe((res:boolean) => item.isBookmark = res);
          break; 
        case "WP006": // bỏ ghim
          this.checkBookmark(item.recID,"remove")
          .subscribe((res:boolean) => item.isBookmark = !res);
          break; 
        case "WP007": // đánh dấu đã đọc
          this.checkRead(item.recID)
          .subscribe((res:boolean) => item.read = res);
          break; 
        case "WP008": // xóa
          break;
        default:
          break;
      }
    }
  }

  // change More funtion
  changeDataMF(arrMFC){
    if(this.notiMFC.length > 0){
      let _lstMoreFcID = this.notiMFC.map(e => e.functionID);
      arrMFC.map(e => {
        e.disabled = !_lstMoreFcID.includes(e.functionID)
      });
    }
  }

  // bookmark noti
  checkBookmark(recID:string,mode = "add"){
    return this.api.execSv(
        "BG",
        "ERM.Business.BG",
        "NotificationBusinesss",
        "BookmarkAsync",
        [recID,mode]);
  }
  // bookmark noti
  checkRead(recID:string){
   return this.api.execSv(
        "BG",
        "ERM.Business.BG",
        "NotificationBusinesss",
        "UpdateAsync",
        [recID]);
  }
}
