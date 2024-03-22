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
import { Permission } from '@shared/models/file.model';

@Component({
  selector: 'bp-popup-change-permission',
  templateUrl: './bp-popup-change-permission.component.html',
  styleUrls: ['./bp-popup-change-permission.component.css'],
})
export class BPPopupChangePermissionComponent implements OnInit {
  userIDs:any;
  dialogRef: any;
  data: any;
  pers=[];
  user: import("codx-core").UserModel;
  constructor(
    private detectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    // private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialogRef=dialog;
    this.data = dialogData?.data?.data;
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    
  }

  onSaveForm() {
    if(this.userIDs== null || this.userIDs?.length==0)
    {
      this.notificationsService.notify("Người thực hiện ko đc bỏ trống!",'2',null);
      return;
    }
    this.userIDs?.dataSelected.forEach(u=>{
      let per = new Permission();      
      per.objectName = u.dataSelected?.UserName ?? u?.text;
      per.objectID=u.dataSelected?.UserID ?? u?.id;
      per.objectType="U";
      per.email =u?.dataSelected?.Email;
      per.full=true;
      per.create=true;
      per.read=true;
      per.update=true;
      per.delete=true;
      per.share=true;
      per.isSharing=true;
      per.allowOtherShare=true;
      per.upload=true;
      per.download=true;
      per.revision=true;
      per.assign=true;
      per.allowOtherDownload=true;
      per.isActive=true;
      per.createdOn=new Date();
      per.createdBy=this.user?.userID;
      this.pers.push(per);
    })
    this.api.execSv<any>(
      "BP",
      "ERM.Business.BP",
      'ProcessTasksBusiness',
      'ChangeTaskPermissionAsync',
      [this.data?.dataTask?.recID,this.pers]
    ).subscribe(res=>{
      this.dialogRef && this.dialogRef.close(this.pers);
    });
  }

  
  valueChange(evt:any) {
    if (evt && evt?.field) {
      this.userIDs = evt?.data;
    }
    this.detectorRef.detectChanges();
  }  
}
