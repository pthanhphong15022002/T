import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthService, CallFuncService, DialogData, DialogRef, NotificationMessage, SidebarModel, UIComponent } from 'codx-core';
import { CodxAlertComponent } from '../../../components/codx-alert/codx-alert.component';

@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
  styleUrls: ['./notify-drawer.component.scss'],
})
export class NotifyDrawerComponent extends UIComponent implements OnInit {
  dialog: any;
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
      this.cache.functionList(this.funcID).subscribe((f:any) => {
        if(f){
          this.entityName = f.entityName;
          this.getAlertAsync(this.entityName);
        }
      });
    }
    // this.api.execNonDB<NotificationMessage[]>( 
    //   'Background',
    //   'NotificationBusinesss',
    //   'GetAsync',
    //   [this.auth.userValue.userID, this.auth.userValue.tenant]
    // ).subscribe((res:any) => {
    //   if(res){
    //     console.log(res);
    //     this.lstNotify = res;
    //   }
    // });

  }

  getAlertAsync(entityName:string){
    this.api.exec("ERM.Business.AD","AlertRulesBusiness","GetAsync",entityName)
    .subscribe((res:any) => {
      if(res){
        console.log(res);
      }
    })
  }
}
