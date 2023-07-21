import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { ApiHttpService, AuthService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-codx-report-add',
  templateUrl: './codx-report-add.component.html',
  styleUrls: ['./codx-report-add.component.css']
})
export class CodxReportAddComponent {
  dialogRef:DialogRef = null;
  action:string = "";
  objectID:string = "";
  objectType:string = "";
  constructor(
  private api:ApiHttpService,
  private auth:AuthService,
  private notiSV:NotificationsService,
  private dt:ChangeDetectorRef,
  @Optional() dialogData:DialogData,
  @Optional() dialogRef:DialogRef,
  )
  {
    this.dialogRef = dialogRef;
    this.action = dialogData.data?.action;
    this.objectID = dialogData.data?.objectID;
    this.objectType = dialogData.data?.action;
    this.action = dialogData.data?.action;

  }
}
