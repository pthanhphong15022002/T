import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthService, DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
})
export class NotifyDrawerComponent extends UIComponent implements OnInit {
  dialog: any;
  tenant:string ="";
  constructor(
    private inject: Injector,
    private dt:ChangeDetectorRef,
    private auth:AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.tenant = this.auth.userValue.tenant;
  }

  onInit(): void {
    this.api.execSv("Background","ERM.Business.Background","NotificationBusinesss","GetAsync",[this.auth.userValue.userID,this.tenant])
    .subscribe((res:any) => {
      console.log(res);
    })
  }
}
