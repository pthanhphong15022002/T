import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Permission } from '@shared/models/file.model';
import { preRender } from '@syncfusion/ej2-angular-buttons';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { dataValidate } from '@syncfusion/ej2-angular-spreadsheet';
import { ViewModel, ViewsComponent, ImageViewerComponent, ApiHttpService, AuthService, DialogData, ViewType, DialogRef, NotificationsService, CallFuncService, Util, CacheService } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { environment } from 'src/environments/environment';
import { WP_Comments } from '../../../models/WP_Comments.model';
import { WP_News } from '../../../models/WP_News.model';

@Component({
  selector: 'lib-popup-add',
  templateUrl: './popup-add.component.html',
  styleUrls: ['./popup-add.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PopupAddComponent implements OnInit {
  
  user: any = null;
  objectID:string = '';
  dialogData: any;
  dialogRef: DialogRef = null;
  newsType: any;
  shareControl: string = "9"; // default everyone
  mssgCodeNoty:any = null;
  fileUpload: any[] = [];
  fileImage: any = null;
  fileVideo: any = null;
  shareIcon: string = "";
  shareText: string = "";
  shareWith: string = "";
  dVLL:any = {};
  permissions: Permission[] = [];
  messageImage: string = "";
  data:WP_News = null;  
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

  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('viewbase') viewbase: ViewsComponent;
  @ViewChild('codxATM') codxATM: AttachmentComponent;
  @ViewChild('codxATMVideo') codxATMVideo: AttachmentComponent;
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
    this.newsType = dd.data;
    this.dialogRef = dialogRef;
    this.user = auth.userValue;
  }
  ngAfterViewInit(): void {
  }


  ngOnInit(): void {
    this.data = new WP_News();
    this.data.newsType = this.newsType;
    this.data.shareControl = "9";
    this.setDataDefault();
  }


  setDataDefault() {
    this.cache.message('WP017').subscribe((mssg: any) => {
      if(mssg?.defaultName){
        this.messageImage = mssg.defaultName;
      }
    });
    this.cache.message("SYS009").subscribe((mssg: any) => {
      if(mssg){
        this.mssgCodeNoty = mssg;
      }
    });
  }

  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  clickInsertNews() {
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
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'InsertNewsAsync',
        [this.data]
      ).subscribe(async (res:boolean) => {
        if (res) {
          if (this.fileUpload.length > 0) {
            this.codxATM.objectId = this.data.recID;
            this.codxATM.fileUploadList = this.fileUpload;
            (await this.codxATM.saveFilesObservable()).subscribe((res2: any) => {
                if (res2) {
                  this.dialogRef.close();
                }
              }
            );
          }
          else 
          {
            this.dialogRef.close();
          }
        }
      });
  }
  releaseNews() {
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'ReleaseNewsAsync',
        [this.data]
      ).subscribe(async (res:any[]) => {
        if (res) {
          let checkApproval = res[0];
          let result = res[1];
          if (this.fileUpload.length > 0 && result?.recID) {
            this.codxATM.objectId = result.recID;
            this.codxATM.fileUploadList = this.fileUpload;
            (await this.codxATM.saveFilesObservable()).subscribe(
              (res2: any) => {
                if (res2) {
                  if(checkApproval)
                  {
                    this.dialogRef.close();
                  }
                  else
                  {
                    this.dialogRef.close(result);
                  }
                }
              }
            );
          }
          else
          {
            if(checkApproval)
            {
              this.dialogRef.close();
            }
            else
            {
              this.dialogRef.close(result);
            }
          }
        }
      });
  }
  valueChange(event: any) {
    if(event)
    {
      let field = event.field;
      let value = event.data;
      switch(field)
      {
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
    if (event) 
    {
      this.data.shareControl = event[0].objectType;
      this.getValueShare(this.data.shareControl, event);
    }
  }
  getValueShare(shareControl: string, data: any[] = null) {
    debugger
    if (shareControl && data.length > 0) 
    {
      let permissions:any[] = [];
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
            let p = new Permission();
            p.memberType = this.MEMBERTYPE.SHARE;
            p.objectType = x.objectType;
            p.objectID = x.id;
            p.objectName = x.text;
            permissions.push(p);
          });
          if (data.length > 1) 
          {
            this.cache.message('WP002').subscribe((mssg: any) => {
              if (mssg)
              {
                this.data.shareName = Util.stringFormat(mssg.defaultName, '<b>' + data[0].text + '</b>', data.length - 1,data[0].objectName);
                this.data.permissions = permissions;
              }
            });
          }
          else 
          {
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
    }
    this.changedt.detectChanges();
  }
  addFiles(files: any) {
    if (files && files.data.length > 0) {
      files.data.forEach(f => {
        if (f.mimeType.indexOf("image") >= 0) {
          f['referType'] = this.FILE_REFERTYPE.IMAGE;
          this.fileImage = f;
        }
        else if (f.mimeType.indexOf("video") >= 0) {
          f['referType'] = this.FILE_REFERTYPE.VIDEO;
          this.fileVideo = f;
        }
        else
        {
          this.notifSV.notify("Vui lòng chọn file hình ảnh hoặc video");
          return;
        }
        this.fileUpload.push(f);
      });
      
      this.changedt.detectChanges();
    }
  }
  clickClosePopup() {
    this.dialogRef.close();
  }
  clickUploadImage() {
    this.codxATM.uploadFile();
  }
  clickUploadVideo() {
    this.codxATM.uploadFile();
  }

}
