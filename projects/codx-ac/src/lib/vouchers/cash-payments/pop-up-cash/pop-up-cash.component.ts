import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, DialogRef, NotificationsService, AuthService, DialogData } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-pop-up-cash',
  templateUrl: './pop-up-cash.component.html',
  styleUrls: ['./pop-up-cash.component.css']
})
export class PopUpCashComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private auth: AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
  }
  onInit(): void {
    
  }

  ngAfterViewInit() {
    
    this.dt.detectChanges();
  }
}
