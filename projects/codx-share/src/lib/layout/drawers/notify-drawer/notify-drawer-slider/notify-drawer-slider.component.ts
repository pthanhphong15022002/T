import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { MODEL_CHANGED } from '@syncfusion/ej2-angular-richtexteditor';
import { DateTime } from '@syncfusion/ej2-charts';
import { DialogRef, CRUDService, ApiHttpService, AuthService, DialogData, ScrollComponent, RequestModel, DataRequest } from 'codx-core';

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
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {    
    this.dialogRef = dialogRef;
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    this.getNotifyAsync();
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
      if(res){
        this.lstNotify = res[0];
        let totalRecord = res[1];
        this.totalPage = totalRecord / this.model.pageSize;
        this.isScroll = false;
        this.dt.detectChanges();
        console.log(totalRecord,this.totalPage);
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
    if(!item || !item.recID) return;
    
    this.api.execSv(
    'BG',
    'ERM.Business.BG',
    'NotificationBusiness',
    'UpdateNotificationAsync', 
    [item.recID]).subscribe((res:boolean) => {
      if(res){
        if(!item.isRead || item.isRead.length == 0){
          item.isRead = [];
        }
        let object = {
          objectID: this.user.userID,
          objectName: this.user.userName,
          createdOn: new DateTime()
        }
        item.isRead.push(object);
      }
    })
    this.dt.detectChanges();
  }

}
