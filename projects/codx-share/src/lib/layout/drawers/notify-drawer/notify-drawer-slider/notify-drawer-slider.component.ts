import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { MODEL_CHANGED } from '@syncfusion/ej2-angular-richtexteditor';
import { DateTime } from '@syncfusion/ej2-charts';
import { DialogRef, CRUDService, ApiHttpService, AuthService, DialogData, ScrollComponent, RequestModel, DataRequest, CacheService } from 'codx-core';

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
  user:any = null;
  totalPage:number = 0;
  isScroll = true;
  messageNoData:string ="";
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthService,
    private cache:CacheService,
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
  }

  ngAfterViewInit(){
    ScrollComponent.reinitialization();
  }
  clickCloseFrom(){
    this.dialogRef.close();
  }
  getNotifyAsync(){
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetAsync',
      [this.model]
    ).subscribe((res:any[]) => {
      if(res)
      {
        this.lstNotify = res[0];
        let totalRecord = res[1];
        this.totalPage = totalRecord / this.model.pageSize;
        this.isScroll = false;
        this.dt.detectChanges();
      }
    });
  }

  onScroll(event: any) {
    let dcScroll = event.srcElement;
    if (dcScroll.scrollTop + dcScroll.clientHeight < dcScroll.scrollHeight - 150) return;
    if(this.model.page > this.totalPage || this.isScroll) return;
    this.isScroll = true;
    this.model.page = this.model.page + 1;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetAsync',
      [this.model]
    ).subscribe((res:any[]) => {
      if(res && res[0].length > 0){
        let notifications = res[0];
        this.lstNotify = this.lstNotify.concat(notifications);
        this.isScroll = false;
        this.dt.detectChanges();
      }
    });
  }

  clickNotification(item:any){
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
    })
  }

  getMessage(mssgCode:string){
    if(mssgCode){
      this.cache.message(mssgCode).subscribe((mssg:any) => {
        if(mssg){
          this.messageNoData = mssg.defaultName;
        }
      });
    }
  }

}
