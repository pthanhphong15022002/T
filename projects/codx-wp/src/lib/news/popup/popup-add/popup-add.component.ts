import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { preRender } from '@syncfusion/ej2-angular-buttons';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { ViewModel, ViewsComponent, ImageViewerComponent, ApiHttpService, AuthService, DialogData, ViewType, DialogRef, NotificationsService } from 'codx-core';
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
  dialogRef: DialogRef
  startDate: Date;
  endDate: Date;
  tagName = "";
  objectType = "";
  shareControl:string =  "";
  userRecevier: any;
  recevierID = "";
  recevierName = "";
  lstRecevier = [];
  headerText = "Soạn thảo văn bản"
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() closePopup = new EventEmitter();
  @Output() loadData = new EventEmitter();
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private notifSV: NotificationsService,
    private changedt: ChangeDetectorRef,
    @Optional() dd?: DialogData,
    @Optional() dialog?: DialogRef

  ) {
    this.dialogRef = dialog;
    this.user = auth.userValue;
  }
  ngAfterViewInit(): void {
    this.changedt.detectChanges();
  }
  ngOnInit(): void {
    if (this.newsType != "1") {
      this.isVideo = false;
    }
    this.initForm();
    this.user = this.auth.userValue;
  }


  clickInsertNews() {
    if(this.lstRecevier.length <= 0){
      this.notifSV.notifyCode("WP012");
      return
    }
    if(this.tagName == "" ){
      this.notifSV.notifyCode("WP013");
      return;
    }
    if(!this.startDate){
      this.notifSV.notifyCode("WP012");
      return;
    }
   
    let objNews = new WP_News();
    objNews.newsType = '1';
    objNews.status = '2';
    objNews.approveControl = "0";
    objNews.createdOn = new Date();
    objNews.createdBy = this.user.userID;
    objNews.shareControl = this.shareControl;
    objNews.tags = this.tagName;
    objNews.category = this.formGroup.controls['Category'].value;
    objNews.startDate = this.formGroup.controls['DateStart'].value;
    objNews.endDate = this.formGroup.controls['DateEnd'].value;
    objNews.subject = this.formGroup.controls['Subject'].value;
    objNews.subContent = this.formGroup.controls['SubContent'].value;
    objNews.contents = this.formGroup.controls['Contents'].value;
    objNews.allowShare = this.formGroup.controls['IsShare'].value;
    objNews.createPost = this.formGroup.controls['IsCreated'].value;
    objNews.createdBy = this.user.userID;
    var lstPermissions: Permission[] = [];
    // Owner
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
    if(isNaN(Number(this.shareControl))){
      this.lstRecevier.map(item => {
        var per = new Permission();
        per.memberType = "3";
        per.objectType = this.objectType;
        per.objectID = item.UserID;
        per.objectName = item.UserName;
        per.read = true;
        per.share = objNews.allowShare;
        per.share = true;
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
        obj[field] = this.startDate;
        break;
      case 'DateEnd':
        this.endDate = value.fromDate;
        if(this.endDate < this.startDate){
          this.notifSV.notifyCode("WP011");
          this.endDate = null;
          obj[field] = null;
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
      case 'IsShare':
        obj[field] = value;
        break;
      case 'IsCreated':
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
      DateStart: new FormControl(new Date()),
      DateEnd: new FormControl(),
      Subject: new FormControl(''),
      SubContent: new FormControl(''),
      Contents: new FormControl(''),
      Image: new FormControl(''),
      IsShare: new FormControl(false),
      IsCreated: new FormControl(false),
    });
    this.changedt.detectChanges();
  }
  clearValueForm() {
    this.formGroup.controls['Tags'].setValue("");
    this.formGroup.controls['Category'].setValue(null);
    this.formGroup.controls['DateStart'].setValue(null);
    this.formGroup.controls['DateEnd'].setValue(null);
    this.formGroup.controls['Subject'].setValue('');
    this.formGroup.controls['Contents'].setValue('');
    this.formGroup.controls['SubContent'].setValue('');
    this.formGroup.controls['Image'].setValue('');
    this.formGroup.controls['IsShare'].setValue(false);
    this.formGroup.controls['IsCreated'].setValue(false);
    this.changedt.detectChanges();
  }
  clickShowPopup() {
    // this.viewbase.currentView.openSidebarRight();
  }
  clickClosePopup(index: any) {
    this.dialogRef.close();
    this.clearValueForm();
  }
  PopoverEmpEnter(p:any){
    p.open();
  }
  PopoverEmpLeave(p:any){
    p.close();
  }

}
