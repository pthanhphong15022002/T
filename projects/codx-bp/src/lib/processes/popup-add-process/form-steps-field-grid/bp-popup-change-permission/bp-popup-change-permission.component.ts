import {
  CacheService,
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  AuthStore,
} from 'codx-core';
import {
  Component,
  OnInit,
  Optional,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'bp-popup-change-permission',
  templateUrl: './bp-popup-change-permission.component.html',
  styleUrls: ['./bp-popup-change-permission.component.css'],
})
export class BPPopupChangePermissionComponent implements OnInit {
  userIDs:any;
  dialogRef: any;
  task: any;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    // private cache: CacheService,
    private api: ApiHttpService,
    // private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialogRef=dialog;
    this.task = dialogData?.data?.task;
  }

  ngOnInit(): void {
    
  }

  onSaveForm() {
    if(this.userIDs== null || this.userIDs?.length==0)
    {
      this.notificationsService.notify("Người thực hiện ko đc bỏ trống!",'2',null);
      return;
    }
    this.api.execSv<any>(
      "BP",
      "ERM.Business.BP",
      'ProcessTasksBusiness',
      'ChangeTaskPermissionAsync',
      [this.userIDs]
    ).subscribe(res=>{

    });
    this.dialogRef && this.dialogRef.close();
  }

  
  valueChange(evt:any) {
    if (evt && evt?.field) {
      this.userIDs = evt?.data?.value;
    }
    this.detectorRef.detectChanges();
  }  
}
