import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { ApiHttpService, AuthService, AuthStore, CacheService, CallFuncService, CRUDService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxViewFilesComponent } from 'projects/codx-share/src/lib/components/codx-view-files/codx-view-files.component';
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
import { Observable, Observer, of } from 'rxjs';
import { json } from 'stream/consumers';


@Component({
  selector: 'wp-popup-add-post',
  templateUrl: './popup-add-post.component.html',
  styleUrls: ['./popup-add-post.component.scss']
})
export class PopupAddPostComponent implements OnInit {

  dialogRef:DialogRef = null;
  dialogData:any = null;
  user:any = null;
  headerText:string = "";
  mssgPlacehHolder:string = "";
  data:any = null;
  status: "create" | "edit" | "share" = "create"
  fileUpload:any[] = [];
  grvSetup:any = null;
  loaded:boolean = false;
  CATEGORY = {
    POST:"1",
    COMMENTS:"2",
    FEEDBACK:"3",
    SHARE:"4",
    PICTURES:"9",
    VIDEO:"10",
    FILES:"11"
  }
  MEMBERTYPE = {
    CREATED: "1",
    SHARE: "2",
    TAGS: "3"
  }
  SHARECONTROLS = {
    OWNER: "1",
    MYGROUP: "2",
    MYTEAM: "3",
    MYDEPARMENTS: "4",
    MYDIVISION: "5",
    MYCOMPANY: "6",
    EVERYONE: "9",
    OGRHIERACHY: "O",
    DEPARMENTS: "D",
    POSITIONS: "P",
    ROLES: "R",
    GROUPS: "G",
    USER: "U",
  }
  copyFormat:string = "clean";
  // emoji  
  emojiMode: 'native' | 'apple' |'facebook' | 'google' | 'twitter' = 'facebook';
  emojiPreview:boolean = false;
  emojiPerLine:number = 7;
  emojiMaxFrequentRows:number = 4;

  // popup
  showCBB:boolean = false;
  width:number = 720;
  height:number = window.innerHeight;
  @ViewChild("codxViewFiles") codxViewFiles:CodxViewFilesComponent;

  constructor(
    private api:ApiHttpService,
    private callFC:CallFuncService,
    private dt:ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private cache: CacheService,
    private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.dialogData = dialogData?.data,
    this.dialogRef = dialogRef,
    this.user = authStore.get();
  }

  ngOnInit(): void {
    this.setData();
    this.getSetGridSetUp();
  }

  // set data default
  setData(){
    if(this.dialogData){
      this.headerText = this.dialogData.headerText;
      this.status = this.dialogData.status;
      this.data = this.dialogData.data;
      if(this.status !== "edit"){
        this.data.recID = Util.uid();
        this.data.createdBy = this.user.userID;
        this.data.createdName = this.user.userName;
        this.data.shareControl = this.SHARECONTROLS.EVERYONE;
        this.data.content = "";
        if(this.status == "share"){
          // bài share
          this.data.category = this.CATEGORY.SHARE;
          this.data.refType = this.dialogData.refType;
        }
        else
        {
          // bài viết mới
          this.data.category = this.CATEGORY.POST;
          this.data.refType ="WP_Comments";
        }
      }
      // edit bài viết
      else{
        debugger
        if(Array.isArray(this.data.permission)){
          Array.from<any>(this.data.permission).forEach(x=>{
            if(x.memberType == this.MEMBERTYPE.TAGS){
              this.strPermissionTag += x.objectID;
            }
          });
        }
      }
    }
    this.getSettingValue();
    this.getMssgDefault()
  }
  // get gridViewSetup
  getSetGridSetUp(){
    this.cache.functionList("WP").subscribe((func:any) =>{
      if(func){
        this.cache.gridViewSetup(func.formName,func.gridViewName)
        .subscribe((grv:any) => {
          if(grv){
            this.grvSetup = grv;
          }
        });
      }
    });
  }
  // mssg placeholderText content
  getMssgDefault(){
    this.cache.message('WP011').subscribe((mssg: any) => {
      if(mssg?.defaultName)
      {
        this.mssgPlacehHolder = Util.stringFormat(mssg.defaultName, this.data.createdName);
      }
    });
  }

  //open control share
  openControlShare(controlShare:any){
    if(controlShare){
      this.callFC.openForm(controlShare, '', 420, window.innerHeight);
    }
  }

