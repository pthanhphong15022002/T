
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, CodxService, DataRequest, DialogData, DialogRef, FormModel, ScrollComponent } from 'codx-core';

@Component({
  selector: 'codx-notify-popup',
  templateUrl: './notify-drawer-popup.component.html',
  styleUrls: ['./notify-drawer-popup.component.scss']
})
export class NotifyDrawerPopupComponent implements OnInit, AfterViewInit {

  @Input() predicate:string = "";
  @Input() dataValue:string = "";
  @Input() predicates:string = "";
  @Input() dataValues:string = "";
  @Input() dataObj:string = "";
  
  dialogRef: DialogRef;
  model:DataRequest;
  formModel:FormModel;
  user:any;
  data:any[] = [];

  scrolled:boolean = true;
  loaded:boolean = true;
  totalRecord:number = 0;
  mssgNoData:string ="";
  vllEntityName:any[] = [];
  entityName:any = null;
  vllIsRead:any[] = [];
  isRead:any = null;
  notiMFC:any[] = [];

  constructor
  (
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthStore,
    private cache:CacheService,
    private codxService:CodxService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.dialogRef = dialogRef;
    this.model = new DataRequest("Notification","grvNotification","BG_Notification",this.predicate,this.dataValue,1,20);
    this.model.predicate = this.predicate;
    this.model.dataValue = this.dataValue;
    this.model.predicates = this.predicates;
    this.model.dataValues = this.dataValues;
    this.model.dataObj = this.dataObj;
    this.formModel = new FormModel();
    this.user = this.auth.get();

  }
 

  ngOnInit(): void {
    this.getSetUp();
    this.getNotiAsync();
  }
  ngAfterViewInit(): void {
    ScrollComponent.reinitialization();
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
    this.cache.valueList("SYS055").subscribe((vll:any) => {
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
    this.cache.valueList("SYS057").subscribe((vll:any) => {
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
  }

  // load data noti
  getNotiAsync(scroll:boolean = false){
    this.loaded = true;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetNotiAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res[1] > 0)
      {
        if(scroll)
          this.data = this.data.concat(res[0]);
        else
          this.data = res[0];
        this.totalRecord = res[1];
        this.scrolled = false;
        this.dt.detectChanges();
      }
      else if(this.data.length == 0){
        this.loaded = false;
      }
    });
  }

  // scroll
  onScroll(event: any) {
    let dcScroll = event.srcElement;
    if(this.scrolled || (dcScroll.scrollTop + dcScroll.clientHeight < dcScroll.scrollHeight - 150)  || this.data.length > this.totalRecord) return;
    this.loaded = true;
    this.scrolled = true;
    this.model.page = this.model.page + 1;
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
      this.data.splice(index,1);
      this.codxService.openUrlNewTab(item.function,"",query);
    }
  }


  // filter selected change
  entityNameChange(event:any){
    this.entityName = event;
    this.model.predicates = "EntityName = @0";
    this.model.dataValues = event.value;
    this.loaded = true;
    this.model.page = 1;
    this.totalRecord = 0;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetNotiAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res[1] > 0)
      {
        this.data = res[0];
        this.totalRecord = res[1];
        this.scrolled = false;
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
    this.totalRecord = 0;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetNotiAsync',
      [this.model])
      .subscribe((res:any[]) => {
      if(res && res[1] > 0)
      {
        this.data = res[0];
        this.totalRecord = res[1];
        this.scrolled = false;
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
  clickTab1(){

  }
  //
  clickTab2(){

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
