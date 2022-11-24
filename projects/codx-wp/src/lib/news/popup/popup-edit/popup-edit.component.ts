import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DialogRef, ApiHttpService, AuthService, NotificationsService, CallFuncService, CacheService, DialogData, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { WP_News } from '../../../models/WP_News.model';

@Component({
  selector: 'lib-popup-edit',
  templateUrl: './popup-edit.component.html',
  styleUrls: ['./popup-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PopupEditComponent implements OnInit {
  user: any;
  objectID = '';
  dialogData: any;
  dialogRef: DialogRef;
  data: WP_News;
  fileUpload: any[] = [];
  fileImage: any = null;
  fileVideo: any = null;
  shareWith: String = "";
  mssgCodeNoty:any = null;
  headerText:string ="";
  files:any[] = [];
  fileDelete:any[] = [];
  extensions: "image" | "video" = "video";
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
  @ViewChild('codxATM') codxATM: AttachmentComponent;
  @ViewChild('viewVideo') video: AttachmentComponent;

  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private notifSV: NotificationsService,
    private changedt: ChangeDetectorRef,
    private callFunc: CallFuncService,
    private cache: CacheService,
    @Optional() dd?: DialogData,
    @Optional() dialogRef?: DialogRef

  ) {
    this.dialogData = dd.data;
    this.data = JSON.parse(JSON.stringify(this.dialogData.data));
    this.headerText = this.dialogData.headerText;
    this.dialogRef = dialogRef;
    this.user = auth.userValue;
  }

  ngOnInit(): void {
    this.getFileByObjectID(this.data.recID);
  }

  ngAfterViewInit(): void {
  }

  getFileByObjectID(objectID:string) {
    if(objectID)
    {
      this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        [objectID])
        .subscribe((files: any[]) => 
        {
          if (files.length > 0) 
          {
            files.forEach((f: any) => {
              f["source"] = `${environment.urlUpload}`+"/"+f.url; 
              if(f.referType == this.FILE_REFERTYPE.IMAGE )
              {
                  this.fileImage = f; 
              }
              if(f.referType == this.FILE_REFERTYPE.VIDEO )
              {
                  this.fileVideo = f;
              }
            });
            this.files = JSON.parse(JSON.stringify(files));
            this.changedt.detectChanges();
          }
      });
    }
  }

  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  clickUpdatePost() {
    if (!this.data.category) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Loại bài viết");
      this.notifSV.notify(mssgCode);
      return;
    }
    if(!this.data.startDate){
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Ngày bắt đầu");
      this.notifSV.notify(mssgCode);
      return;
    }
    if(this.data.endDate) // check endDate
    {
      let startDate = new Date(this.data.startDate);
      let endDate = new Date(this.data.endDate);
      if(startDate > endDate){
        return this.notifSV.notify("Ngày kết thúc phải lớn hơn ngày bắt đầu");  
      }
    }
    if (!this.data.subject) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Tiêu đề");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (!this.data.subContent) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Mô tả");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (this.data.newsType == this.NEWSTYPE.POST && !this.data.contents) 
    {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Nội dung");
      this.notifSV.notify(mssgCode);
      return;
    }
    let post = new WP_News();
    post.recID = this.data.recID;
    post.shareControl = this.data.shareControl;
    post.tags = this.data.tags;
    post.category = this.data.category;
    post.startDate = this.data.startDate;
    post.endDate = this.data.endDate;
    post.subject = this.data.subject;
    post.subContent = this.data.subContent;
    post.allowShare = this.data.allowShare;
    post.createPost = this.data.createPost;
    post.contents = this.data.contents;
    post.permissions = this.data.permissions;
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'UpdatePostAsync',
        [post]
      )
      .subscribe(async (res: any) => 
      {
        if (res) 
        {
          this.data = res;
          if (this.fileUpload.length > 0) //check thay đổi file
          { 
            this.deleteFileByObjectID(this.fileDelete);
            this.codxATM.objectId = this.data.recID;
            this.codxATM.fileUploadList = this.fileUpload;
            (await (this.codxATM.saveFilesObservable())).subscribe((res2: any) => {
              if (res2) 
              {
                this.dialogRef.close(this.data);
              }
            });
          }
          else 
          {
            this.dialogRef.close(this.data);
          }
        }
        else
        {
          this.notifSV.notifyCode("SYS021");
        }
      });
  }
  clickReleasePost() {
    if (!this.data.category) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Loại bài viết");
      this.notifSV.notify(mssgCode);
      return;
    }
    if(!this.data.startDate){
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Ngày bắt đầu");
      this.notifSV.notify(mssgCode);
      return;
    }
    if(this.data.endDate) // check endDate
    {
      let startDate = new Date(this.data.startDate);
      let endDate = new Date(this.data.endDate);
      if(startDate > endDate){
        return this.notifSV.notify("Ngày kết thúc phải lớn hơn ngày bắt đầu");  
      }
    }
    if (!this.data.subject) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Tiêu đề");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (!this.data.subContent) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Mô tả");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (this.data.newsType == this.NEWSTYPE.POST && !this.data.contents) 
    {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Nội dung");
      this.notifSV.notify(mssgCode);
      return;
    }
    this.api.execSv( 
      "WP",
      "ERM.Business.WP",
      "NewsBusiness",
      "SubmitNewsAsync",
      [this.data.recID])
      .subscribe((res:any[]) => {
        if(res && res[0] && res[1])
        {
          this.data = res[1];
          this.dialogRef.close(this.data);
        }
      });
    
  }
  deleteFileByObjectID(lstFileID: string[]) {
    if (lstFileID.length > 0) 
    {
      debugger
      this.api.execSv(
        "DM",
        "ERM.Business.DM",
        "FileBussiness",
        "DeleteFilesAsync",
        [lstFileID])
        .subscribe();
    }
  }

  valueChange(event: any) {
    if(event?.field){
      let field = event.field;
      let value = event.data;
      switch(field){
        case "Tags":
          this.data.tags = value;
          break;
        case "Category":
          this.data.category = value;
          break;
        case "StartDate":
          this.data.startDate = new Date(value.fromDate);
          break;
        case "EndDate":
          this.data.endDate = new Date(value.fromDate);
          break;
        case "Subject":
          this.data.subject = value;
          break;
        case "SubContent":
          this.data.subContent = value;
          break;
        case "AllowShare":
          this.data.allowShare = value;
          break;
        case "CreatePost":
          this.data.createPost = value;
          break;
        case "Contents":
          this.data.contents = value;
          break;
        default:
          break;  
      }
      this.changedt.detectChanges();
    }
  }
  eventApply(event: any) {
    if (event) {
      this.data.shareControl = event[0].objectType;
      this.getValueShare(this.data.shareControl, event);
    }
  }
  getValueShare(shareControl: string, data: any[] = []) {
    if (shareControl && data.length > 0) {
      let permissions = [];
      switch (shareControl) {
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
          data.forEach((x: any) => {
            let p = {
              memberType : this.MEMBERTYPE.SHARE,
              objectType : x.objectType,
              objectID : x.id,
              objectName : x.text
            }
            permissions.push(p);
          });
          if (data.length > 1) {
            this.cache.message('WP002').subscribe((mssg: any) => {
              if (mssg)
              {
                this.data.shareName = Util.stringFormat(mssg.defaultName, '<b>' + data[0].text + '</b>', data.length - 1,data[0].objectName);
                this.data.permissions = permissions;  
              }
            });
          }
          else {
            this.cache.message('WP001').subscribe((mssg: any) => {
              if (mssg)
              {
                this.data.shareName = Util.stringFormat(mssg.defaultName, '<b>' + data[0].text + '</b>');
                this.data.permissions = permissions;  
              }
            });
          } 
          break;
        default: 
      }
      this.changedt.detectChanges();
    }
  }
  addFile(files: any) 
  {
    if (files && files.data.length > 0) {
      let file = files.data[0];
      if(this.extensions === 'image') // file image
      {
        if (file.mimeType.includes("image")) 
        {
          file['referType'] = this.FILE_REFERTYPE.IMAGE;
          this.fileUpload.push(file);
          this.fileDelete.push(this.fileImage.recID);
          this.fileImage = {...file};
          this.changedt.detectChanges();
        }
        else this.notifSV.notify("Vui lòng chọn file image.");
      }
      else if(this.extensions === "video") // file video
      {
        if(file.mimeType.includes("video")) 
        {
          file['referType'] = this.FILE_REFERTYPE.VIDEO;
          this.fileUpload.push(file);
          this.fileDelete.push(this.fileVideo.recID);
          this.fileVideo = {...file};
          this.changedt.detectChanges();
        }
        else this.notifSV.notify("Vui lòng chọn file video.");
      }
    }
  }
  clickUploadFile(extensions:string = "image") 
  {
    this.extensions = extensions === "image" ? "image" : "video";  
    this.codxATM.uploadFile();
  }

  clickClosePopup() {
    this.dialogRef.close();
  }
}
