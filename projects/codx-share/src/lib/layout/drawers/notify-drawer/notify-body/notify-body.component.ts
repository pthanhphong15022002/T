import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, CodxService, DataRequest, DialogModel, FormModel } from 'codx-core';
import { NotifyDrawerPopupComponent } from '../notify-drawer-popup/notify-drawer-popup.component';

@Component({
  selector: 'codx-notify-body',
  templateUrl: './notify-body.component.html',
  styleUrls: ['./notify-body.component.scss']
})
export class NotifyBodyComponent implements OnInit {

  @Input() mode:string = "";
  model:DataRequest;
  formModel:FormModel;
  user:any;
  noti:any[] = [];
  bookmark:any[] = [];
  scrolled:boolean = true;
  loaded:boolean = true;
  totalPage:number = 0;
  mssgNoData:string ="";
  vllType:any[] = [];
  type:any = null;
  vllStatus:any[] = [];
  status:any = null;
  notiMFC:any[] = [];
  notiFilter = {
    mode:"",
    type:"",
    status:""
  }
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthStore,
    private cache:CacheService,
    private codxService:CodxService,
    private callFC:CallFuncService
  ) 
  {
    this.model = new DataRequest("Notification","grvNotification","BG_Notification","","",1,20);
    this.model.dataObj = JSON.stringify(this.notiFilter);
    this.formModel = new FormModel();
    this.user = auth.get();
  }

  ngOnInit(): void {
    this.notiFilter.mode = this.mode;
    this.getSetUp();
    this.getNotiAsync();
  }

   // get set up
   getSetUp(){
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
    this.cache.message("SYS010").subscribe((mssg:any) => {
      if(mssg){
        this.mssgNoData = mssg.defaultName;
      }
    });
    this.cache.valueList("SYS055")
    .subscribe((vll:any) => {
      if(vll){
        this.vllType = vll.datas;
        let _default  = vll.datas.find(x => x.value === "");
        if(_default)
          this.type = _default;
        else
          this.type = vll.datas[0];
      }
    });
    this.cache.valueList("SYS057")
    .subscribe((vll:any) => {
      if(vll){
        this.vllStatus = vll.datas;
        let _default  = vll.datas.find(x => x.value === "");
        if(_default)
          this.status = _default;
        else
          this.status = vll.datas[0];
      }
    });
  }

  // load data noti
  getNotiAsync(scroll:boolean = false){
    if(!scroll)      
      this.model.page = 1;
    else
      this.model.page = this.model.page + 1; 
    this.loaded = true;
    this.model.dataObj = JSON.stringify(this.notiFilter);
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetNotiAsync',
      [this.model])
      .subscribe((res:any[]) => {
        debugger
        if(scroll)
          this.noti = this.noti.concat(res[1]);
        else
        {
            this.bookmark = res[0];
            this.noti = res[1];
            this.totalPage = Math.ceil(res[2] / this.model.pageSize);
            this.scrolled = false;
            if(res[2] == 0)
              this.loaded = false;
        }
    });
  }

  // scroll
  onScroll() {
    if(this.scrolled || this.model.page > this.totalPage) return;
    this.scrolled = true;
    this.getNotiAsync(this.scrolled);
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
      this.noti.splice(index,1);
      this.codxService.openUrlNewTab(item.function,"",query);
    }
  }

  // filter selected change
  typeChange(event:any){
    this.type = event;
    this.notiFilter.type = event.value;
    this.getNotiAsync();
  }
  //filter entityName change
  statusChange(event:any){
    this.status = event;
    this.notiFilter.status = event.value;
    this.getNotiAsync();
  }
  // filter bookmark
  clickTab(mode){
    this.notiFilter.mode = mode;
    this.getNotiAsync();
  }
  //click more FC
  clickMF(event,item){
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
