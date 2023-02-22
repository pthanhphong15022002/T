import { C } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { isObject } from '@syncfusion/ej2-base';
import { FormModel, ApiHttpService, AuthService, CacheService, NotificationsService, CallFuncService, DialogModel, DialogRef } from 'codx-core';
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
  isCollapsed=true;
  @ViewChild("popupViewDetail") popupViewDetail:TemplateRef<any>;
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
    if(this.data?.actionType === "C")
    {
      this.getFileByObjectID(this.data.recID);
    }
  }

  getFileByObjectID(objetcID:string){
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

  //check value string is null or empty
  isNullOrEmpty(value:string):boolean{
    if(!value.trim()){
      return true;
    }
    return false;
  }
  // Check data type is object || josn || array
  isObject(value:any):boolean {
    try
    {
      JSON.parse(value);
      return true;
    } catch 
    {
        return false;
    }
  }
  // open popup view detail
  clickViewDetail(){
    let option = new DialogModel();
    this.callFuc.openForm(this.popupViewDetail,"",0,0,"",null,"",option);
  }

  //
  clickClosePopup(dialog:DialogRef){
    dialog.close();
  }

}
