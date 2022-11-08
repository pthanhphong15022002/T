import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, CacheService, CallFuncService, DataRequest, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderService } from '@shared/services/folder.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileInfo, FileUpload, HistoryFile, ItemInterval, Permission, SubFolder } from '@shared/models/file.model';
import { FolderInfo } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { RolesComponent } from '../roles/roles.component';

@Component({
  selector: 'editFile',
  templateUrl: './editFile.component.html',
  styleUrls: ['./editFile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditFileComponent implements OnInit {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;    
  @Output() eventShow = new EventEmitter<boolean>();
  dialog: any;
  titleDialog = 'Cập nhật file';
  titleRolesDialog = 'Cập nhật quyền';
  titleFileNameRequire = 'Tên tài liệu không để trống';
  titleFileNameInvalid = 'Tên tài liệu không hợp lệ';
  titleFileType = 'Loại tập tin';
  titleSize = 'Kích cỡ file';
  titleCreator = 'Người tạo';
  titleCreaton = 'Ngày tạo';
  titleShare = 'Chia sẻ';
  titleSelectObject = 'Chọn đối tượng';
  titleExpand = 'Thông tin mở rộng';
  titleFile = 'Tiêu đề';
  titleSubject = 'Chủ đề';
  titleCate = 'Phân loại';
  titleLanguage = 'Ngôn ngữ';
  titleExcerpts = 'Trích lục';
  titleDescription = 'Mô tả tài liệu';
  titleRelation = 'Mối quan hệ';
  titleSource = 'Nguồn';
  titleCopyright  = 'Bản quyền';
  titleAuthor = 'Tên tác giả';
  titlePublisher = 'Nhà xuất bản';
  titlePublishyear = 'Năm xuất bản';
  titlePublishDate = 'Ngày hết hạn';
  titleSave = 'Lưu';
  historyFile: HistoryFile;
  propertiesFolder: boolean;
  closeResult = '';
  id: string;
  listLevel: any;
  listType: any;
  listFormat1: any;
  listFormat2: any;
  listFormat3: any;
  listFormat4: any;
  listSubFolder: SubFolder[];
  subitem: SubFolder;
  commenttext: string;
  fullName: string;
  newfile: string;
  updateversion: boolean
  type: string;
  copy: boolean;
  view: string;
  userID: string;
  disableSubItem: boolean;
  selectId: string;
  disableSave = false;
  menuList: string;
  folderId: string;
  id_to: string; // id forder copy to
  selection = 0;
  listNodeMove: any;
  listNodeAdd: any;
  listFolder: FolderInfo[];
  listFiles: FileInfo[];
  folderName = "folder";
  fileName = [];//"file";
  datafile: ArrayBuffer[];
  percent = '0%';
  listTag: any;
  breadcumb: string[];
  breadcumbLink = [];
  viewFolderOnly = false;
  modePermission = false;
  readRight = false;
  createRight = false;
  assignRight = true;
  updateRight = true;
  downloadRight = true;
  uploadRight = true;
  shareRight = true;
  deleteRight = true;
  errorshow = false;
  security = false;
  createSubFolder = false;
  message: string;
  noeditName: boolean;
  modeSharing: boolean;
  confirmAll: boolean;
  isSystem: boolean;
  comment: string;
  mytitle = 0;;
  interval: ItemInterval[];
  intervalCount = 0;
  // readonly: boolean;
  // listPermisson: Permission[];
  // fileToUpload: FileList | null = null;
  fileUploadList: FileUpload[];
  objectId = 'file';
  objectType = '';
  functionID = '';
  remote: boolean;
  objectName = '';
  arrType = [];
  arrName = [];
  cate = 'cate';
  user: any;
  isFileList = false;  
  fileEditing: FileUpload;
  fileEditingTemp: FileUpload;
  parentFolder: FileUpload;
  mode: string;
  currentPemission = 0;
  information: boolean;
  license: boolean;
  options = new DataRequest();
  dataVll = [];
  currentPermision: string;
  full: boolean;
  create: boolean
  read: boolean;
  update: boolean;
  delete: boolean;
  share: boolean;
  upload: boolean;
  download: boolean;
  assign: boolean;
  icon: string;
  startDate: Date;
  endDate: Date;
  approval = false;
  revision = false;
  physical = false;
  copyrights: any;
  copyrightsControl: any;
  approvers: string;
  description: string;
  location: string;
  public loading = false;
  private onScrolling = true;
  dataSelcected: any = [];
  entityName = "";
  predicate = "";
  dataValue = "";
  viewMember = "";
  valueMember = "";
  service = "";
  objUser: any;
  parentIdField = "";
  permissonActiveId: string;
  floor: string;
  range: string;
  shelf: string;
  compartment: string;
  currentRate = 0;
  selected = 0;
  hovered = 0;
  readonly = false;
  isSharing: boolean;
  isDownload: boolean;
  requestRight = "1";
  modeShare: string;
  modeRequest: string;
  isShare: boolean;
  onRole = false;
  listPerm: Permission[];
  toPermission: Permission[];
  byPermission: Permission[];
  ccPermission: Permission[];
  bccPermission: Permission[];
  shareContent: string;
  requestContent: string;
  requestTitle: string;
  totalRating: number;
  totalViews: number;
  rating1: string;
  rating2: string;
  rating3: string;
  rating4: string;
  rating5: string;
  styleRating: string;
  historyFileName: string;
  historyID: string;
  sendEmail: boolean;
  postblog: boolean;
  historyFileNameExt: string;
  clipboard: any;
  titlemessage = 'Thông báo';
  copymessage = 'Bạn có muốn lưu lên không ?';
  renamemessage = 'Bạn có muốn lưu với tên {0} không ?';
  editfilemessage = 'Cần điền đầy đủ thông tin trước khi lưu';
  //objectType="";
  indexSub: number;
  isCopyRight = false;
  subItemLevel: string;
  comboboxName = "";
  listLanguages: any;
  showAll: boolean;
  emailTemplate: string;
  component: {};
  remotePermission: Permission[];
  listRemoteFolder: any;
  fileEditingOld: FileUpload;
  indexEdit: any;
  addnewIndex: any;
  path: string;
  //treeAdd: TreeviewComponent;
  item: any = {};
  objectUpdate = {};
  fieldUpdate = "";
  data: any;
  @ViewChild('fileNameCtrl') fileNameCtrl;
  
  /* vlL1473 : any; */
  constructor(  
    /* private cache: CacheService, */
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
    private fileService: FileService,    
    private api: ApiHttpService,
    public dmSV: CodxDMService,
    private callfc: CallFuncService,
    private modalService: NgbModal,
    private auth: AuthStore,
    private notificationsService: NotificationsService,
   // private confirmationDialogService: ConfirmationDialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
    ) {
      this.data = data.data;
      //this.fileEditing = this.data[1];   
      this.fileEditing =  JSON.parse(JSON.stringify(this.data[1]));   
      this.user = this.auth.get();
      this.dialog = dialog;     
      this.id = this.fileEditing.recID;
      debugger;
      if(this.data[2]) this.isCopyRight = this.data[2];      
      // this.dmSV.isFileEditing.subscribe(item => {
      //   if (item != undefined && this.fileEditing.recID == item.recID) {
      //     this.fileEditing.permissions = item.permissions;
      //     this.changeDetectorRef.detectChanges();
      //   }                  
      // });
    //  this.changeDetectorRef.detectChanges();
   // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {   
    if(this.fileEditing.type == null)
    {
      this.fileEditing.type = this.fileEditing.extension.replace('.', '');
    }
/* if(this.fileEditing.language)
        {
          this.cache.valueList("L1473").subscribe(item=>{
            if(item && item.datas) 
            {
              this.vlL1473 = item.datas;
              var lang = item.datas.filter(x=>x.value === this.fileEditing.language);
              if(lang && lang[0])
              {
                // this.fileEditing.language // this.fileEditing.type = lang[0].text;
              }
              
            }
          })
        } */
   
  }

  

  onSaveEditingFile() {
    if (this.fileEditing.fileName === "") {
      // $('#fileName').addClass('form-control is-invalid');
      // $('#fileName').focus();
      
    }
    // if(this.license == true){
    //   if(this.fileEditing.author == "" || this.fileEditing.publisher == "" || this.fileEditing.publishYear == null || this.fileEditing.copyRights == "" || this.fileEditing.publishDate == null){
    //     this.notificationsService.notify(this.editfilemessage);
    //     return;
    //   }
    // }
    //Check bản quyền
    if(this.isCopyRight && this.checkRequired()) return

    if (this.id !=undefined &&  this.id != "") {
      // update file
      // save permisson
      this.fileService.updateFile(this.fileEditing).subscribe(item => {
        if (item.status == 0) {
          let res = item.data;
        //  this.dmSV.fileEditing.next(item.data);
          if (res != null) {
            var files = this.dmSV.listFiles;//.getValue();
            if (files != null) {
              let index = files.findIndex(d => d.recID.toString() === this.id);
              if (index != -1) {
                files[index] = res;
              }
              this.dmSV.listFiles = files;
              this.dmSV.ChangeData.next(true);
              this.changeDetectorRef.detectChanges();
            }
            // if (modal != null)
            //   this.modalService.dismissAll();
          }
          this.dialog.close();
        }
        else {
          // $('#fileName').addClass('form-control is-invalid');
          // $('#fileName').focus();
          this.errorshow = true;
          // $('#fileError').html(item.message);
          this.changeDetectorRef.detectChanges();
        }

        if (item.status == 6) {
          let newNameMessage = this.renamemessage.replace("{0}", item.data.fileName);
          var config = new AlertConfirmInputConfig();
          config.type = "YesNo";
          this.notificationsService.alert(this.titlemessage, item.message + ". " + newNameMessage, config).closed.subscribe(x=>{
            if(x.event.status == "Y")
            { 
                this.fileEditing.fileName = item.data.fileName;
                this.fileService.updateFile(this.fileEditing).subscribe(async res => {
                  if (res.status == 0) {
                    this.dmSV.fileEditing.next(item.data);
                    var files = this.dmSV.listFiles;
                    if (files != null) {
                      let index = files.findIndex(d => d.recID.toString() === this.id);
                      if (index != -1) {
                        files[index].fileName = res.data.fileName;
                      }
                      this.dmSV.listFiles = files;                    
                      this.dmSV.ChangeData.next(true);
                      // if (modal != null)
                      //   this.modalService.dismissAll();
                      this.changeDetectorRef.detectChanges();
                    }
                    this.dialog.close();
                  }
                  this.notificationsService.notify(res.message);
                });
            }
          })        
        }
        else {
          this.notificationsService.notify(item.message);
        }
        this.dialog.close();
      });

    }
    else {
      this.dialog.close(true);
    }
    // else {
    //   //  this.dmSV.fileEditing.next(this.fileEditing);
    //   let index = this.fileUploadList.findIndex(d => d.order.toString() === this.fileEditing.order.toString()); //find index in your array
    //   if (index > -1) {
    //     this.fileUploadList.splice(index, 1);//remove element from array
    //     // this.fileUploadList.push(new Object(), this.fileEditing);
    //     this.fileUploadList.push(Object.assign({}, this.fileEditing));
    //   //  this.dmSV.fileUploadListAdd.next(true);
    //   }
    //   this.dialog.close();
    //   // if (modal != null)
    //   //   modal.dismiss('Cross click');//modal.close();
    // }

  }
  
  checkInputFile() {
    return this.fileEditing.fileName === ""  ? true : false;
  } 

  doTrichluc($event) {

  }

  checkRequired()
  {
    var arr = [];
    if(!this.fileEditing.author || this.fileEditing.author == "") arr.push(this.titleAuthor);
    if(!this.fileEditing.publisher || this.fileEditing.publisher == "") arr.push(this.titlePublisher);
    if(!this.fileEditing.publishYear || this.fileEditing.publishYear == "") arr.push(this.titlePublishyear);
    if(!this.fileEditing.copyRights || this.fileEditing.copyRights == "") arr.push(this.titleCopyright);
    if(!this.fileEditing.publishDate || this.fileEditing.publishDate == "") arr.push(this.titlePublishDate);
    if(arr.length>0) 
    {
      this.notificationsService.notifyCode("SYS009",0,arr.join(" ,")); 
      return true
    }
    return false;
  }
  removeUserRight(index, list: Permission[] = null) {
    if (list == null) {
      if (this.fileEditing != null && this.fileEditing.permissions != null && this.fileEditing.permissions.length > 0) {
        this.fileEditing.permissions.splice(index, 1);//remove element from array  
        this.changeDetectorRef.detectChanges();
       // this.changePermission(0);
      }
    }
    else {
      if (list != null && list.length > 0) {
        list.splice(index, 1);//remove element from array  
        this.changeDetectorRef.detectChanges();
      }
    }

    if (this.type == "file") {
   //   this.onSaveEditingFile();
    }
    else {
      this.fileEditing.folderName = this.folderName;
      this.fileEditing.folderID = this.dmSV.getFolderId();
      this.fileEditing.recID = this.id;
      // this.folderService.updateFolder(this.fileEditing).subscribe(async res => {
      // });
    }
  }

  getSizeByte(size: any) {
    if (size != null)
      return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    else return "";
  }

  getSizeKB(size: any) {
    if (size != null) {
      var kb = size / 1024;
      return kb.toFixed(2);
    }
    else {
      return "";
    }
  }  

  openRight(mode = 1, type = true) {
    this.dmSV.dataFileEditing = this.fileEditing;
    this.callfc.openForm(RolesComponent, this.titleRolesDialog, 950, 650, "", [this.functionID], "").closed.subscribe(item => {
      if (item) {
        this.fileEditing = item.event;
        this.changeDetectorRef.detectChanges();
      }        
    });
    // if (this.fileEditing != null)
    //   this.fileEditingOld = JSON.parse(JSON.stringify(this.fileEditing));
    // if (mode == 2) {
    //   // $('app-customdialog').css('z-index', '1000');
    //   this.onSetPermision(type);
    // }
    // //  $('#dms_properties').css('z-index', '1000');    
    // this.modeRequest = "";
    // this.modeShare = "";
    // var index = 0;
    // var i = 0;
    // this.currentPemission = -1;
    // if (this.modeSharing) { //findIndex
    //   index = this.fileEditing.permissions.findIndex(d => d.isSharing);
    // }

    // if (this.fileEditing != null && this.fileEditing.permissions != null && this.fileEditing.permissions.length > 0 && index > -1) {
    //   // if (this.fileEditing.permissions[index].startDate != null && this.fileEditing.permissions[index].startDate != null)
    //   //   this.startDate = this.formatDate(this.fileEditing.permissions[index].startDate.toString());
    //   // if (this.fileEditing.permissions[index].endDate != null && this.fileEditing.permissions[index].endDate != null)
    //   //   this.endDate = this.formatDate(this.fileEditing.permissions[0].endDate.toString());
    // }

    // // modal-xs/modal-sm/modal-md/modal-lg/modal-xl   
    // //this.openDialogFolder(this.contentRight, "lg", "right");
    // if (this.fileEditing != null && this.fileEditing.permissions != null && this.fileEditing.permissions.length > 0) {
    // //  this.changePermission(index);
    // }    
    // else {
    //   this.full = false;
    //   this.create = false;
    //   this.read = false;
    //   this.update = false;
    //   this.delete = false;
    //   this.download = false;
    //   this.share = false;
    //   this.upload = false;
    //   this.assign = false;
    // }
    // this.changeDetectorRef.detectChanges();
  }

  hideLicence() {
    //this.dmSV.hideShowBoxLicense.next(!this.license);
    this.license = !this.license;
    this.changeDetectorRef.detectChanges();
  }

  hideInfo() {
    this.information = !this.information;
    this.changeDetectorRef.detectChanges();
   // this.dmSV.hideShowBoxInfo.next(!this.information);
  }

  getListPermission() {
    this.listPerm = this.fileEditing.permissions;//this.fileEditing.permissions.filter(x => x.isSharing == this.modeSharing);
  }
  
  onSetPermision(sharing: boolean) {
    this.modeSharing = sharing;
    this.getListPermission();
    this.changeDetectorRef.detectChanges();
  }

  txtValue($event, type) {
    if ($event.data != null) {
      switch(type) {
        case 'tag':
          this.fileEditing.tags = $event.data;
          break;  
        case 'filename':
          if ($event.data.length > 0)
          this.fileEditing.fileName = $event.data;
          else
          this.fileEditing.fileName = "";
          
          break;
        case 'title':
          if ($event.data.length > 0)
          this.fileEditing.title = $event.data;
          else
          this.fileEditing.title = "";
          break;
        case 'subject':
          if ($event.data.length > 0)
            this.fileEditing.subject = $event.data;
            else
          this.fileEditing.subject = "";
            break;
        case 'relation':
          if ($event.data.length > 0)
            this.fileEditing.relation = $event.data;
            else
          this.fileEditing.relation  = "";
            break;
        case 'category':
            this.fileEditing.category = $event.data;
          break;
        case 'language':
          if ($event.data.length > 0)
            this.fileEditing.language = $event.data;
            else
            this.fileEditing.language = "";
            break;
        case 'source':
          if ($event.data.length > 0)
            this.fileEditing.source = $event.data;
            else
            this.fileEditing.source = "";
            break;
        case 'excerpts':
          if ($event.data.length > 0)
            this.fileEditing.excerpts = $event.data;
            else
            this.fileEditing.excerpts= "";
            break;
            case 'description':
          if ($event.data.length > 0)
            this.fileEditing.description = $event.data;
            else
            this.fileEditing.description= "";
            break;
        case 'authur':
          if ($event.data.length > 0)
          this.fileEditing.author = $event.data;
          else
            this.fileEditing.author= "";
          break;
        case 'publishdate':
          if ($event.data != null)
            this.fileEditing.publishDate = $event.data.fromDate;
            else
            this.fileEditing.publishDate = null;  
            break;
        case 'publisher':
          if ($event.data.length > 0)
            this.fileEditing.publisher = $event.data;
          else
            this.fileEditing.publisher = "";         
          break;
        case 'publishyear':
          if ($event.data != null)
          this.fileEditing.publishYear = $event.data.fromDate;
          else
            this.fileEditing.publisher = null;  
          break;
        case 'copyrights':
          if ($event.data.length > 0)
          this.fileEditing.copyRights = $event.data;
          else
            this.fileEditing.copyRights = "";  
          break;
      }
    }
    this.changeDetectorRef.detectChanges();  
  }

  checkFileName() {
   // const fs = require('fs');
   
    if (this.fileEditing.fileName === "")
      return "1";
    else if (this.fileEditing.fileName.indexOf(".") === -1)
      return "2";
    else
      return "0";
  }

  validate(item) {
    //  fileName
    this.errorshow = false;
    switch (item) {
      case "requestContent":
        // if (this.requestContent === "") {
        //   $('#requestContent').addClass('form-control is-invalid');
        //   $("#btnRequest").attr('disabled', 'disabled');
        //   $('#requestContent').focus();
        // }
        // else {
        //   $('#requestContent').addClass('form-control').removeClass("is-invalid");
        //   $("#btnRequest").removeAttr('disabled');
        // }

        break;

      case "requestTitle":
        // if (this.requestTitle === "") {
        //   $('#requestTitle').addClass('form-control borderless is-invalid');
        //   $("#btnRequest").attr('disabled', 'disabled');
        //   $('#requestTitle').focus();
        // }
        // else {
        //   $('#requestTitle').addClass('form-control borderless').removeClass("is-invalid");
        //   $("#btnRequest").removeAttr('disabled');
        // }

        break;

      case "fullName":
        // if (this.fullName === "") {
        //   $('#fullName').addClass('form-control is-invalid');
        //   $("#btnRename").attr('disabled', 'disabled');
        //   $('#fullName').focus();
        // }
        // else {
        //   $('#fullName').addClass('form-control').removeClass("is-invalid");
        //   $("#btnRename").removeAttr('disabled');
        // }

        break;

      case "fullNameMove":
        // if (this.fullName === "") {
        //   $('#fullNameMove').addClass('form-control is-invalid');
        //   $("#btnMove").attr('disabled', 'disabled');
        //   $('#fullNameMove').focus();
        // }
        // else {
        //   $('#fullNameMove').addClass('form-control').removeClass("is-invalid");
        //   $("#btnMove").removeAttr('disabled');
        // }

        break;

      case "folderName":
        // if (this.folderName === "") {
        //   $('#folderName').addClass('form-control is-invalid');
        //   $("#btnCreateFolder").attr('disabled', 'disabled');
        //   $('#folderName').focus();
        // }
        // else {
        //   $('#folderName').addClass('form-control').removeClass("is-invalid");
        //   $("#btnCreateFolder").removeAttr('disabled');
        // }

        break;

      case "fileName":
        if (this.checkFileName() != "0") {        
          return "w-100 border border-danger is-invalid";
          //$('#fileName').addClass('form-control is-invalid');
         // $('#fileName').focus();
        }
        else {
          return "w-100";
         // $('#fileName').addClass('form-control').removeClass("is-invalid");
        }

        break;

      case "startDateRole":
        // if (!this.checkDateValid(this.startDate)) {
        //   $('#startDateRole').addClass('form-control is-invalid');
        // }
        // else {

        //   $('#startDateRole').addClass('form-control').removeClass("is-invalid");
        // }
        break;

      case "endDateRole":
        // if (!this.checkDateValid(this.endDate)) {
        //   $('#endDateRole').addClass('form-control is-invalid');
        // }
        // else {

        //   $('#endDateRole').addClass('form-control').removeClass("is-invalid");
        // }
        break;
    }
  
    return "";    

  }

  getAvatar(filename: string) {
    if (filename == "" || filename == null)
      return "";
    var ext = filename.substring(filename.lastIndexOf('.'), filename.length) || filename;

    if (ext == null) {
      // alert(1);
      return "file.svg";
    }
    else {
      switch (ext) {
        case ".txt":
          return "txt.svg";
        case ".doc":
        case ".docx":
          return "doc.svg";
        case ".7z":
        case ".rar":
        case ".zip":
          return "zip.svg";
        case ".jpg":
          return "jpg.svg";
        case ".mp4":
          return "mp4.svg";
        case ".xls":
        case ".xlsx":
          return "xls.svg";
        case ".pdf":
          return "pdf.svg";
        case ".png":
          return "png.svg";
        case ".js":
          return "javascript.svg";
        default:
          return "file.svg";
      }
    }
  }
}