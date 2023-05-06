import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { ViewsComponent, ApiHttpService, AuthService, DialogData, ViewType, DialogRef, NotificationsService, CallFuncService, Util, CacheService } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { WP_News } from '../../../models/WP_News.model';
import moment from 'moment';

@Component({
  selector: 'lib-popup-add',
  templateUrl: './popup-add.component.html',
  styleUrls: ['./popup-add.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PopupAddComponent implements OnInit {
  
  user: any = null;
  dialogData: any;
  dialogRef: DialogRef = null;
  newsType: any;
  mssgCodeNoty:any = null;
  fileUpload: any[] = [];
  fileImage: any = null;
  fileVideo: any = null;
  dVLL:any = {};
  permissions: Permission[] = [];
  messageImage: string = "";
  data:WP_News = null;  
  function:any = null;

  grvSetup:any = {};
  arrFieldRequire:any[] = [];
  headerText:string = "";
  loading:boolean = false;
  action:string = "";
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
    this.dialogRef = dialogRef;
    this.action = dialogData.data.action;
    this.newsType = dialogData.data.type;
    this.user = auth.userValue;
  }
  ngOnInit(): void {
    this.setDataDefault();
    this.cache.functionList(this.dialogRef.formModel.funcID)
    .subscribe((func:any) => {
      if(func){
        this.function = func;
        this.headerText = `Thêm ${ this.function.defaultName}`;
        this.cache.gridViewSetup(this.function.formName, this.function.gridViewName)
        .subscribe((grv:any) => {
          if(grv){
            this.grvSetup = grv;
            let arrField =  Object.values(grv).filter((x:any) => x.isRequire);
            if(Array.isArray(arrField)){
              this.arrFieldRequire = arrField.map((x:any) => x.fieldName);
            }
          }
        });
      }
    });
    
  }
  ngAfterViewInit(): void {
  }
  // set data
  setDataDefault() {
    this.data = new WP_News();
    this.data.newsType = this.newsType;
    this.cache.message('WP017').subscribe((mssg: any) => {
      if(mssg?.defaultName){
        this.messageImage = mssg.defaultName;
      }
    });
  }
  // open popup share
  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  // insert post
  clickInsertNews(){
    debugger
    if(this.checkValidate()){
      return;
    }
    this.loading = true;
    if(this.fileUpload.length > 0){
      this.codxATM.objectId = this.data.recID;
      this.codxATM.fileUploadList = Array.from<any>(this.fileUpload);
      this.codxATM.saveFilesMulObservable()
      .subscribe((res: any) => {
        if(res){
          this.api.execSv(
            'WP',
            'ERM.Business.WP',
            'NewsBusiness',
            'InsertNewsAsync',
            [this.data]).subscribe((res2) => {
              this.loading = false;
              this.dialogRef.close(res2 ? this.data : null);
            });
        }
        else
        {
          this.loading = false;
          this.dialogRef.close();
        }
      });
    }
  }
  // release post
  releaseNews() {
    debugger
    if(this.checkValidate()){
      return;
    }
    this.loading = true;
    if(this.fileUpload.length > 0){
      this.codxATM.objectId = this.data.recID;
      this.codxATM.fileUploadList = Array.from<any>(this.fileUpload);
      this.codxATM.saveFilesMulObservable()
      .subscribe((res: any) => {
        if(res){
          this.api.execSv(
            'WP',
            'ERM.Business.WP',
            'NewsBusiness',
            'ReleaseNewsAsync',
            [this.data])
            .subscribe((res2:any) => {
              this.loading = false;
              this.dialogRef.close(res2);
            });
        }
        else
        {
          this.loading = false;
          this.dialogRef.close();
        }
      });
    }
  }
  // check validate
  checkValidate(){
    if(this.arrFieldRequire.length > 0){
      let arrFieldUnValid:string = "";
      this.arrFieldRequire.forEach((key) => {
        let field = Util.camelize(key);
        if (!this.data[field])
        {
          arrFieldUnValid += this.grvSetup[key]['headerText'] + ";";
        }
      });
      if(arrFieldUnValid){
        this.notifSV.notifyCode("SYS009",0,arrFieldUnValid);
        return true;
      }
    }
    return false;
  }
  // value change
  valueChange(event: any) {
    if(event){
      let field = Util.camelize(event.field);
      let value = event.data;
      if((typeof value) == 'object'){
        value = value.fromDate;
        if(this.data["startDate"] && this.data["endDate"] && this.data["startDate"] > this.data["endDate"]){
          this.data[field] = null;
          this.notifSV.notifyCode('WP012');
          return;
        }
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
    if (Array.isArray(files.data)){
      let file = files.data[0]; 
      if(file.mimeType.indexOf("image") >= 0){
        file['referType'] = this.FILE_REFERTYPE.IMAGE;
        this.fileImage = JSON.parse(JSON.stringify(file));
        this.fileImage["source"] = file.avatar;
      }
      else if(file.mimeType.indexOf("video") >= 0){
        file['referType'] = this.FILE_REFERTYPE.VIDEO;
        this.fileVideo = JSON.parse(JSON.stringify(file));
        this.fileVideo['source'] = file.data.changingThisBreaksApplicationSecurity;
      }
      let index = this.fileUpload.findIndex(x => x['referType'] === file['referType'])
      if(index != -1)
          this.fileUpload[index] =  JSON.parse(JSON.stringify(file));
      else
        this.fileUpload.push(file);
      this.data.image = this.fileUpload.length;
      this.changedt.detectChanges();
    }
  }
  //upload image
  clickUploadImage() {
    this.codxATM.uploadFile();
  }
  //upload video
  clickUploadVideo() {
    this.codxATMVideo.uploadFile();
  }

  //close popup
  clickClosePopup() {
    this.dialogRef.close();
  }

}
