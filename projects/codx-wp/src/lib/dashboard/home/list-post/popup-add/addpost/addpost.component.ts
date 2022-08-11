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
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Post } from '@shared/models/post';
import 'lodash';
import { ApiHttpService, AuthService, AuthStore, CacheService, CallFuncService, CRUDService, DialogData, DialogModel, DialogRef, NotificationsService, UploadFile, Util } from 'codx-core';
import { Permission } from '@shared/models/file.model';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { WP_Comments } from 'projects/codx-wp/src/lib/models/WP_Comments.model';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import * as mime from 'mime-types'
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';
import { Observable, of, Subscriber } from 'rxjs';
import { Observer } from '@syncfusion/ej2-base';
import { A } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.scss'],

})
export class AddPostComponent implements OnInit, AfterViewInit {

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
    POST: "Post",
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
  myPermission: Permission = null;
  adminPermission: Permission = null;
  userPermision: Permission = null;
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
    this.myPermission = new Permission();
    this.myPermission.objectType = this.SHARECONTROLS.OWNER;
    this.myPermission.memberType = this.MEMBERTYPE.CREATED;
    this.myPermission.objectID = this.user.userID;
    this.myPermission.objectName = this.user.userName;
    this.myPermission.create = true;
    this.myPermission.update = true;
    this.myPermission.delete = true;
    this.myPermission.upload = true;
    this.myPermission.download = true;
    this.myPermission.assign = true;
    this.myPermission.share = true;
    this.myPermission.read = true;
    this.myPermission.isActive = true;
    this.myPermission.createdBy = this.user.userID;
    this.myPermission.createdOn = new Date();
    //admin
    this.adminPermission = new Permission();
    this.adminPermission.objectType = "7";
    this.adminPermission.memberType = this.MEMBERTYPE.SHARE;
    this.adminPermission.create = true;
    this.adminPermission.update = true;
    this.adminPermission.delete = true;
    this.adminPermission.upload = true;
    this.adminPermission.download = true;
    this.adminPermission.assign = true;
    this.adminPermission.share = true;
    this.adminPermission.read = true;
    this.adminPermission.isActive = true;
    this.adminPermission.createdBy = this.user.userID;
    this.adminPermission.createdOn = new Date();
    this.cache.message('WP011').subscribe((mssg: any) => {
      this.title =  Util.stringFormat(mssg.defaultName,this.user.userName);
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
      this.cache.valueList('L1901').subscribe((vll: any) => {
        let modShare = vll.datas.find((x: any) => x.value == this.SHARECONTROLS.EVERYONE);
        this.shareIcon = modShare.icon;
        this.shareText = modShare.text;
        this.shareControl = this.SHARECONTROLS.EVERYONE;
      });
      // OWNER
      this.permissions.push(this.myPermission);
      this.permissions.push(this.adminPermission);
    }
    this.dt.detectChanges();
  }
  Submit() {
    if (this.isClick) return;
    this.isClick = true;
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
      this.dt.detectChanges();
    }
  }

  eventApply(event: any) {
    if (!event) {
      return;
    }
    let data = event[0];
    this.shareControl = data.objectType;
    this.shareIcon = data.icon;
    this.shareText = data.objectName;
    var countPermission = 0;
    if (data.dataSelected) {
      countPermission = data.dataSelected.length;
    }
    switch (this.shareControl) {
      case this.SHARECONTROLS.OWNER:
        break;
      case this.SHARECONTROLS.EVERYONE:
        let evrPermission = new Permission();
        evrPermission.objectType = this.shareControl;
        evrPermission.memberType = this.MEMBERTYPE.SHARE;
        evrPermission.read = true;
        evrPermission.share = true;
        evrPermission.isActive = true;
        evrPermission.createdBy = this.user.userID;
        evrPermission.createdOn = new Date();
        this.shareWith = "";
        this.permissions.push(evrPermission);
        break;
      case this.SHARECONTROLS.MYGROUP:
      case this.SHARECONTROLS.MYTEAM:
      case this.SHARECONTROLS.MYDEPARMENTS:
      case this.SHARECONTROLS.MYDIVISION:
      case this.SHARECONTROLS.MYCOMPANY:
        let permission = new Permission();
        permission.objectType = this.shareControl;
        permission.memberType = this.MEMBERTYPE.SHARE;
        permission.read = true;
        permission.share = true;
        permission.isActive = true;
        permission.createdBy = this.user.userID;
        permission.createdOn = new Date();
        this.shareWith = "";
        this.permissions.push(permission);
        break;
      case this.SHARECONTROLS.OGRHIERACHY:
      case this.SHARECONTROLS.DEPARMENTS:
        data.dataSelected.forEach((x: any) => {
          let p = new Permission();
          p.objectType = this.shareControl;
          p.objectID = x.OrgUnitID;
          p.objectName = x.OrgUnitName;
          p.memberType = this.MEMBERTYPE.SHARE;
          p.read = true;
          p.share = true;
          p.isActive = true;
          p.createdBy = this.user.userID;
          p.createdOn = new Date();
          this.permissions.push(p);
        });
        if (countPermission > 1) {
          this.cache.message('WP002').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].OrgUnitName + '</b>', countPermission - 1, this.shareText);
          });
        }
        else {
          this.cache.message('WP001').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].OrgUnitName + '</b>');
          });
        }
        break;
      case this.SHARECONTROLS.POSITIONS:
        data.dataSelected.forEach((x: any) => {
          let p = new Permission();
          p.objectType = this.shareControl;
          p.objectID = x.PositionID;
          p.objectName = x.PositionName;
          p.memberType = this.MEMBERTYPE.SHARE;
          p.read = true;
          p.share = true;
          p.isActive = true;
          p.createdBy = this.user.userID;
          p.createdOn = new Date();
          this.permissions.push(p);

        });
        if (countPermission > 1) {
          this.cache.message('WP002').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].PositionName + '</b>', countPermission - 1, this.shareText);
          });
        }
        else {
          this.cache.message('WP001').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].PositionName + '</b>');
          });
        }
        break;
      case this.SHARECONTROLS.ROLES:
        data.dataSelected.forEach((x: any) => {
          let p = new Permission();
          p.objectType = this.shareControl;
          p.objectID = x.RoleID;
          p.objectName = x.RoleName;
          p.memberType = this.MEMBERTYPE.SHARE;
          p.read = true;
          p.share = true;
          p.isActive = true;
          p.createdBy = this.user.userID;
          p.createdOn = new Date();
          this.permissions.push(p);
        });
        if (countPermission > 1) {
          this.cache.message('WP002').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].RoleName + '</b>', countPermission - 1, this.shareText);
          });
        }
        else {
          this.cache.message('WP001').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].RoleName + '</b>');
          });
        }
        break;
      case this.SHARECONTROLS.GROUPS:
        data.dataSelected.forEach((x: any) => {
          let p = new Permission();
          p.objectType = this.shareControl;
          p.objectID = x.UserID;
          p.objectName = x.UserName;
          p.memberType = this.MEMBERTYPE.SHARE;
          p.read = true;
          p.share = true;
          p.isActive = true;
          p.createdBy = this.user.userID;
          p.createdOn = new Date();
          this.permissions.push(p);

        });
        if (countPermission > 1) {
          this.cache.message('WP002').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].UserName + '</b>', countPermission - 1, this.shareText);
          });
        }
        else {
          this.cache.message('WP001').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].UserName + '</b>');
          });
        }
        break;
      default:
        data.dataSelected.forEach((x: any) => {
          let p = new Permission();
          p.objectType = this.shareControl;
          p.objectID = x.UserID;
          p.objectName = x.UserName;
          p.memberType = this.MEMBERTYPE.SHARE;
          p.read = true;
          p.share = true;
          p.isActive = true;
          p.createdBy = this.user.userID;
          p.createdOn = new Date();
          this.permissions.push(p);
        });
        if (countPermission > 1) {
          this.cache.message('WP002').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].UserName + '</b>', countPermission - 1, this.shareText);
          });
        }
        else {
          this.cache.message('WP001').subscribe((mssg: any) => {
            if (mssg)
              this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + data.dataSelected[0].UserName + '</b>');
          });
        }
        break;

    }
    this.dt.detectChanges();
  }

  publishPost() {
    if (!this.message && this.listFileUpload.length < 0) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    var post = new Post();
    post.content = this.message;
    post.shareControl = this.shareControl;
    post.category = this.CATEGORY.POST;
    post.approveControl = "0";
    post.refType = this.entityName;
    post.permissions = this.permissions;
    this.api.execSv("WP", "ERM.Business.WP", "CommentsBusiness", "PublishPostAsync", [post])
      .subscribe((result: any) => {
        if (result) {
          if (this.listFileUpload.length > 0) {
            this.atmCreate.objectId = result.recID;
            this.dmSV.fileUploadList = [...this.listFileUpload];
            result.files = [...this.listFileUpload];
            this.atmCreate.saveFilesObservable().subscribe((res:any)=>{
              if(res){
                (this.dialogRef.dataService as CRUDService).add(result, 0).subscribe();
                this.notifySvr.notifyCode('SYS006');
                this.dialogRef.close();
              }});
          }
          else{
            (this.dialogRef.dataService as CRUDService).add(result, 0).subscribe();
            this.notifySvr.notifyCode('SYS006');
            this.dialogRef.close();
          }
        }
      });
  }

  editPost() {
    if (!this.message) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    this.dataEdit.content = this.message;
    this.dataEdit.shareControl = this.shareControl;
    this.dataEdit.shareIcon = this.shareIcon;
    this.dataEdit.shareText = this.shareText;
    this.dataEdit.permissions = this.permissions;
    this.dataEdit.shareName = this.shareWith;
    if (this.listFileUpload.length > 0) {
      this.atmEdit.objectId = this.dataEdit.recID;
      this.dmSV.fileUploadList = this.listFileUpload;
      this.atmEdit.saveFilesObservable().subscribe();
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
        this.notifySvr.notifyCode('SYS007');
        this.dialogRef.close(this.dataEdit);
      }
    });

  }


  sharePost() {
    if (!this.message && this.listFileUpload.length < 0) {
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
    post.permissions = this.permissions;
    this.api.execSv("WP", "ERM.Business.WP", "CommentsBusiness", "PublishPostAsync", [post])
      .subscribe((result: any) => {
        if (result) {
          if (this.listFileUpload.length > 0) {
            this.atmCreate.objectId = result.recID;
            this.dmSV.fileUploadList = [...this.listFileUpload];
            result.files = [...this.listFileUpload];
            this.atmCreate.saveFilesObservable().subscribe((res:any)=>{
              if(res){
                (this.dialogRef.dataService as CRUDService).add(result, 0).subscribe();
                this.notifySvr.notifyCode('SYS006');
                this.dialogRef.close();
              }});
          }
          else{
            (this.dialogRef.dataService as CRUDService).add(result, 0).subscribe();
            this.notifySvr.notifyCode('SYS006');
            this.dialogRef.close();
          }
        }
      });
  }
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

  tagUser(){
    
  }
}
