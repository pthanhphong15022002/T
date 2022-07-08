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
import { WPService } from '@core/services/signalr/apiwp.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Post } from '@shared/models/post';
import 'lodash';
import { ApiHttpService, AuthService, AuthStore, CacheService, DialogData, DialogRef, NotificationsService, UploadFile } from 'codx-core';
import { Permission } from '@shared/models/file.model';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.scss'],
})
export class AddPostComponent  implements OnInit,AfterViewInit {
  @Input() dataRef = new Post();
  @Output() update = new EventEmitter();
  @Output() create = new EventEmitter();
  data: any;
  message: string = '';
  user: any;
  closeResult: any;
  previewFiles = [];
  fileUpload: UploadFile[] = [];
  showEmojiPicker = false;
  isFileReady: boolean = false;
  tags: Array<any> = [];
  shareWith: Array<{ id: string; name: string }> = [];
  shareType: string = '9';
  displayShare: string = 'Everyone';
  changed = 0;
  isDB = false;
  count = 0;
  tag = 0;
  idx = 0;
  title ="";
  dialogRef: DialogRef;
  @ViewChild('template') template: ElementRef;
  @ViewChild('attachment') attachment: AttachmentComponent;
  modalPost: NgbModalRef;
  //Variable for control share
  entityName = '';
  predicate = '';
  dataValue = '';
  viewMember = '';
  valueMember = '';
  service = '';
  objectName = '';
  parentIdField = '';
  comboboxName = '';
  icon = '';
  dataVll = [];
  checkValueInput = false;
  checkValueFile = false;
  checkValueMessage = false;
  checkValueTag = false;
  checkValueShare = false;
  checkOpenTags = false;
  dataPost:any;
  dataShare : any;
  dataEdit : any ;
  myPermission:Permission;
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
  @Input() isShow: boolean;
  constructor(
    private dt: ChangeDetectorRef,
    public atSV: AttachmentService,
    private notifySvr: NotificationsService,
    private cache : CacheService,
    private api:ApiHttpService,
    private authStore:AuthService,
    @Optional() dd?: DialogData,
    @Optional() dialog?: DialogRef
    
  ) {
    this.dialogRef = dialog;
    this.dataPost = dd.data;
    this.title = dd.data.title;
    this.user = authStore.userValue;
    this.cache.valueList('L1901').subscribe((res) => {
      if (res) {
        this.dataVll = res.datas;
        this.dt.detectChanges();
      }
    });
  }
  ngAfterViewInit(): void {}

  ngOnInit() {
    this.setDataPost(this.dataPost);
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
  }

  setDataPost(dataPost:any){
    if(!dataPost) return;
    if(dataPost.status == "create"){
      this.data = new Post();
      this.dataEdit = null;
      this.dataShare = null;
      this.message = "";
    }
    else if(dataPost.status == "edit")
    {
      this.data = dataPost.post;
      this.dataEdit = dataPost.post;
      this.dataShare = null;
      this.message = this.data.content;
    }
    else
    {
      this.data = new Post();
      this.dataEdit = null;
      this.dataShare = dataPost.post;
    }
    this.dt.detectChanges();
  }

  clearForm() {
    this.previewFiles = [];
    this.fileUpload = [];
    this.tags = [];
    this.shareWith = [];
    this.shareType = '9';
    this.data = new Post();
    this.dataRef = new Post();
    this.message = '';
    this.checkValueInput = false;
    this.checkValueFile = false;
    this.checkValueMessage = false;
    this.checkValueTag = false;
    this.checkValueShare = false;
    this.checkOpenTags = false;
    this.lstRecevier = [];
    this.shareControl = "";
    this.objectType = "";
  }

  Submit() {
    if (this.dataPost.status == "create") 
    {
      this.publishPost();
    } 
    else if (this.dataPost.status == "edit")  {
      this.editPost();
    }
    else{
      this.sharePost();
    }
  }
  valueChangeTags(e) {
    this.data.tags = e.data;
  }
  valueChange(e:any) {
    if(!e.data.value)
    {
      this.message = e.data;
    }
    else
    {
      this.message = e.data.value;
    }
    this.dt.detectChanges();
  }

