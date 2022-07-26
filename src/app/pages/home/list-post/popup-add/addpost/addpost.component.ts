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
import { ApiHttpService, AuthService, AuthStore, CacheService, CallFuncService, CodxListviewComponent, CRUDService, DialogData, DialogModel, DialogRef, NotificationsService, UploadFile } from 'codx-core';
import { Permission } from '@shared/models/file.model';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { WP_Comments } from 'projects/codx-wp/src/lib/models/WP_Comments.model';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import * as mime from 'mime-types'
import { ImageGridComponent } from 'projects/codx-share/src/lib/components/image-grid/image-grid.component';

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
  shareControl: string = "";
  objectType: string = "";
  userRecevier: any;
  recevierID: string;
  recevierName: string = "";
  codxListView!: CodxListviewComponent;
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
    ADMINISTRATOR: "7",
    EVERYONE: "9",
    OGRHIERACHY: "O",
    DEPARMENTS: "D",
    POSITIONS: "P",
    ROLES: "R",
    GROUPS: "G",
    USER: "U",
  }
  MEMPERTPE = {
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
  myPermission: Permission;

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
    this.title = this.dialogData.title;
    this.codxListView = this.dialogData.lstView;

  }
  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.myPermission = new Permission();
    this.myPermission.objectType = "1";
    this.myPermission.memberType = this.MEMPERTPE.CREATED;
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
    this.shareControl = this.SHARECONTROLS.OWNER;
    if (this.dialogData.status == this.STATUS.EDIT) {
      this.dataEdit = this.dialogData.post;
      this.message = this.dataEdit.content;
      this.shareControl = this.dataEdit.shareControl;
    }
    if (this.dialogData.status == this.STATUS.SHARE) {
      this.dataShare = this.dialogData.post;
    }
    this.dt.detectChanges();
  }



  Submit() {
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
    if (!e.data.value) {
      this.message = e.data;
    }
    else {
      this.message = e.data.value;
    }
    this.dt.detectChanges();
  }

  eventApply(event: any) {
    if (!event) {
      return;
    }
    var data = event[0];
    var objectType = data.objectType;
    this.objectType = objectType;
    this.shareControl = objectType;

    if (isNaN(Number(objectType))) {
      this.lstRecevier = data.dataSelected;
      if (objectType == this.SHARECONTROLS.USER) {
        this.recevierName = this.lstRecevier[this.lstRecevier.length - 1].UserName;
      }
      else {
        this.recevierName = data.objectName + " " + data.text;
      }
    }
    else {
      this.recevierName = data.objectName;
    }

    this.dt.detectChanges();
  }

  beforSave(opt:any,data:any):boolean{
    opt.method = 'PublishPostAsync';
    opt.data = data;
    return true;
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
    post.permissions = [];
    post.permissions.push(this.myPermission);
    if (this.lstRecevier.length > 0) {
      this.lstRecevier.forEach((item) => {
        var per = new Permission();
        switch (this.objectType) {
          case this.SHARECONTROLS.USER:
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            break;
          case this.SHARECONTROLS.POSITIONS:
            per.objectID = item.PositionID;
            per.objectName = item.PositionName;
            break
          case this.SHARECONTROLS.DEPARMENTS:
            per.objectID = item.OrgUnitID;
            per.objectName = item.OrgUnitName;
            break;
          case this.SHARECONTROLS.GROUPS:
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            break;
          case this.SHARECONTROLS.ROLES:
            per.objectID = item.RoleID;
            per.objectName = item.RoleName;
            break
        }
        per.memberType = this.MEMPERTPE.TAGS;
        per.objectType = this.objectType;
        per.read = true;
        per.isActive = true;
        per.createdBy = this.user.userID;
        per.createdOn = new Date();
        post.permissions.push(per);
      })
    }
    // upload file
    if (this.listFileUpload.length > 0) {
      post.isUpload = true;
      post.files = this.listFileUpload;
    }
    // this.dialogRef.dataService.save((opt:any)=> this.beforSave(opt,post)).subscribe((res:any) => {
    //   if(res){
    //           if(this.listFileUpload.length > 0){
    //             this.atmCreate.objectId = res.recID;
    //             this.dmSV.fileUploadList =  this.codxFileCreated.getFiles();
    //             res.files = [...this.listFileUpload];
    //             this.atmCreate.saveFiles();
    //           }
    //           this.notifySvr.notifyCode('E0026');
    //           this.dialogRef.close();
    //         }
    // })
    this.api.execSv("WP", "ERM.Business.WP", "CommentBusiness", "PublishPostAsync", [post])
      .subscribe((res: any) => {
        if (res) {
          if (this.listFileUpload.length > 0) {
            this.atmCreate.objectId = res.recID;
            this.dmSV.fileUploadList = this.codxFileCreated.getFiles();
            res.files = [...this.listFileUpload];
            this.atmCreate.saveFiles();
          }
          (this.dialogRef.dataService as CRUDService).add(res, 0).subscribe((res2) => { console.log(res2) });
          this.notifySvr.notifyCode('E0026');
          this.dialogRef.close();
          this.dt.detectChanges();
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
    if (this.lstRecevier.length > 0) {
      let lstPermission: any[] = [];
      lstPermission.push(this.myPermission);
      this.lstRecevier.forEach((item) => {
        var per = new Permission();
        switch (this.objectType) {
          case this.SHARECONTROLS.USER:
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            break;
          case this.SHARECONTROLS.POSITIONS:
            per.objectID = item.PositionID;
            per.objectName = item.PositionName;
            break
          case this.SHARECONTROLS.DEPARMENTS:
            per.objectID = item.OrgUnitID;
            per.objectName = item.OrgUnitName;
            break;
          case this.SHARECONTROLS.GROUPS:
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            break;
          case this.SHARECONTROLS.ROLES:
            per.objectID = item.RoleID;
            per.objectName = item.RoleName;
            break
        }
        per.memberType = this.MEMPERTPE.TAGS;
        per.objectType = this.objectType;
        per.read = true;
        per.isActive = true;
        per.createdBy = this.user.userID;
        per.createdOn = new Date();
        lstPermission.push(per);
      });
      this.dataEdit.permissions = lstPermission;
    }
    this.api
      .execSv<any>(
        'WP',
        'ERM.Business.WP',
        'CommentBusiness',
        'EditPostAsync',
        [this.dataEdit]
      )
      .subscribe((res: any) => {
        if (res) {
          if (this.listFileUpload.length > 0) {
            this.atmEdit.objectId = this.dataEdit.recID;
            this.dmSV.fileUploadList = this.listFileUpload;
            this.atmEdit.saveFiles();
          }
          if (this.codxFileEdit.filesDelete.length > 0) {
            this.codxFileEdit.filesDelete.forEach((f: any) => {
              this.deleteFile(f.recID, true);
            });
          }
          res.files = this.codxFileEdit.lstFile;
          (this.dialogRef.dataService as CRUDService).edit(res).subscribe();
          this.notifySvr.notifyCode('E0026');
          this.dialogRef.close();
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
    var lstPermissions: Permission[] = [];
    lstPermissions.push(this.myPermission);
    if (this.lstRecevier.length > 0) {
      this.lstRecevier.forEach((item) => {
        var per = new Permission();
        switch (this.objectType) {
          case this.SHARECONTROLS.USER:
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            break;
          case this.SHARECONTROLS.POSITIONS:
            per.objectID = item.PositionID;
            per.objectName = item.PositionName;
            break
          case this.SHARECONTROLS.DEPARMENTS:
            per.objectID = item.OrgUnitID;
            per.objectName = item.OrgUnitName;
            break;
          case this.SHARECONTROLS.GROUPS:
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            break;
          case this.SHARECONTROLS.ROLES:
            per.objectID = item.RoleID;
            per.objectName = item.RoleName;
            break
        }
        per.memberType = this.MEMPERTPE.TAGS;
        per.objectType = this.objectType;
        per.read = true;
        per.isActive = true;
        per.createdBy = this.user.userID;
        per.createdOn = new Date();
        post.permissions.push(per);
      });
    }
    post.permissions = lstPermissions;
    // upload file
    if (this.listFileUpload.length > 0) {
      post.isUpload = true;
      post.files = this.listFileUpload;
    }
    this.api.execSv("WP", "ERM.Business.WP", "CommentBusiness", "PublishPostAsync", [post])
      .subscribe((res: any) => {
        if (res) {
          this.dialogRef.DataService as CRUDService;
          this.dialogRef.dataService.add(res, 0).subscribe();
          if (this.listFileUpload.length > 0) {
            this.atmCreate.objectId = res.recID;
            this.atmCreate.saveFiles();
          }
          this.dialogRef.close();
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
  openFile() {
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
  addFile(files: any) {
    if (this.listFileUpload.length == 0) {
      this.listFileUpload = files;
    }
    else {
      this.listFileUpload.concat(files);
    }
    this.dt.detectChanges();
  }
}
