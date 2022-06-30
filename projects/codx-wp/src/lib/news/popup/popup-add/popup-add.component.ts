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
 objNews = new WP_News();
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
    this.objNews = dd?.data;
    this.dialogRef = dialog;
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

  beforeSave(option: any) {
    let itemData = this.objNews;
    option.method = 'InsertNewsAsync';
    option.data = [itemData];
    return true;
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
   
    this.objNews.newsType = '1';
    this.objNews.status = '2';
    this.objNews.approveControl = "0";
    this.objNews.createdOn = new Date();
    this.objNews.createdBy = this.user.userID;
    this.objNews.shareControl = this.shareControl;
    this.objNews.tags = this.tagName;
    this.objNews.category = this.formGroup.controls['fCategory'].value;
    this.objNews.startDate = this.formGroup.controls['fDateStart'].value;
    this.objNews.endDate = this.formGroup.controls['fDateEnd'].value;
    this.objNews.subject = this.formGroup.controls['fSubject'].value;
    this.objNews.subContent = this.formGroup.controls['fSubContent'].value;
    this.objNews.contents = this.formGroup.controls['fContents'].value;
    this.objNews.allowShare = this.formGroup.controls['fIsShare'].value;
    this.objNews.createPost = this.formGroup.controls['fIsCreated'].value;
    this.objNews.createdBy = this.user.userID;
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
    this.lstRecevier.map(item => {
      var per = new Permission();
      per.memberType = "3";
      per.objectType = this.objectType;
      per.objectID = item.UserID;
      per.objectName = item.UserName;
      per.read = true;
      per.share = this.objNews.allowShare;
      per.share = true;
      per.isActive = true;
      per.createdBy = this.user.userID;
      per.createdOn = new Date();
      lstPermissions.push(per);
    })
    this.objNews.permissions = lstPermissions;
   
   this.dialogRef.dataService.save((opt: any) => this.beforeSave(opt)).subscribe((res: any) => {
    if (res) {
      let data = res;
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
   
   
   
    // this.api
    //   .execSv(
    //     'WP',
    //     'ERM.Business.WP',
    //     'NewsBusiness',
    //     'InsertNewsAsync',
    //     this.objNews
    //   )
    //   .subscribe((res1: any) => {
    //     if (res1) {
    //       let data = res1;
    //       this.objectID = data.recID;
    //       this.imageUpload
    //         .updateFileDirectReload(data.recID)
    //         .subscribe((res2) => {
    //           if (res2) {
    //             this.initForm();
    //             this.objectID = '';
    //             this.objectType = '';
    //             this.lstRecevier = [];
    //             this.notifSV.notifyCode('E0026');
    //             this.insertWPComment(data);
    //           }
    //         });
    //     }
    //   });
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
    if(!event || event.data == ""){
      return;
    }
    var field = event.field;
    var value = event.data;
    var obj = {};
    switch(field)
    {
      case 'fStartDate':
        this.startDate = value.fromDate;
        obj[field] = this.startDate;
        break;
      case 'fDateEnd':
        this.endDate = value.fromDate;
        if(this.endDate < this.startDate){
          this.notifSV.notifyCode("WP011");
          this.endDate = null;
          obj[field] = null;
        }
        break;
      case 'fCategory':
        obj[field] = value;
        break;
      case 'fSubject':
        obj[field] = value;
        break;
      case 'fSubContent':
        obj[field] = value;
        break;
      case 'fContents':
        obj[field] = value.value;
        break;
      case 'fIsShare':
        obj[field] = value;
        break;
      case 'fIsCreated':
        obj[field] = value;
        break;
      case 'fTags':
        this.tagName = value;
        obj[field] = value;
        break; 
    }
    this.formGroup.patchValue(obj);
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
      if(objectType == "U" && this.lstRecevier.length == 1){
          this.userRecevier = this.lstRecevier[0];
      }
    }
    this.changedt.detectChanges();
  }
  initForm() {
    this.formGroup = new FormGroup({
      fTags: new FormControl(''),
      fCategory: new FormControl(null),
      fDateStart: new FormControl(new Date()),
      fDateEnd: new FormControl(),
      fSubject: new FormControl(''),
      fSubContent: new FormControl(''),
      fContents: new FormControl(''),
      fImage: new FormControl(''),
      fIsShare: new FormControl(false),
      fIsCreated: new FormControl(false),
    });
    this.changedt.detectChanges();
  }
  clearValueForm() {
    this.formGroup.controls['fTags'].setValue("");
    this.formGroup.controls['fCategory'].setValue(null);
    this.formGroup.controls['fDateStart'].setValue(null);
    this.formGroup.controls['fDateEnd'].setValue(null);
    this.formGroup.controls['fSubject'].setValue('');
    this.formGroup.controls['fSubContent'].setValue('');
    this.formGroup.controls['fImage'].setValue('');
    this.formGroup.controls['fIsShare'].setValue(false);
    this.formGroup.controls['fIsCreated'].setValue(false);
    this.changedt.detectChanges();
  }
  clickShowPopup() {
    // this.viewbase.currentView.openSidebarRight();
  }
  clickClosePopup(index: any) {
    this.dialogRef.close();
    this.clearValueForm();
  }

}
