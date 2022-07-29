import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { ApiHttpService, AuthService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { WP_News } from '../../../models/WP_News.model';

@Component({
  selector: 'app-popup-edit',
  templateUrl: './popup-edit.component.html',
  styleUrls: ['./popup-edit.component.scss']
})
export class PopupEditComponent implements OnInit {

  dataNew: WP_News = new WP_News();
  dateStart: Date;
  dateEnd: Date;
  subContent: string;
  isVideo = true;
  newsType: any;
  dataOld:any ;
  user:any;
  dialogRef: DialogRef;
  formGroup: FormGroup;
  dialogData:any;
  startDate: Date;
  endDate: Date;
  tagName = "";
  objectType = "";
  shareControl:string =  "";
  userRecevier: any;
  recevierID = "";
  recevierName = "";
  lstRecevier = [];
  dataEdit:any;
  isUpload:boolean = false;
  fileUpload:any[] = [];
  fileImage:any[] = [];
  fileVideo:any[] = [];
  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
  }
  SHARECONTROLS = {
    OWNER: "1",
    MYGROUP: "2",
    MYTEAM: "3",
    MYDEPARMENTS:"4",
    MYDIVISION:"5",
    MYCOMPANY: "6",
    ADMINISTRATOR: "7",
    EVERYONE: "9",
    OGRHIERACHY: "O",
    DEPARMENTS: "D",
    POSITIONS: "P",
    ROLES: "R",
    GROUPS: "G",
    USER: "U",
  }
  MEMPERTYPE ={
    CREATED: "1",
    SHARE: "2",
    TAGS: "3"
  }



  constructor(
    private api:ApiHttpService,
    private auth: AuthService,
    private dt:ChangeDetectorRef,
    private callFunc:CallFuncService,
    private notifySvr:NotificationsService,
    private dmSV:CodxDMService,
    @Optional() dialog?: DialogData,
    @Optional() dialogRef?: DialogRef
    ) 
  {
    this.dialogRef = dialogRef;
    this.dataOld = dialog.data
    this.dataNew.contents = this.dataOld.contents;
    this.user = this.auth.userValue;
    this.dt.detectChanges();
  }

  ngOnInit(): void {

  }

  valueChange(event: any) {
    this.dataNew.contents = event.data;
    this.dt.detectChanges();
  }

  clickInsertNews(){
    let lstPermission:any[] = [];
    let myPermission = new Permission();
    myPermission.objectID = this.user.userID;
    myPermission.objectName = this.user.userName;
    myPermission.objectType = this.SHARECONTROLS.OWNER;
    myPermission.create = true;
    myPermission.read = true;
    myPermission.update = true;
    myPermission.createdBy = this.user.userID;
    myPermission.createdOn = new Date();
    let adminPermission = new Permission();
    adminPermission.objectType = this.SHARECONTROLS.ADMINISTRATOR;
    adminPermission.read = true;
    adminPermission.isActive = true;
    adminPermission.update = true;
    adminPermission.createdBy = this.user.userID;
    adminPermission.createdOn = new Date();
    var permisson = new Permission();
    permisson.objectType = this.SHARECONTROLS.EVERYONE;
    permisson.read = true;
    permisson.createdBy = this.user.userID;
    permisson.createdOn = new Date();
    lstPermission.push(myPermission);
    lstPermission.push(adminPermission);
    lstPermission.push(permisson);
    this.dataNew.shareControl = this.SHARECONTROLS.EVERYONE;
    this.dataNew.approveControl = "1";
    this.dataNew.status = "2";
    this.dataNew.approveStatus = "5";
    this.dataNew.permissions = lstPermission;
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'InsertCompanyinfoAsync',
        [this.dataNew,this.dataOld.recID]
      )
      .subscribe((res) => {
        if(res)
        {
          this.dataOld = res;
          this.dialogRef.close();
          this.dt.detectChanges();
          this.notifySvr.notifyCode('E0026');
        }
      });
  }

  eventApply(event:any){
    var data = event[0];
    var objectType = data.objectType;
    if(objectType && !isNaN(Number(objectType))){
      this.lstRecevier = data.data;
      this.shareControl = objectType;
    }
    else
    {
      this.objectType = data.objectType;
      this.lstRecevier = data.dataSelected;
      this.shareControl = objectType;
      this.userRecevier = this.lstRecevier[0];
      switch(objectType){
        case 'U':
          this.recevierID = this.userRecevier.UserID;
          this.recevierName = this.userRecevier.UserName;
          break;
        case 'D':
          this.recevierID = this.userRecevier.OrgUnitID;
          this.recevierName = this.userRecevier.OrgUnitName;
          break;
        case 'P':
          this.recevierID = this.userRecevier.PositionID;
          this.recevierName = this.userRecevier.PositionName;
          break;
        case 'G':
          this.recevierID = this.userRecevier.UserID;
          this.recevierName = this.userRecevier.UserName;
          break;
        case 'R':
          this.recevierID = this.userRecevier.RoleID;
          this.recevierName = this.userRecevier.RoleName;
          break;
      }
      
    }
    this.dt.detectChanges();
  }


}
