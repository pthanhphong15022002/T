import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { Permission } from '@shared/models/file.model';
import {
  ApiHttpService,
  AuthService,
  AuthStore,
  CacheService,
  CallFuncService,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { CodxViewFilesComponent } from 'projects/codx-common/src/lib/component/codx-view-files/codx-view-files.component';

@Component({
  selector: 'wp-popup-add-post',
  templateUrl: './popup-add-post.component.html',
  styleUrls: ['./popup-add-post.component.scss'],
})
export class PopupAddPostComponent implements OnInit {
  dialogRef: DialogRef = null;
  dialogData: any = null;
  user: any = null;
  headerText: string = '';
  mssgPlacehHolder: string = '';
  data: any = null;
  status: 'create' | 'edit' | 'share' = 'create';
  fileUpload: any[] = [];
  grvSetup: any = null;
  formModel: FormModel = null;
  loaded: boolean = false;
  CATEGORY = {
    POST: '1',
    COMMENTS: '2',
    FEEDBACK: '3',
    SHARE: '4',
    PICTURES: '9',
    VIDEO: '10',
    FILES: '11',
  };
  MEMBERTYPE = {
    CREATED: '1',
    SHARE: '2',
    TAGS: '3',
  };
  SHARECONTROLS = {
    OWNER: '1',
    MYGROUP: '2',
    MYTEAM: '3',
    MYDEPARMENTS: '4',
    MYDIVISION: '5',
    MYCOMPANY: '6',
    EVERYONE: '9',
    OGRHIERACHY: 'O',
    DEPARMENTS: 'D',
    POSITIONS: 'P',
    ROLES: 'R',
    GROUPS: 'G',
    USER: 'U',
  };
  copyFormat: string = 'clean';
  // emoji
  emojiMode: 'native' | 'apple' | 'facebook' | 'google' | 'twitter' =
    'facebook';
  emojiPreview: boolean = false;
  emojiPerLine: number = 7;
  emojiMaxFrequentRows: number = 4;

  // popup
  showCBB: boolean = false;
  width: number = 720;
  height: number = window.innerHeight;

  crrPermisionTag: string = '';
  @ViewChild('codxViewFiles') codxViewFiles: CodxViewFilesComponent;

  constructor(
    private api: ApiHttpService,
    private callFC: CallFuncService,
    private dt: ChangeDetectorRef,
    private notifySvr: NotificationsService,
    private cache: CacheService,
    private authStore: AuthStore,
    @Optional() dialogData?: DialogData,
    @Optional() dialogRef?: DialogRef
  ) {
    (this.dialogData = dialogData?.data),
      (this.dialogRef = dialogRef),
      (this.user = authStore.get());
    this.formModel = new FormModel();
  }

  ngOnInit(): void {
    this.setData();
    this.getSetting();
  }

  ngAfterViewInit() {
  }

  // set data default
  setData() {
    if (this.dialogData) {
      this.headerText = this.dialogData.headerText;
      this.status = this.dialogData.status;
      this.data = this.dialogData.data;
      if (this.status !== 'edit') {
        this.data.recID = Util.uid();
        this.data.contents = '';
        this.data.shareControl = this.SHARECONTROLS.EVERYONE;
        this.data.category =
          this.status === 'share' ? this.CATEGORY.SHARE : this.CATEGORY.POST;
        this.data.refType = this.dialogData.refType
          ? this.dialogData.refType
          : 'WP_Comments';
        this.data.createdBy = this.user.userID;
        this.data.createdName = this.user.userName;
      }
      else
      {
        if(this.data.isShortContent)
        {
          this.api.execSv("WP","ERM.Business.WP","CommentsBusiness","GetContentAsync",[this.data.recID])
          .subscribe((res:string) => {
            this.data.contents = res;
            this.dt.detectChanges();
          });
        }
      }
    }
    this.getSettingValue();
    this.getMssgDefault();
  }
  // get gridViewSetup
  getSetting() {
    this.cache.functionList('WP').subscribe((func: any) => {
      if (func) {
        this.formModel.funcID = 'WP';
        this.formModel.formName = func.formName;
        this.formModel.gridViewName = func.gridViewName;
        this.cache
          .gridViewSetup(func.formName, func.gridViewName)
          .subscribe((grv: any) => {
            if (grv) {
              this.grvSetup = grv;
            }
          });
      }
    });
  }
  // mssg placeholderText content
  getMssgDefault() {
    this.cache.message('WP011').subscribe((mssg: any) => {
      if (mssg?.defaultName) {
        this.mssgPlacehHolder = Util.stringFormat(
          mssg.defaultName,
          this.data.createdName
        );
      }
    });
  }

  //open control share
  openControlShare(controlShare: any) {
    if (controlShare) {
      this.callFC.openForm(controlShare, '', 420, window.innerHeight);
    }
  }

  // value change
  valueChange(event: any) {
    this.data.contents = event.data;
    this.dt.detectChanges();
  }

  // add icon
  addEmoji(event: any) {
    if (!this.data.contents) this.data.contents = event.emoji.native;
    else this.data.contents = this.data.contents + event.emoji.native;
  }

  // click show popup gắn thẻ
  clickTagsUser() {
    this.showCBB = !this.showCBB;
    if (this.data.permissions) {
      let arr = Array.from<any>(this.data.permissions).filter(
        (x) => x.memberType == this.MEMBERTYPE.TAGS && x.objectID
      );
      if (arr.length == 1) this.crrPermisionTag = arr[0].objectID;
      else this.crrPermisionTag = arr.map((x) => x.objectID).join(';');
    }
  }

  // click uploadFile
  clickUploadFile() {
    this.codxViewFiles.uploadFiles();
  }

  // submit
  submit() {
    if (!this.loaded) {
      switch (this.status) {
        case 'create':
          this.publishPost();
          break;
        case 'edit':
          this.editPost();
          break;
        case 'share':
          this.sharePost();
          break;
        default:
          break;
      }
    }
  }

  // insert post
  insertPost(post: any) {
    return this.api.execSv(
      'WP',
      'ERM.Business.WP',
      'CommentsBusiness',
      'PublishPostAsync',
      [post]
    );
  }

  // publich Post
  publishPost() {
    if (!this.data.contents && this.codxViewFiles.files.length == 0) {
      this.notifySvr.notifyCode(
        'SYS009',
        0,
        this.grvSetup['Comments']['headerText']
      );
      this.loaded = false;
      return;
    }
    this.loaded = true;
    this.data.category = this.CATEGORY.POST;
    this.data.createdBy = this.user.userID;
    this.data.createdName = this.user.userName;
    this.data.createdOn = new Date();
    this.data.attachments = this.codxViewFiles.files.length;
    this.data.medias = this.codxViewFiles.medias;
    let permisisons = this.getPermission();
    this.codxViewFiles.save(permisisons)
    .subscribe((res1: boolean) => {
      if (res1) {
        this.insertPost(this.data).subscribe((res2: any) => {
          if (res2) this.notifySvr.notifyCode('WP024');
          else this.notifySvr.notifyCode('WP013');
          this.loaded = false;
          this.dialogRef.close(res2);
        });
      } else this.loaded = false;
    });
  }

  // edit post
  editPost() {
    if (
      !this.data.contents &&
      this.codxViewFiles.files.length == 0 &&
      this.data.category !== this.CATEGORY.SHARE
    ) {
      this.loaded = false;
      this.notifySvr.notifyCode(
        'SYS009',
        0,
        this.grvSetup['Comments']['headerText']
      );
      return;
    }
    this.loaded = true;
    this.data.attachments = this.codxViewFiles.files.length;
    this.data.medias = this.codxViewFiles.medias;
    let permisisons = this.getPermission();
    this.codxViewFiles.save(permisisons)
    .subscribe((res1: boolean) => {
      if (res1) {
        this.api
          .execSv(
            'WP',
            'ERM.Business.WP',
            'CommentsBusiness',
            'EditPostAsync',
            [this.data]
          )
          .subscribe((res2: any) => {
            if (res2) this.notifySvr.notifyCode('WP021');
            else this.notifySvr.notifyCode('SYS021');
            this.loaded = false;
            this.dialogRef.close(this.data);
          });
      } else this.loaded = false;
    });
  }

  // share post
  sharePost() {
    this.loaded = true;
    this.data.category = this.CATEGORY.SHARE;
    this.data.createdBy = this.user.userID;
    this.data.createdName = this.user.userName;
    this.data.createdOn = new Date();
    this.data.attachments = this.codxViewFiles.files.length;
    this.data.medias = this.codxViewFiles.medias;
    let permisisons = this.getPermission();
    this.codxViewFiles.save(permisisons)
    .subscribe((res1: boolean) => {
      if (res1) {
        this.insertPost(this.data).subscribe((res2: any) => {
          if (res2) this.notifySvr.notifyCode('WP020');
          else this.notifySvr.notifyCode('WP013');
          this.loaded = false;
          this.dialogRef.close(res2);
        });
      } else this.loaded = false;
    });
  }

  getPermission(): Permission[]{
    let lstPermission:Permission[] = [];
    let owner = new Permission();
    owner.objectID = this.data.createdBy;
    owner.objectName = this.data.createdName;
    owner.objectType = "U";
    owner.read = true;
    owner.create = true;
    owner.delete = true;
    owner.update = true;
    owner.share = true;
    owner.download = true;
    owner.full = true;
    owner.assign = true;
    owner.upload = true;
    owner.isActive = true;
    lstPermission.push(owner);
    if(this.data.permissions && this.data.permissions.length > 0)
    {
      this.data.permissions.forEach(x => {
        let per = new Permission();
        per.objectID = x.objectName;
        per.objectName = x.objectName;
        per.objectType = x.objectType;
        per.read = true;
        per.share = true;
        per.download = true;
        per.isActive = true;
        lstPermission.push(per);
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
      lstPermission.push(per);
    }
    return lstPermission;
  }

  // chia sẻ người dùng
  addPerShares(event: any) {
    let arrPermisison = Array.from<any>(event);
    if (arrPermisison?.length > 0) {
      let fisrtPermission = arrPermisison[0];
      let shareControl = arrPermisison[0].objectType;
      let shareName = arrPermisison[0].objectName;
      this.data.shareControl = shareControl;
      if (!this.data.permissions) this.data.permissions = [];
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
          let permission = {
            memberType: this.MEMBERTYPE.SHARE,
            objectID: '',
            objectName: shareName,
            objectType: shareControl,
          };
          this.data.permissions.push(permission);
          this.data.shareName = shareName;
          break;
        case this.SHARECONTROLS.OGRHIERACHY:
        case this.SHARECONTROLS.DEPARMENTS:
        case this.SHARECONTROLS.POSITIONS:
        case this.SHARECONTROLS.ROLES:
        case this.SHARECONTROLS.GROUPS:
        case this.SHARECONTROLS.USER:
          arrPermisison.forEach((x) => {
            let permission = {
              memberType: this.MEMBERTYPE.SHARE,
              objectID: x.id,
              objectName: x.text,
              objectType: x.objectType,
            };
            this.data.permissions.push(permission);
          });
          // WP001 chia sẻ 1 - WP002 chia sẻ nhiều người
          let mssgCode = arrPermisison.length == 1 ? 'WP001' : 'WP002';
          this.cache.message(mssgCode).subscribe((mssg: any) => {
            if (mssg?.customName) {
              if (arrPermisison.length == 1) {
                // chia sẻ 1 người
                this.data.shareName = Util.stringFormat(
                  mssg.customName,
                  `<b>${fisrtPermission.text}</b>`
                );
              } else {
                // chia sẻ nhiều người
                let count = arrPermisison.length - 1;
                let type = fisrtPermission.objectName;
                this.data.shareName = Util.stringFormat(
                  mssg.customName,
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
    } else {
      this.data.shareName = '';
    }
    this.dt.detectChanges();
  }

  // gắn thẻ người dùng

  addPerTags(event: any) {
    let arrPermission = Array.from<any>(event.dataSelected);
    if (arrPermission?.length > 0) {
      if (!this.data.permissions) this.data.permissions = [];
      else
        this.data.permissions = this.data.permissions.filter(
          (x) => x.memberType !== this.MEMBERTYPE.TAGS
        );
      this.crrPermisionTag = arrPermission.map((x) => x.UserID).join(';');
      arrPermission.forEach((x: any) => {
        let p = {
          memberType: this.MEMBERTYPE.TAGS,
          objectID: x.UserID,
          objectName: x.UserName,
          objectType: 'U',
        };
        this.data.permissions.push(p);
      });
      // WP018 gắn thẻ 1 - WP019 gắn thẻ nhiều người
      let mssgCodeTag = arrPermission.length == 1 ? 'WP018' : 'WP019';
      this.cache.message(mssgCodeTag).subscribe((mssg: any) => {
        if (mssg?.customName) {
          if (arrPermission.length == 1) {
            // gắn thẻ 1 người
            this.data.tagName = Util.stringFormat(
              mssg.customName,
              `<b>${arrPermission[0].UserName}</b>`
            );
          } else {
            // gắn thẻ nhiều người
            this.data.tagName = Util.stringFormat(
              mssg.customName,
              `<b>${arrPermission[0].UserName}</b>`,
              arrPermission.length - 1
            );
          }
        }
      });
      this.dt.detectChanges();
    } else {
      this.data.tagName = null;
      this.crrPermisionTag = '';
      if (this.data.permissions?.length > 0)
        this.data.permissions = this.data.permissions.filter(
          (x: any) => x.memberType !== this.MEMBERTYPE.TAGS
        );
    }
    this.showCBB = false;
  }

  // get SettingValue
  getSettingValue() {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetSettingValueAsync',
        ['WPParameters']
      )
      .subscribe((res: any) => {
        if (res) {
          let _param = JSON.parse(res);
          //default mode coppy
          if (_param['CopyFormat'] === '1') this.copyFormat = 'keepFormat';
          //default mode share
          if (_param['Publishmode'])
            this.data.shareControl = _param['Publishmode'];
        }
      });
  }
}
