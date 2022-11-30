import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { WP_Groups } from 'projects/codx-wp/src/lib/models/WP_Groups.model';

@Component({
  selector: 'wp-popup-add-group',
  templateUrl: './popup-add-group.component.html',
  styleUrls: ['./popup-add-group.component.css']
})
export class PopupAddGroupComponent implements OnInit {

  dialogData:any = null;
  dialogRef:any = null;
  gridViewSetUp:any = null;
  user:any = null;
  headerText:string = "";
  group:WP_Groups = new WP_Groups();
  constructor(
    private api:ApiHttpService,
    private notifiSV:NotificationsService,
    private dt:ChangeDetectorRef,
    private auth: AuthStore,
    @Optional() dialogData?:DialogData,
    @Optional() dialogRef?:DialogRef,
  )
  {
    this.dialogData = dialogData.data;
    this.dialogRef = dialogRef;
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.setData();
  }

  setData(){
    if(this.dialogData)
    {
      this.headerText = this.dialogData.headerText;
      this.gridViewSetUp = this.dialogData.gridViewSetUp;
    }
  }

  // value change
  valueChange(event)
  {
    if(event)
    {
      this.group.groupName = event.data;
      this.dt.detectChanges();
    }
  }
}
