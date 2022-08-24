import { ChangeDetectorRef, Component, inject, Injector, OnInit, Optional } from '@angular/core';
import { extend } from '@syncfusion/ej2-base';
import { AuthService, DialogData, DialogRef, NotificationMessage, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-alert-drawer',
  templateUrl: './alert-drawer.component.html',
  styleUrls: ['./alert-drawer.component.css']
})
export class AlertDrawerComponent extends UIComponent implements OnInit {

  dialog: any;
  lstAlerts:any[] = [];
  lstNewNotify:any[] = [];
  lstOldNotify:any[] = [];
  funcID:string ="";
  entityName:string = "";
  tableName:String = "";
  constructor(
    private inject: Injector,
    private dt:ChangeDetectorRef,
    private auth:AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.funcID = data?.data;
  }

  onInit(): void {
    if(this.funcID)
    {
      this.getAlertAsync(this.funcID);
    }
  }



  getAlertAsync(funcID:string){
    this.api.execNonDB<NotificationMessage[]>( 
      'Background',
      'NotificationBusinesss',
      'GetAsync',
      [this.auth.userValue.userID, this.auth.userValue.tenant]
    ).subscribe((res:any) => {
      if(res){
        console.log(res);
        this.lstAlerts = res;
      }
    });
  }

  clickStopAlert(event:any,item:any){
    item.isRead = event.value;
    this.dt.detectChanges();
  }
}
