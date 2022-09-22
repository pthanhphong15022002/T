import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { itemMove } from '@syncfusion/ej2-angular-treemap';
import { DateTime } from '@syncfusion/ej2-charts';
import {  ApiHttpService, AuthService, CRUDService, DialogData, DialogRef, ScrollComponent, UIComponent } from 'codx-core';
import { debug } from 'console';

@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
  styleUrls: ['./notify-drawer.component.scss'],
})
export class NotifyDrawerComponent implements OnInit {
  dialog: DialogRef;
  lstNotify:any[] = [];
  pageIndex:number = 0;
  pageSize:number = 20;
  dataService:CRUDService = null;
  user:any = null;
  @ViewChild("itemNoti") itemNoti: TemplateRef<any>;
  constructor(
    private api:ApiHttpService,
    private injector: Injector,
    private dt:ChangeDetectorRef,
    private auth:AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {    this.dialog = dialog;
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
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
      if(res && res[0] && res[1] > 0){
        this.lstNotify = res[0];
        this.totalPage = res[1];
        this.isScroll = false;
        this.dt.detectChanges();
      }
    });
  }
  totalPage:number = 0;
  isScroll = true;
  onScroll(event: any) {
    let dcScroll = event.srcElement;
    if (dcScroll.scrollTop + dcScroll.clientHeight < dcScroll.scrollHeight - 150) return;
    if(this.pageIndex > this.totalPage || this.isScroll) return;
    this.isScroll = true;
    let pPageIndex = this.pageIndex + 1;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusiness',
      'GetAsync',
      [pPageIndex]
    ).subscribe((res:any[]) => {
      if(res && res[0].length > 0){
        let notifications = res[0];
        notifications.forEach((e:any) => {
          let isExsit = this.lstNotify.some(x => x.recID == e.recID);
          if(!isExsit)
          {
            this.lstNotify.push(e);
          }
        });
        this.isScroll == false;
        this.pageIndex = pPageIndex;
        this.dt.detectChanges();
      }
      else
      {
        this.isScroll = true;
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
