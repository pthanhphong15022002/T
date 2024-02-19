import { Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-viewresult',
  templateUrl: './viewresult.component.html',
  styleUrls: ['./viewresult.component.css']
})
export class ViewresultComponent extends UIComponent {
  dialog!: DialogRef;
  sessionID: any = '';
  headerText: any = '';
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private acService: CodxAcService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data.headerText;
    this.sessionID = dialogData.data.sessionID;
  }

  onInit(): void {
    this.acService.setPopupSize(this.dialog, '90%', '90%');
  }
}
