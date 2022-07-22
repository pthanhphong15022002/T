import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { preRender } from '@syncfusion/ej2-angular-buttons';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ViewModel, ViewsComponent, ImageViewerComponent, ApiHttpService, AuthService, DialogData, ViewType, DialogRef, NotificationsService, CallFuncService } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
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
  dialogRef: any;
  startDate: Date;
  endDate: Date;
  tagName = "";
  objectType = "";
  shareControl:string =  "";
  userRecevier: any;
  recevierID = "";
  recevierName = "";
  lstRecevier = [];
  headerText = "Soạn thảo văn bản";
  dataEdit:any;
  isUpload:boolean = false;
  fileUpload:any[] = [];
  CATEGORY= {
    NEWS: "1",
    VIDEO: "2"
  }
  myPermission:any;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('codxAttachment') codxAttachment: AttachmentComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private notifSV: NotificationsService,
    private changedt: ChangeDetectorRef,
    protected callFunc: CallFuncService,
    @Optional() dd?: DialogData,
    @Optional() dialogRef?: DialogRef

  ) {
    this.dialogData = dd.data;
    this.dialogRef = dialogRef;
    this.user = auth.userValue;
  }
  ngAfterViewInit(): void {
  }
  ngOnInit(): void {
    if (this.newsType != "1") {
      this.isVideo = false;
    }
    this.shareControl = "1";
    this.objectType = "1";
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
    this.initForm();
  }

  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  clickInsertNews() {
    if(this.tagName == "" ){
      this.notifSV.notifyCode("WP013");
      return;
    }
    if(!this.startDate){
      this.notifSV.notifyCode("WP012");
      return;
    }
    let objNews = new WP_News();
    objNews = this.formGroup.value;
    objNews.newsType = this.CATEGORY.NEWS;
    objNews.status = '2';
    objNews.approveControl = "0";
    objNews.shareControl = this.shareControl;
    objNews.tags = this.tagName;
    objNews.createdBy = this.user.userID;
    var lstPermissions: Permission[] = [];
    lstPermissions.push(this.myPermission);
    // permission
    if(this.lstRecevier.length > 0){
      this.lstRecevier.forEach((item) => {
        var per = new Permission();
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
        per.memberType = "3";
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
      .subscribe((res1: any) => {
        if (res1) {
          let data = res1;
          this.objectID = data.recID;
          this.imageUpload
            .updateFileDirectReload(data.recID)
            .subscribe((res2) => {
              if (res2) {
                this.initForm();
                this.objectID = '';
                this.objectType = '';
                this.lstRecevier = [];
                this.notifSV.notifyCode('E0026');
                this.insertWPComment(data);
              }
            });
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
    var field = event.field;
    var value = event.data;
    var obj = {};
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
      case 'Category':
        obj[field] = value;
        break;
      case 'Subject':
        obj[field] = value;
        break;
      case 'SubContent':
        obj[field] = value;
        break;
      case 'Contents':
        obj[field] = value.value;
        break;
      case 'AllowShare':
        obj[field] = value;
        break;
      case 'CreatePost':
        obj[field] = value;
        break;
      case 'Tags':
        this.tagName = value;
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

  addFiles(files:any){
    if(files && files.data.length >0 ){
      this.fileUpload = files.data;
      this.changedt.detectChanges();
    }
    return;
  }
  clickUploadFile(){
    this.codxAttachment.uploadFile();
  }
}