  // value change
  valueChange(event:any){
    this.data.content = event.data;
    this.dt.detectChanges();
  }

  // add icon
  addEmoji(event:any){
    if(!this.data.content)
      this.data.content = event.emoji.native;  
    else
      this.data.content = this.data.content + event.emoji.native; 
  }

  // click show popup gắn thẻ
  clickTagsUser(){
    this.showCBB = !this.showCBB;
  }

  // click uploadFile
  clickUploadFile(){
    this.codxViewFiles.uploadFiles();
  }

  // submit
  submit(){
    if(!this.loaded){
      switch(this.status){
        case "create":
          this.publishPost();
          break;
        case "edit":
          this.editPost();
          break;
        case "share":
          this.sharePost();
          break;
        default:
          break
      };
    }
  }

  // insert post
  insertPost(post:any){
    return this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      "PublishPostAsync",
      [post]);
  }
  
  // publich Post 
  publishPost(){
    if (!this.data.content && this.codxViewFiles.files.length == 0){
      this.notifySvr.notifyCode("SYS009",0,this.grvSetup["Comments"]["headerText"]);
      this.loaded = false;
      return;
    }
    this.loaded = true;
    this.data.category = this.CATEGORY.POST;
    this.data.approveControl = "0"; // không bật xét duyệt
    this.data.createdBy = this.user.userID;
    this.data.createdName = this.user.userName;
    this.data.createdOn = new Date();
    this.data.attachments = this.codxViewFiles.files.length;
    this.data.medias = this.codxViewFiles.medias;
    this.codxViewFiles.save()
      .subscribe((res1:boolean)=>{
        if(res1){
          this.insertPost(this.data)
          .subscribe((res2: any) => {
            if(res2){
              this.notifySvr.notifyCode('WP024');
              this.dialogRef.close(res2);
            }
            else
            {
              this.notifySvr.notifyCode('WP013');
            }
            this.loaded = false;
          });
        }
        else this.loaded = false;
      });
  }
  
  // edit post
  editPost(){
    if (!this.data.content && this.codxViewFiles.files.length == 0 && this.data.category !== this.CATEGORY.SHARE) {
      this.loaded = false;
      this.notifySvr.notifyCode("SYS009",0,this.grvSetup["Comments"]["headerText"]);
      return;
    }
    this.loaded = true;
    this.data.attachments = this.codxViewFiles.files.length;
    this.data.medias = this.codxViewFiles.medias;
    this.codxViewFiles.save()
    .subscribe((res1:boolean)=>{
      if(res1){
        this.api.execSv(
          'WP',
          'ERM.Business.WP',
          'CommentsBusiness',
          'EditPostAsync',
          [this.data])
          .subscribe((res2: any) => {
            if (res2) 
              this.notifySvr.notifyCode('WP021');
            else
              this.notifySvr.notifyCode('SYS021');
            this.loaded = false;
            this.dialogRef.close(this.data);
        });
      }
      else this.loaded = false;
    });
  }

  // share post
  sharePost(){
    this.loaded = true;
    this.data.category = this.CATEGORY.SHARE;
    this.data.approveControl = "0"; // không bật xét duyệt 
    this.data.createdBy = this.user.userID;
    this.data.createdName = this.user.userName;
    this.data.createdOn = new Date();
    this.data.attachments = this.codxViewFiles.files.length;
    this.data.medias = this.codxViewFiles.medias;
    this.codxViewFiles.save()
    .subscribe((res1:boolean)=>{
      if(res1){
        this.api.execSv(
          "WP",
          "ERM.Business.WP",
          "CommentsBusiness",
          "PublishPostAsync",
          [this.data])
          .subscribe((res2: any) =>{
            if (res2){
              this.notifySvr.notifyCode('WP020');
              this.dialogRef.close(res2);  
            }
            else
              this.notifySvr.notifyCode('WP013');
            this.loaded = false;
          });
      }
      else this.loaded = false;
    });
  }

  // chia sẻ người dùng
  addPerrmissonShares(event:any){
    if(Array.isArray(event)){
      let arrPermisison = Array.from<any>(event);
      let fisrtPermission = arrPermisison[0];
      this.data.shareControl = fisrtPermission.objectType;
      if(this.data.permissions.length == 0)
        this.data.permissions = [];
      else
        this.data.permissions = this.data.permissions.filter((e:any) => e.memberType != this.MEMBERTYPE.SHARE);
      switch (this.data.shareControl) {
        case this.SHARECONTROLS.OWNER:
          break;
        case this.SHARECONTROLS.EVERYONE:
        case this.SHARECONTROLS.MYGROUP:
        case this.SHARECONTROLS.MYTEAM:
        case this.SHARECONTROLS.MYDEPARMENTS:
        case this.SHARECONTROLS.MYDIVISION:
        case this.SHARECONTROLS.MYCOMPANY:
          let permission = new Permission();
          permission.memberType = this.MEMBERTYPE.SHARE;
          permission.objectType = fisrtPermission.objectType;
          permission.createdBy = this.user.userID,
          permission.createdOn = new Date();
          this.data.permissions.push(permission);
          this.data.shareName = "";
          break;
        case this.SHARECONTROLS.OGRHIERACHY:
        case this.SHARECONTROLS.DEPARMENTS:
        case this.SHARECONTROLS.POSITIONS:
        case this.SHARECONTROLS.ROLES:
        case this.SHARECONTROLS.GROUPS:
        case this.SHARECONTROLS.USER:
          arrPermisison.forEach(x => {
            let permission = new Permission();
            permission.memberType = this.MEMBERTYPE.SHARE;
            permission.objectType = x.objectType;
            permission.objectID = x.id;
            permission.objectName = x.text;
            permission.createdBy = this.user.userID;
            permission.createdOn = new Date();
            this.data.permissions.push(permission);
          });
          // WP001 chia sẻ 1 - WP002 chia sẻ nhiều người
          let mssgCodeShare = arrPermisison.length == 1 ? "WP001" : "WP002";
          this.cache.message(mssgCodeShare).subscribe((mssg: any) => {
            if (mssg?.customName)
            {
              if(arrPermisison.length == 1){
                // chia sẻ 1 người
                this.data.shareName = Util.stringFormat(mssg.customName, `<b>${fisrtPermission.text}</b>`);
              }
              else
              {
                // chia sẻ nhiều người
                let count = arrPermisison.length - 1;
                let type =  fisrtPermission.objectName;
                this.data.shareName = Util.stringFormat(mssg.customName,`<b>${fisrtPermission.text}</b>`, count, type);
              }
            } 
          });
          break;
        default:
          break;
      }
      this.dt.detectChanges();
    }
  }

  // gắn thẻ người dùng
  strPermissionTag:string = "";
  addPerrmissonTags(event:any){
    if(Array.isArray(event?.dataSelected)){
      let arrPermission = Array.from<any>(event.dataSelected);
      if(!this.data.permission){
        this.data.permissions = [];
      }
      else
      {
        this.data.permissions = Array.from<any>(this.data.permissions).filter(x => x.memberType !== this.MEMBERTYPE.TAGS);
      }
      this.strPermissionTag = "";
      arrPermission.forEach((x: any) => {
        let p = new Permission();
        p.memberType = this.MEMBERTYPE.TAGS;
        p.objectID = x.UserID;
        p.objectName = x.UserName;
        p.objectType = "U";
        p.createdBy = this.user.userID;
        p.createdOn = new Date();
        this.strPermissionTag += x.userID;
        this.data.permissions.push(p);
      });
      let fisrtPermission = arrPermission[0];
      // WP018 gắn thẻ 1 - WP019 gắn thẻ nhiều người
      let mssgCodeTag = arrPermission.length == 1 ? "WP018" : "WP019";
      this.cache.message(mssgCodeTag).subscribe((mssg: any) => {
        if (mssg?.customName)
        {
          if(arrPermission.length == 1){
            // gắn thẻ 1 người
            this.data.tagName = Util.stringFormat(mssg.customName, `<b>${fisrtPermission.UserName}</b>`);
          }
          else
          {
            // gắn thẻ nhiều người
            this.data.tagName = Util.stringFormat(mssg.customName,`<b>${fisrtPermission.UserName}</b>`, arrPermission.length - 1);
          }
        } 
      });
      this.dt.detectChanges();
    }
  }
  // get getSettingValue
  getSettingValue(){
    this.api.execSv(
      "SYS",
      "ERM.Business.SYS",
      "SettingValuesBusiness",
      "GetSettingValueAsync",
      ["WPParameters"])
      .subscribe((res:any) => {
        if(res){
          let _param = JSON.parse(res);
          if(_param["CopyFormat"] === "1")
            this.copyFormat = 'keepFormat';
        }
      });
  }
}
