import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { VALUECELL } from '@syncfusion/ej2-pivotview/src/common/base/css-constant';
import { DialogRef, ViewsComponent, ApiHttpService, AuthService, NotificationsService, CallFuncService, CacheService, DialogData, Util } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { WP_Comments } from '../../../models/WP_Comments.model';
import { WP_News } from '../../../models/WP_News.model';

@Component({
  selector: 'lib-popup-edit',
  templateUrl: './popup-edit.component.html',
  styleUrls: ['./popup-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PopupEditComponent implements OnInit {

  dateStart: Date;
  dateEnd: Date;
  subContent: string;
  formGroup: FormGroup;
  user: any;
  popupFiled = 1;
  popupContent = 2;
  objectID = '';
  dialogData: any;
  dialogRef: DialogRef;
  startDate: Date;
  endDate: Date;
  tagName = "";
  objectType = "";
  shareControl: string = "";
  userRecevier: any;
  recevierID = "";
  recevierName = "";
  data: any;
  fileUpload: any[] = [];
  fileImage: any = null;
  fileVideo: any = null;
  myPermission: Permission = null;
  apprPermission: Permission = null;
  shareIcon: string = "";
  shareText: string = "";
  shareWith: String = "";
  permissions: Permission[] = [];
  mssgCodeNoty:any = null;
  headerText:string ="";
  NEWSTYPE = {
    POST: "1",
    VIDEO: "2"
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
  MEMBERTYPE = {
    CREATED: "1",
    SHARE: "2",
    TAGS: "3"
  }
  FILE_REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION: 'application'
  }
  APPROVE_STATUS = {
    NEW: "1",
    REDO: "2",
    SUBMITED: "3",
    REJECTED:"4",
    APPROVETED:"5",
    CANCELLED:"6"
  }
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('codxAttachment') codxAttachment: AttachmentComponent;
  @ViewChild('codxATMVideo') codxAttachmentVideo: AttachmentComponent;
  @ViewChild('codxAttm') codxAttm: AttachmentComponent;

  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private notifSV: NotificationsService,
    private changedt: ChangeDetectorRef,
    private callFunc: CallFuncService,
    private cache: CacheService,
    private dmSV: CodxDMService,
    @Optional() dd?: DialogData,
    @Optional() dialogRef?: DialogRef

  ) {
    this.dialogData = dd?.data;
    this.data = this.dialogData?.data;
    this.headerText = this.dialogData?.headerText;
    this.dialogRef = dialogRef;
    this.user = auth.userValue;
  }
 



  ngOnInit(): void {
    this.setData();
  }

  ngAfterViewInit(): void {
  }

  getMessageNoti(mssCode:string){
    this.cache.message(mssCode).subscribe((mssg: any) => {
      if(mssg){
        this.mssgCodeNoty = mssg;
      }
    });
  }

  setData() {
    this.tagName = this.data.tags;
    this.shareControl = this.data.shareControl;
    this.permissions = this.data.permissions;
    this.formGroup = new FormGroup({
      Tags: new FormControl(this.data.tags),
      Category: new FormControl(this.data.category),
      StartDate: new FormControl(this.data.startDate),
      EndDate: new FormControl(this.data.endDate),
      Subject: new FormControl(this.data.subject),
      SubContent: new FormControl(this.data.subContent),
      Contents: new FormControl(this.data.contents),
      Image: new FormControl(this.data.image),
      AllowShare: new FormControl(this.data.allowShare),
      CreatePost: new FormControl(this.data.createPost),
    });
    this.getMessageNoti("SYS009");
    this.changedt.detectChanges();

  }
  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  clickUpdatePost() {
    this.data.tags = this.formGroup.controls['Tags'].value;
    this.data.category = this.formGroup.controls['Category'].value;
    this.data.startDate = this.formGroup.controls['StartDate'].value;
    this.data.endDate = this.formGroup.controls['EndDate'].value;
    this.data.subject = this.formGroup.controls['Subject'].value;
    this.data.subContent = this.formGroup.controls['SubContent'].value;
    this.data.contents = this.formGroup.controls['Contents'].value;
    this.data.allowShare = this.formGroup.controls['AllowShare'].value;
    this.data.createPost = this.formGroup.controls['CreatePost'].value;
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'UpdateNewsAsync',
        [this.data]
      )
      .subscribe(async (res: any) => {
        if (res) {
          if (this.fileUpload.length > 0) {
            this.deleteFileByObjectID(this.data.recID);
            this.dmSV.fileUploadList = [...this.fileUpload];
            (await (this.codxAttm.saveFilesObservable())).subscribe((res2: any) => {
              if (res2) 
              {
                this.notifSV.notifyCode('SYS007');
                this.dialogRef.close(res);
              }
            });
          }
          else 
          {
            this.dialogRef.close(res);
          }
        }
      });
  }

  clickApproPost() {
    if(this.data)
    {
      this.api.execSv(
        "WP",
        "ERM.Business.WP",
        "NewsBusiness",
        "SubmitNewsAsync",
        [this.data.recID])
        .subscribe((res:any[]) => {
          if(res && res[0]){
            this.data = res[1];
            this.dialogRef.close(this.data);
          }
        });
    }
  }


  deleteFileByObjectID(recID: string) {
    if (recID) {
      this.api.execSv(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "DeleteByObjectIDAsync",
        [recID, 'WP_Comments', true]).subscribe();
    }
  }
  insertWPComment(data: WP_News) {
    if (data.createPost) {
      var post = new WP_Comments();
      post.category = "4";
      post.refID = data.recID;
      post.refType = "WP_News";
      post.content = data.subject;
      post.shareControl = data.shareControl;
      post.permissions = data.permissions;
      post.approveControl = "0";
      post.createdBy = data.createdBy;
      this.api.execSv("WP", "ERM.Business.WP", "CommentsBusiness", "PublishPostAsync", [post, null]).subscribe();
    }
  }
  valueChange(event: any) {
    if (!event || event.data == "" || !event.data) {
      return;
    }
    let field = event.field;
    let value = event.data;
    let obj = {};
    switch (field) {
      case 'StartDate':
        this.startDate = value.fromDate;
        if (this.endDate < this.startDate) {
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
        if (this.endDate < this.startDate) {
          this.notifSV.notifyCode("WP011");
          this.endDate = null;
          obj[field] = null;
        }
        else {
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
    if (event && event[0]?.objectType) {
      this.data.shareControl = event[0].objectType;
      this.getValueShare(this.data.shareControl, event);
    }
  }
  getValueShare(shareControl: string, data: any[] = null) {
    if (shareControl) {
      let listPermission = [];
      this.shareWith = "";
      switch (this.shareControl) {
        case this.SHARECONTROLS.OWNER:
        case this.SHARECONTROLS.EVERYONE:
        case this.SHARECONTROLS.MYGROUP:
        case this.SHARECONTROLS.MYTEAM:
        case this.SHARECONTROLS.MYDEPARMENTS:
        case this.SHARECONTROLS.MYDIVISION:
        case this.SHARECONTROLS.MYCOMPANY:
          break;
        case this.SHARECONTROLS.OGRHIERACHY:
        case this.SHARECONTROLS.DEPARMENTS:
        case this.SHARECONTROLS.POSITIONS:
        case this.SHARECONTROLS.ROLES:
        case this.SHARECONTROLS.GROUPS:
        case this.SHARECONTROLS.USER:
          listPermission.forEach((x: any) => {
            let p = new Permission();
            p.objectType = this.shareControl;
            p.objectID = x.id;
            p.objectName = x.text;
            p.memberType = this.MEMBERTYPE.SHARE;
            listPermission.push(p);
          });
          this.data.permissions = listPermission;
          if (listPermission.length > 1) {
            this.cache.message('WP002').subscribe((mssg: any) => {
              if (mssg)
                this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + listPermission[0].text + '</b>', listPermission.length - 1, this.shareText);
            });
          }
          else {
            this.cache.message('WP001').subscribe((mssg: any) => {
              if (mssg)
                this.shareWith = Util.stringFormat(mssg.defaultName, '<b>' + listPermission[0].text + '</b>');
            });
          }   
          break;
        default:
          
      }
    }
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
  PopoverEmpEnter(p: any) {
    p.open();
  }
  PopoverEmpLeave(p: any) {
    p.close();
  }
  removeFile(file) {
    if (file) {
      this.fileUpload = [];
    }
  }

  addFiles(file: any) {
    if (file && file.data.length > 0) {
      file.data.map(f => {
        if (f.mimeType.indexOf("image") >= 0) {
          f['referType'] = this.FILE_REFERTYPE.IMAGE;
        }
        else if (f.mimeType.indexOf("video") >= 0) {
          f['referType'] = this.FILE_REFERTYPE.VIDEO;
        }
        else {
          f['referType'] = this.FILE_REFERTYPE.APPLICATION;
        }
      });
      this.fileUpload = [...file.data];
      this.dmSV.fileUploadList = [...file.data]

      this.changedt.detectChanges();
    }
  }
  addImage(files: any) {
    if (files && files.data.length > 0) {
      let file = files.data[0];
      if (file.mimeType.indexOf("image") >= 0) {
        file['referType'] = this.FILE_REFERTYPE.IMAGE;
        this.fileImage = file;
        this.fileUpload.push(file);
        this.changedt.detectChanges();
      }
      else this.notifSV.notify("Vui lòng chọn file image.");
    }
  }
  addVideo(files: any) {
    if (files && files.data.length > 0) {
      let file = files.data[0];
      if (file.mimeType.indexOf("video") >= 0) {
        file['referType'] = this.FILE_REFERTYPE.VIDEO;
        this.fileVideo = file;
        this.fileUpload.push(file);
        this.changedt.detectChanges();
      }
      else {
        this.notifSV.notify("Vui lòng chọn file video.");
      }
    }
  }
  clickClosePopup() {
    this.dialogRef.close();
  }


  clickUploadFile() {
    this.codxAttm.uploadFile();
  }

}
