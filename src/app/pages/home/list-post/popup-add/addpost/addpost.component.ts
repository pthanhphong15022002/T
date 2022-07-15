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
import { ApiHttpService, AuthService, AuthStore, CacheService, CallFuncService, CRUDService, DialogData, DialogModel, DialogRef, NotificationsService, UploadFile } from 'codx-core';
import { Permission } from '@shared/models/file.model';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { WP_Comments } from 'projects/codx-wp/src/lib/models/WP_Comments.model';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import * as mime from 'mime-types'

@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.scss'],

})
export class AddPostComponent implements OnInit, AfterViewInit {
  
  @Input() dataRef = new Post();
  data: any;
  message: string = '';
  user: any;
  fileUpload: UploadFile[] = [];
  showEmojiPicker = false;
  shareType: string = '9';
  title = "";
  dialogRef: DialogRef;
  lstRecevier = [];
  shareControl:string = "";
  objectType:string = "9";
  userRecevier:any;
  recevierID:string;
  recevierName:string = "";
  @ViewChild('template') template: ElementRef;
  @ViewChild('atmCreate') atmCreate: AttachmentComponent;
  @ViewChild('atmEdit') atmEdit: AttachmentComponent;
  modalPost: NgbModalRef;
  //Variable for control share
  CATEGORY = {
    POST: "1",
    COMMENTS: "2",
    FEEDBACK :"3",
    SHARE : "4",
    PICTURES: "9",
    VIDEO: "10",
    FILE: "1"
  }
  POST:number = 1;
  COMMENTS:number = 2;
  SHARE:number = 4;
  entityName = 'WP_Comments';
  objectName = '';
  dataShare: any;
  dataEdit: any;
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
  status:string = "";
  fileType:string = "";
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
    
