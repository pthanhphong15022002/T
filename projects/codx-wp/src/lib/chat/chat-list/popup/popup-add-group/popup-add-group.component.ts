import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ApiHttpService, AuthStore, DataRequest, DialogData, DialogRef, ImageViewerComponent, NotificationsService } from 'codx-core';
import { WP_Groups } from 'projects/codx-wp/src/lib/models/WP_Groups.model';
import { WP_Members } from 'projects/codx-wp/src/lib/models/WP_Members.model';

@Component({
  selector: 'wp-popup-add-group',
  templateUrl: './popup-add-group.component.html',
  styleUrls: ['./popup-add-group.component.css']
})
export class PopupAddGroupComponent implements OnInit {

  dialogData:any = null;
  dialogRef:any = null;
  gridViewSetUp:any = null;
  user:any = null;
  headerText:string = "";
  group:WP_Groups = new WP_Groups();
  gridModel:DataRequest = new DataRequest();
  listUser:any[] = [];
  @ViewChild("codxImg") codxImg:ImageViewerComponent;
  constructor(
    private api:ApiHttpService,
    private notifiSV:NotificationsService,
    private dt:ChangeDetectorRef,
    private auth: AuthStore,
    @Optional() dialogData?:DialogData,
    @Optional() dialogRef?:DialogRef,
  )
  {
    this.dialogData = dialogData.data;
    this.dialogRef = dialogRef;
    this.user = this.auth.get();
  }

  ngOnInit(): void {
    this.setData();
  }

  setData(){
    if(this.dialogData)
    {
      this.headerText = this.dialogData.headerText;
      this.gridViewSetUp = this.dialogData.gridViewSetUp;
      this.gridModel.funcID = this.dialogRef.formModel.funcID;
      this.gridModel.comboboxName = "Users";
      this.gridModel.entityName = "AD_Users";
      this.gridModel.pageLoading = true;
      this.gridModel.page = 1;
      this.loadDataCbbAsync(this.gridModel);
    }
  }

  loadDataCbbAsync(gridModel:any){
    if(gridModel){
      this.api.execSv("SYS","ERM.Business.CM","DataBusiness","LoadDataCbxAsync",[gridModel])
      .subscribe((res:any[]) => 
      {
        if(res.length > 0)
        {
          let arrUser = JSON.parse(res[0]);
          this.listUser = this.listUser.concat(arrUser);
          console.log(this.listUser);
          this.dt.detectChanges();
        }
      });
    }
  }
  // value change
  valueChange(event)
  {
    if(event)
    {
      this.group.groupName = event.data;
      this.dt.detectChanges();
    }
  }

  // insert group
  insertGroup(){
    
    if(this.user)
    {
      let members:Array<WP_Members> = new Array<WP_Members>();
      let member1:WP_Members = new WP_Members();
      member1.userID = "ADMIN";
      member1.userName = "ADMinistrator"
      member1.menberType = "1";
      member1.createdBy = "ADMIN";
      let member2:WP_Members = new WP_Members();
      member2.userID = "TTLOC";
      member2.userName = "Trần Tấn Lộc"
      member2.menberType = "2";
      member2.createdBy = "ADMIN";
      members.push(member1);
      members.push(member2);
      this.group.members = members;
      this.group.createdBy = this.user.userID;
      this.api.execSv("WP","ERM.Business.WP","GroupBusiness","InsertGroupAsync",[this.group])
      .subscribe((res:any[]) =>{
        if(Array.isArray(res) && res[0])
        {
          let data = res[1];
          if(data.groupType === "2"){
            this.codxImg.updateFileDirectReload(this.group.groupID).subscribe();
          }
          this.dialogRef.close(data);
        }
        else{
          this.dialogRef.close();
          this.notifiSV.notify("Thêm không thành công");
        }
      });
    }
    
  }
}
