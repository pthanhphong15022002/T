import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, DataRequest, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderService } from '@shared/services/folder.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileInfo, FileUpload, HistoryFile, ItemInterval, Permission, SubFolder } from '@shared/models/file.model';
import { FolderInfo } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { threadId } from 'worker_threads';
import { traceChildTaskBar } from '@syncfusion/ej2-gantt/src/gantt/base/css-constants';

@Component({
  selector: 'roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;    
  @Output() eventShow = new EventEmitter<boolean>();
  dialog: any;
  titleDialog = 'Chia sẻ quyền'; 
  titleSave = 'Lưu';
  titleFunction = 'Chức năng';
  titleDescription = 'Mô tả';
  titleAllow = 'Allow';
  titleFullControl = 'Full control';
  titleRightDescription = 'Người dùng có tất cà quyền trên folder/file';
  titleCreateFolder = 'Tạo thư mục';
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
  assignRight = false;
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
  revisionNote: string;
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
  //objectType="";
  indexSub: number;
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
  constructor(  
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
    private fileService: FileService,    
    private folderService: FolderService,    
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
      this.data = data.data;
      this.fileEditing = this.data[1];   
      this.user = this.auth.get();
      this.dialog = dialog;      
  }

  ngOnInit(): void {      
  }

  checkCurrentRightUpdate(owner = true) {
    if (!this.isSystem) {
      return !this.assignRight;//this.fileEditing.assign;
    }
    else {    
      return true;
    }
  }

  onSaveEditingFile(modal) {
    if (this.fileEditing.fileName === "") {
      // $('#fileName').addClass('form-control is-invalid');
      // $('#fileName').focus();
      return;
    }

    if (this.id != "") {
      // update file
      // save permisson
      this.fileService.updateFile(this.fileEditing).subscribe(item => {
        if (item.status == 0) {
          let res = item.data;
          if (res != null) {
            var files = this.dmSV.listFiles.getValue();
            let index = files.findIndex(d => d.recID.toString() === this.id);
            if (index != -1) {
              files[index].fileName = res.fileName;
            }
            this.dmSV.listFiles.next(files);
            this.changeDetectorRef.detectChanges();
            if (modal != null)
              this.modalService.dismissAll();
          }
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
          // this.confirmationDialogService.confirm(this.titlemessage, item.message + ". " + newNameMessage)
          //   .then((confirmed) => {
          //     if (confirmed) {
          //       this.fileEditing.fileName = item.data.fileName;
          //       this.fileService.updateFile(this.fileEditing).subscribe(async res => {
          //         if (res.status == 0) {
          //           var files = this.dmSV.listFiles.getValue();
          //           let index = files.findIndex(d => d.recID.toString() === this.id);
          //           if (index != -1) {
          //             files[index].fileName = res.data.fileName;
          //           }
          //           this.dmSV.listFiles.next(files);
          //           if (modal != null)
          //             this.modalService.dismissAll();
          //           this.changeDetectorRef.detectChanges();
          //         }
          //         this.notificationsService.notify(res.message);
          //       });
          //     }
          //   })
          //   .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));

        }
        else {
          this.notificationsService.notify(item.message);
        }

      });

    }
    else {
      let index = this.fileUploadList.findIndex(d => d.fileName.toString() === this.fileEditing.fileName.toString()); //find index in your array
      if (index > -1) {
        this.fileUploadList.splice(index, 1);//remove element from array
        // this.fileUploadList.push(new Object(), this.fileEditing);
        this.fileUploadList.push(Object.assign({}, this.fileEditing));
        // this.dmSV.fileUploadList.next(this.fileUploadList);
      }

      if (modal != null)
        modal.dismiss('Cross click');//modal.close();
    }

  }

  setClassActive(id: string) {
    if (id == this.permissonActiveId)
      return 'd-flex justify-content-between user-nav-item user-nav-active mb-1 p-2';
    else
      return "d-flex justify-content-between user-nav-item mb-1 p-2";
  }

  checkItemRight(i) {
    //isSystem
    if (!this.fileEditing.permissions[i].isSystem)
      return !this.fileEditing.assign;
    else
      return true;
  }

  changePermission(index) {
    // alert(index);
    // save old permission   
    // alert(1);
    let isSystem = false;
    let objectType = "";
    if (this.currentPemission > -1) {
      let oldIndex = this.currentPemission; //find index in your array
      if (oldIndex != index && oldIndex > -1 && this.fileEditing.permissions[oldIndex] != null) {
        this.fileEditing.permissions[oldIndex].full = this.full;
        this.fileEditing.permissions[oldIndex].create = this.create;
        this.fileEditing.permissions[oldIndex].read = this.read;
        this.fileEditing.permissions[oldIndex].update = this.update;
        this.fileEditing.permissions[oldIndex].delete = this.delete;
        this.fileEditing.permissions[oldIndex].download = this.download;
        this.fileEditing.permissions[oldIndex].share = this.share;
        this.fileEditing.permissions[oldIndex].upload = this.upload;
        this.fileEditing.permissions[oldIndex].startDate = this.startDate;
        this.fileEditing.permissions[oldIndex].endDate = this.endDate;
        //  this.fileEditing.permissions[oldIndex].isSystem = this.isSystem;
        this.fileEditing.permissions[oldIndex].assign = this.assign;
      }
    }

    // load new permission  
    if (this.fileEditing.permissions[index] != null) {
      this.create = this.fileEditing.permissions[index].create;
      this.read = this.fileEditing.permissions[index].read;
      this.update = this.fileEditing.permissions[index].update;
      this.delete = this.fileEditing.permissions[index].delete;
      this.download = this.fileEditing.permissions[index].download;
      this.share = this.fileEditing.permissions[index].share;
      this.upload = this.fileEditing.permissions[index].upload;
      this.assign = this.fileEditing.permissions[index].assign;
      this.full = this.create && this.read && this.update && this.delete && this.download && this.share && this.upload && this.assign;
      this.currentPemission = index;
      isSystem = this.fileEditing.permissions[index].isSystem;
      objectType = this.fileEditing.permissions[index].objectType;
      this.userID = this.fileEditing.permissions[index].objectID;
      this.objectType = objectType;
      this.isSystem = this.fileEditing.permissions[index].isSystem;
      this.permissonActiveId = index;
    }
    else {
      this.full = false;
      this.create = false;
      this.read = false;
      this.update = false;
      this.delete = false;
      this.download = false;
      this.share = false;
      this.upload = false;
      this.assign = false;
      this.currentPemission = index;
      isSystem = false;
      this.isSystem = false;
      this.permissonActiveId = index;
    }   
    this.changeDetectorRef.detectChanges();
  }


  removeUserRight(index, list: Permission[] = null) {
    if (list == null) {
      if (this.fileEditing != null && this.fileEditing.permissions != null && this.fileEditing.permissions.length > 0) {
        this.fileEditing.permissions.splice(index, 1);//remove element from array  
        this.changePermission(0);
      }
    }
    else {
      if (list != null && list.length > 0) {
        list.splice(index, 1);//remove element from array  
        this.changeDetectorRef.detectChanges();
      }
    }

    if (this.type == "file") {
      this.onSaveEditingFile(null);
    }
    else {
      this.fileEditing.folderName = this.folderName;
      this.fileEditing.folderId = this.dmSV.getFolderId();
      this.fileEditing.recID = this.id;
      this.folderService.updateFolder(this.fileEditing).subscribe(async res => {
      });
    }
  }

  openRole() {
    // if (this.update || this.assign) {
    // $('#dms_share').css('z-index', '9999');
    // $('#dms_properties').css('z-index', '9999');
    // $('#dms_request-permission').css('z-index', '9999');
    // this.cbxsv.dataSelcected = [];
    // this.addnewIndex = 0;
    // this.loadRole();
    // this.openDialogFolder(this.contentRole, "xs", "role");
    //  }
  }

  allowSetRight() {
    // this.fileEditing.assign
    var right = this.dmSV.idMenuActive != '6' && this.dmSV.idMenuActive != '7' && this.assignRight;
    //var right = this.dmSV.idMenuActive != '6' && this.dmSV.idMenuActive != '7' && this.fileEditing.assign;
    return right;
  }

  onSaveRight() {
    var that = this;
    if (this.endDate != null && this.endDate < this.startDate) {

    //  $('#endDateRole').addClass('form-control is-invalid');
      this.changeDetectorRef.detectChanges();
      return;
    }

    // save current permisssion
    if (this.currentPemission > -1 && this.fileEditing.permissions[this.currentPemission] != null) {
      //  this.fileEditing.permissions[this.currentPemission].isSharing = this.modeSharing;
      this.fileEditing.permissions[this.currentPemission].full = this.full;
      this.fileEditing.permissions[this.currentPemission].create = this.create;
      this.fileEditing.permissions[this.currentPemission].read = this.read;
      this.fileEditing.permissions[this.currentPemission].update = this.update;
      this.fileEditing.permissions[this.currentPemission].delete = this.delete;
      this.fileEditing.permissions[this.currentPemission].download = this.download;
      this.fileEditing.permissions[this.currentPemission].share = this.share;
      this.fileEditing.permissions[this.currentPemission].upload = this.upload;
      this.fileEditing.permissions[this.currentPemission].startDate = this.startDate;
      this.fileEditing.permissions[this.currentPemission].endDate = this.endDate;
      this.fileEditing.permissions[this.currentPemission].assign = this.assign;
    }

    if (this.modePermission) {
      if (this.type == "file") {
    //    this.onSaveEditingFile(modal);
      }
      else {
        // this.fileEditing.folderName = this.folderName;
        this.fileEditing.folderId = this.dmSV.getFolderId();
        this.fileEditing.recID = this.id;
        this.folderService.updateFolder(this.fileEditing).subscribe(async res => {
        });
        // this.folderService.updateFolderPermisson(this.fileEditing).subscribe(async res => {
        // });
      }
    }
    this.dialog.close();
    //this.modal
    //modal.dismiss('Cross click');// modal.close();
  }
}