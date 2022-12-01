import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormModel, ApiHttpService, AuthService, CacheService, NotificationsService, CallFuncService } from 'codx-core';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'codx-history-item',
  templateUrl: './codx-history-item.component.html',
  styleUrls: ['./codx-history-item.component.css']
})
export class CodxHistoryItemComponent implements OnInit {

  @Input() funcID: string;
  @Input() formModel:FormModel;
  @Input() data:any;
  user: any = null;
  lstFile: any[] = [];
  grdSetUp:any;
  REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION: 'application'
  }
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private cache: CacheService,
    private notifySV:NotificationsService,
    private callFuc:CallFuncService,
    private dt: ChangeDetectorRef
  ) 
  {
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    if(this.data)
    {
      this.getFileByObjectID(this.data.recID);
    }
  }

  getFileByObjectID(objetcID:string)
  {
    if(objetcID)
    {
      this.api.execSv(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "GetFilesByIbjectIDAsync",
        [objetcID])
        .subscribe((res:any[]) => {
          if(res?.length > 0){
            let files = res;
            files.forEach((e:any) => {
              if(e && e.referType == this.REFERTYPE.VIDEO)
              {
                e['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${e.recID}?access_token=${this.user.token}`;
              }
            })
            this.lstFile = res; 
            this.dt.detectChanges();
        }});
    }
  }

}
