import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { DateTime } from '@syncfusion/ej2-charts';
import {  ApiHttpService, AuthService, CRUDService, DialogData, DialogRef, ScrollComponent, UIComponent } from 'codx-core';

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


  onScroll(event: any) {
    const dcScroll = event.srcElement;
    if (
      dcScroll.scrollTop + dcScroll.clientHeight <
      dcScroll.scrollHeight - 150
    ) {
      return;
    }
    this.pageIndex++;
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusiness',
      'GetAsync',
      [this.pageIndex]
    ).subscribe((res:any[]) => {
      if(res){
        let notifys = res[0];
        let lstNotifyElement = document.getElementById("lstNotify");
        notifys.forEach((item:any) => {
          let notiHTML = 
            `
              <div class="row p-4 my-2" (click)="clickNotification(${item})">
                <div class="col-1">
                  <codx-img [width]="35" [objectId]="${item.userID}" [objectType]="'AD_Users'"></codx-img>
                </div>
                <div class="col-10">
                  <div [innerHTML]="${item.textValue}">        
                  </div>
                  <div>
                    <span class="text-primary ms-1">{{${item.createdDate} | timefrom}}</span>
                  </div>
                </div>
                <div class="col-1" *ngIf="${!item.isRead}">
                  <span class="dots"></span>
                </div>
              </div>
            `  
        });
        this.dt.detectChanges();
      }
    });
    //this.dataService.scrolling();
  }

}
