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

  // default owner
  shareIcon: string = "";
  shareText: string = "";
  shareControl: string = "";
  objectType: string = "";
  shareWith: string = "";
  permissions: any[] = [];
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
    PICTURES: "9",
    VIDEO: "10",
    FILE: "1"
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
  listFileUpload: any[] = [];

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
    this.cache.message('WP011').subscribe((mssg: any) => {
      this.title = Util.stringFormat(mssg.defaultName, this.user.userName);
      this.dt.detectChanges();
    });
    if (this.dialogData.status == this.STATUS.EDIT) {
      this.dataEdit = this.dialogData.post;
      this.message = this.dataEdit.content;
      this.permissions = this.dataEdit.permissions;
      this.shareControl = this.dataEdit.shareControl;
      this.shareIcon = this.dataEdit.shareIcon;
      this.shareText = this.dataEdit.shareText;
      this.shareWith = this.dataEdit.shareName;
    }
    else {
      if (this.dialogData.status == this.STATUS.SHARE) {
        this.dataShare = this.dialogData.post;
      }
      this.getValueShare(this.SHARECONTROLS.EVERYONE);
    }
    this.dt.detectChanges();
  }

  getValueShare(shareControl: string, data: any[] = null) {
    this.permissions = [];
    let listPermission = data;
    this.cache.valueList('L1901').subscribe((vll: any) => {
      let modShare = vll.datas.find((x: any) => x.value == shareControl);
      this.shareControl = shareControl;
      this.shareIcon = modShare.icon;
      this.shareText = modShare.text;
      if (listPermission) {
        switch (this.shareControl) {
          case this.SHARECONTROLS.OWNER:
          case this.SHARECONTROLS.EVERYONE:
          case this.SHARECONTROLS.MYGROUP:
          case this.SHARECONTROLS.MYTEAM:
          case this.SHARECONTROLS.MYDEPARMENTS:
          case this.SHARECONTROLS.MYDIVISION:
          case this.SHARECONTROLS.MYCOMPANY:
            this.shareWith = "";
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
    if (e.data) {
      this.message = e.data;
    } else {
      this.message = "";
    }
    this.dt.detectChanges();
  }

  eventApply(event: any) {
    if (!event) {
      return;
    }
    this.shareControl = event[0].objectType;
    this.objectType = event[0].objectType;
    this.getValueShare(this.shareControl, event);
  }

  publishPost() {
    if (!this.message && this.listFileUpload.length <= 0) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    var post = new Post();
    post.content = this.message;
    post.shareControl = this.shareControl;
    post.objectType = this.objectType;
    post.category = this.CATEGORY.POST;
    post.approveControl = "0";
    post.refType = this.entityName;
    post.permissions = this.permissions;
    post.listTag = this.tags;
    this.api.execSv("WP", "ERM.Business.WP", "CommentsBusiness", "PublishPostAsync", [post])
      .subscribe(async (result: any) => {
        if (result) {
          if (this.listFileUpload.length > 0) {
            this.atmCreate.objectId = result.recID;
            this.listFileUpload.map((e: any) => {
              e.objectId = this.atmCreate.objectId;
            })
            this.atmCreate.fileUploadList = [...this.listFileUpload];
            result.files = [...this.listFileUpload];
            (await this.atmCreate.saveFilesObservable()).subscribe((res: any) => {
              if (res) {
                (this.dialogRef.dataService as CRUDService).add(result, 0).subscribe();
                this.notifySvr.notifyCode('SYS006');
                this.dialogRef.close();
              }
            });
          }
          else {
            (this.dialogRef.dataService as CRUDService).add(result, 0).subscribe();
            this.notifySvr.notifyCode('SYS006');
            this.dialogRef.close();
          }
        }
      });
  }

  async editPost() {
    if (!this.message && this.dataEdit.files.length <= 0 && this.listFileUpload.length <= 0) {
      this.notifySvr.notifyCode('E0315');
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
      this.notifySvr.notifyCode('E0315');
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
                (this.dialogRef.dataService as CRUDService).add(result, 0).subscribe();
                this.notifySvr.notifyCode('WP020');
                this.dialogRef.close();
              }
            });
          }
          else {
            (this.dialogRef.dataService as CRUDService).add(result, 0).subscribe();
            this.notifySvr.notifyCode('WP020');
            this.dialogRef.close();
          }
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
    if (event && event.data.length > 0) {
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
    if (this.listFileUpload.length == 0) {
      this.listFileUpload = files;
    }
    else {
      this.listFileUpload.concat(files);
    }
    this.dt.detectChanges();
  }

  showCBB = false;
  tagWith: string = '';
  tags: any[] = [];
  saveAddUser(value: any) {
    this.tags = [];
    let data = value.dataSelected;
    if (data && data.length > 0) {
      this.lstTagUser = data;
      data.forEach((x: any) => {
        let p = new Permission();
        p.objectType = 'U'
        p.objectID = x.UserID;
        p.objectName = x.UserName;
        p.memberType = this.MEMBERTYPE.TAGS;
        p.createdBy = this.user.userID;
        p.createdOn = new Date();
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
  lstTagUser: any[] = [];
  searchTagUser: string = "";
  clickShowTag() {

  }
  getTagUser() {
  }
}