  publishPost() {
    if (!this.message) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    this.data.content = this.message;
    this.data.shareControl = this.shareControl;
    this.data.category = "1";
    this.data.approveControl = "0";
    this.data.refType = "post";
    var lstPermissions: Permission[] = [];
    lstPermissions.push(this.myPermission);
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
      lstPermissions.push(per);
    })
    this.data.Permissions = lstPermissions;

    this.api.execSv("WP","ERM.Business.WP","CommentBusiness","PublishPostAsync",[this.data, this.shareWith])
    .subscribe((res: any) => {
        this.dialogRef.dataService.add(res,0).subscribe();
        this.clearForm();
        if(this.isUploadFile){
          this.attachment.objectId = res.recID;
          this.saveFile();
        }
        this.notifySvr.notifyCode('E0026');
        this.dialogRef.close();
        this.dt.detectChanges();
      });
  }

  isEdit = false;
  editPost() {
    if (!this.message || this.shareControl || this.isEdit){
      this.notifySvr.notifyCode('E0315');
      return;
    }
    
    var recID = this.data.recID;
    var comment = "";
    var isComment = false;
    var isShare = false;
    var lstPermission = [];
    if(this.message != this.data.content){
      isComment = true;
      comment = this.message;
    }
    if(this.shareControl){
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
          this.clearForm();
          this.notifySvr.notifyCode('E0026');
        }
      });
  }

  lstRecevier = [];
  shareControl:string = "";
  objectType:string = "";
  userRecevier:any;
  recevierID:string;
  recevierName:string;
  eventApply(event:any){
    if(!event || !event.data){
      return;
    }
    if (this.dataPost.status == "edit"){
      this.isEdit = true;
    }
    else{
      this.isEdit = false;
    }
    var data = event.data;
    var objectType = data[0].objectType;
    if(objectType && !isNaN(Number(objectType))){
      this.lstRecevier = data;
      this.shareControl = objectType;
    }
    else
    {
      this.objectType = objectType;
      this.lstRecevier = data;
      this.shareControl = objectType;
      this.recevierID = data[0].id;
      this.recevierName = data[0].dataSelected.UserName;
      
      
    }
    this.dt.detectChanges();
  }
  sharePost() {
    if (!this.message) {
      this.notifySvr.notifyCode('E0315');
      return;
    }
    this.data.content = this.message;
    this.data.shareControl = this.shareControl;
    this.data.category = "4";
    this.data.approveControl = "0";
    this.data.refID = this.dataShare.recID;
    var lstPermissions: Permission[] = [];
    lstPermissions.push(this.myPermission);
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
      lstPermissions.push(per);
    })
    this.data.Permissions = lstPermissions;
    this.api.execSv("WP","ERM.Business.WP","CommentBusiness","PublishPostAsync",[this.data, this.shareWith])
    .subscribe((res: any) => {
        this.dialogRef.dataService.add(res,0).subscribe();
        this.clearForm();
        this.notifySvr.notifyCode('E0026');
      });
  }
  setData(data) {
    this.message = data.content;
    this.data = data;
    this.count = 0;
    this.tag = this.data.tag;
    this.shareType = this.data.shareControl;
    this.getShareOfComment(this.shareType, this.data.id);
    if (this.data.listImage && this.data.listImage.length > 0) {
      this.isDB = true;
      this.previewFiles = this.data.listImage;
      this.isFileReady = true;
    }
    if (this.shareType == '9') {
      this.shareWith.push({ id: '9', name: 'Everyone' });
    }

    if (data.refID) {
      this.api
        .execSv<any>(
          'WP',
          'ERM.Business.WP',
          'CommentBusiness',
          'GetPostByIDAsync',
          [data.refID]
        )
        .subscribe((res) => {
          this.dataRef = res;
        });
    }
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
              this.shareWith.push(e);
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
              this.shareWith.push(e);
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
    this.attachment.saveFiles();
  }

  isUploadFile = false;
  openFile() {
    this.attachment.uploadFile();
  }
  fileAdded(event){
    console.log(event)
  }
  listImgUpload:any[] = [];

  getfileCount(event:any){
    if(!event || event.data.length <= 0){
      this.isUploadFile = false;
      return;
    }
    this.isUploadFile = true;
    this.listImgUpload = event.data;
    this.dt.detectChanges();
  }



}
