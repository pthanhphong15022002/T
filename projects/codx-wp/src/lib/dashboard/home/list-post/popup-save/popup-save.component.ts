import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, AuthService, CacheService, CallFuncService, CodxListviewComponent, CRUDService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
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
  data:any;
  user:any;
  title:string = "";
  itemSelected: any = null;
  loaded:boolean = true;
  mssgNoData:string = "";
  loading:boolean = false;
  @ViewChild("tmpPopupAdd") popupBody: TemplateRef<any>;
  @ViewChild("listview") codxListView: CodxListviewComponent;

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
    // this.getListStorage();
    this.cache.message("SYS010")
    .subscribe((mssg:any) => {
      if(mssg){
        this.mssgNoData = mssg.defaultName;
      }
    });
  }
  //save to storage
  saveToStorage() {
    if(!this.loading && this.itemSelected?.recID && this.data?.recID){
      this.loading = true;
        this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "StoragesBusiness",
        "SaveStorageAsync",
        [this.itemSelected.recID, this.data.recID])
        .subscribe((res:any) => {
          this.dialogRef.close();
          this.loading = false;
        });
    }
  }
  //select item
  selectedItem(event:any){
    event.data.isActive = true;
    this.itemSelected = JSON.parse(JSON.stringify(event.data));
    this.dt.detectChanges();
  }
  //create storage

  createdStorage(dialogPopup: DialogRef) {
    if(!this.loading){
      if (this.title.trim() == "") {
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
        let data = {
          recID: Util.uid(),
          title:this.title,
          storageType:'WP_Comments'
        }
        this.api.execSv(
          "WP",
          "ERM.Business.WP", 
          "StoragesBusiness", 
          "InsertAsync", 
          [data])
          .subscribe((res: any) => {
            if (res){
              (this.codxListView.dataService as CRUDService).add(res).subscribe();
              this.itemSelected = JSON.parse(JSON.stringify(res));
              this.dt.detectChanges();
            }
            this.loading = false;
            this.title = "";
            dialogPopup.close();
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
    this.title = event.data;
  }
}
