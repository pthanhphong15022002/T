import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { MODEL_CHANGED } from '@syncfusion/ej2-angular-richtexteditor';
import { DateTime, Thickness } from '@syncfusion/ej2-charts';
import { DialogRef, CRUDService, ApiHttpService, AuthService, DialogData, ScrollComponent, RequestModel, DataRequest, CacheService, CodxService } from 'codx-core';

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
  datas:any[] = [];
  valueSelected:any = null;

  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthService,
    private cache:CacheService,
    private codxService:CodxService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {    
    this.dialogRef = dialogRef;
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    this.getNotifyAsync();
    this.getMessage("SYS010");
    this.cache.valueList("SYS055").subscribe(vll => {
      if(vll){
        this.datas = vll.datas;
        let _defaultVLL  = vll.datas.find(x => x.value == "");
        if(_defaultVLL){
          this.valueSelected = _defaultVLL;
        }
        else{
          this.valueSelected = vll.datas[0];
        }
      }
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
  getNotifyAsync()
  {
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetAsync',
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
        if(Array.isArray(this.lstNotify) && this.lstNotify.length == 0){
          this.loaded = false;
        }
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
      'GetAsync',
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
      else
      {
        if(Array.isArray(this.lstNotify) && this.lstNotify.length == 0){
          this.loaded = false;
        }
      }
    });
  }
  // view detail noti
  clickNotification(item:any){
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
    this.model.page = 1;
    this.totalPage = 0;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetAsync',
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
}
