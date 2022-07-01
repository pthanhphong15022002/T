import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { ApiHttpService, AuthService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { WP_News } from '../../../models/WP_News.model';

@Component({
  selector: 'app-popup-edit',
  templateUrl: './popup-edit.component.html',
  styleUrls: ['./popup-edit.component.scss']
})
export class PopupEditComponent implements OnInit {

  dataNew: WP_News = new WP_News();
  dataOld:any ;
  user:any;
  dialogRef: DialogRef;

  constructor(
    private api:ApiHttpService,
    private auth: AuthService,
    private dt:ChangeDetectorRef,
    private notifySvr:NotificationsService,
    @Optional() dialog?: DialogData,
    @Optional() dialogRef?: DialogRef
    ) 
  {
    this.dialogRef = dialogRef;
    this.dataOld = dialog.data
    this.dataNew = this.dataOld;
  }

  ngOnInit(): void {
    this.user = this.auth.userValue;
  }

  valueChange(value:any){
    this.dataNew.contents = value.data.value;
    this.dt.detectChanges();
  }

  clickInsertNews(){
    let lstPermission:Array<Permission> = [];
    var per1 = new Permission();
    per1.objectID = this.user.userID;
    per1.objectName = this.user.userName;
    per1.objectType = "1";
    per1.create = true;
    per1.read = true;
    per1.update = true;
    per1.share = true;
    lstPermission.push(per1);
    var per2 = new Permission();
    per2.objectType = "9";
    per2.read = true;
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'InsertNewsAsync',
        this.dataNew
      )
      .subscribe((res1) => {
        if(res1)
        {
          this.api
          .execSv(
            'WP',
            'ERM.Business.WP',
            'NewsBusiness',
            'UpdateCompanyInforAsync',
            this.dataOld.recID
          ).subscribe((res2) =>
          {
              if(res2){
                this.dataOld = this.dataNew;
                this.dialogRef.dataService.dataSelected = this.dataNew;
                this.dialogRef.close();
                this.dt.detectChanges();
              } 
              
          })
        }
      });
  }

}
