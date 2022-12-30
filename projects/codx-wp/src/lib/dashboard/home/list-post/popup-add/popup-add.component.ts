import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { Post } from '@shared/models/post';
import 'lodash';
import { ApiHttpService, AuthService, AuthStore, CacheService, CallFuncService, CRUDService, DialogData, DialogModel, DialogRef, NotificationsService, UploadFile, Util } from 'codx-core';
import { Permission } from '@shared/models/file.model';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-addpost',
  templateUrl: './popup-add.component.html',
  styleUrls: ['./popup-add.component.scss'],

})
export class PopupAddPostComponents implements OnInit, AfterViewInit {

  message: string = '';
  user: any;
  showEmojiPicker = false;
  headerText: string = "";
  title: string = "";
  lstRecevier = [];
  isClick: boolean = false;
  shareIcon: string = "";
  shareText: string = "";
  shareControl: string = "9";
  objectType: string = "";
  shareName: string = "";
  permissions: any[] = [];
  mssgNoti:string = "";
  showCBB = false;
  tagWith: string = '';
  tags: any[] = [];
  lstTagUser: any[] = [];
  
  CATEGORY = {
    POST: "1",
    COMMENTS: "2",
    FEEDBACK: "3",
    SHARE: "4",
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
  MEMBERTYPE = {
    CREATED: "1",
    SHARE: "2",
    TAGS: "3"
  }
  STATUS = {
    CREATED: "create",
    EDIT: "edit",
    SHARE: "share"
  }
  entityName = 'WP_Comments';
  objectName = '';
  dataShare: Post = null;
  dataEdit: Post = null;
  data:Post = null;
  emojiMode = 'apple';
  status: string = "";
  dialogData: any;
  dialogRef: DialogRef;
  listFileUpload:any[] = [];
  width = 720;
  height = window.innerHeight;
  grvSetup:any = null;
  mssgShareOne:string = "";
  mssgShareMore:string = "";
  mssgTagOne:string = "";
  mssgTagMore:string = "";
  @Input() isShow: boolean;
  @ViewChild('atmCreate') atmCreate: AttachmentComponent;
  @ViewChild('atmEdit') atmEdit: AttachmentComponent;
  @ViewChild('codxFileCreated') codxFileCreated: ImageGridComponent;
  @ViewChild('codxFileEdit') codxFileEdit: ImageGridComponent;
  constructor(
    private dt: ChangeDetectorRef,
    public atSV: AttachmentService,
    private notifySvr: NotificationsService,
    private cache: CacheService,
    private dmSV: CodxDMService,
    private api: ApiHttpService,
    private callFunc: CallFuncService,
    private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.user = authStore.get();
    this.dialogData = dialogData.data;
    this.dialogRef = dialogRef;
    this.headerText = this.dialogData.headerText;
  }
  
  ngOnInit() {
    if (this.dialogData.status == this.STATUS.EDIT) {
      this.data = this.dialogData.post;
      this.message = this.dataEdit.content;
      this.permissions = this.dataEdit.permissions;
      this.shareControl = this.dataEdit.shareControl;
    }
    else
    {
      this.data = new Post();
      if (this.dialogData.status == this.STATUS.SHARE) {
        this.dataShare = this.dialogData.post;
        this.entityName = this.dialogData.refType;
      }
      this.getValueShare(this.SHARECONTROLS.EVERYONE);
    }
    this.getMssgDefault();
  }
  ngAfterViewInit(): void {
  }
  getGridViewSetup(funcID){
    if(funcID){
      this.cache.functionList(funcID).subscribe((func) => {
        if(func){
          // get grv set up
          console.log(func);
          let formName = func.formName;
          let grvName = func.gridViewName;
          this.cache.gridViewSetup(formName,grvName).subscribe((grv) => {
            if(grv){
              console.log(grv);
              this.grvSetup = JSON.stringify(grv);
            }
          });
        }
      });
    }
  }
  getMssgDefault(){
    // mssg share one
    this.cache.message('WP001').subscribe((mssg: any) => {
      if (mssg?.customName)
      {
        this.mssgShareOne = mssg.customName;
      } 
    });
    // mssg share more
    this.cache.message('WP002').subscribe((mssg: any) => {
      if (mssg?.customName)
      {
        this.mssgTagOne = mssg.customName;
      } 
    });
    // mssg tag one
    this.cache.message('WP018').subscribe((mssg: any) => {
      if (mssg?.customName)
      {
        this.mssgTagMore = mssg.customName;
      } 
    });
    // mssg tag more
    this.cache.message('WP019').subscribe((mssg: any) => {
      if (mssg?.customName)
      {
        this.mssgShareMore = mssg.customName;
      } 
    });
    // mssg default content
    this.cache.message('WP011').subscribe((mssg: any) => {
      if(mssg?.customName)
      {
        if(this.user?.userName){
          this.title = Util.stringFormat(mssg.customName, this.user.userName);
        }
      }
    });
    
    this.cache.message("SYS009").subscribe((mssg:any) =>{
      if(mssg?.defaultName){
        this.mssgNoti = mssg.defaultName;
      }
    })
  }
  
  click() {
    switch (this.dialogData.status) {
      case this.STATUS.EDIT:
        this.editPost();
        break;
      case this.STATUS.SHARE:
        this.sharePost();
        break;
      default:
        this.publishPost();
        break;
    }
  }

  valueChange(e: any) {
    if (e?.data) 
    {
      this.message = e.data;
    } 
    else 
    {
      this.message = "";
    }
    this.dt.detectChanges();
  }
  getValueShare(shareControl: string, permissions: any[] = null) {
    
    switch (shareControl) {
      case this.SHARECONTROLS.OWNER:
      case this.SHARECONTROLS.EVERYONE:
      case this.SHARECONTROLS.MYGROUP:
      case this.SHARECONTROLS.MYTEAM:
      case this.SHARECONTROLS.MYDEPARMENTS:
      case this.SHARECONTROLS.MYDIVISION:
      case this.SHARECONTROLS.MYCOMPANY:
        break;
      case this.SHARECONTROLS.OGRHIERACHY:
      case this.SHARECONTROLS.DEPARMENTS:
      case this.SHARECONTROLS.POSITIONS:
      case this.SHARECONTROLS.ROLES:
      case this.SHARECONTROLS.GROUPS:
      default:
        if(Array.isArray(permissions) && permissions.length > 0)
        {
          if(this.data.permissions.length == 0){
            this.data.permissions = [];
          }
          this.data.shareName = "";
          permissions.forEach((x: any) => {
            let p = new Permission();
            p.objectType = x.objectType;
            p.objectID = x.id;
            p.objectName = x.text;
            p.memberType = this.MEMBERTYPE.SHARE;
            this.data.permissions.push(p);
          });
          let _permisison = permissions[0];
          if (permissions.length > 1) {
            this.cache.message('WP002').subscribe((mssg: any) => {
              if (mssg)
              this.data.shareName = Util.stringFormat(mssg.defaultName, '<b>' + _permisison.text + '</b>', permissions.length - 1, _permisison.objectName);
            });
          }
          else {
            this.cache.message('WP001').subscribe((mssg: any) => {
              if (mssg)
              this.data.shareName = Util.stringFormat(mssg.defaultName, '<b>' + _permisison.text + '</b>');
            });
          }
        }
    }
    this.dt.detectChanges();
  }
  addPerrmisson(event: any) {
    if (!event) return;
    this.shareControl = event[0].objectType;
    this.getValueShare(this.shareControl, event);
  }

  publishPost() {
    if (!this.message && this.listFileUpload.length <= 0) {
      let mssgStr = Util.stringFormat(this.mssgNoti,'Nội dung');
      this.notifySvr.notify(mssgStr);
      return;
    }
    var post = new Post();
    post.content = this.message;
    post.shareControl = this.shareControl;
    post.category = this.CATEGORY.POST;
    post.approveControl = "0";
    post.refType = this.entityName;
    post.permissions = this.permissions;
    post.createdBy = this.user.userID;
    post.createdName = this.user.userName;
    post.createdOn = new Date();
    this.api.execSv("WP", "ERM.Business.WP", "CommentsBusiness", "PublishPostAsync", [post])
      .subscribe(async (result: any) => {
        if (result) {
          if (this.listFileUpload.length > 0) {
            this.atmCreate.objectId = result.recID;
            this.listFileUpload.map((e: any) => {
              if (e.mimeType.indexOf('image') >= 0) {
                e.referType = "image";
              } else if (e.mimeType.indexOf('video') >= 0) {
                e.referType = "video";
              }
            })
            result.files = [...this.listFileUpload];
            this.atmCreate.fileUploadList = this.listFileUpload;
            (await this.atmCreate.saveFilesObservable()).subscribe((res: any) => {
              if (res) 
              {
                if(this.dialogRef?.dataService)
                {
                  this.dialogRef.dataService.add(result, 0).subscribe();
                }
                this.notifySvr.notifyCode('WP024');
                this.dialogRef.close();
              }
              else 
              {
                this.notifySvr.notifyCode('WP013');
              }
            });
          }
          else 
          {
            if(this.dialogRef?.dataService)
            {
              this.dialogRef.dataService.add(result, 0).subscribe();
            }
            this.notifySvr.notifyCode('WP024');
            this.dialogRef.close();
          }
        }
        else
        {
          this.notifySvr.notifyCode('WP013');
        }
      });
  }
  
  async editPost() {
    if (!this.message) {
      let mssgStr = Util.stringFormat(this.mssgNoti,'Nội dung');
      this.notifySvr.notify(mssgStr);
      return;
    }
    this.dataEdit.content = this.message;
    this.dataEdit.shareControl = this.shareControl;
    this.dataEdit.permissions = this.permissions;
    if (this.listFileUpload.length > 0) {
      this.atmEdit.objectId = this.dataEdit.recID;
      this.dmSV.fileUploadList = this.listFileUpload;
      (await this.atmEdit.saveFilesObservable()).subscribe();
    }
    if (this.codxFileEdit.filesDelete.length > 0) {
      let filesDeleted = this.codxFileEdit.filesDelete;
      filesDeleted.forEach((f: any) => {
        this.deleteFile(f.recID, true);
      });
    }
    this.api.execSv<any>(
      'WP',
      'ERM.Business.WP',
      'CommentsBusiness',
      'EditPostAsync',
      [this.dataEdit]
    ).subscribe((res: any) => {
      if (res) {
        this.dataEdit = res;
        this.dataEdit.files = this.codxFileEdit.files;
        (this.dialogRef.dataService as CRUDService).update(this.dataEdit).subscribe();
        this.notifySvr.notifyCode('WP021');
        this.dialogRef.close(this.dataEdit);
      }
    });

  }
  sharePost() {
    if (!this.message && this.listFileUpload.length <= 0) {
      let mssgStr = Util.stringFormat(this.mssgNoti,'Nội dung');
      this.notifySvr.notify(mssgStr);
      return;
    }
    let post = new Post();
    post.content = this.message;
    post.shareControl = this.shareControl;
    post.category = this.CATEGORY.SHARE;
    post.approveControl = "0";
    post.refID = this.dataShare.recID;
    post.refType = this.entityName;
    post.shares = this.dataShare;
    post.permissions = this.permissions;
    post.createdBy = this.user.userID;
    post.createdName = this.user.userName;
    post.createdOn = new Date();
    this.api.execSv("WP", "ERM.Business.WP", "CommentsBusiness", "PublishPostAsync", [post])
      .subscribe(async (result: any) => {
        if (result) {
          if (this.listFileUpload.length > 0) {
            this.atmCreate.objectId = result.recID;
            this.dmSV.fileUploadList = [...this.listFileUpload];
            result.files = [...this.listFileUpload];
            (await this.atmCreate.saveFilesObservable()).subscribe((res: any) => {
              if (res) {
                if(this.dialogRef?.dataService){
                  this.dialogRef.dataService.add(result, 0).subscribe();
                }
                this.notifySvr.notifyCode('WP020');
                this.dialogRef.close();
              }
              else 
              {
                this.notifySvr.notifyCode('WP013');
                this.dialogRef.close();
              }
            });
          }
          else {
            if(this.dialogRef?.dataService)
            {
              this.dialogRef.dataService.add(result, 0).subscribe();
            }
            this.notifySvr.notifyCode('WP020');
            this.dialogRef.close();
          }
        }
        else
        {
          this.notifySvr.notifyCode('WP013');
          this.dialogRef.close();
        }
      });
  }
  
  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }

