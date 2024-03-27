import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, CodxService, DataRequest, DialogModel, FormModel, NotificationsService } from 'codx-core';
import { Subscription, map, of } from 'rxjs';
import { NotifyDrawerPopupComponent } from '../notify-drawer-popup/notify-drawer-popup.component';
import { subscribe } from 'diagnostics_channel';

@Component({
  selector: 'codx-notify-body',
  templateUrl: './notify-body.component.html',
  styleUrls: ['./notify-body.component.scss']
})
export class NotifyBodyComponent implements OnInit, OnDestroy {

  @Input() mode:string = "";
  @Input() formModel:FormModel = null;
  @Input() defaultStatus:string
  model:DataRequest;
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
  notiFilter = {
    mode:"",
    type:[],
    status:""
  }
  isAfterRender=false;
  funcList: any;
  subscriptions = new Subscription();

  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthStore,
    private cache:CacheService,
    private codxService:CodxService,
    private callFC:CallFuncService,
    private notiSV:NotificationsService,
  ) 
  {
    this.model = new DataRequest("Notification","grvNotification","BG_Notification","","",1,20);
    this.user = auth.get();
    let subscribe = this.cache.functionList('BGT001').subscribe(func=>{
      this.funcList = func;
      this.isAfterRender = true;
    });
    this.subscriptions.add(subscribe);
  }
 

  ngOnInit(): void {
    if(this.defaultStatus)
      this.notiFilter.status = this.defaultStatus;
    this.model.dataObj = JSON.stringify(this.notiFilter);
    this.notiFilter.mode = this.mode;
    this.getSetUp();
    this.getNotiAsync();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

   getSetUp(){
    let subcribe1 = this.cache.message("SYS010").subscribe((mssg:any) => {
      if(mssg){
        this.mssgNoData = mssg.defaultName;
      }
    });
    let subcribe2 = this.cache.valueList("SYS055")
    .subscribe((vll:any) => {
      if(vll){
        this.vllType = vll.datas;
        this.type = vll.datas[0];
      }
    });
    let subcribe3 = this.cache.valueList("SYS057")
    .subscribe((vll:any) => {
      if(vll){
        this.vllStatus = vll.datas;
        this.status = vll.datas[0];
      }
    });
    this.subscriptions.add(subcribe1);
    this.subscriptions.add(subcribe2);
    this.subscriptions.add(subcribe3);
  }

  // load data noti
  getNotiAsync(scroll:boolean = false){
    if(!scroll)      
      this.model.page = 1;
    else
      this.model.page = this.model.page + 1; 
    this.loaded = true;
    this.model.dataObj = JSON.stringify(this.notiFilter);
    let subscribe = this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetNotiAsync',
      [this.model])
      .subscribe((res:any[]) => {
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
    this.subscriptions.add(subscribe);
  }

  // scroll
  onScroll() {
    if(this.scrolled || this.model.page > this.totalPage) return;
    this.scrolled = true;
    this.getNotiAsync(this.scrolled);
  }

  // view detail noti
  clickNotification(item:any,element:any){
    if(element.target.tagName !== 'A'){
      if(!item.read)
      {
        let subscribe = this.api.execSv(
          'BG',
          'ERM.Business.BG',
          'NotificationBusinesss',
          'UpdateAsync', 
          [item.recID]).subscribe((res:boolean) => {
            item.read = res;
        });
        this.subscriptions.add(subscribe);
      }
      var queryParam = { predicate:"RecID=@0",dataValue:item.transID};
      if(item.view)
        Object.assign(queryParam, {view: item.view});
      if(item?.parentID)
      {
        let subscribe = this.cache.functionList(item.function).subscribe(func=>{
          if(func && func?.url){
            this.codxService.openUrlNewTab(null,func?.url+"/"+item?.parentID,queryParam);
          }
        });
        this.subscriptions.add(subscribe);
      }
      else this.codxService.openUrlNewTab(item.function,"",queryParam);
    }
  }

  // filter selected change
  typeChange(event:any){
    if(event.value !== this.type.value)
    {
      this.notiFilter.type = [];
      this.type = event;
      if(this.type.value){
        this.notiFilter.type.push(this.type.value);
      }
      this.getNotiAsync();
    }
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
  clickMF(event:any,item:any,type:string,index){
    if(event){
      switch(event.functionID){
        case "WP005": // ghim
          let subscribe1 = this.checkBookmark(item.recID,"add")
          .subscribe((res:boolean) => item.isBookmark = res);
          this.subscriptions.add(subscribe1);
          break; 
        case "WP006": // bỏ ghim
          let subscribe2 = this.checkBookmark(item.recID,"remove")
                                .subscribe((res:boolean) => item.isBookmark = !res);
          this.subscriptions.add(subscribe2);
          break; 
        case "WP007": // đánh dấu đã đọc
          let subscribe3 = this.checkRead(item.recID)
          .subscribe((res:boolean) => item.read = res);
          this.subscriptions.add(subscribe3);
          break; 
        case "WP008": // xóa
          let subscribe4 = this.notiSV.alertCode("SYS030")
          .subscribe((res1:any) => {
            if(res1.event.status === "Y"){
              this.api.execSv(
                "BG",
                "ERM.Business.BG",
                "NotificationBusinesss",
                "DeleteAsync",
                [item.recID])
                .subscribe((res2:boolean) => {
                  if(res2){
                    this.notiSV.notifyCode("SYS008");
                    if(type == "bookmark")
                      this.bookmark.splice(index,1);
                    else
                      this.noti.splice(index,1);
                  }
                  else this.notiSV.notifyCode("SYS022");
                });
            }
          });
          this.subscriptions.add(subscribe4);
          break;
        default:
          break;
      }
    }
  }

  // change More funtion
  changeDataMF(arrMFC){
      arrMFC.map(e => {
        if(e.functionID == "WP005" || e.functionID == "WP006" || e.functionID == "WP007" || e.functionID == "WP008")
          e.disabled = false;
        else
          e.disabled = true;
      });
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

  // check read all
  checkReadAll(){
    this.api.execSv("BG","ERM.Business.BG","NotificationBusinesss","ReadAllAsync",[])
    .subscribe((res:boolean) => {
      if(res){
        if(this.bookmark.length > 0){
          this.bookmark.map(e => e.read = true);
        }
        if(this.noti.length > 0){
          this.noti.map(e => e.read = true);
        }
      }
    })
  }
  
}
