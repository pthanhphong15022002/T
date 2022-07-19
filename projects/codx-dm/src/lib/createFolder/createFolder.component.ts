import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DataRequest, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderService } from '@shared/services/folder.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileInfo, FileUpload, HistoryFile, ItemInterval, Permission, SubFolder } from '@shared/models/file.model';
import { FolderInfo } from '@shared/models/folder.model';
import { RolesComponent } from '../roles/roles.component';
import { PhysicalComponent } from './physical/physical.component';
import { SubFolderComponent } from './subFolder/subFolder.component';

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
  titleDialogPHysical = 'Physical Control'; 
  titleRolesDialog = 'Cập nhật quyền';
  titleShare = 'Chia sẻ';  
  titleExpand = 'Mở rộng';
  titleSelectObject = 'Chọn đối tượng';
  titlemessage = 'Thông báo';
  titletitleCreateSubFolder = 'Thêm mới cấp thư mục';
  titleDelete = 'Xóa';
  titleEdit = 'Edit';
  titleDesctionSub = 'Diễn giải';
  titleSetting = 'Thiết lập';
  titleLevel = 'Cấp thư mục';
  titleCreateSubFolder = 'Tạo thư mục cấp con tự động';
  titleSecurityControl = 'Bảo mật';
  copymessage = 'Bạn có muốn lưu lên không ?';
  renamemessage = 'Bạn có muốn lưu với tên {0} không ?';  
  titleCopyrightsControl = 'Quản lý bản quyền';
  titleStoreControl = 'Kiểm soát vị trí kho';
  titleVersionControl = 'Kiểm soát phiên bản';
  titleApprovar = 'Xét duyệt tài liệu';
  titleFolderRequired = 'Tên thư mục bắt buộc..';  
  width = '720'; 
  height = window.innerHeight;
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
  showPopup =false;
  constructor(  
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
    private folderService: FolderService,    
    private api: ApiHttpService,
    public dmSV: CodxDMService,
    private callfc: CallFuncService,
    private modalService: NgbModal,
    private auth: AuthStore,
    private cache: CacheService,
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
    this.dmSV.ListSubFolder.subscribe(item => {
      this.listSubFolder = item;
      this.changeDetectorRef.detectChanges();
    });

    this.cache.valueList("L1488").subscribe((res) => {
      // console.log(res);
      this.listLevel = res.datas;
    });

    this.cache.valueList("L1484").subscribe((res) => {
      console.log(res);
      this.listType = res.datas;
    });

    this.cache.valueList("L1485").subscribe((res) => {
      console.log(res);
      this.listFormat1 = res.datas;
    });

    this.cache.valueList("L1486").subscribe((res) => {
      console.log(res);
      this.listFormat2 = res.datas;
    });

    this.cache.valueList("L1487").subscribe((res) => {
      console.log(res);
      this.listFormat3 = res.datas;
    });

    this.cache.valueList("L1489").subscribe((res) => {
      //console.log(res);
      this.listFormat4 = res.datas;
    });
  }
  
  changeValue($event, type) {
    console.log($event);
    switch(type) {
      case "folderName":
        this.folderName = $event.data;
     //   alert(this.folderName);
        break;
    }
  }

  allpyShare($event) {

  }

  changeValueOwner($event) {
    
    this.showPopup = false;   
    if ($event?.id != undefined)
      this.approvers = $event.id; 
    //this.approvers - $event.dataSelected[0].OrgUnitID;
  }

  openForm() {
    var that = this;
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

  onSaveRightChanged($event, ctrl) {
    var value = $event.data;
    switch (ctrl) {    
      case 'checkFolder':
        this.createSubFolder = value;
        this.changeDetectorRef.detectChanges();
        break;        
      case "approval":
        this.approval = value;
        if (!this.approval)
          this.approvers = "";
        break;
      case "physical":
        this.physical = value;
        break;
      case "revision":
        this.revision = value;
        break;
      case "copyrightsControl":
        this.copyrightsControl = value;
        break;
      case "sentemail":
        this.sendEmail = value;
        break;
      case "postBlob":
        this.postblog = value;
        break;
      case "assign":
        this.assign = value;
        break;
    }
    this.changeDetectorRef.detectChanges();
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

  getListPermission() {
    this.listPerm = this.fileEditing.permissions;//this.fileEditing.permissions.filter(x => x.isSharing == this.modeSharing);
  }

  onSetPermision(sharing: boolean) {
    this.modeSharing = sharing;
    this.getListPermission();
    this.changeDetectorRef.detectChanges();
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
  
  disableSubItemAdd() {
    return (this.listSubFolder.length >= 5 || this.subitem.level == "" || this.subitem.type == "" || this.subitem.format == "")
  }
    
  openSubFolder() {
    this.callfc.openForm(SubFolderComponent, this.titleDialogPHysical, 450, 400, "", [this.functionID, -1, this.listSubFolder], "");
  }

  onDeleteSub(index) {
    this.listSubFolder.splice(index, 1);
    var newlist = [];   
    for (var i = 0; i < this.listSubFolder.length; i++) {
      var item = JSON.parse(JSON.stringify(this.listSubFolder[i]));
      item.level = i + 1;
      newlist.push(Object.assign({}, item));//push(new Object(), this.subitem);
    }
    this.listSubFolder = JSON.parse(JSON.stringify(newlist));
    this.changeDetectorRef.detectChanges();
  }

  onEditSub(index) {
    this.disableSubItem = false;
    this.indexSub = index;
    this.subitem = JSON.parse(JSON.stringify(this.listSubFolder[index]));
    this.subItemLevel = this.listSubFolder[index].level;
    this.callfc.openForm(SubFolderComponent, this.titleDialogPHysical, 450, 400, "", [this.functionID, index, this.listSubFolder], "");    
  }

  removeUserRight(index) {    
  }

  isShowAll(action = false) {
    if (action)
      this.showAll = !this.showAll;
    return this.showAll;
  }

  SubFormat(item) {
    switch (item.type) {
      case "1":
        var idx = this.listFormat1.findIndex(x => x.value == item.format);
        return idx > -1 ? this.listFormat1[idx].text : "";

      case "2":
        var idx = this.listFormat2.findIndex(x => x.value == item.format);
        return idx > -1 ? this.listFormat2[idx].text : "";
      case "3":
        var idx = this.listFormat3.findIndex(x => x.value == item.format);
        return idx > -1 ? this.listFormat3[idx].text : "";

      case "4":
        var idx = this.listFormat4.findIndex(x => x.value == item.format);
        return idx > -1 ? this.listFormat4[idx].text : "";
    }
    return "";
  }

  SubLevel(item) {
    var idx = this.listLevel.findIndex(x => x.value == item.level);
    return idx > - 1 ? this.listLevel[idx].text : "";
  }

  SubType(item) {
    var idx = this.listType.findIndex(x => x.value == item.type);
    return idx > - 1 ? this.listType[idx].text : "";
    //return item.typeText;
  }

  openPhysical() {
  //  this.dmSV.dataFileEditing = this.fileEditing;
  // let list = this.fileEditing.location.split("|");
  // this.floor = list[0];
  // this.range = list[1];
  // this.shelf = list[2];
  // this.compartment = list[3];
    var location = this.fileEditing.location;
    this.callfc.openForm(PhysicalComponent, this.titleDialogPHysical, 450, 400, "", [this.functionID, location], "");
   // this.openDialogFolder(this.contentPhysical, "xs", "physical");
  }

  disableRight(item: string) {
    var ret = false;
    if (this.updateRight == false)
      return true;
    if (this.propertiesFolder)
      return true;

    switch (item) {
      case "revision":
        ret = this.revision;
        break;
      case "approval":
        ret = this.approval;
        break;
      case "physical":
        ret = this.physical;
        break;
    }
    return !ret;
  }

  openApproval() {
    this.showPopup = true;
     this.changeDetectorRef.detectChanges();
    //this.callfc.openForm(share, '', 420, window.innerHeight); 
  }

  openRight(mode = 1, type = true) {
    this.dmSV.dataFileEditing = this.fileEditing;
    this.callfc.openForm(RolesComponent, this.titleRolesDialog, 950, 650, "", [this.functionID], "");
  }

  checkFolderName() {     
     if (this.folderName === "")
       return "1";  
     else
       return "0";
   }

  validate(item) {  
    this.errorshow = false;
    switch (item) {  
      case "folderName":
        if (this.checkFolderName() != "0") {        
          return "w-100 text-error is-invalid";       
        }
        else {
          return "w-100";      
        }

        break;
    }  
    return "";    
  }

  // validate(type) {
  //   return "form-control is-invalid error";
  // }


  valueChange($event, type) {
  }

}