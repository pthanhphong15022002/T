import { C } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { isObject } from '@syncfusion/ej2-base';
import { FormModel, ApiHttpService, AuthService, CacheService, NotificationsService, CallFuncService, DialogModel, DialogRef } from 'codx-core';
import { environment } from 'src/environments/environment';
import { ViewFileDialogComponent } from '../../viewFileDialog/viewFileDialog.component';
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
    private callFuc:CallFuncService,
    private dt: ChangeDetectorRef
  ) 
  {
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    if(this.data.actionType === "A" || this.data.actionType === "C" || this.data.actionType === "C1" || this.data.actionType === "C2" || this.data.actionType === "3"){
      this.getFileByObjectID(this.data.recID);
    }
  }

  // get file by objectID
  getFileByObjectID(objetcID:string){
    if(this.data.actionType == "C"){
      this.api.execSv(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "GetFilesByIbjectIDAsync",
        this.data.recID)
      .subscribe((res:any[]) => {
        if(Array.isArray(res)){
          debugger
          this.lstFile = res; 
          this.dt.detectChanges();
      }});
    }
    else{
      this.api.execSv(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "GetFilesByTrackLogIDAsync",
        [objetcID])
        .subscribe((res:any[]) => {
          if(Array.isArray(res)){
            this.lstFile = res; 
            this.dt.detectChanges();
        }});
    }
  }

  //check value string is null or empty
  isNullOrEmpty(value:string):boolean{
    return value == null || value==undefined || !value.trim();
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

  //click view file
  clickViewFile(file:any){
    let option = new DialogModel();
      option.FormModel = this.formModel;
      option.IsFull = true;
      option.zIndex = 999;
      this.callFuc.openForm(
        ViewFileDialogComponent,
        '',
        0,
        0,
        '',
        file,
        '',
        option
      );
  }
  // format file size 
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
