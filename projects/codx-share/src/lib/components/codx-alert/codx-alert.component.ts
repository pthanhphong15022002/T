import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogRef, DialogData, ApiHttpService, NotificationMessage, AuthService } from 'codx-core';

@Component({
  selector: 'lib-codx-alert',
  templateUrl: './codx-alert.component.html',
  styleUrls: ['./codx-alert.component.scss']
})
export class CodxAlertComponent implements OnInit {

  funcID:string = "";
  dialog:DialogRef = null;
  constructor(
    private route:ActivatedRoute,
    private auth:AuthService,
    private api:ApiHttpService,
    private dt: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) 
  {
    this.dialog = dialog;
    this.funcID = data.data;
  }

  ngOnInit(): void { 

  }

}
