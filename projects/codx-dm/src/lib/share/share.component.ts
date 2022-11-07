import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderInfo } from '@shared/models/folder.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileInfo, FileUpload, ItemInterval, Permission } from '@shared/models/file.model';
import { resetInfiniteBlocks } from '@syncfusion/ej2-grids';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareComponent implements OnInit {  
  @Input() formModel: any;    
  //listFolders: FolderInfo[];
 // listFiles: FileInfo[];
  selection = 0;
  listNodeMove: FileUpload[] = [];
  //listNodeMove: any;
  html: string;
  count: number;
  tenant: string;
  oldFolderId: string;
  _propertyName: string = "";
  fullName: string = "";
  id: string = "";
  ext: string = "";
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
  titleDialog = `Chia sẻ qua email`;  
  titleDialogRequest = `Yêu cầu cấp quyền`;  
  fileEditing: FileUpload;
  titleShared = "Chia sẻ thành công";
  titleShareContent = "Nhập nội dung";
  titleRequestTitle = 'Nhập lý do...';
  titleRequest = "Đã yêu cầu cấp quyền"
  titleReadonly = 'Readonly';
  titleModified = 'Modified';
  titleCopyUrl = "Đã copy vào bộ nhớ đường dẫn";
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
  toPermission: Permission[];
  byPermission: Permission[];
  ccPermission: Permission[];
  bccPermission: Permission[];  
//   @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  @ViewChild('view') view!: ViewsComponent; 
  
  @Output() eventShow = new EventEmitter<boolean>();
  constructor(  
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
    private folderService: FolderService,
    private fileService: FileService,
    private api: ApiHttpService,
    public dmSV: CodxDMService,
    private modalService: NgbModal,
    private auth: AuthStore,
    private notificationsService: NotificationsService,
   // private confirmationDialogService: ConfirmationDialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,    
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
    ) {
      this.dialog = dialog;       
      this.type = data.data[0];
      this.fileEditing = data.data[1];
      this.id =  this.fileEditing.recID;
      
      this.isShare = data.data[2];
      this.fullName = this.fileEditing.folderName ? this.fileEditing.folderName : this.fileEditing.fileName;
      this.formModel = dialog.formModel;  

    //  this.id = this.data.recID;     
  }

  ngOnInit(): void {   
    this.user = this.auth.get();       
    if(this.dmSV.breakCumArr.length>0 && this.dmSV.breakCumArr.includes(this.fullName)) this.fullName= null
  }


  checkContent() 
  {    
    if (this.shareContent == "")  return false;
    return true;
  }

  validate(item) {
    //  fileName
   // this.errorshow = true;  
   switch(item) {
    case "requestTitle":
      if (this.errorshow && this.requestTitle == "")
        return "w-100 border border-danger is-invalid";
      else 
        return "w-100";      
    case "shareContent":
      if (this.errorshow && !this.checkContent()) 
        return "w-100 border border-danger is-invalid h-200";
      else   
        return "h-200";          
   }    
   return "";
  }

  removeUserRight(index, list: Permission[] = null) {   
    if (list != null && list.length > 0) {
      list.splice(index, 1);//remove element from array  
      this.changeDetectorRef.detectChanges();
    }    
  }

  onSaveRole($event, type: string) {    
   // console.log($event);
    var list = [];
    if ($event.data != undefined) {
      var data = $event.data;
      for(var i=0; i<data.length; i++) {
        var item = data[i];
        var perm = new Permission;               
        perm.startDate = this.startDate;       
        perm.endDate = this.endDate;
        perm.isSystem = false;
        perm.isActive = true;
        perm.objectName = item.text;
        perm.objectID = item.id;
        perm.objectType = item.objectType;
        perm.read = true;        
        list.push(Object.assign({}, perm));        
      //  this.fileEditing.permissions = this.addRoleToList(this.fileEditing.permissions, perm);
      } 
      
      switch(type)  {
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
    var index = window.location.href.indexOf("?");
    var url = window.location.href;
    if (index > -1) {
      url = window.location.href.substring(0, index);
    }
    var url = `${url}?id=${this.id}&type=${this.type}&name=${this.fullName}`;
    return url;
  }

  copyToClipboard(textToCopy) {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      return navigator.clipboard.writeText(textToCopy);
    } else {
      // text area method
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
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
      this.changeDetectorRef.detectChanges();
      return;
    }

    if (!this.isShare && this.requestTitle === '') {  
      this.errorshow = true;
      this.changeDetectorRef.detectChanges();
      return;
    }
    if(!this.checkPermission(this.fileEditing.permissions , this.byPermission)) return this.notificationsService.notifyCode("DM066");
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
      this.fileEditing.toPermission[i].startDate = this.startDate;
      this.fileEditing.toPermission[i].endDate = this.endDate;
      if (!this.isShare) {
        if (this.selection) {
          this.fileEditing.toPermission[i].create = true;
          this.fileEditing.toPermission[i].update = true;
          this.fileEditing.toPermission[i].share = true;
          this.fileEditing.toPermission[i].download = true;
          this.fileEditing.toPermission[i].upload = true;
          this.fileEditing.toPermission[i].read = true;
        }
        else {
          //modified: xem, sua, xoa, download
          //readonly: xem
          this.fileEditing.toPermission[i].read = true;
        }
      }
      else {
        this.fileEditing.toPermission[i].read = true;
        this.fileEditing.toPermission[i].share = this.share;
        this.fileEditing.toPermission[i].download = this.download;
      }
    }

    if (!this.isShare) {
      this.fileEditing.form = "request";
      this.fileEditing.titleEmail = this.requestTitle;
      this.fileEditing.contentEmail = this.shareContent;
    }
    else {
      this.fileEditing.form = "share";
      this.fileEditing.titleEmail = "";
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
      this.fileService.requestOrShareFile(this.fileEditing).subscribe(item => {
        if (this.fileEditing.form == "share")
          this.notificationsService.notify(this.titleShared);
        else
          this.notificationsService.notify(this.titleRequest);
      });
    }
    else {
      // this.folderService.requestOrShareFolder(this.fileEditing).subscribe(item => {      
      //   this.notificationsService.notify(this.titleShared);      
      // });
      this.folderService.requestOrShareFolder(this.fileEditing).subscribe(item => {
        if (this.fileEditing.form == "share")
          this.notificationsService.notify(this.titleShared);
        else
          this.notificationsService.notify(this.titleRequest);
      });
    }
    //return true;
    this.dialog.close();
  }  

  checkPermission(permiss:any , upermiss:any)
  {
    var result = false;
    for(var i = 0 ; i< upermiss.length ; i++)
    {
      var check = permiss.filter(x=>x.objectID == upermiss[i].objectID);
      if(!check || !check[0]?.assign) return false;
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

  onSaveRightChanged($event, type) {

  }

  txtValue($event, ctrl) {
    switch(ctrl) {
      case "requestTitle":
        this.requestTitle = $event.data;
        break; 
      case "shareContent":
        this.shareContent = $event.data;
        break;
      case "share":
        this.share = $event.data;
        break;
      case "download":
        this.download = $event.data;
        break;
      case "startDate":
        this.startDate = $event.data;
        break;
      case "endDate":
        this.endDate = $event.data;
        break;
      case "sentemail":
        this.sentEmail = $event.data;
        break;
      case "postblog":
        this.postblog = $event.data;
        break;
    }
  }
}