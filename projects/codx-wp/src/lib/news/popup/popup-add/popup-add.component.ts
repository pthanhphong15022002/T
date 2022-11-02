import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['./popup-add.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PopupAddComponent implements OnInit {
  
  user: any = null;
  objectID:string = '';
  dialogData: any;
  dialogRef: DialogRef = null;
  isVideo:boolean = true;
  newsType: any;
  formGroup: FormGroup = null;
  startDate: Date;
  endDate: Date;
  tagName:string = "";
  objectType:string = "";
  shareControl: string = "";
  mssgCodeNoty:any = null;
  fileUpload: any[] = [];
  fileImage: any = null;
  fileVideo: any = null;
  shareIcon: string = "";
  shareText: string = "";
  shareWith: string = "";
  permissions: Permission[] = [];
  messageImage: string = "";
  paramerters:any = null;
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
    private dmSV: CodxDMService,
    @Optional() dd?: DialogData,
    @Optional() dialogRef?: DialogRef

  ) {
    this.newsType = dd.data;
    if (this.newsType != this.NEWSTYPE.POST) {
      this.isVideo = false;
    }
    this.dialogRef = dialogRef;
    this.user = auth.userValue;
  }
  ngAfterViewInit(): void {
  }


  ngOnInit(): void {
    this.getMessage("SYS009")
    this.setDataDefault();
  }


  setDataDefault() {
    this.cache.valueList('L1901').subscribe((vll: any) => {
      let modShare = vll.datas.find((x: any) => x.value == this.SHARECONTROLS.EVERYONE);
      this.shareIcon = modShare.icon;
      this.shareText = modShare.text;
      this.shareControl = this.SHARECONTROLS.EVERYONE;
    });
    let formName = "WPParameters";
    let category = "1";
    this.initForm();
  }

  getParameterAsync(formName:string, category:string){
    if(formName && category){
      this.api.execSv("SYS","ERM.Business.SYS","SettingValuesBusiness","GetParameterAsync",[formName,category])
      .subscribe((res:any) => {
        if(res){
          let jsParam = JSON.parse(res);
          console.log(jsParam);
          this.paramerters = res;
        }
      })
    }
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
      AllowShare: new FormControl(false),
      CreatePost: new FormControl(false),
    });
  }
  getMessage(mssCode:string){
    this.cache.message(mssCode).subscribe((mssg: any) => {
      if(mssg){
        this.mssgCodeNoty = mssg;
      }
    });
  }
  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  clickInsertNews() {
    if (!this.formGroup.controls['Category'].value) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Loại bài viết");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (!this.formGroup.controls['Subject'].value) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Tiêu đề");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (!this.formGroup.controls['SubContent'].value) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Mô tả");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (this.newsType == this.NEWSTYPE.POST && !this.formGroup.controls['Contents'].value) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Nội dung");
      this.notifSV.notify(mssgCode);
      return;
    }
    let data = new WP_News();
    data = this.formGroup.value;
    data.recID = Util.uid();
    data.newsType = this.newsType;
    data.shareControl = this.shareControl;
    data.permissions = this.permissions;
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'InsertNewsAsync',
        [data]
      ).subscribe(async (res:boolean) => {
        if (res) {
          if (this.fileUpload.length > 0) {
            this.codxATM.objectId = data.recID;
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
    if (!this.formGroup.controls['Category'].value) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Loại bài viết");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (!this.formGroup.controls['Subject'].value) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Tiêu đề");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (!this.formGroup.controls['SubContent'].value) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Mô tả");
      this.notifSV.notify(mssgCode);
      return;
    }
    if (this.newsType == this.NEWSTYPE.POST && !this.formGroup.controls['Contents'].value) {
      let mssgCode = Util.stringFormat(this.mssgCodeNoty.defaultName, "Nội dung");
      this.notifSV.notify(mssgCode);
      return;
    }
    let data = new WP_News();
    data = this.formGroup.value;
    data.recID = Util.uid();
    data.newsType = this.newsType;
    data.shareControl = this.shareControl;
    data.permissions = this.permissions;
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'ReleaseNewsAsync',
        [data]
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
    if (!event || !event.field || !event.data) {
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
      this.shareControl = event[0].objectType;
      this.getValueShare(this.shareControl, event);
    }
  }
  getValueShare(shareControl: string, data: any[] = null) {
    let listPermission = data;
    this.cache.valueList('L1901').subscribe((vll: any) => {
      if(vll){
        let modShare = vll.datas.find((x: any) => x.value == shareControl);
        this.shareControl = shareControl;
        this.shareIcon = modShare.icon;
        this.shareText = modShare.text;
        if (listPermission) {
          this.permissions = []
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
                this.permissions.push(p);
              });
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
    });
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
  addFiles(files: any) {
    if (files && files.data.length > 0) {
      files.data.map(f => {
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
