import { ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { ViewsComponent, ApiHttpService, AuthService, DialogData, ViewType, DialogRef, NotificationsService, CallFuncService, Util, CacheService, ImageViewerComponent, AuthStore } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { WP_News } from '../../../models/WP_News.model';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { map } from 'rxjs';
import { Base64 } from '@syncfusion/ej2-angular-documenteditor';

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
  fileUpload: any[] = [];
  fileImage: any = null;
  fileVideo: any = null;
  messageImage: string = "";
  data:any = null;  
  function:any = null;
  grvSetup:any = null;
  arrFieldRequire:any[] = [];
  headerText:string = "";
  loading:boolean = false;
  isAdd:boolean = true;
  defaultImgSrc:string = "../assets/themes/wp/default/img/upload_image.svg"; 
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
    NEW: '1',
    REDO: '2',
    SUBMITED: '3',
    REJECTED: '4',
    APPROVETED: '5',
    CANCELLED: '6',
  };
  @ViewChild('codxATMImage') codxATMImage: AttachmentComponent;
  @ViewChild('codxATMVideo') codxATMVideo: AttachmentComponent;
  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private notifSV: NotificationsService,
    private changedt: ChangeDetectorRef,
    private callFunc: CallFuncService,
    private codxShareSV: CodxShareService,
    private cache: CacheService,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.dialogRef = dialogRef;
    this.headerText = dialogData.data.action;
    this.isAdd = dialogData.data.isAdd;
    this.data = JSON.parse(JSON.stringify(dialogData.data.data));
    this.user = auth.get();
    
  }
  ngOnInit(): void {
    debugger
    if(this.isAdd)
    {
      this.data.createdBy = this.user.userID;
      this.data.createdName = this.user.userName;
    }
    else
    {
      this.getPostInfo(this.data.recID);
      this.getFileByObjectID(this.data.recID);
    }
    this.cache.functionList("WPT02")
    .subscribe((func:any) => {
      if(func){
        this.function = func;
        this.headerText += " " + func.defaultName;
        this.cache.gridViewSetup(func.formName, func.gridViewName)
        .subscribe((grv:any) => {
          if(grv){
            this.grvSetup = grv;
            let arrField =  Object.values(grv).filter((x:any) => x.isRequire);
            if(Array.isArray(arrField))
              this.arrFieldRequire = arrField.map((x:any) => x.fieldName);
          }
          this.changedt.detectChanges();
        });
      }
    });
    this.getMessageDefault();
    
  }
  ngAfterViewInit(): void {
  }

  getPostInfo(recID:string)
  {
    if(recID)
    {
      this.api.execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'GetPostByIDAsync',
        [recID]).subscribe((res:any) => {
          this.data = res;
          this.changedt.detectChanges();
        });
    }
  }
  // set data
  getMessageDefault() {
    this.cache.message('WP017')
    .subscribe((mssg: any) => {
      if(mssg){
        this.messageImage = mssg.defaultName;
      }
    });
  }
  //close popup
  clickClosePopup() {
    debugger
    this.dialogRef.close();
  }
  // open popup share
  openControlShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }

  // insert post
  clickInsert(){
    debugger
    if(this.checkValidate()){
      return;
    }
    this.loading = true;
    this.data.image = this.fileUpload.length;
    this.codxATMImage.fileUploadList = Array.from<any>(this.fileUpload);
    this.codxATMImage.saveFilesMulObservable()
    .subscribe((res1: any) => {
      debugger
      if(res1.status != 0)
      {
        let fileNames = "";
        this.fileUpload.forEach(x => fileNames += `${x.fileName};`);
        this.notifSV.notifyCode("DM006",0,fileNames);
      }
      this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'NewsBusiness',
      'InsertAsync',
      [this.data])
      .subscribe((res2:boolean) => {
        this.notifSV.notifyCode( res2 ? "WP024" : "WP013");
        this.dialogRef.close(res2);
      });
    });
  }
  // release post
  clickRelease() {
    debugger
    if(this.checkValidate()) return;
    this.loading = true;
    if(this.fileUpload.length > 0)
    {
      this.codxATMImage.fileUploadList = Array.from<any>(this.fileUpload);
      this.codxATMImage.saveFilesMulObservable()
      .subscribe((res: any) => {
        debugger
        if(res.status != 0)
        {
          let fileNames = this.fileUpload.map(x => x.fileName).join(";");
          this.notifSV.notifyCode("DM006",0,fileNames);
        }
        this.releasePost(this.data)
        .subscribe((res2:any) => {
          this.loading = false;
          this.notifSV.notifyCode(res2 ? "WP024" : "WP013");
          this.dialogRef.close(res2);
        });
      });
    }
    else
    {
      this.releasePost(this.data).subscribe((res:any) => {
        this.loading = false;
        this.dialogRef.close(res);
      });
    }
  }

  releasePost(post:any){
    return this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'NewsBusiness',
      'ReleaseNewsAsync',
      [post])
      .pipe(map((res:any) => res));
  }
  // check validate
  checkValidate(){
    if(this.arrFieldRequire.length > 0)
    {
      let arrFieldUnValid:string = "";
      this.arrFieldRequire.forEach((key) => {
        if (!this.data[Util.camelize(key)])
          arrFieldUnValid += this.grvSetup[key]['headerText'] + ";";
      });
      if(arrFieldUnValid)
      {
        this.notifSV.notifyCode("SYS009",0,arrFieldUnValid);
        return true;
      }
    }
    return false;
  }
  // value change
  valueChange(event: any) {
    debugger
    if(event){
      let field = Util.camelize(event.field);
      let value = event.data;
      if(field === 'startDate' || field === 'endDate'){
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
    if (Array.isArray(event)) {
      let dataSeleted = Array.from<any>(event);
      let lstPermision = [];
      let fisrtPermission = dataSeleted[0];
      let shareControl = dataSeleted[0].objectType
      this.data.shareControl = fisrtPermission.objectType;
      if (!Array.isArray(this.data.permissions)) this.data.permissions = [];
      else
        this.data.permissions = this.data.permissions.filter(
          (e: any) => e.memberType != this.MEMBERTYPE.SHARE
        );
      switch (shareControl) {
        case this.SHARECONTROLS.OWNER:
          break;
        case this.SHARECONTROLS.EVERYONE:
        case this.SHARECONTROLS.MYGROUP:
        case this.SHARECONTROLS.MYTEAM:
        case this.SHARECONTROLS.MYDEPARMENTS:
        case this.SHARECONTROLS.MYDIVISION:
        case this.SHARECONTROLS.MYCOMPANY:
          let permission = new Permission();
          permission.memberType = this.MEMBERTYPE.SHARE;
          permission.objectID = "";
          permission.objectName = "";
          permission.objectType = this.data.shareControl;
          lstPermision.push(permission);
          this.data.permissions = lstPermision;
          this.data.shareName = '';
          break;
        case this.SHARECONTROLS.OGRHIERACHY:
        case this.SHARECONTROLS.DEPARMENTS:
        case this.SHARECONTROLS.POSITIONS:
        case this.SHARECONTROLS.ROLES:
        case this.SHARECONTROLS.GROUPS:
        case this.SHARECONTROLS.USER:
          dataSeleted.forEach((x) => {
            let p = new Permission();
            p.memberType = this.MEMBERTYPE.SHARE;
            p.objectID = x.id;
            p.objectName = x.text;
            p.objectType = x.objectType;
            this.data.permissions.push(p);
          });
          // WP001 chia sẻ 1 - WP002 chia sẻ nhiều người
          let mssgCodeShare = dataSeleted.length == 1 ? 'WP001' : 'WP002';
          this.cache.message(mssgCodeShare).subscribe((mssg: any) => {
            if (mssg) {
              if (dataSeleted.length == 1) {
                // chia sẻ 1 người
                this.data.shareName = Util.stringFormat(
                  mssg.defaultName,
                  `<b>${fisrtPermission.text}</b>`
                );
              } else {
                // chia sẻ nhiều người
                let count = dataSeleted.length - 1;
                let type = fisrtPermission.objectName;
                this.data.shareName = Util.stringFormat(
                  mssg.defaultName,
                  `<b>${fisrtPermission.text}</b>`,
                  count,
                  type
                );
              }
            }
          });
          break;
        default:
          break;
      }
      this.changedt.detectChanges();
    }
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
  //click upload file
  clickUpload(type:string)
  {
    type == 'image' ? this.codxATMImage.uploadFile() : this.codxATMVideo.uploadFile();;
  }

  //update
  clickUpdate() {
    debugger
    if(this.checkValidate()) return;
    this.loading = true;
    if(this.fileUpload.length > 0)
    {
      this.codxATMImage.fileUploadList = Array.from<any>(this.fileUpload);
      this.codxATMImage.saveFilesMulObservable()
      .subscribe((res:any) => {
        debugger
        if(res.status != 0)
        {
          let fileNames = this.fileUpload.map(x => x.fileName).join(";");
          this.notifSV.notifyCode("DM006",0,fileNames);
        }
        this.updatePost(this.data)
        .subscribe((res2:any) => {
          this.loading = false;
          this.notifSV.notifyCode(res ? "SYS007" : "SYS021");
          this.dialogRef.close(res2);
        });
      });
    }
    else
    {
      this.updatePost(this.data)
      .subscribe((res:any) => {
        this.loading = false;
        this.notifSV.notifyCode(res ? "SYS007" : "SYS021");
        this.dialogRef.close(res);
      });
    }
  }


  updatePost(post:any){
    return this.api
    .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'UpdateAsync', [post])
    .pipe(map((res:any) => res));
  }
  // get file by objectID
  getFileByObjectID(objectID: string) {
    this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        [objectID])
        .subscribe((res: any[]) => {
        if (res?.length > 0) {
          res.forEach((f: any) => {
            if (f.referType == this.FILE_REFERTYPE.IMAGE) {
              f["source"] = this.codxShareSV.getThumbByUrl(f.url,300);
              this.fileImage = f;
            }
            if (f.referType == this.FILE_REFERTYPE.VIDEO) {
              f['source'] = `${environment.urlUpload}` + '/' + f.url;
              this.fileVideo = f;
            }
          });
          this.changedt.detectChanges();
        }
      });
  }


  //check base 64
  removeBase64(){
    let strUrl = "";
    let isBase64 = Base64
  }
  
}
