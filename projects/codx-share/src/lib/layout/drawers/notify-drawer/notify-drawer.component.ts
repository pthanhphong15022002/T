import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthService, CallFuncService, DialogData, DialogRef, SidebarModel, UIComponent } from 'codx-core';
import { CodxAlertComponent } from '../../../components/codx-alert/codx-alert.component';

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
    // this.api.execSv("Background","ERM.Business.Background","NotificationBusinesss","GetAsync",[this.auth.userValue.userID,this.tenant])
    // .subscribe((res:any) => {
    //   console.log(res);
    // })
  }
  clickShowAlert(){
    let optionSide = new SidebarModel();
    optionSide.Width = '550px';
    this.callfc.openSide(CodxAlertComponent,'',optionSide);
  }
}
