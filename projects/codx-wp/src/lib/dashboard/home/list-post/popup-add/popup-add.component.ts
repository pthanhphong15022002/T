import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnInit,
  Optional,
  Output,
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
import { Observable, of, Subscriber } from 'rxjs';

@Component({
  selector: 'app-addpost',
  templateUrl: './popup-add.component.html',
  styleUrls: ['./popup-add.component.scss'],

})
export class PopupAddPostComponent implements OnInit, AfterViewInit {

  data: any;
  message: string = '';
  user: any;
  showEmojiPicker = false;
  headerText: string = "";
  title: string = "";
  lstRecevier = [];
  isClick: boolean = false;
  shareIcon: string = "";
  shareText: string = "";
  shareControl: string = "";
  objectType: string = "";
  shareWith: string = "";
  permissions: any[] = [];
  mssgNoti:string = "";

  @ViewChild('atmCreate') atmCreate: AttachmentComponent;
  @ViewChild('atmEdit') atmEdit: AttachmentComponent;
  @ViewChild('codxFileCreated') codxFileCreated: ImageGridComponent;
  @ViewChild('codxFileEdit') codxFileEdit: ImageGridComponent;
  //Variable for control share
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
  sets = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger'
  ]
  set = 'apple';
  status: string = "";
  dialogData: any;
  dialogRef: DialogRef;
  listFileUpload:any[] = [];

  @Input() isShow: boolean;
  constructor(
    private dt: ChangeDetectorRef,
    public atSV: AttachmentService,
    private notifySvr: NotificationsService,
    private cache: CacheService,
    private dmSV: CodxDMService,
    private api: ApiHttpService,
    private callFunc: CallFuncService,
    private authStore: AuthService,
    @Optional() dd?: DialogData,
    @Optional() dialog?: DialogRef

  ) {

    this.user = authStore.userValue;
    this.dialogData = dd.data;
    this.dialogRef = dialog;
    this.headerText = this.dialogData.headerText;

  }
  ngAfterViewInit(): void {
  }

  ngOnInit() {
    if (this.dialogData.status == this.STATUS.EDIT) {
      this.dataEdit = this.dialogData.post;
      this.message = this.dataEdit.content;
      this.permissions = this.dataEdit.permissions;
      this.shareControl = this.dataEdit.shareControl;
      this.shareIcon = this.dataEdit.shareIcon;
      this.shareText = this.dataEdit.shareText;
      this.shareWith = this.dataEdit.shareName;
    }
    else
    {
      if (this.dialogData.status == this.STATUS.SHARE) {
        this.dataShare = this.dialogData.post;
        this.entityName = this.dialogData.refType;
      }
      this.getValueShare(this.SHARECONTROLS.EVERYONE);
    }
    this.cache.message('WP011').subscribe((mssg: any) => {
      this.title = Util.stringFormat(mssg.defaultName, this.user.userName);
      this.dt.detectChanges();
    });
    this.getMessageNoti("SYS009");
    this.dt.detectChanges();
  }

  getValueShare(shareControl: string, data: any[] = null) {
    let listPermission = data;
    this.cache.valueList('L1901').subscribe((vll: any) => {
      let modShare = vll.datas.find((x: any) => x.value == shareControl);
      this.shareControl = shareControl;
      this.shareIcon = modShare.icon;
      this.shareText = modShare.text;
      if (listPermission) {
        this.permissions = []
        this.shareWith = "";
        switch (this.shareControl) {
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
            listPermission.forEach((x: any) => {
              let p = new Permission();
              p.objectType = this.objectType;
              p.objectID = x.id;
              p.objectName = x.text;
              p.memberType = this.MEMBERTYPE.SHARE;
              this.permissions.push(p);
            });
            if (listPermission.length > 1) {
              this.cache.message('WP002').subscribe((mssg: any) => {
                if (mssg)
                  this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + listPermission[0].text + '</b>', listPermission.length - 1, this.shareText);
              });
            }
            else {
              this.cache.message('WP001').subscribe((mssg: any) => {
                if (mssg)
                  this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + listPermission[0].text + '</b>');
              });
            }
        }
      }
      this.dt.detectChanges();
    });
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
    if(!e) return;
    if (e.data) {
      this.message = e.data;
    } 
    else 
    {
      this.message = "";
    }
    this.dt.detectChanges();
  }

  eventApply(event: any) {
    if (!event) return;
    this.shareControl = event[0].objectType;
    this.objectType = event[0].objectType;
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
    post.objectType = this.objectType;
    post.category = this.CATEGORY.POST;
    post.approveControl = "0"; // không qua xét duyệt
    post.refType = this.entityName;
    post.permissions = this.permissions;
    post.listTag = this.tags;
    debugger;
    this.api.execSv("WP", "ERM.Business.WP", "CommentsBusiness", "PublishPostAsync", [post])
      .subscribe(async (result: any) => {
        if (result) {
          if (this.listFileUpload.length > 0) {
            this.atmCreate.objectId = result.recID;
            result.files = [...this.listFileUpload];
            debugger;
            (await this.atmCreate.saveFilesObservable()).subscribe((res: any) => {
              if (res) 
              {
                debugger;
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
  getMessageNoti(mssgCode:string){
    this.cache.message(mssgCode).subscribe((mssg:any) =>{
      if(mssg && mssg?.defaultName){
        this.mssgNoti = mssg.defaultName;
        this.dt.detectChanges();
      }
    })
  }
  async editPost() {
    if (!this.message) {
      let mssgStr = Util.stringFormat(this.mssgNoti,'Nội dung');
      this.notifySvr.notify(mssgStr);
      return;
    }
    this.dataEdit.content = this.message;
    this.dataEdit.shareControl = this.shareControl;
    this.dataEdit.shareIcon = this.shareIcon;
    this.dataEdit.shareText = this.shareText;
    this.dataEdit.shareName = this.shareWith;
    this.dataEdit.permissions = this.permissions;
    this.dataEdit.listTag = this.tags;
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
    post.listTag = this.tags;
    post.permissions = this.permissions;
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
  width = 720;
  height = window.innerHeight;
  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.dt.detectChanges();
  }
  addEmoji(event) {
    this.message += event.emoji.native;
    this.dt.detectChanges();
  }
  uploadFile() {
    this.dmSV.fileUploadList = [];
    if (this.dialogData.status == this.STATUS.EDIT) {
      this.atmEdit.uploadFile();
    }
    else {
      this.atmCreate.uploadFile();
    }
  }

  getfileCount(event: any) {
    if (event && event?.data?.length > 0) {
      debugger;
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
    // this.listFileUpload = this.listFileUpload.concat(files);
    files.map((f:any)=>{
      let isExist = this.listFileUpload.some((e:any)=>  e.fileName == f.fileName);
      if(!isExist)
      {
        this.listFileUpload.push(f);
      }
    });
    // this.listFileUpload.push(files);
    this.dt.detectChanges();
  }

  showCBB = false;
  tagWith: string = '';
  tags: any[] = [];
  lstTagUser: any[] = [];
  searchTagUser: string = "";
  saveAddUser(value: any) {
    let data = value.dataSelected;
    if (data && data.length > 0) {
      this.tags = [];
      this.lstTagUser = data;
      data.forEach((x: any) => {
        let p = new Permission();
        p.objectID = x.UserID;
        p.objectName = x.UserName;
        this.tags.push(p);
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
  tagUser() {
    this.showCBB = !this.showCBB;
  }

}