  clickEmoji() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.dt.detectChanges();
  }
  addEmoji(event) {
    this.message += event.emoji.native;
    this.dt.detectChanges();
  }
  clickUploadFile() {
    if (this.dialogData.status == this.STATUS.EDIT) {
      this.atmEdit.uploadFile();
    }
    else {
      this.atmCreate.uploadFile();
    }
  }
  getfileCount(event: any) {
    if (event && event?.data?.length > 0) {
      if (this.dialogData.status == this.STATUS.EDIT) {
        this.codxFileEdit.addFiles(event.data);
      }
      else {
        this.codxFileCreated.addFiles(event.data);
      }
    }
    this.dt.detectChanges();
  }
  removeFile(file: any) {
    switch (this.dialogData.status) {
      case this.STATUS.EDIT:
        let fileEdit = this.listFileUpload.filter((f: any) => { return f.fileName == file.fileName });
        this.dataEdit.files = fileEdit;
        break;
      default:
        let fileAdd = this.listFileUpload.filter((f: any) => { return f.fileName != file.fileName });
        this.listFileUpload = fileAdd;
    }
    this.dt.detectChanges();
  }
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
  deleteFiles(files: any[]): Observable<Boolean> {
    let isSuccess = true;
    files.forEach((f: any) => {
      if (f) {
        this.api.execSv(
          "DM",
          "ERM.Business.DM",
          "FileBussiness",
          "DeleteFileAsync",
          [f.recID, true]).subscribe((res: boolean) => {
            if (!res) {
              isSuccess = false;
            }
          });
      }
    });
    return of(isSuccess);
  }
  addFile(files: any) {
    if(!files)return;
    if (this.listFileUpload.length == 0) {
      this.listFileUpload = [];
    }
    files.map((f:any)=>{
      let isExist = this.listFileUpload.some((e:any)=>  e.fileName == f.fileName);
      if(!isExist)
      {
        this.listFileUpload.push(f);
      }
    });
    this.dt.detectChanges();
  }
  clickTagsUser() {
    this.showCBB = !this.showCBB;
  }
  addTagsUser(value: any) {
    let data = value.dataSelected;
    if (data && data.length > 0) {
      if(this.permissions.length == 0){
        this.permissions = [];
      }
      this.lstTagUser = data;
      data.forEach((x: any) => {
        let p = new Permission();
        p.objectType = "U";
        p.objectID = x.UserID;
        p.objectName = x.UserName;
        p.memberType = this.MEMBERTYPE.TAGS
        this.permissions.push(p);
      });
      if (data.length > 1) {
        this.cache.message('WP019').subscribe((mssg: any) => {
          if (mssg)
            this.tagWith = Util.stringFormat(mssg.defaultName, '<b>' + data[0].UserName + '</b>', data.length - 1);
        });
      }
      else {
        this.cache.message('WP018').subscribe((mssg: any) => {
          if (mssg)
            this.tagWith = Util.stringFormat(mssg.defaultName, '<b>' + data[0].UserName + '</b>');
        });
      }
    }
    this.showCBB = !this.showCBB;
    this.dt.detectChanges();
  }
}
