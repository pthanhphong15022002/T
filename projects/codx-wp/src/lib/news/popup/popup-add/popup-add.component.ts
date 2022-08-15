import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { preRender } from '@syncfusion/ej2-angular-buttons';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ViewModel, ViewsComponent, ImageViewerComponent, ApiHttpService, AuthService, DialogData, ViewType, DialogRef, NotificationsService, CallFuncService, Util, CacheService } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { WP_Comments } from '../../../models/WP_Comments.model';
import { WP_News } from '../../../models/WP_News.model';

@Component({
  selector: 'lib-popup-add',
  templateUrl: './popup-add.component.html',
  styleUrls: ['./popup-add.component.css']
})
export class PopupAddComponent implements OnInit {
  dateStart: Date;
  dateEnd: Date;
  subContent: string;
  isVideo = true;
  newsType: any;
  formGroup: FormGroup;
  user: any;
  
  popupFiled = 1;
  popupContent = 2;
  objectID = '';
  dialogData:any;
  dialogRef: DialogRef;
  startDate: Date;
  endDate: Date;
  tagName = "";
  objectType = "";
  shareControl:string =  "";
  userRecevier: any;
  recevierID = "";
  recevierName = "";

  fileUpload:any[] = [];
  fileImage:any = null;
  fileVideo:any = null;
  myPermission:Permission = null;
  apprPermission:Permission = null;
  shareIcon:string = "";
  shareText:string = "";
  shareWith:String = "";
  permissions:Permission[] = [];

  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
  }
  SHARECONTROLS = {
    OWNER: "1",
    MYGROUP: "2",
    MYTEAM: "3",
    MYDEPARMENTS:"4",
    MYDIVISION:"5",
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
  MEMBERTYPE ={
    CREATED: "1",
    SHARE: "2",
    TAGS: "3"
  }
  FILE_REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION :'application'
  }

  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('codxATMImage') codxATMImage: AttachmentComponent;
  @ViewChild('codxATMVideo') codxATMVideo: AttachmentComponent;
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private notifSV: NotificationsService,
    private changedt: ChangeDetectorRef,
    private callFunc: CallFuncService,
    private cache:CacheService,
    private dmSV:CodxDMService,
    @Optional() dd? : DialogData,
    @Optional() dialogRef?: DialogRef

  ) {

    this.newsType = dd.data.type;
    if (this.newsType != this.NEWSTYPE.POST) {
      this.isVideo = false;
    }
    this.dialogRef = dialogRef;
    this.user = auth.userValue;
  }
  ngAfterViewInit(): void {
  }


  messageImage:string ="";
  ngOnInit(): void {
    this.cache.message('WP017').subscribe((mssg:any) => {
      if (mssg) this.messageImage = Util.stringFormat(mssg.defaultName);
    })
    this.setDataDefault();
  }


  setDataDefault(){
    this.cache.valueList('L1901').subscribe((vll: any) => {
      let modShare = vll.datas.find((x: any) => x.value == this.SHARECONTROLS.EVERYONE);
      this.shareIcon = modShare.icon;
      this.shareText = modShare.text;
      this.shareControl = this.SHARECONTROLS.EVERYONE;
    });
    this.tagName = "";
    this.shareControl = this.SHARECONTROLS.EVERYONE;
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
    // appover 
    this.apprPermission = new Permission();
    this.apprPermission.objectType = this.SHARECONTROLS.ADMINISTRATOR;
    this.apprPermission.read = true;
    this.apprPermission.isActive = true;
    this.apprPermission.createdBy = this.user.userID;
    this.apprPermission.createdOn = new Date();
    let evrPermission = new Permission();
    evrPermission.objectType = this.shareControl;
    evrPermission.memberType = this.MEMBERTYPE.SHARE;
    evrPermission.read = true;
    evrPermission.isActive = true;
    evrPermission.createdBy = this.user.userID;
    evrPermission.createdOn = new Date();
    this.shareWith = "";
    this.permissions.push(this.myPermission);
    this.permissions.push(this.apprPermission);
    this.permissions.push(evrPermission);
    this.initForm();
  }
  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  clickInsertNews() {
    if(!this.formGroup.controls['Category'].value){
      this.cache.message("SYS009").subscribe((mssg:any) => {
        if(mssg){
          let mssgCode = Util.stringFormat(mssg.defaultName,"Loại bài viết");
          this.notifSV.notify(mssgCode);
        }
      });
      return;
    }
    if(!this.formGroup.controls['Subject'].value){
      this.cache.message("SYS009").subscribe((mssg:any) => {
        if(mssg){
          let mssgCode = Util.stringFormat(mssg.defaultName,"Tiêu đề");
          this.notifSV.notify(mssgCode);
        }
      });
      return;
    }
    if(!this.formGroup.controls['SubContent'].value){
      this.cache.message("SYS009").subscribe((mssg:any) => {
        if(mssg){
          let mssgCode = Util.stringFormat(mssg.defaultName,"Mô tả");
          this.notifSV.notify(mssgCode);
        }
      });
      return;
    }
    if(!this.formGroup.controls['Contents'].value){
      this.cache.message("SYS009").subscribe((mssg:any) => {
        if(mssg){
          let mssgCode = Util.stringFormat(mssg.defaultName,"Nội dung");
          this.notifSV.notify(mssgCode);
        }
      });
      return;
    }
    if(this.fileUpload.length == 0){
      this.cache.message("SYS009").subscribe((mssg:any) => {
        if(mssg){
          let mssgCode = "";
          if(this.newsType == this.NEWSTYPE.POST)
             mssgCode = Util.stringFormat(mssg.defaultName,"Hình ảnh");
          else mssgCode = Util.stringFormat(mssg.defaultName,"Hình ảnh/Video");
          this.notifSV.notify(mssgCode);
        }
      });
      return;
    }
    let objNews = new WP_News();
    objNews = this.formGroup.value;
    objNews.newsType = this.newsType;
    objNews.status = '2';
    objNews.approveControl = "0";
    objNews.shareControl = this.shareControl;
    objNews.permissions = this.permissions;
    objNews.isActive = true;
    if(objNews.allowShare){
      objNews.permissions.map((p:Permission)=>{p.share = true});
    }
    objNews.createdBy = this.user.userID;
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'InsertNewsAsync',
        objNews
      )
      .subscribe((res: any) => {
        if (res) {
          let data = res;
          if(this.fileUpload.length > 0){
            this.codxATMImage.objectId = data.recID;
            this.dmSV.fileUploadList = [...this.fileUpload];
            this.codxATMImage.saveFilesObservable().subscribe(
              (res2:any) => {
                if(res2){
                  this.initForm();
                  this.shareControl = this.SHARECONTROLS.EVERYONE;
                  this.notifSV.notifyCode('E0026');
                  this.dialogRef.close();
                  this.insertWPComment(data);
                }
              }
            );
          }
        }
      });
  }
  insertWPComment(data: WP_News){
    if(data.createPost){
      var post = new WP_Comments();
      post.category = "4";
      post.refID = data.recID;
      post.refType = "WP_News";
      post.content = data.subject;
      post.shareControl = data.shareControl;
      post.permissions = data.permissions;
      post.approveControl = "0";
      post.createdBy = data.createdBy;
      this.api.execSv("WP","ERM.Business.WP","CommentsBusiness","PublishPostAsync", [post, null]).subscribe();
    }
  }
  valueChange(event: any) {
    if(!event || event.data == "" || !event.data){
      return;
    }
    let field = event.field;
    let value = event.data;
    let obj = {};
    switch(field)
    {
      case 'StartDate':
        this.startDate = value.fromDate;
        if(this.endDate < this.startDate){
          this.notifSV.notifyCode("WP011");
          this.endDate = null;
          obj[field] = null;
        }
        else {
          obj[field] = this.startDate;
        }
        break;
      case 'EndDate':
        this.endDate = value.fromDate;
        if(this.endDate < this.startDate){
          this.notifSV.notifyCode("WP011");
          this.endDate = null;
          obj[field] = null;
        }
        else  {
          obj[field] = this.endDate;
        }
        break;
      default:
        obj[field] = value;
        break; 
    }
    this.formGroup.patchValue(obj);
    this.changedt.detectChanges();
  }
  eventApply(event: any) {
    if (!event) {
      return;
    }
    let data = event[0];
    let countPermission = 0;
    if(this.shareControl){
      this.permissions = [];
      this.permissions.push(this.myPermission);
      this.permissions.push(this.apprPermission);
    }
    this.shareControl = data.objectType;
    this.shareIcon = data.icon;
    this.shareText = data.objectName;
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
    this.changedt.detectChanges();
  }
  initForm() {
    this.formGroup = new FormGroup({
      Tags: new FormControl(''),
      Category: new FormControl(null),
      StartDate: new FormControl(new Date()),
      EndDate: new FormControl(),
      Subject: new FormControl(''),
      SubContent: new FormControl(''),
      Contents: new FormControl(''),
      Image: new FormControl(''),
      AllowShare: new FormControl(false),
      CreatePost: new FormControl(false),
    });
    this.changedt.detectChanges();
  }
  clearValueForm() {
    this.formGroup.controls['Tags'].setValue("");
    this.formGroup.controls['Category'].setValue(null);
    this.formGroup.controls['StartDate'].setValue(null);
    this.formGroup.controls['EndDate'].setValue(null);
    this.formGroup.controls['Subject'].setValue('');
    this.formGroup.controls['Contents'].setValue('');
    this.formGroup.controls['SubContent'].setValue('');
    this.formGroup.controls['Image'].setValue('');
    this.formGroup.controls['AllowShare'].setValue(false);
    this.formGroup.controls['CreatePost'].setValue(false);
    this.changedt.detectChanges();
  }
  PopoverEmpEnter(p:any){
    p.open();
  }
  PopoverEmpLeave(p:any){
    p.close();
  }
  removeFile(file){
    if(file){
      this.fileUpload = [];
    }
  }

  addFiles(file:any){
    if(file && file.data.length > 0 ){
      file.data.map(f => {
        if(f.mimeType.indexOf("image") >= 0 ){
          f['referType'] = this.FILE_REFERTYPE.IMAGE;
        }
        else if(f.mimeType.indexOf("video") >= 0)
        {
          f['referType'] = this.FILE_REFERTYPE.VIDEO;
        }
        else{
          f['referType'] = this.FILE_REFERTYPE.APPLICATION;
        }
      });
      this.fileUpload = [...file.data];
      this.dmSV.fileUploadList = [...file.data]

      this.changedt.detectChanges();
    }
  }

  addImage(files){
    if(files && files.data.length > 0 ){
      let file = files.data[0];
        if(file.mimeType.indexOf("image") >= 0 ){
          file['referType'] = this.FILE_REFERTYPE.IMAGE;
          this.fileImage = file;
          this.fileUpload.push(file);
          this.changedt.detectChanges();
        }
        else {
          this.notifSV.notify("Vui lòng chọn file image.")
        }
    }
  }
  addVideo(files){
    if(files && files.data.length > 0 ){
      let file = files.data[0];
         if(file.mimeType.indexOf("video") >= 0)
        {
          file['referType'] = this.FILE_REFERTYPE.VIDEO;
          this.fileVideo = file;
          this.fileUpload.push(file);
          this.changedt.detectChanges();
        }
        else{
          this.notifSV.notify("Vui lòng chọn file video.")
        }
    }
  }
  clickClosePopup(){
    this.dialogRef.close();
  }
  clickUploadImage(){
    this.codxATMImage.uploadFile();
  }
  clickUploadVideo(){
    this.codxATMVideo.uploadFile();
  }
}
