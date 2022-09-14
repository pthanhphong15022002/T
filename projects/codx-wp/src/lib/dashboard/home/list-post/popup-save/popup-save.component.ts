import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthService, CacheService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-save',
  templateUrl: './popup-save.component.html',
  styleUrls: ['./popup-save.component.scss']
})
export class PopupSavePostComponent implements OnInit {


  headerText:string;
  dialogRef:DialogRef;
  data:any;
  user:any;
  listStorage:any[] = [];
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    private auth:AuthService,
    @Optional() dd?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.user = auth.userValue;
    this.dialogRef = dialog;
    this.data = dd.data.post;
    this.headerText = dd.data.headerText;
  }

  ngOnInit(): void {
    this.getListStorage();
  }

  getListStorage(){
    this.api.execSv("WP","ERM.Business.WP","StoragesBusiness","GetListStorageByUserIDAsync")
    .subscribe((res:any[]) => {
      if(res){
        this.listStorage = res;
        this.dt.detectChanges();
      }
    });
  }


  saveObjectToStorage(){
    this.api.execSv("WP","ERM.Business.WP","StoragesBusiness","GetListStorageByUserIDAsync")
    .subscribe((res:any) => {
      if(res){

      }
    });
  }

  selectStorage(item){
    this.listStorage.map((x:any) =>{
      if(x.recID != item.recID){
        x.isActive = false;
      }
      else
      {
        x.isActive = true;
      }
    });
    this.dt.detectChanges();
  }
}
