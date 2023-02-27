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
  itemSelected: any = null;
  loaded:boolean = true;
  mssgNoData:string = "";
  loading:boolean = false;
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
    this.data = this.dialogData.data;
    this.headerText = this.dialogData.headerText;
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {
    this.getListStorage();
    this.cache.message("SYS010").subscribe((mssg:any) => {
      if(mssg){
        this.mssgNoData = mssg.defaultName;
      }
    });
  }
  getListStorage() {
    this.loaded = true;
    this.api.execSv("WP", "ERM.Business.WP", "StoragesBusiness", "GetListStorageByUserIDAsync")
      .subscribe((res: any[]) => {
        if (res == null || res?.length == 0)
          this.loaded = false;          
        else
        {
          res[0].isActive = true;
          this.listStorage = JSON.parse(JSON.stringify(res));
          this.itemSelected = this.listStorage[0];
        }
        this.dt.detectChanges();
        });
  }
  //save to storage
  saveToStorage() {
    if(!this.loading){
      this.loading = true;
      if(this.itemSelected && this.data)
      {
        this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "StoragesBusiness",
        "InsertIntoStorageAsync",
        [this.itemSelected.recID, this.data.recID])
        .subscribe((res:any) => {
          if (res)
          {
            if(this.listStorage.length == 0){
              res.isActive = true;
              this.itemSelected = res;
            }
            this.listStorage.push(res);
            this.notifiSV.notifyCode("SYS006");
            this.dialogRef.close();
          }
          else 
            this.notifiSV.notifyCode("SYS023");
          this.loading = false;
        });
      }
    }
  }
  //select item
  selectItem(item:any,index:number){
    if(index > -1){
      this.itemSelected = this.listStorage[index];
      this.listStorage.map((x: any) => x.isActive = x.recID == item.recID);
      this.dt.detectChanges();
    }
  }
  //create storage
  createdStorage(dialogPopup: DialogRef) {
    if(!this.loading)
    {
      if (!this.title) {
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
        this.loading = true;
        this.api.execSv("WP", "ERM.Business.WP", "StoragesBusiness", "CreateStorageAsync", [this.title,this.storageType])
          .subscribe((res: any) => {
            if (res){
              var storage = {
                recID: res.recID,
                title: res.title,
                isActive: false
              }
              if(this.listStorage.length == 0)
                storage.isActive = true;
              this.listStorage.push(storage);
              this.notifiSV.notifyCode("SYS006");
              dialogPopup.close();
            }
            else 
              this.notifiSV.notifyCode("SYS023");
            this.loading = false;
            this.dt.detectChanges();
          });
      }
    }
    
  }
  //open popup add
  openPopupAdd() {
    this.callFC.openForm(this.popupBody, "", 400, 200, "", null, "");
  }
  // value change
  valueChange(event: any) {
    if (!event) return;
    this.title = event.data;
  }
}
