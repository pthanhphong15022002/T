import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { Permission } from '@shared/models/file.model';
import { DialogRef, ApiHttpService, AuthStore, NotificationsService, CallFuncService, CacheService, DialogData, Util } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'wp4-popup-add-knowledge',
  templateUrl: './popup-add-knowledge.component.html',
  styleUrls: ['./popup-add-knowledge.component.css'],
  encapsulation: ViewEncapsulation.None,

})
export class PopupAddKnowledgeComponent implements OnInit {
  user: any = null;
  dialogData: any;
  dialogRef: DialogRef = null;
  fileUpload: any[] = [];
  fileImage: any = null;
  fileVideo: any = null;
  messageImage: string = '';
  data: any = null;
  function: any = null;
  grvSetup: any = null;
  arrFieldRequire: any[] = [];
  headerText: string = '';
  loading: boolean = false;
  isAdd: boolean = true;
  allowExtensions: string = '.png, .jpg, .jpeg';
  defaultCategory: string = '';
  defaultImgSrc: string = '../assets/themes/wp/default/img/upload_image.svg';
  NEWSTYPE = {
    POST: '1',
    VIDEO: '2',
  };
  SHARECONTROLS = {
    OWNER: '1',
    MYGROUP: '2',
    MYTEAM: '3',
    MYDEPARMENTS: '4',
    MYDIVISION: '5',
    MYCOMPANY: '6',
    ADMINISTRATOR: '7',
    EVERYONE: '9',
    OGRHIERACHY: 'O',
    DEPARMENTS: 'D',
    POSITIONS: 'P',
    ROLES: 'R',
    GROUPS: 'G',
    USER: 'U',
  };
  MEMBERTYPE = {
    CREATED: '1',
    SHARE: '2',
    TAGS: '3',
  };
  FILE_REFERTYPE = {
    IMAGE: 'image',
    VIDEO: 'video',
    APPLICATION: 'application',
  };
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
    private callFunc: CallFuncService,
    private codxShareSV: CodxShareService,
    private cache: CacheService,
    private detectorRef: ChangeDetectorRef,

    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    this.dialogRef = dialogRef;
    this.headerText = dialogData.data.action;
    this.isAdd = dialogData.data.isAdd;
    this.data = JSON.parse(JSON.stringify(dialogData.data.data));
    this.user = auth.get();
  }
  ngOnInit(): void {
    if (this.isAdd) {
      this.data.createdBy = this.user.userID;
      this.data.createdName = this.user.userName;
    } else {
      this.getPostInfo(this.data.recID);
      this.getFileByObjectID(this.data.recID);
    }
    this.getValue();
  }
  ngAfterViewInit(): void {}

  getPostInfo(recID: string) {
    if (recID) {
      this.api
        .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'GetPostByIDAsync', [
          recID,
        ])
        .subscribe((res: any) => {
          this.data = JSON.parse(JSON.stringify(res));
          this.detectorRef.detectChanges();
        });
    }
  }
  getValue() {
    this.cache.functionList('WPT02').subscribe((func: any) => {
      if (func) {
        this.function = func;
        this.headerText += ' ' + func.customName;
        this.cache
          .gridViewSetup(func.formName, func.gridViewName)
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
    this.cache.message('WP017').subscribe((mssg: any) => {
      if (mssg) {
        this.messageImage = mssg.customName;
      }
    });
  }
  clickClosePopup() {
    this.dialogRef.close();
  }
  openControlShare(content: any) {
    this.callFunc.openForm(content, '', 420, window.innerHeight);
  }

  clickInsert() {
    if (this.checkValidate()) return;
    this.loading = true;
    this.codxATMImage.fileUploadList = Array.from<any>(this.fileUpload);
    this.codxATMImage.saveFilesMulObservable().subscribe((res1: any) => {
      if (
        res1 &&
        ((typeof res1 == 'object' && res1.status == 0) ||
          (Array.isArray(res1) && res1[0].status == 0))
      ) {
        this.api
          .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'InsertAsync', [
            this.data,
          ])
          .subscribe((res2: boolean) => {
            this.notifSV.notifyCode(res2 ? 'WP024' : 'WP013');
            this.dialogRef.close(res2);
          });
      } else {
        let arrFields = this.fileUpload.map((x) => x.fileName);
        let fileNames =
          arrFields.length > 1 ? arrFields.join(';') : arrFields.pop();
        this.notifSV.notifyCode('DM006', 0, fileNames);
        this.dialogRef.close();
        this.dialogRef.close();
        return;
      }
    });
  }

  clickRelease() {
    if (this.checkValidate()) return;
    this.loading = true;
    if (this.fileUpload.length > 0) {
      this.codxATMImage.fileUploadList = [...this.fileUpload];
      this.codxATMImage.saveFilesMulObservable().subscribe((res: any) => {
        if (
          res &&
          ((typeof res == 'object' && res.status == 0) ||
            (Array.isArray(res) && res[0].status == 0))
        ) {
          this.releasePost(this.data);
        } else {
          let arrFields = this.fileUpload.map((x) => x.fileName);
          let fileNames =
            arrFields.length > 1 ? arrFields.join(';') : arrFields.pop();
          this.notifSV.notifyCode('DM006', 0, fileNames);
          this.dialogRef.close();
          this.dialogRef.close();
          return;
        }
      });
    } else {
      this.releasePost(this.data);
    }
  }

  releasePost(post: any) {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'ReleaseNewsAsync', [
        post,
      ])
      .subscribe((res: any) => {
        this.loading = false;
        this.notifSV.notifyCode(res ? 'WP024' : 'WP013');
        this.dialogRef.close(res);
      });
  }

  checkValidate() {
    if (this.arrFieldRequire.length > 0) {
      let arrFieldUnValid = this.arrFieldRequire.filter(
        (key) => !this.data[Util.camelize(key)]
      );
      if (arrFieldUnValid.length > 0) {
        this.notifSV.notifyCode('SYS009', 0, arrFieldUnValid.join(';'));
        return true;
      }
      if (this.data.newsType == 2 && this.fileImage == null) {
        this.notifSV.notifyCode(
          'SYS009',
          0,
          this.grvSetup['Image']['headerText']
        );
        return true;
      }
    }
    return false;
  }

  valueChange(event: any) {
    if (event) {
      let field = Util.camelize(event.field);
      let value = event.data;
      switch(field)
      {
        case "category":
          this.data[field] = value;
          break;
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

  eventApply(event: any) {
    if (Array.isArray(event)) {
      let dataSeleted = Array.from<any>(event);
      let lstPermision = [];
      let fisrtPermission = dataSeleted[0];
      let shareControl = dataSeleted[0].objectType;
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
          permission.objectID = '';
          permission.objectName = '';
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
      this.detectorRef.detectChanges();
    }
  }

  addFiles(files: any) {
    if (files?.data?.length > 0) {
      let file = files.data[0];
      file['id'] = Util.uid();
      if (file.mimeType.includes('image')) {
        file['referType'] = this.FILE_REFERTYPE.IMAGE;
        file['source'] = file.avatar;
        if (this.fileImage) this.removeImage();
        this.fileImage = JSON.parse(JSON.stringify(file));
      } else if (file.mimeType.includes('video')) {
        file['referType'] = this.FILE_REFERTYPE.VIDEO;
        file['source'] = file.data.changingThisBreaksApplicationSecurity;
        this.fileVideo = JSON.parse(JSON.stringify(file));
      }
      if (this.fileUpload.length > 0) {
        this.fileUpload = this.fileUpload.filter(
          (x) => x['referType'] != file['referType']
        );
      }
      this.fileUpload.push(file);
      this.data.image = this.fileUpload.length;
      this.detectorRef.detectChanges();
    }
  }

  clickUpload(type: string) {
    if (type == 'image') {
      this.codxATMImage.uploadFile();
    } else {
      this.codxATMVideo.uploadFile();
    }
  }

  clickUpdate() {
    if (this.checkValidate()) return;
    this.loading = true;
    if (this.fileDelete.length > 0) {
      let _fileIDs = this.fileDelete.map((x) => x.id);
      this.api
        .execSv<any>(
          'DM',
          'ERM.Business.DM',
          'FileBussiness',
          'DeleteFilesAsync',
          [_fileIDs]
        )
        .subscribe();
    }
    if (this.fileUpload.length > 0) {
      this.data.image = this.fileUpload.length;
      this.codxATMImage.fileUploadList = [...this.fileUpload];
      this.codxATMImage.saveFilesMulObservable().subscribe((res: any) => {
        if (
          res &&
          ((typeof res == 'object' && res?.status == 0) ||
            (Array.isArray(res) && res[0]?.status == 0))
        ) {
          this.updatePost(this.data);
        } else {
          let arrFields = this.fileUpload.map((x) => x.fileName);
          let fileNames =
            arrFields.length > 1 ? arrFields.join(';') : arrFields.pop();
          this.notifSV.notifyCode('DM006', 0, fileNames);
          this.dialogRef.close();
          return;
        }
      });
    } else {
      this.updatePost(this.data);
    }
  }

  updatePost(post: any) {
    this.api
      .execSv('WP', 'ERM.Business.WP', 'NewsBusiness', 'UpdateAsync', [post])
      .subscribe((res: any) => {
        this.loading = false;
        this.notifSV.notifyCode(res ? 'SYS007' : 'SYS021');
        this.dialogRef.close(res);
      });
  }
  getFileByObjectID(objectID: string) {
    this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        [objectID]
      )
      .subscribe((res: any[]) => {
        if (res?.length > 0) {
          res.forEach((f: any) => {
            if (f.referType == this.FILE_REFERTYPE.IMAGE) {
              this.fileImage = f;
              this.fileImage['source'] = this.codxShareSV.getThumbByUrl(
                f.url,
                300
              );
              this.fileImage['id'] = f.recID;
            } else if (f.referType == this.FILE_REFERTYPE.VIDEO) {
              this.fileVideo = f;
              this.fileVideo['source'] =
                `${environment.urlUpload}` + '/' + f.url;
              this.fileVideo['id'] = f.recID;
            }
          });
          this.detectorRef.detectChanges();
        }
      });
  }

  fileDelete: any[] = [];
  removeImage() {
    if (!this.fileDelete) {
      this.fileDelete = [];
    }
    this.fileDelete.push(this.fileImage);
    this.fileUpload = this.fileUpload.filter((x) => x.id != this.fileImage.id);
    this.fileImage = null;
    this.data.image = this.data.image > 0 ? this.data.image - 1 : 0;
  }
}
