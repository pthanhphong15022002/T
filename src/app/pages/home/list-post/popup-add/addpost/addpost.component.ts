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
import { ApiHttpService, AuthStore, CacheService, DialogData, DialogRef, NotificationsService, UploadFile } from 'codx-core';
import { Permission } from '@shared/models/file.model';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
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

  @Input() isShow: boolean;
  constructor(
    injector: Injector,
    private modalService: NgbModal,
    private authStore: AuthStore,
    private cdr: ChangeDetectorRef,
    private signalRAPI: WPService,
    private dt: ChangeDetectorRef,
    public atSV: AttachmentService,
    private notifySvr: NotificationsService,
    private cache : CacheService,
    private api:ApiHttpService,
    @Optional() dd?: DialogData,
    @Optional() dialog?: DialogRef
    
  ) {
    this.dialogRef = dialog;
    this.dataPost = dd.data;
    this.title = dd.data.title;
    this.user = authStore.get();
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

  getFile(files) {
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.readAsDataURL(files[i]);
        reader.onload = (event: any) => {
          var category = event.target.result.includes('video') ? '10' : '9';
          this.previewFiles.push({
            fileName:
              category == '9'
                ? `url(${event.target.result})`
                : event.target.result,
            category: category,
            id: i,
          });
          if (this.previewFiles.length == files.length) {
            this.isFileReady = true;
            this.changed++;
            this.isDB = false;
          }
        };

        var f = new UploadFile();
        f['id'] = i;
        f.fileName = files[i].name;
        f.category = files[i].type;
        f.fileSize = files[i].size;
        // f.fileBytes = this.aescry.arrayBufferToBase64(arrayFile);
        this.fileUpload.push(f);
      }
    }
  }

  checkFile(files) {
    if (files.length == 0 || this.previewFiles.length + 1 > files.length)
      this.previewFiles = [];

    if (files.length > 0) {
      let form = new FormData();
      for (let i = 0; i < files.length; i++) {
        form.append('file', files[i]);
      }

      this.signalRAPI.checkfile(form).subscribe((res) => {
        if (res.error == false) {
          this.getFile(files);
        } else {
          let erroFiles = res.lstError;
          for (let i = 0; i < erroFiles.length; i++) {
            alert(erroFiles[i].key + '. ' + erroFiles[i].mssg);
          }
        }
      });
    }
  }

  remove() {
    this.previewFiles = [];
    this.fileUpload = [];
    this.isFileReady = false;
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
    var per1 = new Permission();
    per1.objectType = '1';
    per1.memberType = "1";
    per1.objectID = this.user.userID;
    per1.objectName = this.user.userName;
    per1.create = true;
    per1.update = true;
    per1.delete = true;
    per1.upload = true;
    per1.download = true;
    per1.assign = true;
    per1.share = true;
    per1.read = true;
    per1.isActive = true;
    per1.createdBy = this.user.userID;
    per1.createdOn = new Date();
    lstPermissions.push(per1);

    this.lstRecevier.map((item) => {
      var per = new Permission();
      per.memberType = "3";
      per.objectType = this.objectType;
      per.objectID = item.UserID;
      per.objectName = item.UserName;
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
      var per1 = new Permission();
      per1.objectType = '1';
      per1.memberType = "1";
      per1.objectID = this.user.userID;
      per1.objectName = this.user.userName;
      per1.create = true;
      per1.update = true;
      per1.delete = true;
      per1.upload = true;
      per1.download = true;
      per1.assign = true;
      per1.share = true;
      per1.read = true;
      per1.isActive = true;
      per1.createdBy = this.user.userID;
      per1.createdOn = new Date();
      lstPermission.push(per1);
      this.lstRecevier.map((item) => {
        var per = new Permission();
        per.memberType = "3";
        per.objectType = this.objectType;
        per.objectID = item.UserID;
        per.objectName = item.UserName;
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
    if (this.dataPost.status == "edit"){
      this.isEdit = true;
    }
    else{
      this.isEdit = false;
    }
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
    var per1 = new Permission();
    per1.objectType = '1';
    per1.memberType = "1";
    per1.objectID = this.user.userID;
    per1.objectName = this.user.userName;
    per1.create = true;
    per1.update = true;
    per1.delete = true;
    per1.upload = true;
    per1.download = true;
    per1.assign = true;
    per1.share = true;
    per1.read = true;
    per1.isActive = true;
    per1.createdBy = this.user.userID;
    per1.createdOn = new Date();
    lstPermissions.push(per1);
    this.lstRecevier.map((item) => {
      var per = new Permission();
      per.memberType = "3";
      per.objectType = this.objectType;
      per.objectID = item.UserID;
      per.objectName = item.UserName;
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

  showModal() {
    this.modalPost = this.modalService.open(this.template, {
      ariaLabelledBy: 'modal-basic-title',
    });
    this.iconShare();
    this.modalPost.result.then(
      (result) => {
        if (result) console.log('result: ', result);
      },
      () => {
        this.clearForm();
      }
    );
    this.cdr.detectChanges();
  }

  openShareControl(content) {
    // this.cbxsv.dataSelcected = this.shareWith;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        () => {
          this.closeResult = `Dismissed`;
        }
      );
  }

  getDisplayName() {
    const type = this.shareType;
    const t = this;
    const ext = ['O', 'D', 'P', 'R', 'G', 'U'];
    if (ext.includes(this.shareType)) {
      // _.filter(this.lstType, function (o) {
      //   if (o.value == type)
      //     t.displayShare = o.name;
      // })
    } else {
      t.displayShare = t.shareWith[0].name;
    }
  }

  applyClick(event, modal) {
    this.handleDataControlShare(event);
    modal.dismiss();
  }

  onSaveAddUser(event) {
    var modal = event.modal;
    this.handleDataControlShare(event);
    modal.dismiss();
  }

  handleDataControlShare(event = null) {
    const t = this;
    const ext = ['O', 'D', 'P', 'R', 'G', 'U'];
    // this.shareType = this.cbxsv.arrType[0];
    // this.shareType = event[0].objectType;
    // this.displayShare = this.cbxsv.arrName[0];
    if (this.displayShare == 'Owner') {
      this.displayShare = event[0].objectName;
    }

    if (ext.includes(this.shareType)) this.handleDataCbx();
    else this.shareWith = [{ id: this.shareType, name: t.displayShare }];
    console.log(this.shareWith);
    this.checkValueShare = true;

    for (let i = 0; i <= this.dataVll.length; i++) {
      if (this.dataVll[i].value === this.shareType) {
        this.icon = this.dataVll[i].icon;
        break;
      }
    }
   
  }

  handleDataCbx() {
    
  }

  getIdx() {
    
  }

  handleSelection(event) {
    let message = this.message || '';
    message += event.char;
    this.message = message;
  }

  convertListToTmpData(list: Array<object>, id: string, value: string) {
    let result = [];
    if (list.length == 0) return result;
    list.forEach((item) => result.push({ id: item[id], name: item[value] }));
    return result;
  }

  openTags(content) {
    this.checkOpenTags = true;
    
    this.cdr.detectChanges();
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        () => {
          this.closeResult = `Dismissed`;
        }
      );
  }

  selectTags(event) {
    var modal = event.modal;
    let data = [];
    
    if (this.checkOpenTags) {
      this.tags = data;
    }

    this.tag = data.length;
    modal.dismiss();
    this.checkValueTag = true;
  }

  checkValueStatus() {
    if (this.data.id) {
      if (this.message != this.data.content) {
        this.checkValueMessage = true;
      }
      if (this.previewFiles != this.data.listImage) {
        this.checkValueInput = true;
      }
    } else {
      if (this.message != undefined && this.message != '') {
        this.checkValueMessage = true;
      }
      if (this.previewFiles.length != 0) {
        this.checkValueFile = true;
      }
    }
    if (
      this.checkValueFile ||
      this.checkValueTag ||
      this.checkValueShare ||
      this.checkValueMessage
    ) {
      this.checkValueInput = true;
    }
  }

  private deleteString(str: string, strDelete: string): string {
    while (str.indexOf(strDelete) != -1) {
      str = str.replace(strDelete, '');
    }
    return str;
  }

  iconShare() {
    if (this.data.id) {
      for (let i = 0; i <= this.dataVll.length; i++) {
        if (this.dataVll[i].value === this.data.shareControl) {
          this.icon = this.dataVll[i].icon;
          break;
        }
      }
    } else {
      this.icon = 'fas fa-globe';
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
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.dt.detectChanges();
  }

  addEmoji(event) {
    this.message += event.emoji.native;
    this.dt.detectChanges();
  }


}
