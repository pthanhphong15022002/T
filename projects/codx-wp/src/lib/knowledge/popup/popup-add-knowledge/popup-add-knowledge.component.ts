import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { DialogRef, ApiHttpService, AuthStore, NotificationsService, CallFuncService, CacheService, DialogData, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';
import { FILE_REFERTYPE, MEMBERTYPE, NEWSTYPE, SHARECONTROLS } from '../../models/Knowledge.model';
import { Subject, takeUntil } from 'rxjs';
import { WP_TagObjects } from '../../models/WP_TagObjects.model';

@Component({
  selector: 'wp4-popup-add-knowledge',
  templateUrl: './popup-add-knowledge.component.html',
  styleUrls: ['./popup-add-knowledge.component.css'],
  encapsulation: ViewEncapsulation.None,

})
export class PopupAddKnowledgeComponent implements OnInit, AfterViewInit,OnDestroy  {

  user: any = null;
  dialogData: any;
  dialogRef: DialogRef;
  fileUpload: any[] = [];
  fileImage: any = null;
  fileVideo: any = null;
  mssgWP017: string = "WP017";
  data: any = null;
  function: any = null;
  grvSetup: any = null;
  arrFieldRequire: any[] = [];
  headerText: string = '';
  actionType: "add" | "edit" = "add";
  MEMPERTYPE_SHARE = MEMBERTYPE.SHARE;
  defaultImgSrc: string = '../assets/themes/wp/default/img/upload_image.svg';
  NEWTYPE_POST = NEWSTYPE.POST;
  private destroy$ = new Subject<void>();

  @ViewChild('codxATMImage') codxATMImage: AttachmentComponent;
  @ViewChild('codxATMVideo') codxATMVideo: AttachmentComponent;
  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private notifSV: NotificationsService,
    private callFunc: CallFuncService,
    private codxShareSV: CodxShareService,
    private cache: CacheService,
    private detectorRef: ChangeDetectorRef,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) 
  {
    this.user = auth.get();
    this.dialogRef = dialogRef;
    if(dialogData?.data)
    {
      this.actionType = dialogData.data.actionType;
      this.data = JSON.parse(JSON.stringify(dialogData.data.data));
      if (this.actionType == "add") 
      {
        this.data.permissions = [];
        let owner = new WP_TagObjects();
        owner.objectID = this.user.userID;
        owner.objectName = this.user.userName;
        owner.objectType = "U";
        owner.memberType = MEMBERTYPE.CREATED;
        this.data.permissions.push(owner);
        if(this.data.shareControl == SHARECONTROLS.EVERYONE)
        {
          let erveryOne = new WP_TagObjects();
          erveryOne.objectType = "9";
          erveryOne.memberType = MEMBERTYPE.SHARE;
          this.data.permissions.push(erveryOne);
        }
      } 
      else if(this.actionType == "edit")
      {
        this.getPostByID(this.data.recID);
        this.getFileByObjectID(this.data.recID);
      }
    }
    this.cache.functionList('WPT02')
    .pipe(takeUntil(this.destroy$))
    .subscribe((func: any) => {
      if (func) 
      {
        this.function = func;
        if(this.actionType == "add")
          this.headerText = "Thêm " + func.customName;
        else if(this.actionType == "edit")
          this.headerText = "Cập nhật " + func.customName;
        this.cache
          .gridViewSetup(func.formName, func.gridViewName)
          .pipe(takeUntil(this.destroy$))
          .subscribe((grv: any) => {
            if (grv) {
              this.grvSetup = grv;
              let arrField = Object.values(grv).filter((x: any) => x.isRequire);
              if (Array.isArray(arrField))
                this.arrFieldRequire = arrField.map((x: any) => x.fieldName);
            }
            this.detectorRef.detectChanges();
          });
      }
    });
  }
 
  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPostByID(recID: string) {
    this.api
    .execSv('WP', 'WP', 'NewsBusiness', 'GetPostByIDAsync', [recID])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      this.data = JSON.parse(JSON.stringify(res));
      this.detectorRef.detectChanges();
    });
  }

  getFileByObjectID(objectID: string) {
    this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        [objectID])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any[]) => {
        if (res?.length > 0) {
          res.forEach((file: any) => {
            if (file?.referType == FILE_REFERTYPE.IMAGE) 
            {
              file['source'] = this.codxShareSV.getThumbByUrl(file.url,300);
              file['id'] = file.recID;
              this.fileImage = file;
            } 
            else if (file?.referType == FILE_REFERTYPE.VIDEO)
            {
              file['source'] = `${environment.urlUpload}/${file.url}`;
              file['id'] = file.recID;
              this.fileVideo = file;
            }
          });
          this.detectorRef.detectChanges();
        }
      });
  }

  openControlShare(content: any) {
    if(content)
    {
      this.callFunc.openForm(content, '', 420, window.innerHeight);
    }
  }
  
  validate() {
    if (this.arrFieldRequire.length > 0) {
      let arrFieldUnValid = this.arrFieldRequire.filter(key => !this.data[Util.camelize(key)]);
      if (arrFieldUnValid.length > 0)
      {
        this.notifSV.notifyCode('SYS009', 0, arrFieldUnValid.join(';'));
        return true;
      }
      if (this.data.newsType == 2 && this.fileImage == null)
      {
        this.notifSV.notifyCode('SYS009',0,this.grvSetup['Image']['headerText']);
        return true;
      }
    }
    return false;
  }

  valueChange(event: any) {
    if (event) {
      let field = Util.camelize(event.field);
      let value = event.data;
      switch(field){
        case "startDate":
        case "endDate":
          value = value.fromDate;
          this.data[field] = value;
          if(this.data['startDate'] && this.data['endDate'] && this.data['startDate'].toLocaleDateString() > this.data['endDate'].toLocaleDateString()) 
          {
            this.data[field] = null;
            this.notifSV.notifyCode('WP012');
            return;
          }
          break; 
        default:
          this.data[field] = value;
          break;
      }
      this.detectorRef.detectChanges();
    }
  }

  shareWith:string = "";
  cbbShareChange(event: any) {
    if (event?.length > 0) 
    {
      let permissions = Array.from<any>(event);
      this.data.shareControl = permissions[0].objectType;
      if (!this.data.permissions) 
        this.data.permissions = [];
      else
        this.data.permissions = this.data.permissions.filter((e: any) => e.memberType != MEMBERTYPE.SHARE);
      switch (this.data.shareControl) {
        case SHARECONTROLS.OWNER:
          this.data.shareName = "";
          this.shareWith = "";
          break;
        case SHARECONTROLS.EVERYONE:
        case SHARECONTROLS.MYGROUP:
        case SHARECONTROLS.MYTEAM:
        case SHARECONTROLS.MYDEPARMENTS:
        case SHARECONTROLS.MYDIVISION:
        case SHARECONTROLS.MYCOMPANY:
          let permission = new WP_TagObjects();
          permission.objectType = this.data.shareControl;
          permission.memberType = MEMBERTYPE.SHARE;
          this.data.permissions.push(permission);
          this.data.shareName = "";
          this.shareWith = "";
          break;
        case SHARECONTROLS.OGRHIERACHY:
        case SHARECONTROLS.DEPARMENTS:
        case SHARECONTROLS.POSITIONS:
        case SHARECONTROLS.ROLES:
        case SHARECONTROLS.GROUPS:
        case SHARECONTROLS.USER:
          permissions.forEach(item => {
            let p = new WP_TagObjects();
            p.objectID = item.id;
            p.objectName = item.text;
            p.objectType = item.objectType;
            p.memberType = MEMBERTYPE.SHARE;
            this.data.permissions.push(p);
          });
          let mssgCode = permissions.length == 1 ? 'WP001' : 'WP002';
          this.cache.message(mssgCode)
          .pipe(takeUntil(this.destroy$))
          .subscribe((mssg: any) => {
            if(mssg) 
            {
              if (permissions.length == 1) 
              {
                this.data.shareName = Util.stringFormat(mssg.defaultName,`<b>${permissions[0].text}</b>`);
                this.shareWith = Util.stringFormat(mssg.defaultName,`<b>${permissions[0].text}</b>`);
              }
              else 
              {
                this.data.shareName = Util.stringFormat(mssg.defaultName,`<b>${permissions[0].text}</b>`,permissions.length - 1,permissions[0].objectName);
                this.shareWith = Util.stringFormat(mssg.defaultName,`<b>${permissions[0].text}</b>`,permissions.length - 1,permissions[0].objectName);
              }
            }
          });
          break;
        default:
          break;
      }
      this.detectorRef.detectChanges();
    }
  }

  clickUpload(type: string) {
    if (type == 'image') 
      this.codxATMImage.uploadFile();
    else 
      this.codxATMVideo.uploadFile();
  }

  selectedFile(event: any) {
    if (event?.data?.length > 0) 
    {
      let file = event.data[0];
      file['id'] = Util.uid();
      if (file.mimeType.includes('image')) 
      {
        file['referType'] = FILE_REFERTYPE.IMAGE;
        file['source'] = file.avatar;
        if (this.fileImage) this.removeImage();
        this.fileImage = JSON.parse(JSON.stringify(file));
      } 
      else if (file.mimeType.includes('video')) 
      {
        file['referType'] = FILE_REFERTYPE.VIDEO;
        file['source'] = file.data.changingThisBreaksApplicationSecurity;
        this.fileVideo = JSON.parse(JSON.stringify(file));
      }

      if (this.fileUpload?.length > 0)
        this.fileUpload = this.fileUpload.filter((x) => x['referType'] != file['referType']);
      this.fileUpload.push(file);
      this.data.image = this.fileUpload.length;
      this.detectorRef.detectChanges();
    }
  }

  fileDelete: any[] = [];
  removeImage() {
    if(this.actionType == "add") return;
    if (!this.fileDelete) this.fileDelete = [];
    this.fileDelete.push(this.fileImage);
    this.fileUpload = this.fileUpload.filter((x) => x.id != this.fileImage.id);
    this.fileImage = null;
    this.data.image = 0;
  }

  getPermissionsFile(): Permission[]{
    let permissions:Permission[] = [];
    if(this.data.permissions?.length > 0)
    {
      this.data.permissions.forEach(x => {
        let per = new Permission();
        per.objectID = x.objectID;
        per.objectName = x.objectName;
        per.objectType = x.objectType;
        per.read = true;
        per.share = true;
        per.download = true;
        per.isActive = true;
        permissions.push(per);
      });
    }
    else 
    {
      let per = new Permission();
      per.objectID = "";
      per.objectName = this.data.shareControl == "9" ? "Mọi người" : "";
      per.objectType = this.data.shareControl;
      per.read = true;
      per.share = true;
      per.download = true;
      per.isActive = true;
      permissions.push(per);
    }
    return permissions;
  }

  isLoading:boolean = false;
  onSave(){
    if (this.validate()) return;
    this.isLoading = true;
    if(this.fileUpload.length > 0)
    {
      let permisisons = this.getPermissionsFile();
      this.fileUpload.forEach(x => x.permissions = permisisons);
    }
    this.codxATMImage.fileUploadList = [...this.fileUpload];
    this.codxATMImage.saveFilesMulObservable()
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) 
        this.save();
      else 
      {
        this.isLoading = false;
        this.notifSV.notifyCode("WP013");
      }
    });
  }

  save(){
    this.api
    .execSv('WP', 'WP', 'NewsBusiness', 'SaveAsync', [this.data])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: boolean) => {
      if(res)
      {
        this.notifSV.notifyCode("WP024");
        this.dialogRef.close(this.data);
      }
      else
      {
        this.isLoading = false;
        this.notifSV.notifyCode("SYS023");
      }
    });
  }

  onUpdate(){
    debugger
    if (this.validate()) return;
    this.isLoading = true;
    if (this.fileDelete?.length > 0) 
    {
      let _fileIDs = this.fileDelete.map((x) => x.id);
      this.api
      .execSv<any>(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'DeleteFilesAsync',
        [_fileIDs]).pipe(takeUntil(this.destroy$)).subscribe();
    }
    if(this.fileUpload?.length > 0)
    {
      let permisisons = this.getPermissionsFile();
      this.fileUpload.forEach(x => x.permissions = permisisons);
    }
    this.codxATMImage.fileUploadList = [...this.fileUpload];
    this.codxATMImage.saveFilesMulObservable()
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res) 
        this.update();
      else 
      {
        this.isLoading = false;
        this.notifSV.notifyCode("WP013");
      }
    });
  }

  update(){
    this.api
    .execSv('WP', 'WP', 'NewsBusiness', 'UpdateAsync2', [this.data])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: boolean) => {
      if(res)
      {
        this.notifSV.notifyCode("SYS007");
        this.dialogRef.close(this.data);
      }
      else
      {
        this.isLoading = true;
        this.notifSV.notifyCode("SYS021");
      }
    });
  }

  onRelease() {
    if (this.validate()) return;
    this.isLoading = true;
    if (this.fileDelete?.length > 0) 
    {
      let _fileIDs = this.fileDelete.map((x) => x.id);
      this.api
      .execSv<any>(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'DeleteFilesAsync',
        [_fileIDs]).pipe(takeUntil(this.destroy$)).subscribe();
    }
    if(this.fileUpload.length > 0) 
    {
      let permisisons = this.getPermissionsFile();
      this.fileUpload.forEach(x => x.permissions = permisisons);
      this.codxATMImage.fileUploadList = [...this.fileUpload];
      this.codxATMImage.saveFilesMulObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res) 
          this.release(this.data);
        else 
        {
          this.isLoading = false;
          this.notifSV.notifyCode("Gửi duyệt không thành công",2); // chưa có mssgCode
        }
      });
    } 
    else this.release(this.data);
  }

  release(post: any) {
    this.api
    .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'SaveAndReleaseAsync', [post])
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
      {
        this.notifSV.notifyCode("ES007");
        this.dialogRef.close(res[1]);
      }
      else
      {
        this.isLoading = false;
        this.notifSV.notifyCode("Gửi duyệt không thành công",2); // chưa có mssgCode
      }
    });
  }

}
