import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, AuthService, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';

@Component({
  selector: 'lib-popup-save',
  templateUrl: './popup-save.component.html',
  styleUrls: ['./popup-save.component.scss']
})
export class PopupSavePostComponent implements OnInit {


  headerText: string;
  headerTextPopup: string = "Thêm mới kho lưu trữ";
  dialogData:any = null;
  dialogRef: DialogRef;
  data: any;
  user: any;
  listStorage: any[] = [];
  title: string = "";
  storageType: string = "WP_Comments";
  storageIDSelected: any = null;
  storage:any = null;

  @ViewChild("fromPopupAdd") popupBody: TemplateRef<any>;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private notifiSV: NotificationsService,
    private callFC: CallFuncService,
    private auth: AuthService,
    private cache : CacheService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.user = auth.userValue;
    this.dialogData = dialogData?.data;
    this.data = this.dialogData?.data;
    this.headerText = this.dialogData?.headerText;
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {
    this.getListStorage();
  }
  getListStorage() {
    this.api.execSv("WP", "ERM.Business.WP", "StoragesBusiness", "GetListStorageByUserIDAsync")
      .subscribe((res: any[]) => {
        if (res) 
        {
          this.listStorage = res;
          this.listStorage[0].isActive = true;
          this.storageIDSelected = this.listStorage[0].recID;
          this.storage = this.listStorage[0]
          this.dt.detectChanges();
        }
      });
  }
  saveObjectToStorage() {
    if(this.storage && this.data)
    {
      this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "StoragesBusiness",
      "InsertIntoStorageAsync",
      [this.storage.recID, this.data.recID])
      .subscribe((res:any) => {
        if (res)
        {
          this.notifiSV.notifyCode("SYS006");
          this.dialogRef.close();
        }
        else 
        {
          this.notifiSV.notifyCode("SYS023");
        }
      });
    }
  }
  selectStorage(item){
    this.listStorage.map((x: any) => {
      if (x.recID != item.recID) 
      {
        x.isActive = false;
      }
      else 
      {
        this.storageIDSelected = x.recID;
        x.isActive = true;
      }
    });
    this.dt.detectChanges();
  }
  createdStorage(dialogPopup: DialogRef) {
    if (!this.title) 
    {
      this.cache.message("SYS009").subscribe((mssg:any) =>{
        if(mssg){
          let messageCode = mssg.defaultName;
          let strMessage = Util.stringFormat(messageCode,"Tên kho lưu trữ");
          this.notifiSV.notify(strMessage); 
        }
      });
    }
    else
    {
      var object = {
        title: this.title,
        storageType: this.storageType
      }
      this.api.execSv("WP", "ERM.Business.WP", "StoragesBusiness", "CreateStorageAsync", [object])
        .subscribe((res: any) => {
          if (res) 
          {
            var storage = {
              recID: res.recID,
              title: res.title,
              isActive: false
            }
            if(this.listStorage.length == 0){
              storage.isActive = true;
              this.listStorage = [];
            }
            this.listStorage.push(storage);
            this.dt.detectChanges();
            this.notifiSV.notifyCode("SYS006");
            dialogPopup.close();
          }
          else 
          {
            this.notifiSV.notifyCode("SYS023");
          }
        });
    }
  }
  openModelAddStorage() {
    this.callFC.openForm(this.popupBody, "", 400, 200, "", null, "");
  }
  valueChange(event: any) {
    if (!event) return;
    this.title = event.data;
    this.dt.detectChanges();
  }
}
