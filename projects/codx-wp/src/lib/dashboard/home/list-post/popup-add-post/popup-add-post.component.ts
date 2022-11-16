import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { Post } from '@shared/models/post';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthService, AuthStore, CacheService, CallFuncService, CRUDService, DialogData, DialogRef, NotificationsService, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
import { WP_Comments } from 'projects/codx-wp/src/lib/models/WP_Comments.model';
import { json } from 'stream/consumers';
import { isThisTypeNode } from 'typescript';

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
  placeholderText:string = "";
  data:WP_Comments = null;
  status: "create" | "edit" | "share" = "create"
  fileUpload:any[] = [];
  mssgNoti:string = "";
  // emoji  
  showEmojiPicker:boolean = false;
  emojiMode = 'apple';
  // end emoji
  // popup
  showCBB:boolean = false;
  width:number = 720;
  height:number = window.innerHeight;
  // end popup
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
  @ViewChild("codxATM") codxATM:AttachmentComponent;
  @ViewChild("codxFile") codxFile:ImageGridComponent;
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
    this.getData();
  }

  getData(){
    if(this.dialogData)
    {
      this.headerText = this.dialogData.headerText;
      this.status = this.dialogData.status;
      this.data = this.dialogData.data;
    }
    this.cache.message('WP011').subscribe((mssg: any) => {
      if(mssg?.defaultName)
      {
        this.placeholderText = Util.stringFormat(mssg.defaultName, this.data.createdName);
        this.dt.detectChanges();
      }
    });
    this.cache.gridViewSetup("Comments","grvComments").subscribe((grd:any) => {
      if(grd){
        console.log('gridViewSetup',grd)
      }
    });
    this.cache.message("SYS009").subscribe((mssg:any) =>{
      if(mssg?.defaultName){
        this.mssgNoti = mssg.defaultName;
        this.dt.detectChanges();
      }
    })
  }

  //open control share
  openControlShare(controlShare:any){
    if(controlShare){
      this.callFC.openForm(controlShare, '', 420, window.innerHeight);
    }
  }
  // value change
  valueChange(event:any){
    if (event.data){
      this.data.content = event.data;
      this.dt.detectChanges();
    } 
  }
  // upload file 
  addFile(files: any) {
    if(files){
      if (this.fileUpload.length == 0) {
        this.fileUpload = JSON.parse(JSON.stringify(files));
      }
      else
      {
        this.fileUpload = this.fileUpload.concat(files);
      }
      if(this.fileUpload.length > 0)
      {
        let fileImages = this.fileUpload.filter(x => x.referType == "image");
        if(fileImages?.length > 0){
          this.data.images = fileImages.length;
        }
      }
      this.dt.detectChanges();
    }
  }

  // remove file 
  removeFile(file: any) {
    if(file){
      this.fileUpload = this.fileUpload.filter(x => x.fileName != file.fileName);
      this.dt.detectChanges();
    }
  }

  // select file
  getfileCount(event: any) {
    if(event)
    {
      let files = event.data;
      if(files?.length > 0){
        this.codxFile.addFiles(files);
      }
    }
  }

  // open popup emoji
  clickEmoji(){
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  // chose emoji
  addEmoji(event:any){
    this.data.content = this.data.content + event.emoji.native;
  }

  // click tag 
  clickTagsUser(){
    this.showCBB = !this.showCBB;
  }

  // clikc uploadFile
  clickUploadFile(){
    this.codxATM.uploadFile();
  }

  // submit
  submit(){
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
    }
  }

  // create Post 
  publishPost(){
    if (!this.data.content && this.fileUpload.length == 0) {
      let mssgStr = Util.stringFormat(this.mssgNoti,'Nội dung');
      this.notifySvr.notify(mssgStr);
      return;
    }
    this.data.category = "1" // post;
    this.data.approveControl = "0"; 
    this.data.createdBy = this.user.userID;
    this.data.createdName = this.user.userName;
    this.data.createdOn = new Date();
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      "PublishPostAsync",
      [this.data])
      .subscribe(async (res1: any) => {
        if (res1) {
          if (this.fileUpload.length > 0) {
            this.codxATM.objectId = res1.recID;
            this.codxATM.fileUploadList = this.fileUpload;
            (await this.codxATM.saveFilesObservable()).subscribe((res2: any) => {
              if (res2) 
              {
                let files:any[] = [];
                if(Array.isArray(res2)){
                  res2.forEach(element => {
                    files.push(element.data)
                  });;
                }
                else{
                  files.push(res2.data);
                }
                res1.files = JSON.parse(JSON.stringify(files));
                console.log(res1.files);

                this.dialogRef.close(res1);
              }
              else 
              {
                this.notifySvr.notifyCode('WP013');
              }
            });
          }
          else 
          {
            this.dialogRef.close(res1);
          }
        }
        else
        {
          this.notifySvr.notifyCode('WP013');
        }
      });
  }
  // edit post
  editPost(){
    debugger
    if (!this.data.content && this.fileUpload.length == 0) {
      let mssgStr = Util.stringFormat(this.mssgNoti,'Nội dung');
      this.notifySvr.notify(mssgStr);
      return;
    }
    this.api.execSv<any>(
      'WP',
      'ERM.Business.WP',
      'CommentsBusiness',
      'EditPostAsync',
      [this.data])
      .subscribe(async (res: any) => {
        if (res) 
        {
          if(this.fileUpload.length > 0) {
            this.codxATM.objectId = this.data.recID;
            this.codxATM.fileUploadList = this.fileUpload;
            (await this.codxATM.saveFilesObservable()).subscribe();
          }
          if (this.codxFile.filesDelete.length > 0) 
          {
            let filesDeleted = this.codxFile.filesDelete;
            filesDeleted.forEach((f: any) => {
              this.deleteFile(f.recID, true);
            });
          }
          this.data = res;
          this.data.files = this.codxFile.files;
          this.notifySvr.notifyCode('WP021');
          this.dialogRef.close(this.data);
        }
    });
  }
  // share post
  sharePost(){
    if (!this.data.content && this.fileUpload.length == 0) {
      let mssgStr = Util.stringFormat('Nội dung');
      this.notifySvr.notify(mssgStr);
      return;
    }
    this.data.category = "4" // share;
    this.data.approveControl = "0"; 
    this.data.createdBy = this.user.userID;
    this.data.createdName = this.user.userName;
    this.data.createdOn = new Date();
    this.api.execSv(
      "WP",
      "ERM.Business.WP",
      "CommentsBusiness",
      "PublishPostAsync",
      [this.data])
      .subscribe(async (res1: any) => {
        if (res1) {
          if (this.fileUpload.length > 0) {
            this.codxATM.objectId = res1.recID;
            this.codxATM.fileUploadList = this.fileUpload;
            (await this.codxATM.saveFilesObservable()).subscribe((res2: any) => {
              if (res2) 
              {
                let files:any[] = [];
                if(Array.isArray(res2)){
                  res2.forEach(element => {
                    files.push(element.data)
                  });;
                }
                else
                {
                  files.push(res2.data);
                }
                res1.files = JSON.parse(JSON.stringify(files));
                this.dialogRef.close(res1);
              }
              else 
              {
                this.notifySvr.notifyCode('WP013');
              }
            });
          }
          else 
          {
            this.dialogRef.close(res1);
          }
        }
        else
        {
          this.notifySvr.notifyCode('WP013');
        }
      });
  }
  // add permission share
  addPerrmissonShares(event:any){
    if(event?.length > 0)
    {
      let data = event;
      this.data.shareControl = data[0].objectType;
      if(this.data.permissions == null || this.data.permissions.length == 0)
      {
        this.data.permissions = [];
      }
      else
      {
        let permissions = this.data.permissions.filter((e:any) => e.memberType != "2");
        if(permissions?.length == 0){
          this.data.permissions = [];
        }
        else
        {
          this.data.permissions = JSON.parse(JSON.stringify(permissions));
        }
      }
      switch (this.data.shareControl) {
        case this.SHARECONTROLS.OWNER:
        case this.SHARECONTROLS.EVERYONE:
        case this.SHARECONTROLS.MYGROUP:
        case this.SHARECONTROLS.MYTEAM:
        case this.SHARECONTROLS.MYDEPARMENTS:
        case this.SHARECONTROLS.MYDIVISION:
        case this.SHARECONTROLS.MYCOMPANY:
          let permission = new Permission();
            permission.memberType = this.MEMBERTYPE.SHARE;
            permission.objectType = data[0].objectType;
            permission.createdBy = this.user.userID,
            permission.createdOn = new Date();
            this.data.permissions.push(permission);
          break;
        case this.SHARECONTROLS.OGRHIERACHY:
        case this.SHARECONTROLS.DEPARMENTS:
        case this.SHARECONTROLS.POSITIONS:
        case this.SHARECONTROLS.ROLES:
        case this.SHARECONTROLS.GROUPS:
        case this.SHARECONTROLS.USER:
          data.forEach((x: any) => {
            let p = new Permission();
            p.memberType = this.MEMBERTYPE.SHARE;
            p.objectType = x.objectType;
            p.objectID = x.id;
            p.objectName = x.text;
            p.createdBy = this.user.userID;
            p.createdOn = new Date();
            this.data.permissions.push(p);
          });
          let mssgCode = data.length > 1 ? "WP002" : "WP001";
          this.cache.message(mssgCode).subscribe((mssg: any) => {
            if (mssg?.defaultName)
              if(mssgCode == "WP002"){
                this.data.shareName = Util.stringFormat(mssg.defaultName, '<b>' + data[0].text + '</b>', data.length - 1, data[data.length - 1].objectName);
              }
              else
              {
                this.data.shareName = Util.stringFormat(mssg.defaultName, '<b>' + data[0].text + '</b>');
              }
          });  
          break;
        default:
          break;
      }
      this.dt.detectChanges();
    }
  }

  // add permission tag
  addPerrmissonTags(event:any){
    if(event?.dataSelected?.length > 0){
      let data = event.dataSelected;
      if(this.data.permissions == null || this.data.permissions.length == 0)
      {
        this.data.permissions = [];
      }
      else
      {
        let permissions = this.data.permissions.filter((e:any) => e.memberType != "3");
        if(permissions?.length == 0){
          this.data.permissions = [];
        }
        else{
          this.data.permissions = JSON.parse(JSON.stringify(permissions));
        }
      }
      data.forEach((x: any) => {
        let p = new Permission();
        p.memberType = this.MEMBERTYPE.TAGS;
        p.objectID = x.UserID;
        p.objectName = x.UserName;
        p.objectType = "U";
        p.createdBy = this.user.userID;
        p.createdOn = new Date();
        this.data.permissions.push(p);
      });
      let mssgCode = data.length > 1 ? "WP019" : "WP018";
      this.cache.message(mssgCode).subscribe((mssg: any) => {
        if (mssg?.defaultName)
          if (mssgCode == "WP019") {
            this.data.tagName = Util.stringFormat(mssg.defaultName, '<b>' + data[data.length - 1].UserName + '</b>', data.length - 1);
          }  
          else
          {
            this.data.tagName = Util.stringFormat(mssg.defaultName, '<b>' + data[0].UserName + '</b>');
          }
        });
     }
     this.dt.detectChanges();
  }

  // delete file
  deleteFile(fileID: string, deleted: boolean) {
    if (fileID) {
      this.api.execSv(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "DeleteFileAsync",
        [fileID, deleted]).subscribe();
    }
  }
}
