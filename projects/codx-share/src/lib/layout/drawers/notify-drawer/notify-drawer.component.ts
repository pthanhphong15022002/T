import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthService, CallFuncService, DialogData, DialogRef, NotificationMessage, SidebarModel, UIComponent } from 'codx-core';
import { CodxAlertComponent } from '../../../components/codx-alert/codx-alert.component';

@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
  styleUrls: ['./notify-drawer.component.scss'],
})
export class NotifyDrawerComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  lstNotify:any[] = [];
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
      this.getNotifyAsync(this.funcID);
    }
  }
  clickCloseFrom(){
    this.dialog.close();
  }
  getNotifyAsync(funcID:string){
    this.api.execNonDB<NotificationMessage[]>( 
      'Background',
      'NotificationBusinesss',
      'GetAsync',
      [this.auth.userValue.userID, this.auth.userValue.tenant]
    ).subscribe((res:any) => {
      if(res){
        console.log(res);
        this.lstNotify = res;
      }
    });
  }

  clickStopAlert(event:any,item:any){
    item.isRead = event.value;
    this.dt.detectChanges();
  }


}
