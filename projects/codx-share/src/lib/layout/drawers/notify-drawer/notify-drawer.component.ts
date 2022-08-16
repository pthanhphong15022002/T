import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
})
export class NotifyDrawerComponent extends UIComponent implements OnInit {
  dialog: any;
  constructor(
    private inject: Injector,
    private dt:ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
  }

  onInit(): void {
    this.api.execSv("Background","ERM.Business.Background","NotificationBusinesss","GetAsync")
    .subscribe((res:any) => {
      console.log(res);
    })
  }
}