    this.dialogRef = dialog;
    this.status = dd.data.status;
    this.title = dd.data.title;
    if(this.status == "edit"){
      this.dataEdit = dd.data.post;
      this.message = this.dataEdit.content;
    }
    if(this.status == "share"){
      this.dataShare = dd.data.post;
    }
    this.user = authStore.userValue;

  }
  ngAfterViewInit(): void { }

  ngOnInit() {
    this.myPermission = new Permission();
    this.myPermission.objectType = '1';
    this.myPermission.memberType = "1";
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
    this.shareControl = "9";
    this.objectType = "1";
  }



  Submit() {
    if (this.status == "create") {
      this.publishPost();
    }
    else if (this.status == "edit") {
      this.editPost();
    }
    else {
      this.sharePost();
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

  publishPost() {
    if (!this.message) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    let post = new WP_Comments();
    post.content = this.message;
    post.shareControl = this.shareControl;
    post.category = this.CATEGORY.POST;
    post.approveControl = "0";
    post.refType = this.entityName;
    post.permissions = [];
    post.permissions.push(this.myPermission);
    if(this.lstRecevier.length > 0){
      this.lstRecevier.forEach((item) => {
        var per = new Permission();
        per.memberType = "3";
        switch(this.objectType){
          case "U":
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            per.objectType = this.objectType;
            break;
          case "P":
            per.objectID = item.PositionID;
            per.objectName = item.PositionName;
            per.objectType = this.objectType;
            break
          case "D":
            per.objectID = item.OrgUnitID;
            per.objectName = item.OrgUnitName;
            per.objectType = this.objectType;
            break;
          case "G":
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            per.objectType = this.objectType;
            break;
          case "R":
            per.objectID = item.RoleID;
            per.objectName = item.RoleName;
            per.objectType = this.objectType;
            break
        }
        per.read = true;
        per.isActive = true;
        per.createdBy = this.user.userID;
        per.createdOn = new Date();
        post.permissions.push(per);
      })
    }
    // upload file
    if (this.dmSV.fileUploadList.length > 0) {
        post.isUpload = true;
        post.files = this.dmSV.fileUploadList;
    }
    this.api.execSv("WP", "ERM.Business.WP", "CommentBusiness", "PublishPostAsync", [post])
      .subscribe((res: any) => {
        if(res){
          this.dialogRef.dataService  as CRUDService;
          this.dialogRef.dataService.add(res).subscribe((res2) =>
            {
              if(res2){
                 this.notifySvr.notifyCode('E0026');
              }
            }
          )
        if(res.isUpload){
          this.atmCreate.objectId = res.recID;
          this.atmCreate.saveFiles();
        }
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

    var recID = this.dataEdit.recID;
    var comment = "";
    var isComment = false;
    var isShare = false;
    var lstPermission = [];
    if (this.message != this.dataEdit.content) {
      isComment = true;
      comment = this.message;
    }
    if (this.shareControl != this.dataEdit.shareControl) {
      isShare = true;
      lstPermission.push(this.myPermission);
      this.lstRecevier.map((item) => {
        var per = new Permission();
        per.memberType = "3";
        per.objectType = item.objectType;
        per.objectID = item.id;
        per.objectName = item.text;
        per.read = true;
        per.isActive = true;
        per.createdBy = this.user.userID;
        per.createdOn = new Date();
        lstPermission.push(per);
      })
    }
    
    this.api
      .execSv<any>(
        'WP',
        'ERM.Business.WP',
        'CommentBusiness',
        'EditPostAsync',
        [
          recID,
          isComment,
          comment,
          isShare,
          this.shareControl,
          lstPermission
        ]
      )
      .subscribe((res) => {
        if (res) {
          this.notifySvr.notifyCode('E0026');
        }
      });
  }

  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  
  eventApply(event:any){
    if(!event){
      return;
    }
    var data = event[0];
    var objectType = data.objectType;
    this.objectType = objectType;
    this.shareControl = objectType;

    if(isNaN(Number(objectType))){
      this.lstRecevier = data.dataSelected;
      if(objectType == 'U')
      {
        this.recevierID = data.id;
        this.recevierName = data.text;
      }
      else{
        this.recevierName = data.objectName + " " + data.text;
      }
    }
    else
    {
        this.recevierName = data.objectName;
    }
    
    this.dt.detectChanges();
  }
  sharePost() {
    if (!this.message) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    let post = new Post();
    post.content = this.message;
    post.shareControl = this.shareControl;
    post.category = this.CATEGORY.SHARE;
    post.approveControl = "0";
    post.refID = this.dataShare.recID;
    var lstPermissions: Permission[] = [];
    lstPermissions.push(this.myPermission);
    if(this.lstRecevier.length > 0){
      this.lstRecevier.forEach((item) => {
        var per = new Permission();
        per.memberType = "3";
        switch(this.objectType){
          case "U":
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            per.objectType = this.objectType;
            break;
          case "P":
            per.objectID = item.PositionID;
            per.objectName = item.PositionName;
            per.objectType = this.objectType;
            break
          case "D":
            per.objectID = item.OrgUnitID;
            per.objectName = item.OrgUnitName;
            per.objectType = this.objectType;
            break;
          case "G":
            per.objectID = item.UserID;
            per.objectName = item.UserName;
            per.objectType = this.objectType;
            break;
          case "R":
            per.objectID = item.RoleID;
            per.objectName = item.RoleName;
            per.objectType = this.objectType;
            break
        }
        per.read = true;
        per.isActive = true;
        per.createdBy = this.user.userID;
        per.createdOn = new Date();
        post.permissions.push(per);
      })
    }
    post.permissions = lstPermissions;
    this.api.execSv("WP", "ERM.Business.WP", "CommentBusiness", "PublishPostAsync", [post])
      .subscribe((res: any) => {
        if(res){
          this.dialogRef.DataService as CRUDService;
          this.dialogRef.dataService.add(res, 0).subscribe();
          this.notifySvr.notifyCode('E0026');
          this.dialogRef.close();
        }
      });
  }

  getShareOfComment(shareControl, commentID) {
    if (shareControl == '1') {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentBusiness',
          'GetShareOwnerListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res)
            res.forEach((obj) => {
              var e = { id: obj.userID, name: obj.objectName };
            });
        });
    } else {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'CommentBusiness',
          'GetShareUserListAsync',
          [commentID]
        )
        .subscribe((res) => {
          if (res)
            res.forEach((obj) => {
              var e = { id: obj.s, name: obj.objectName };
            });
        });
    }
  }


  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.dt.detectChanges();
  }

  addEmoji(event) {
    this.message += event.emoji.native;
    this.dt.detectChanges();
  }


  saveFile() {
    this.atmCreate.saveFiles();
  }

  openFile() {
    this.dmSV.fileUploadList = [];
    this.atmCreate.uploadFile();
  }
  listFileUpload:any[] = []
  isUploadFile = false;

  getfileCount(event: any) {
    if (!event || event.data.length <= 0) {
      this.isUploadFile = false;
      this.listFileUpload = [];
      this.dmSV.fileUploadList = []
      return;
    }
    else
    {
      this.isUploadFile = true;
      this.listFileUpload = event.data;
    }
    this.dt.detectChanges();
  }



}
