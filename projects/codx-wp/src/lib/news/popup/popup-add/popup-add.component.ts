import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { preRender } from '@syncfusion/ej2-angular-buttons';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ViewModel, ViewsComponent, ImageViewerComponent, ApiHttpService, AuthService, DialogData, ViewType, DialogRef, NotificationsService, CallFuncService } from 'codx-core';
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
  lstRecevier = [];
  dataEdit:any;
  isUpload:boolean = false;
  fileUpload:any[] = [];
  fileImage:any[] = [];
  fileVideo:any[] = [];
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
  MEMPERTYPE ={
    CREATED: "1",
    SHARE: "2",
    TAGS: "3"
  }
  FILE_REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION :'application'
  }
  myPermission:any;
  approverPermission:any;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('codxAttachment') codxAttachment: AttachmentComponent;
  @ViewChild('codxATMVideo') codxAttachmentVideo: AttachmentComponent;

  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private notifSV: NotificationsService,
    private changedt: ChangeDetectorRef,
    protected callFunc: CallFuncService,
    private dmSV:CodxDMService,
    @Optional() dd? : DialogData,
    @Optional() dialogRef?: DialogRef

  ) {

    this.newsType = dd.data;
    this.dialogRef = dialogRef;
    this.user = auth.userValue;
  }
  ngAfterViewInit(): void {
  }
  ngOnInit(): void {
    if (this.newsType != "1") {
      this.isVideo = false;
    }
    this.shareControl = this.SHARECONTROLS.EVERYONE;
    this.myPermission = new Permission();
    this.myPermission.objectType = this.SHARECONTROLS.OWNER;
    this.myPermission.memberType = this.MEMPERTYPE.CREATED;
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
    this.approverPermission = new Permission();
    this.approverPermission.objectType = this.SHARECONTROLS.ADMINISTRATOR;
    this.approverPermission.objectID = 'ADMIN';
    this.approverPermission.read = true;
    this.approverPermission.isActive = true;
    this.approverPermission.createdBy = this.user.userID;
    this.approverPermission.createdOn = new Date();
    this.initForm();
  }

  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  clickInsertNews() {
    let objNews = new WP_News();
    objNews = this.formGroup.value;
    objNews.newsType = this.newsType;
    objNews.status = '2';
    objNews.approveControl = "0";
    objNews.shareControl = this.shareControl;
    objNews.tags = this.tagName;
    objNews.createdBy = this.user.userID;
    var lstPermissions: Permission[] = [];
    lstPermissions.push(this.myPermission);
    lstPermissions.push(this.approverPermission);
    // permission
    if(this.lstRecevier.length > 0){
      this.lstRecevier.forEach((item) => {
        var per = new Permission();
        switch(this.objectType){
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
        per.memberType = this.MEMPERTYPE.TAGS;
        per.read = true;
        per.isActive = true;
        per.createdBy = this.user.userID;
        per.createdOn = new Date();
        lstPermissions.push(per);
      })
    }
    objNews.permissions = lstPermissions;
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
          // if(this.fileUpload.length > 0){
          //   this.codxAttachment.objectId = data.recID;
          //   this.codxAttachment.saveFiles();
          // }
          if(this.newsType == this.NEWSTYPE.POST && this.fileImage.length > 0){
            this.codxAttachment.objectId = data.recID;
            this.dmSV.fileUploadList = [...this.fileImage];
            this.codxAttachment.saveFiles();
          }
          if(this.newsType == this.NEWSTYPE.VIDEO && this.fileVideo.length > 0){
            this.codxAttachmentVideo.objectId = data.recID;
            this.dmSV.fileUploadList = [...this.fileVideo];
            this.codxAttachmentVideo.saveFiles();
          }
          this.initForm();
          this.shareControl = this.SHARECONTROLS.EVERYONE;
          this.lstRecevier = [];
          this.notifSV.notifyCode('E0026');
          this.insertWPComment(data);
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
      this.api.execSv("WP","ERM.Business.WP","CommentBusiness","PublishPostAsync", [post, null]).subscribe();
    }
  }
  clearData(){
    this.lstRecevier = [];
    this.userRecevier = [];
    this.tagName = "";
    this.clearValueForm();
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
  
  eventApply(event:any){
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

  addImage(file){
    this.dmSV.fileUploadList = [];
    if(file && file.data.length > 0 ){
        if(file.data[0].mimeType.indexOf("image") >= 0 ){
          file.data[0]['referType'] = this.FILE_REFERTYPE.IMAGE;
          this.fileImage = [...file.data];
          this.changedt.detectChanges();
        }
        else {
          this.notifSV.notify("Vui lòng chọn file image.")
        }
    }
  }
  addVideo(file){
    this.dmSV.fileUploadList = [];
    if(file && file.data.length > 0 ){
         if(file.data[0].mimeType.indexOf("video") >= 0)
        {
          file.data[0]['referType'] = this.FILE_REFERTYPE.VIDEO;
          this.fileVideo = [...file.data];
          this.changedt.detectChanges();
        }
        else{
          this.notifSV.notify("Vui lòng chọn file video.")
        }
    }
  }
}
