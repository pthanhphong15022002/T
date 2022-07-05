import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, DataRequest, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
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
    ) {
   // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {   
   
  }

  
  onFolderSave() {   
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

  isShowAll(status) {
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

  }

  valueChange($event, type) {
  }

}