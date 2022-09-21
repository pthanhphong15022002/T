import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { DateTime } from '@syncfusion/ej2-charts';
import {  AuthService, CRUDService, DialogData, DialogRef, ScrollComponent, UIComponent } from 'codx-core';

@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
  styleUrls: ['./notify-drawer.component.scss'],
})
export class NotifyDrawerComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  lstNotify:any[] = [];
  pageIndex:number = 0;
  pageSize:number = 20;
  dataService:CRUDService = null;
  user:any = null;
  constructor(
    private injector: Injector,
    private dt:ChangeDetectorRef,
    private auth:AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.user = this.auth.userValue;
    this.dataService = new CRUDService(injector);
    this.dataService.service = "Background";
    this.dataService.assemblyName = "ERM.Business.Background";
    this.dataService.className = "NotificationBusinesss";
    this.dataService.method = "GetAsync";
    this.dataService.idField = "recID";
    this.dataService.pageSize = 20;
    this.dataService.request.entityName = "BKD_Notification";
    this.dataService.request.gridViewName = "grvNotification";
    this.dataService.request.pageLoading = true;
  }

  onInit(): void {
    this.getNotifyAsync();
  }

  ngAfterViewInit(){
    ScrollComponent.reinitialization();
  }
  clickCloseFrom(){
    this.dialog.close();
  }
  getNotifyAsync(){
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusiness',
      'GetAsync',
      [this.pageIndex]
    ).subscribe((res:any[]) => {
      if(res.length > 0){
        this.lstNotify = res[0];
        this.dt.detectChanges();
      }
    });
  }

  clickNotification(item:any){
    let object = {
      UserID: this.user.userID,
      UserName: this.user.userName,
      CreatedOn: new DateTime()
    }
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
        item.isRead.push(object);
      }
    })
    
    this.dt.detectChanges();
  }


}
