import { ChangeDetectorRef, Component, EventEmitter, OnInit, Optional, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { ViewsComponent, ApiHttpService, AuthService, DialogData, ViewType, DialogRef, NotificationsService, CallFuncService, Util, CacheService } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
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
  shareControl: string = "";
  mssgCodeNoty:any = null;
  fileUpload: any[] = [];
  fileImage: any = null;
  fileVideo: any = null;
  dVLL:any = {};
  permissions: Permission[] = [];
  messageImage: string = "";
  data:WP_News = null;  
  grvSetup:any = {};
  arrFieldRequire:any[] = [];
  headerText:string = "";
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
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.newsType = dialogData.data;
    this.dialogRef = dialogRef;
    this.user = auth.userValue;
  }
  ngOnInit(): void {
    this.setDataDefault();
  }
  ngAfterViewInit(): void {
  }
  // set data
  setDataDefault() {
    this.data = new WP_News();
    this.data.newsType = this.newsType;
    this.data.shareControl = "9";
    this.cache.message('WP017').subscribe((mssg: any) => {
      if(mssg?.customName){
        this.messageImage = mssg.customName;
      }
    });
    this.cache.functionList(this.dialogRef.formModel.funcID)
    .subscribe((func:any) => {
      if(func){
        this.headerText = `Thêm ${func.customName}`;
        let formName = func.formName;
        let grvName = func.gridViewName;
        this.cache.gridViewSetup(formName, grvName)
        .subscribe((grv:any) => {
          if(grv){
            this.grvSetup = grv;
              let arrField =  Object.values(grv).filter((x:any) => x.isRequire);
              if(arrField){
                this.arrFieldRequire = arrField.map((x:any) => x.fieldName);
              }
          }
        });
      }
    });
  }
  // open popup share
  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  loading:boolean = false;
  // insert post
  clickInsertNews(){
    this.loading = true;
    if(this.arrFieldRequire.length > 0)
    {
      let arrFieldUnValid:string = "";
      this.arrFieldRequire.forEach((field) => {
        let key = Util.camelize(field);
        if (!this.data[key])
        {
          arrFieldUnValid += this.grvSetup[field]['headerText'] + ";";
        }
      });
      if(arrFieldUnValid) return this.notifSV.notifyCode("SYS009",0,arrFieldUnValid);
    }
    if(this.data.endDate) // check endDate
    {
      let startDate = new Date(this.data.startDate);
      let endDate = new Date(this.data.endDate);
      if(startDate > endDate) return this.notifSV.notifyCode('WP012');  
    }
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'InsertNewsAsync',
        [this.data])
        .subscribe(async (res:boolean) => {
        if (res) {
          debugger
          if (this.fileUpload.length > 0) {
            this.codxATM.objectId = this.data.recID;
            this.codxATM.fileUploadList = JSON.parse(JSON.stringify(this.fileUpload));
            this.codxATM.saveFilesMulObservable().subscribe((res2: any) => {
              this.loading = false;
              this.dialogRef.close();
              }
            );
          }
          else 
          {
            this.loading = false;
            this.dialogRef.close();
          }
        }
        else
        {
          this.loading = false;
          this.dialogRef.close();
        }
      });
  }
  // release post
  releaseNews() {
    if(this.arrFieldRequire.length > 0)
    {
      let arrFieldUnValid:string = "";
      this.arrFieldRequire.forEach((field) => {
        let key = Util.camelize(field);
        if (!this.data[key])
        {
          arrFieldUnValid += this.grvSetup[field]['headerText'] + ";";
        }
      });
      if(arrFieldUnValid) return this.notifSV.notifyCode("SYS009",0,arrFieldUnValid);
    }
    if(this.data.endDate) // check endDate
    {
      let startDate = new Date(this.data.startDate);
      let endDate = new Date(this.data.endDate);
      if(startDate > endDate) return this.notifSV.notifyCode('WP012');  
    }
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'ReleaseNewsAsync',
        [this.data])
        .subscribe(async (res:any[]) => {
        if (res) {
          let data = res[1];
          if (this.fileUpload.length) {
            this.codxATM.objectId = data.recID;
            this.codxATM.fileUploadList = this.fileUpload;
            (await this.codxATM.saveFilesObservable()).subscribe(
              (res2: any) => {
                if (res2) 
                {
                  this.dialogRef.close(data);
                }
              }
            );
          }
          else
          {
            this.dialogRef.close(data);
          }
        }
        else
        {
          this.dialogRef.close();
        }
      });
  }
  valueChange(event: any) {
    if(event){
      let field = event.field;
      let value = event.data;
      field = field[0].toLowerCase() + field.slice(1);
      if(field === "startDate" ||  field == "endDate"){
        value = value.toDate;
      }
      this.data[field] = value;
    }
  }
  eventApply(event: any) {
    if (event){
      this.data.shareControl = event[0].objectType;
      this.getValueShare(this.data.shareControl, event);
    }
  }
  getValueShare(shareControl: string, data: any[] = null) {
    if (shareControl && data.length > 0){
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
  // attachment return files
  addFiles(files: any) {
    debugger
    if (files.data){
      let file = files.data[0]; 
      if(file.mimeType.indexOf("image") >= 0){
        file["source"] = file.avatar;
        file['referType'] = this.FILE_REFERTYPE.IMAGE;
        this.fileImage = JSON.parse(JSON.stringify(file));
      }
      // else if (file.mimeType.indexOf("video") >= 0) {
      //   file['referType'] = this.FILE_REFERTYPE.VIDEO;
      //   this.fileVideo = JSON.parse(JSON.stringify(file));
      // }
      if(this.fileUpload.length > 0){
        let index = this.fileUpload.findIndex(x => x['referType'] === file['referType'])
        if(index != -1)
          this.fileUpload[index] = file;
        else
          this.fileUpload.push(file);
      }
      else
      {
        this.fileUpload.push(file);
      }
      this.data.image = this.fileUpload.length;
      this.changedt.detectChanges();
    }
  }
  // attachment return files
  addFilesVideo(files: any) {
    if (files.data){
      let file = files.data[0]; 
      if (file.mimeType.indexOf("video") >= 0) {
        file['referType'] = this.FILE_REFERTYPE.VIDEO;
        file['source'] = file.data.changingThisBreaksApplicationSecurity;
        this.fileVideo = JSON.parse(JSON.stringify(file));
      }
      if(this.fileUpload.length > 0){
        let index = this.fileUpload.findIndex(x => x['referType'] === this.FILE_REFERTYPE.VIDEO)
        if(index != -1)
          this.fileUpload[index] = file;
        else
          this.fileUpload.push(file);
      }
      else
      {
        this.fileUpload.push(file);
      }
      this.data.image = this.fileUpload.length;
      this.changedt.detectChanges();
    }
  }
  //close popup
  clickClosePopup() {
    this.dialogRef.close();
  }
  clickUploadImage() {
    this.codxATM.uploadFile();
  }
  clickUploadVideo() {
    this.codxATMVideo.uploadFile();
  }

}
