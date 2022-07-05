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

@Component({
  selector: 'createFolder',
  templateUrl: './createFolder.component.html',
  styleUrls: ['./createFolder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateFolderComponent implements OnInit {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;    
  @Output() eventShow = new EventEmitter<boolean>();
  titleDialog: any;
  historyFile: HistoryFile;
  propertiesFolder: boolean;
  closeResult = '';
  dialog: any;
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
  constructor(  
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
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
      this.user = this.auth.get();
      this.dialog = dialog;
      this.titleDialog = data.data.title;
   // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {   
    this.openForm();
  }
  
  changeValue($event, type) {
    console.log($event);
    switch(type) {
      case "folderName":
        this.folderName = $event.data;
        alert(this.folderName);
        break;
    }
  }

  openForm() {
    var that =this;
    this.showAll = false;
    if (that.id != "" && this.id != null) {
      this.noeditName = false;
      this.folderService.getFolder(this.id).subscribe(async res => {
        this.checkPermission();
        this.fileEditing = res;
        this.assignRight = res.assign;
        this.folderName = res.folderName;
        this.id = res.recID;
        this.icon = res.icon;
        this.listSubFolder = this.fileEditing.subFolder;
        //  this.checkSecurity = this.fileEditing.checkSecurity;
        if (this.fileEditing.hasSubFolder == true) {
          this.createSubFolder = true;
        }
        else {
          this.createSubFolder = false;
        }
        this.revision = this.fileEditing.revision;
        this.physical = this.fileEditing.physical;
        this.copyrightsControl = res.copyrights;
        this.approval = this.fileEditing.approval;
        this.security = this.fileEditing.checkSecurity;
        this.location = this.fileEditing.location;
        this.approvers = this.fileEditing.approvers;
        this.revisionNote = this.fileEditing.revisionNote;
        if (this.fileEditing.location != null && this.fileEditing.location != "") {
          let list = this.fileEditing.location.split("|");
          this.floor = list[0];
          this.range = list[1];
          this.shelf = list[2];
          this.compartment = list[3];
        }
        else {
          this.location = "";
          // this.approvers = "";
          // this.revisionNote = "";
          this.floor = "";
          this.range = "";
          this.shelf = "";
          this.compartment = "";
        }
        //  that.icon = "";
    //    this.openFileDialog('dms_folder');
        //this.validate('folderName');
        this.changeDetectorRef.detectChanges();

      });
    }
    else {
      this.noeditName = false;
      //this.folderName = "";
      this.security = false;
      this.revision = this.dmSV.parentRevision;
      this.physical = this.dmSV.parentPhysical;
      this.copyrightsControl = this.dmSV.parentCopyrights;
      this.approval = this.dmSV.parentApproval;
      this.location = this.dmSV.parentLocation;
      this.approvers = this.dmSV.parentApprovers;
      this.revisionNote = this.dmSV.parentRevisionNote;
      this.floor = "";
      this.range = "";
      this.shelf = "";
      this.compartment = "";
      this.fileEditing = new FileUpload();
      //alert(1);
      this.startDate = null;
      this.endDate = null;
      if (this.parentFolder != null) {
        this.fileEditing.permissions = [];
        this.fileEditing.permissions = JSON.parse(JSON.stringify(this.parentFolder.permissions));
      }
      this.checkPermission();
      this.fileEditing.permissions = this.addPermissionForRoot(this.fileEditing.permissions);
      //  this.listPerm = this.fileEditing.permissions.filter(x => x.isSharing == this.modeSharing || x.isSharing == null);
      //  this.addEveryOnePermission(null);
      //alert(1);
      //this.openDialogFolder(this.contentFolder, "lg");
      this.icon = "";
     // this.openFileDialog('dms_folder');
      // this.validate('folderName');
      this.changeDetectorRef.detectChanges();
    }
  }

  addPermissionForRoot(list: Permission[]) {
    var id = this.dmSV.folderId.getValue();
    var permissions = [];
    if (list != null && list.length > 0)
      permissions = list;

   // if (id == "3" || id == "4") {
      //this.fileEditing.permissions = [];
      list = [];
      permissions = list;
      let perm = new Permission;
      perm.objectType = "7";
      perm.objectName = "Administrator";
      perm.isSystem = true;
      perm.isActive = true;
      perm.read = true;
      perm.download = true;
      perm.isSharing = false;
      perm.full = true;
      perm.share = true;
      perm.update = true;
      perm.create = true;
      //perm.delete = false;
      perm.delete = true;
      perm.upload = true;
      perm.assign = true;
      permissions.push(Object.assign({}, perm));

      perm = new Permission;
      perm.objectType = "1";
      perm.objectID = this.user.userID;
      perm.objectName = "Owner (" + this.user.userName + ")";
      perm.isSystem = true;
      perm.isActive = true;
      perm.isSharing = false;
      perm.read = true;
      perm.download = true;
      perm.full = true;
      perm.share = true;
      perm.update = true;
      perm.create = true;
      perm.delete = true;
      perm.upload = true;
      perm.assign = true;
      permissions.push(Object.assign({}, perm));
  //  }
    return permissions;
  }

  checkPermission() {
    //this.isSystem = false;
    this.readRight = this.dmSV.parentRead;
    this.createRight = this.dmSV.parentCreate;
    this.updateRight = this.dmSV.parentUpdate;
    this.shareRight = this.dmSV.parentShare;
    this.deleteRight = this.dmSV.parentDelete;
    this.downloadRight = this.dmSV.parentDownload;
    this.uploadRight = this.dmSV.parentUpload;
    this.assignRight = this.dmSV.parentAssign;
  }

  onFolderSave() {   
    this.dialog.close();
  }
  
  openSubFolder() {
  }

  onDeleteSub(index) {    
  }

  onEditSub(index) {     
  }

  removeUserRight(index) {    
  }

  onSaveRightChanged(ctrl, type) {    
  }

  isShowAll(action = false) {
    if (action)
      this.showAll = !this.showAll;
    return this.showAll;
  }

  SubFormat(sub) {
  }

  SubType(sub) {
  }

  SubLevel(sub) {    
  }

  openPhysical() {    
  }

  disableRight(type) {
  }

  openApproval() {
  }

  openRight() {
  }

  onSetPermision(status) {

  }

  validate(type) {
    return "form-control is-invalid error";
  }


  valueChange($event, type) {
  }

}