import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, AuthService, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-popup-save',
  templateUrl: './popup-save.component.html',
  styleUrls: ['./popup-save.component.scss']
})
export class PopupSavePostComponent implements OnInit {


  headerText: string;
  headerTextPopup: string = "Thêm mới kho lưu trữ";
  dialogRef: DialogRef;
  data: any;
  user: any;
  listStorage: any[] = [];
  title: string = "";
  storageType: string = "WP_Comments";
  storageIDSelected: any = null;

  @ViewChild("fromPopupAdd") popupBody: TemplateRef<any>;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private notifiSV: NotificationsService,
    private callFC: CallFuncService,
    private auth: AuthService,
    @Optional() dd?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = auth.userValue;
    this.dialogRef = dialog;
    this.data = dd.data.post;
    this.headerText = dd.data.headerText;
  }

  ngOnInit(): void {
    this.getListStorage();
  }
  getListStorage() {
    this.api.execSv("WP", "ERM.Business.WP", "StoragesBusiness", "GetListStorageByUserIDAsync")
      .subscribe((res: any[]) => {
        if (res) {
          this.listStorage = res;
          this.listStorage[0].isActive = true;
          this.storageIDSelected = this.listStorage[0].recID;
          this.dt.detectChanges();
        }
      });
  }
  saveObjectToStorage() {
    if(this.storageIDSelected){
      this.api.execSv("WP", "ERM.Business.WP", "StoragesBusiness", "InsertIntoStorageAsync", [this.storageIDSelected, this.data.recID])
      .subscribe((res: any) => {
        if (res) {
          this.notifiSV.notifyCode("SYS006");
          this.dialogRef.close();
        }
        else {
          this.notifiSV.notifyCode("SYS023");
        }
      });
    }
  }
  selectStorage(item) {
    this.listStorage.map((x: any) => {
      if (x.recID != item.recID) {
        x.isActive = false;
      }
      else {
        this.storageIDSelected = x.recID;
        x.isActive = true;
      }
    });
    this.dt.detectChanges();
  }
  createdStorage(dialogPopup: DialogRef) {
    if (!this.title) {
      return;
    }
    var object = {
      title: this.title,
      storageType: this.storageType
    }
    this.api.execSv("WP", "ERM.Business.WP", "StoragesBusiness", "CreateStorageAsync", [object])
      .subscribe((res: any) => {
        if (res) {
          var storage = {
            recID: res.recID,
            title: res.title,
            isActive: false
          }
          this.listStorage.push(storage);
          this.dt.detectChanges();
          this.notifiSV.notifyCode("SYS006");
          dialogPopup.close();
        }
        else {
          this.notifiSV.notifyCode("SYS006");
        }
      });
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
