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
    @Optional() dd?: DialogData,
    @Optional() dialogRef?: DialogRef

  ) {
    this.newsType = dd.data;
    this.dialogRef = dialogRef;
    this.user = auth.userValue;
  }



  ngOnInit(): void {
    this.setDataDefault();
  }
  ngAfterViewInit(): void {
  }

  setDataDefault() {
    debugger
    this.data = new WP_News();
    this.data.newsType = this.newsType;
    this.data.shareControl = "9";
    this.cache.message('WP017').subscribe((mssg: any) => {
      if(mssg?.customName){
        this.messageImage = mssg.customName;
      }
    });
    this.cache.functionList(this.dialogRef.formModel.funcID).subscribe((func:any) => {
      if(func){
        console.log(func);
        this.headerText = `Thêm ${func.customName}`;
        let formName = func.formName;
        let grvName = func.gridViewName;
        this.cache.gridViewSetup(formName, grvName)
        .subscribe((grv:any) => {
          if(grv){
            console.log(grv);
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

  openFormShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }
  clickInsertNews(){
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
          if (this.fileUpload.length > 0) {
            this.codxATM.objectId = this.data.recID;
            this.codxATM.fileUploadList = this.fileUpload;
            (await this.codxATM.saveFilesObservable()).subscribe((res2: any) => {
                if (res2) 
                {
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
        else
        {
          this.dialogRef.close();

        }
      });
  }
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
          let checkApproval = res[0];
          let data = res[1];
          if (this.fileUpload.length > 0 && data.recID) {
            this.codxATM.objectId = data.recID;
            this.codxATM.fileUploadList = this.fileUpload;
            (await this.codxATM.saveFilesObservable()).subscribe(
              (res2: any) => {
                if (res2) {
                  let result = checkApproval ? null : data
                  this.dialogRef.close(result);
                }
              }
            );
          }
          else
          {
            let result = checkApproval ? null : data
            this.dialogRef.close(result);
          }
        }
        else
        {
          this.dialogRef.close();
        }
      });
  }
  valueChange(event: any) {
    if(event)
    {
      let field = event.field;
      field = field[0].toLowerCase() + field.slice(1);
      let value = event.data;
      if(field === "startDate" ||  field == "endDate"){
        value = value.toDate;
      }
      this.data[field] = value;
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
          this.data['image'] = "1";
        }
        else if (f.mimeType.indexOf("video") >= 0) {
          f['referType'] = this.FILE_REFERTYPE.VIDEO;
          this.fileVideo = f;
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
