import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AESCryptoService,
  ApiHttpService,
  AuthStore,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
  TenantService,
  ViewsComponent,
} from 'codx-core';
import { FolderInfo } from '@shared/models/folder.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { CodxDMService } from '../codx-dm.service';
import { FileInfo, FileUpload, Permission } from '@shared/models/file.model';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SystemDialogService } from 'projects/codx-common/src/lib/component/viewFileDialog/systemDialog.service';
import { shareTitle } from './share-title';
import { CodxEmailComponent } from 'projects/codx-share/src/lib/components/codx-email/codx-email.component';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareComponent implements OnInit {
  @Input() formModel: any;
  //listFolders: FolderInfo[];
  // listFiles: FileInfo[];
  selection = true;
  listNodeMove: FileUpload[] = [];
  //listNodeMove: any;
  html: string;
  count: number;
  tenant: string;
  oldFolderId: string;
  _propertyName: string = '';
  fullName: string = '';
  id: string = '';
  ext: string = '';
  user: any;
  item: FolderInfo;
  totalRating: number;
  totalViews: number;
  //type1: string;
  //data: any;
  //Mustache = require('mustache');
  errorshow = false;
  loaded: boolean;
  loadedFile: boolean;
  loadedFolder: boolean;
  setting: any;
  title = 'Thông báo';
  titleDialog = `Chia sẻ`;
  titleDialogRequest = `Yêu cầu cấp quyền`;
  fileEditing: FileUpload | any;
  titleShared = 'Chia sẻ thành công';
  titleShareContent = 'Nhập nội dung';
  titleRequestTitle = 'Nhập lý do...';
  titleRequest = 'Đã yêu cầu cấp quyền';
  titleReadonly = 'Readonly';
  titleModified = 'Modified';
  titleCopyUrl = 'Đã copy vào bộ nhớ đường dẫn';
  requestRight: boolean;
  path: string;
  dialog: any;
  data: FileInfo;
  postblog: any;
  sentEmail: any;
  type: string;
  startDate: any;
  endDate: any;
  download: any;
  share: any;
  shareContent = '';
  isShare = true;
  requestTitle = '';
  ownerID: any;
  emailTemplate: any;
  toPermission: Permission[] = [];
  byPermission: Permission[] = [];
  ccPermission: Permission[];
  bccPermission: Permission[];
  shareGroup: FormGroup;

  shareTitle = shareTitle;
  shareType:string = "0";
  shareGroup2: FormGroup;
  pwOTP:string = "";
  qrBase64:any;
  //   @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  @ViewChild('view') view!: ViewsComponent;
  @ViewChild('qrtmp') qrtmp:any;
  
  @Output() eventShow = new EventEmitter<boolean>();
  constructor(
    private folderService: FolderService,
    private fileService: FileService,
    private api: ApiHttpService,
    public dmSV: CodxDMService,
    private formBuilder: FormBuilder,
    private auth: AuthStore,
    private notificationsService: NotificationsService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private aesCrypto: AESCryptoService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.type = data.data[0];
    this.fileEditing = data.data[1];
    this.id = this.fileEditing.recID;
    this.isShare = data.data[2];
    this.fullName = this.fileEditing.folderName
      ? this.fileEditing.folderName
      : this.fileEditing.fileName;
    this.formModel = dialog.formModel;
    this.titleDialog = 'Chia sẻ thư mục';
    if (!this.fileEditing.folderName) this.titleDialog = 'Chia sẻ tài liệu';
    //  this.id = this.data.recID;
  }

  ngOnInit(): void {
    
    this.shareGroup = this.formBuilder.group({
      by: '',
      per: 'readonly',
    });
    
    this.shareGroup2 = this.formBuilder.group({
      shareType: '0',
      pwType: '1',
      permissions: ''
    });

    this.user = this.auth.get();
    if (
      this.dmSV.breakCumArr.length > 0 &&
      this.dmSV.breakCumArr.includes(this.fullName)
    )
      this.fullName = null;
    if (!this.isShare) this.getOwner();
    else this.getEmailTemplate();

    this.changeValueFormGroup();
    this.randomPW();
  }

  getEmailTemplate() {
    this.api
      .execSv(
        'SYS',
        'ERM.Business.AD',
        'EmailTemplatesBusiness',
        'GetEmailTemplateByTemplateTypeAsync',
        'DM_Share'
      )
      .subscribe((res: any) => {
        this.shareContent = res?.message;
        this.changeDetectorRef.detectChanges();
      });
  }

  checkContent() {
    if (this.shareContent == '') return false;
    return true;
  }

  getOwner() {
    if (this.fileEditing && Array.isArray(this.fileEditing.permissions)) {
      var f = this.fileEditing.permissions.filter((x) => x.objectType == '1');
      if (typeof f == 'object' && f.length > 0) {
        let o: any = {};
        o.objectType = f[0].objectType;
        o.objectName = f[0].objectName;
        o.id = f[0].objectID;
        this.ownerID = [o];
        o.objectID = f[0].objectID;
        this.toPermission.push(o);
      }
    }
  }
  validate(item) {
    //  fileName
    // this.errorshow = true;
    switch (item) {
      case 'requestTitle':
        if (this.errorshow && this.requestTitle == '')
          return 'w-100 border border-danger is-invalid';
        else return 'w-100';
      case 'shareContent':
        if (this.errorshow && !this.checkContent())
          return 'w-100 border border-danger is-invalid h-200';
        else return 'h-200';
    }
    return '';
  }

  removeUserRight(index, list: Permission[] = null) {
    if (list != null && list.length > 0) {
      list.splice(index, 1); //remove element from array
      this.changeDetectorRef.detectChanges();
    }
  }

  onSaveRole($event, type: string) {
    // console.log($event);
    var list = [];
    if ($event.data) {
      var data = $event.data;
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var perm = new Permission();
        if (type == 'to' && data[i].objectType == '1') {
          var o = this.fileEditing.permissions.filter(
            (x) => x.objectType == '1'
          ); // Lấy owner;
          perm.objectID = o[0].objectID;
          perm.objectType = o[0].objectType;
          perm.objectName = o[0].objectName;
        } else {
          perm.objectID = item.id;
          perm.objectType = item.objectType;
          perm.objectName = item.text ? item.text : item.objectName;
        }
        perm.startDate = this.startDate;
        perm.endDate = this.endDate;
        perm.isSystem = false;
        perm.isActive = true;

        perm.read = true;
        list.push(Object.assign({}, perm));
        //  this.fileEditing.permissions = this.addRoleToList(this.fileEditing.permissions, perm);
      }

      switch (type) {
        case 'to':
          this.toPermission = [];
          this.toPermission = list;
          break;
        case 'cc':
          this.ccPermission = [];
          this.ccPermission = list;
          break;
        case 'by':
          this.byPermission = [];
          this.byPermission = list;
          break;
        case 'bcc':
          this.bccPermission = [];
          this.bccPermission = list;
          break;
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  getPath() {
    const queryParams:any = {};
    if(this.type == "folder") queryParams._fo = this.id;
    else queryParams._f = this.id;
    var l = this.router.url.split('?')[0];
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/` + l], {
        queryParams: queryParams,
      })
    );
    return window.location.host + url;
  }

  copyToClipboard(textToCopy) {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      return navigator.clipboard.writeText(textToCopy);
    } else {
      // text area method
      let textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((res, rej) => {
        // here the magic happens
        document.execCommand('copy');
        textArea.remove();
      });
    }
  }

  onShare() {
    if (this.shareContent === '') {
      //$('#shareContent').addClass('form-control is-invalid');
      this.errorshow = true;
      return;
    }

    if (!this.isShare && this.requestTitle === '') {
      this.errorshow = true;
      return;
    }

    if (
      !this.isShare &&
      !this.checkPermission(this.fileEditing.permissions, this.toPermission)
    )
      return this.notificationsService.notifyCode('DM066');
    //  if (this.updateRequestShare())
    this.fileEditing.toPermission = this.toPermission;
    this.fileEditing.byPermission = this.byPermission;
    this.fileEditing.ccPermission = this.ccPermission;
    this.fileEditing.bccPermission = this.bccPermission;
    for (var i = 0; i < this.fileEditing.toPermission.length; i++) {
      // this.fileEditing.toPermission[i].startDate = this.startDate;
      // this.fileEditing.toPermission[i].endDate = this.endDate;
      // this.fileEditing.toPermission[i].read = true;
      // this.fileEditing.toPermission[i].share = this.share;
      // this.fileEditing.toPermission[i].download = this.download;
      var start = '';
      var end = '';
      if (this.startDate instanceof Date)
        start = new Date(this.startDate).toLocaleString();
      if (this.endDate instanceof Date)
        end = new Date(this.endDate).toLocaleString();

      if (!this.isShare) {
        if (this.shareGroup.value.per == 'modified') {
          this.fileEditing.byPermission[i].create = true;
          this.fileEditing.byPermission[i].update = true;
          this.fileEditing.byPermission[i].share = true;
          this.fileEditing.byPermission[i].download = true;
          this.fileEditing.byPermission[i].upload = true;
          this.fileEditing.byPermission[i].read = true;
        } else {
          //modified: xem, sua, xoa, download
          //readonly: xem
          this.fileEditing.byPermission[i].read = true;
        }
        this.fileEditing.byPermission[i].startDate = start;
        this.fileEditing.byPermission[i].endDate = end;
      } else {
        this.fileEditing.toPermission[i].read = true;
        this.fileEditing.toPermission[i].share = this.share;
        this.fileEditing.toPermission[i].download = this.download;
        this.fileEditing.toPermission[i].startDate = start;
        this.fileEditing.toPermission[i].endDate = end;
      }
    }

    if (!this.isShare) {
      this.fileEditing.form = 'request';
      this.fileEditing.titleEmail = this.requestTitle;
      this.fileEditing.contentEmail = this.shareContent;
    } else {
      this.fileEditing.form = 'share';
      this.fileEditing.titleEmail = '';
      this.fileEditing.contentEmail = this.shareContent;
    }

    // this.fileEditing.form = "share";
    // this.fileEditing.titleEmail = "";
    // this.fileEditing.contentEmail = this.shareContent;

    this.fileEditing.urlShare = this.getPath();
    this.fileEditing.sendEmail = this.sentEmail;
    this.fileEditing.postBlog = this.postblog;
    this.fileEditing.urlPath = this.getPath();
    if (this.type == 'file') {
      // this.fileService.requestOrShareFile(this.fileEditing).subscribe(item => {
      //   this.notificationsService.notify(this.titleShared);
      // });
      this.fileService
        .requestOrShareFile(this.fileEditing)
        .subscribe((item) => {
          if (this.fileEditing.form == 'share')
            this.notificationsService.notify(this.titleShared);
          else this.notificationsService.notify(this.titleRequest);
        });
    } else {
      // this.folderService.requestOrShareFolder(this.fileEditing).subscribe(item => {
      //   this.notificationsService.notify(this.titleShared);
      // });
      this.folderService
        .requestOrShareFolder(this.fileEditing)
        .subscribe((item) => {
          if (this.fileEditing.form == 'share')
            this.notificationsService.notify(this.titleShared);
          else this.notificationsService.notify(this.titleRequest);
        });
    }
    //return true;
    this.dialog.close();
  }

  checkPermission(permiss: any, upermiss: any) {
    var result = false;
    for (var i = 0; i < upermiss.length; i++) {
      var check = permiss.filter((x) => x.objectID == upermiss[i].objectID);
      if (!check || !check[0]?.assign) return false;
      else result = true;
    }
    return result;
  }
  copyPath() {
    this.copyToClipboard(this.getPath())
      .then(() => console.log('text copied !'))
      .catch(() => console.log('error'));
    // navigator.clipboard.writeText(this.getPath());
    this.notificationsService.notify(this.titleCopyUrl);
    // this.shareContent = this.shareContent + this.getPath();
  }

  onSaveRightChanged($event, type) {}

  txtValue($event, ctrl) {
    switch (ctrl) {
      case 'requestTitle':
        this.requestTitle = $event.data;
        break;
      case 'shareContent':
        this.shareContent = $event.data;
        break;
      case 'share':
        this.share = $event.data;
        break;
      case 'download':
        this.download = $event.data;
        break;
      case 'startDate':
        this.startDate = $event.data?.fromDate;
        break;
      case 'endDate':
        this.endDate = $event.data?.fromDate;
        break;
      case 'sentemail':
        this.sentEmail = $event.data;
        break;
      case 'postblog':
        this.postblog = $event.data;
        break;
    }
  }

  changeValueFormGroup()
  {
    this.shareGroup2.controls['shareType'].valueChanges.subscribe(value => {
      this.shareType = value;
    });
  }
  randomPW()
  {
    if(this.type != "file") return;
    this.pwOTP = this.makeid(8);
  }
  makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  sendMail()
  {
    var dialog = this.callfunc.openForm(CodxEmailComponent, '', 900, 800);
    dialog.closed.subscribe((x) => {
      if (x.event) {
      
      }
    });
  }

  saveShare(type:any)
  {
    let data = this.shareGroup2.value;

    //Bất kỳ ai || Đối tượng cụ thể
    if(data.shareType == "0" || data.shareType == "1")
    {
      data.module = this.formModel.entityName.split("_")[0];
      data.functionID = this.formModel.funcID;
      data.url = this.fileEditing?.recID;

      if(data.pwType == "2") data.pw = this.pwOTP
      if(data.shareType == "1")
      {
        let listPer = data.permissions.split(";");
        data.permissions = [];
        if(listPer.length >0)
        {
          listPer.forEach(element => {
            var per = new Permission();
            per.objectID = element;
            per.objectType = "Email";
            per.read = true;
            data.permissions.push(per);
          });
        }
      }

      this.api.execSv("BG","BG","SharingsBusiness","SaveItemAsync",data).subscribe((item:any)=>{
        if(item)
        {
          if(type=="link")
          {
            this.copyToClipboard(this.getLink(item.recID));
            this.notificationsService.notify(this.titleCopyUrl);
          }
          else if(type == "qr")
          {
            this.callfunc.openForm(
              this.qrtmp,
              null,
              520,
              520,
              '',
              null,
              null
            );
            this.api
            .execSv<string>(
              'SYS',
              'ERM.Business.AD',
              'UsersBusiness',
              'GenQRCodeByContentAsync',
              this.getLink(item.recID)
            )
            .subscribe((qrImg) => {
              if (qrImg) {
                this.qrBase64 = 'data:image/png;base64,' + qrImg;
              }
            });
            
          }
        }
      });
    }
    //Nội bộ
    else
    {

    }
  }

  getLink(recID:any)
  {
    const queryParams = 
    {
      _k : this.aesCrypto.encode(recID)
    };

    var l = this.router.url.split('/');
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/` + l[1] + `/file`], {
        queryParams: queryParams,
      })
    );

    return window.location.host + url;
  }

  downloadQR(img:any)
  {
    var a = document.createElement("a"); //Create <a>
    a.href = img; //Image Base64 Goes here
    a.download = this.data.fileName + "-qr.png"; //File name Here
    a.click()
  }
}
