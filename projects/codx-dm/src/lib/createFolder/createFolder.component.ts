import { NgForOf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Host,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogData,
  DialogRef,
  NotificationsService,
  TenantService,
  ViewsComponent,
} from 'codx-core';
import { FolderService } from '@shared/services/folder.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-common/src/lib/component/viewFileDialog/systemDialog.service';
import {
  FileInfo,
  FileUpload,
  HistoryFile,
  ItemInterval,
  Permission,
  SubFolder,
} from '@shared/models/file.model';
import { FolderInfo } from '@shared/models/folder.model';
import { RolesComponent } from '../roles/roles.component';
import { PhysicalComponent } from './physical/physical.component';
import { SubFolderComponent } from './subFolder/subFolder.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'createFolder',
  templateUrl: './createFolder.component.html',
  styleUrls: ['./createFolder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateFolderComponent implements OnInit {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;
  @Output() eventShow = new EventEmitter<boolean>();
  titleDialog: any;
  historyFile: HistoryFile;
  propertiesFolder: boolean;
  showError = false;
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
  updateversion: boolean;
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
  folderName = '';
  fileName = []; //"file";
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
  mytitle = 0;
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
  create: boolean;
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
  viewThumb = false;
  alert = false;
  email = false;
  copyrights: any;
  copyrightsControl: any = false;
  approvers: string;
  revisionNote: string;
  location: string;
  public loading = false;
  private onScrolling = true;
  dataSelcected: any = [];
  entityName = '';
  predicate = '';
  dataValue = '';
  viewMember = '';
  valueMember = '';
  service = '';
  objUser: any;
  parentIdField = '';
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
  requestRight = '1';
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
  titleOK = 'Lưu';
  titleDialogPHysical = 'Physical Control';
  titleRolesDialog = 'Cập nhật quyền';
  titleShare = 'Chia sẻ';
  titleExpand = 'Mở rộng';
  titleSelectObject = 'Chọn đối tượng';
  titlemessage = 'Thông báo';
  titletitleCreateSubFolder = 'Thêm mới cấp thư mục';
  titleAlert = 'Alert';
  titleEmail = 'Email';
  titleDelete = 'Xóa';
  titleEdit = 'Sửa';
  titleDesctionSub = 'Diễn giải';
  titleSetting = 'Thiết lập';
  titleLevel = 'Cấp thư mục';
  titleCreateSubFolder = 'Tạo thư mục cấp con tự động';
  titleAvatar = 'Hiển thị hình ảnh tập tin';
  titleSecurityControl = 'Bảo mật';
  copymessage = 'Bạn có muốn lưu lên không ?';
  renamemessage = 'Bạn có muốn lưu với tên {0} không ?';
  titleCopyrightsControl = 'Quản lý bản quyền';
  titleStoreControl = 'Kiểm soát vị trí kho';
  titleVersionControl = 'Kiểm soát phiên bản';
  titleApprovar = 'Xét duyệt tài liệu';
  titleFolderName = 'Tên thư mục';
  titleFolderRequired = 'Tên thư mục bắt buộc..';
  titleAccessDenied = '';
  titleApprovalName = 'Bạn chưa nhập thông tin người xét duyệt';
  width = '720';
  height = window.innerHeight;
  //objectType="";
  indexSub: number;
  subItemLevel: string;
  comboboxName = '';
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
  fieldUpdate = '';
  showPopup = false;
  edit = false;
  isAddFolder = false;
  constructor(
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
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.user = this.auth.get();
    this.dialog = dialog;
    this.titleDialog = data?.data?.title;
    this.isAddFolder =  data?.data?.isAddFolder;
    this.id = data.data.id ?? this.dmSV.folderID;
    this.propertiesFolder = data?.data?.readonly;
    if (data.data.id) this.edit = true;
    this.openForm();
    // if (this.fileEditing  == null) {
    //   this.fileEditing  = new FileUpload;
    //   this.fileEditing.permissions = this.addPermissionForRoot(this.fileEditing.permissions);
    // }

    // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {
    //this.refesh();
    //  this.openForm();
    this.dmSV.isFileEditing.subscribe((item) => {
      if (item) {
        this.fileEditing = item; //CHung Sửa nhớ
        this.changeDetectorRef.detectChanges();
      }
    });

    if (!this.dmSV.folderId) this.refesh();
    // this.dmSV.isListSubFolder.subscribe((item) => {
    //   this.listSubFolder = item;
    //   if (this.fileEditing === undefined) this.fileEditing = new FileUpload();
    //   this.fileEditing.subFolder = this.listSubFolder;
    //   this.changeDetectorRef.detectChanges();
    // });

    this.cache.valueList('L1488').subscribe((res) => {
      // console.log(res);
      this.listLevel = res.datas;
    });

    this.cache.valueList('L1484').subscribe((res) => {
      //  console.log(res);
      this.listType = res.datas;
    });

    this.cache.valueList('L1485').subscribe((res) => {
      //  console.log(res);
      this.listFormat1 = res.datas;
    });

    this.cache.valueList('L1486').subscribe((res) => {
      //   console.log(res);
      this.listFormat2 = res.datas;
    });

    this.cache.valueList('L1487').subscribe((res) => {
      //  console.log(res);
      this.listFormat3 = res.datas;
    });

    this.cache.valueList('L1489').subscribe((res) => {
      //console.log(res);
      this.listFormat4 = res.datas;
    });
  }
  refesh() {
    this.revision = false;
    this.physical = false;
    this.copyrightsControl = false;
    this.approval = false;
    this.security = false;
    this.createSubFolder = false;
    this.listSubFolder = null;
  }
  changeValue($event, type) {
    //   console.log($event);
    this.errorshow = true;
    switch (type) {
      case 'folderName':
        this.folderName = $event.data;
        //   alert(this.folderName);
        break;
    }
  }

  allpyShare($event) {}

  changeValueOwner($event) {
    this.showPopup = false;
    this.approvers = $event.id;
    // this.api.execSv("SYS","AD","UserGroupsBusiness","GetListMemberIDByGroupIDAsync",$event.id).subscribe(item=>{
    //   if(item)
    //     this.approvers = item[0]
    // })
    //this.approvers - $event.dataSelected[0].OrgUnitID;
  }

  openForm() {
    this.showAll = true;
    this.folderService.getFolder(this.id).subscribe(async (res) => {
      if (res) {
        this.setFolderAS(res);
        if (this.edit) {
          this.noeditName = false;
          this.checkPermission();
          this.updateRight = res.write;
          this.fileEditing = res;
          this.assignRight = res.assign;
          this.folderName = res.folderName;
          this.id = res.recID;
          this.icon = res.icon;
          this.listSubFolder = this.fileEditing.subFolder;
          //  this.checkSecurity = this.fileEditing.checkSecurity;
          if (this.fileEditing.hasSubFolder == true)
            this.createSubFolder = true;
          else this.createSubFolder = false;

          if (this.fileEditing.location) {
            let list = this.fileEditing.location.split('|');
            this.floor = list[0];
            this.range = list[1];
            this.shelf = list[2];
            this.compartment = list[3];
          } else {
            this.location = '';
            // this.approvers = "";
            // this.revisionNote = "";
            this.floor = '';
            this.range = '';
            this.shelf = '';
            this.compartment = '';
          }
          //  that.icon = "";
          //    this.openFileDialog('dms_folder');
          //this.validate('folderName');
          this.changeDetectorRef.detectChanges();
        } else {
          this.noeditName = false;
          //this.folderName = "";
          this.floor = '';
          this.range = '';
          this.shelf = '';
          this.compartment = '';
          this.modeSharing = false;
          this.fileEditing = new FileUpload();
          this.fileEditing.folderID = res.recID;
          this.fileEditing.permissions = res.permissions;
          var check = this.fileEditing.permissions.filter(
            (x) => x.objectType == '1'
          );
          if (check.length == 0) {
            var check2 = this.fileEditing.permissions.filter(
              (x) => x.objectID == this.user.userID
            );
            if (check2 && check2.length > 0)
              this.fileEditing.permissions =
                this.fileEditing.permissions.filter(
                  (x) => x.id != check2[0].id
                );
            var perm = new Permission();
            perm.objectType = '1';
            perm.objectID = this.user.userID;
            perm.objectName = 'Owner (' + this.user.userName + ')';
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
            this.fileEditing.permissions.push(perm);
          }
          this.startDate = null;
          this.endDate = null;
          if (this.parentFolder != null) {
            this.fileEditing.permissions = [];
            this.fileEditing.permissions = JSON.parse(
              JSON.stringify(this.parentFolder.permissions)
            );
          }
          this.checkPermission(res);
          // this.fileEditing.permissions = this.addPermissionForRoot(
          //   this.fileEditing.permissions
          // );
          this.icon = '';
          this.changeDetectorRef.detectChanges();
        }
      } else {
        this.noeditName = false;
        //this.folderName = "";
        this.security = false;
        this.revision = false; //this.dmSV.parentRevision;
        this.physical = false; //this.dmSV.parentPhysical;
        this.copyrightsControl = false; //this.dmSV.parentCopyrights;
        this.approval = false; //this.dmSV.parentApproval;
        this.viewThumb = false;
        this.alert = false;
        this.email = false;
        this.location = ''; //this.dmSV.parentLocation;
        this.approvers = ''; //this.dmSV.parentApprovers;
        this.revisionNote = ''; //this.dmSV.parentRevisionNote;
        this.floor = '';
        this.range = '';
        this.shelf = '';
        this.compartment = '';
        this.fileEditing = new FileUpload();
        //alert(1);
        this.startDate = null;
        this.endDate = null;
        if (this.parentFolder != null) {
          this.fileEditing.permissions = [];
          this.fileEditing.permissions = JSON.parse(
            JSON.stringify(this.parentFolder.permissions)
          );
        }
        this.checkPermission();
        this.fileEditing.permissions = this.addPermissionForRoot(
          this.fileEditing.permissions
        );
        this.icon = '';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  setFolderAS(data: any) {
    this.revision = data?.revision == null ? false : data?.revision;
    this.physical = data?.physical == null ? false : data?.physical;
    this.copyrightsControl =
      data?.copyrights == null ? false : data?.copyrights;
    this.approval = data?.approval == null ? false : data?.approval;
    this.security = data?.checkSecurity == null ? false : data?.checkSecurity;
    this.location = data?.location == null ? '' : data?.location;
    this.approvers = data?.approvers == null ? '' : data?.approvers;
    this.revisionNote = data?.revisionNote == null ? '' : data?.revisionNote;
    this.viewThumb = data?.viewThumb == null ? false : data?.viewThumb;
    this.alert = data?.isAlert == null ? false : data?.isAlert;
    this.email = data?.isEmail == null ? false : data?.isEmail;
    this.changeDetectorRef.detectChanges();
  }

  onSaveRightChanged($event, ctrl) {
    var value = $event.data;
    switch (ctrl) {
      case 'security':
        this.security = value;
        break;
      case 'checkFolder':
        this.createSubFolder = value;
        this.changeDetectorRef.detectChanges();
        break;
      case 'approval':
        this.approval = value;
        if (!this.approval) this.approvers = '';
        break;
      case 'physical':
        this.physical = value;
        if (!this.physical) this.location = '';
        break;
      case 'revision':
        this.revision = value;
        break;
      case 'copyrightsControl':
        this.copyrightsControl = value;
        break;
      case 'sentemail':
        this.sendEmail = value;
        break;
      case 'postBlob':
        this.postblog = value;
        break;
      case 'assign':
        this.assign = value;
        break;
      case 'titleAvatar':
        this.viewThumb = value;
        break;

      case 'alert':
        this.alert = value;
        break;

      case 'email':
        this.email = value;
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  addPermissionForRoot(list: Permission[]) {
    var id = this.dmSV.folderId.getValue();
    var permissions = [];
    if (list != null && list.length > 0) permissions = list;

    // if (id == "3" || id == "4") {
    //this.fileEditing.permissions = [];
    list = [];
    permissions = list;
    let perm = new Permission();
    perm.objectType = '7';
    perm.objectName = 'Administrator';
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

    perm = new Permission();
    perm.objectType = '1';
    perm.objectID = this.user.userID;
    perm.objectName = 'Owner (' + this.user.userName + ')';
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
    this.listPerm = this.fileEditing.permissions; //this.fileEditing.permissions.filter(x => x.isSharing == this.modeSharing);
  }

  onSetPermision(sharing: boolean) {
    this.modeSharing = sharing;
    this.getListPermission();
    this.changeDetectorRef.detectChanges();
  }

  checkPermission(res: any = null) {
    //this.isSystem = false;
    this.readRight = this.dmSV.parentRead;
    this.createRight = this.dmSV.parentCreate;
    this.updateRight = res ? res.create : this.dmSV.parentUpdate;
    this.shareRight = this.dmSV.parentShare;
    this.deleteRight = this.dmSV.parentDelete;
    this.downloadRight = this.dmSV.parentDownload;
    this.uploadRight = this.dmSV.parentUpload;
    this.assignRight = this.dmSV.parentAssign;
  }

  onFolderSave() {
    this.errorshow = true;
    if (
      this.approval &&
      (this.approvers == '' || this.approvers == undefined)
    ) {
      this.notificationsService.notify(this.titleApprovalName);
      return;
    }

    if (this.folderName === '') {
      // $('#folderName').addClass('form-control is-invalid');
      // $('#folderName').focus();
      this.changeDetectorRef.detectChanges();
      return;
    }
    this.folderName = this.folderName.trim();
    this.fileEditing.folderName = this.folderName;
    this.fileEditing.approval = this.approval;
    this.fileEditing.revision = this.revision;
    this.fileEditing.physical = this.physical;
    this.fileEditing.copyrightsControl = this.copyrightsControl;
    this.fileEditing.folderID = this.dmSV.folderID;
    this.fileEditing.recID = this.id;
    this.fileEditing.location = this.location;
    this.fileEditing.hasSubFolder = this.createSubFolder;
    this.fileEditing.checkSecurity = this.security == null ? false : this.security;
    this.fileEditing.approvers = this.approvers;
    this.fileEditing.revisionNote = this.revisionNote;
    this.fileEditing.icon = this.icon;
    this.fileEditing.subFolder = this.listSubFolder;
    this.fileEditing.viewThumb = this.viewThumb;
    this.fileEditing.isAlert = this.alert;
    this.fileEditing.isEmail = this.email;
    var that = this;
    if (!this.edit) 
    {
      this.fileEditing.folderType = this.dmSV.idMenuActive;
      this.folderService.addFolder(this.fileEditing).subscribe(async (res) => {
        if (res.status == 0) {
          var folders = this.dmSV.listFolder;
          if (folders == null) folders = [];
          folders.push(Object.assign({}, res.data));
          this.fileEditing = res.data;
          this.setFolderAS(this.fileEditing);
          that.dmSV.listFolder = folders;
          that.dmSV.ChangeDataView.next(true);
          if(!this.isAddFolder) that.dmSV.addFolder.next(res.data);
          that.changeDetectorRef.detectChanges();
          this.dialog.close(res.data);
          this.dmSV.fileEditing.next(null);
        } else {
          this.message = res.message;
          this.errorshow = true;
          this.changeDetectorRef.detectChanges();
        }

        this.notificationsService.notify(res.message);
      });
    } else {
      // update folder
      //
      this.folderService
        .updateFolder(this.fileEditing)
        .subscribe(async (item) => {
          if (item.status == 0) {
            let folder = new FolderInfo();
            folder.recID = that.id;
            folder.folderName = that.folderName;
            //  this.dmSV.nodeChange.next(folder);
            var folders = this.dmSV.listFolder;
            let index = folders.findIndex(
              (d) => d.recID.toString() === this.id
            );
            if (index != -1) {
              //   folders[index].folderName = that.folderName;
              folders[index] = item.data;
            }
            that.dmSV.listFolder = folders;
            //that.dmSV.ChangeData.next(true);
            //that.dmSV.ChangeOneFolder.next(folders[index]);
            that.dmSV.parentFolder.next(item?.data);
            that.dmSV.nodeChange.next(folders[index]);
            that.changeDetectorRef.detectChanges();
            this.modalService.dismissAll();
          } else {
            // $('#folderName').addClass('form-control is-invalid');
            // $('#folderName').focus();
            this.errorshow = true;
            this.message = item.message;
            this.notificationsService.notify(this.message);
            // $('#folderError').html(item.message);
            this.changeDetectorRef.detectChanges();
          }
          // thu muc da co
          if (item.status == 2) {
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notificationsService
              .alert(this.titlemessage, item.message, config)
              .closed.subscribe((x) => {
                if (x.event.status == 'Y') {
                  this.folderService
                    .copyFolder(that.id, that.folderName, '', 1, 1)
                    .subscribe(async (res) => {
                      if (res.status == 0) {
                        that.dmSV.isTree = false;
                        that.dmSV.currentNode = '';
                        that.dmSV.folderId.next(res.data.recID);
                        var folders = this.dmSV.listFolder;
                        let index = folders.findIndex(
                          (d) => d.recID.toString() === that.id
                        );
                        if (index > -1) {
                          that.dmSV.nodeDeleted.next(that.id);
                          folders.splice(index, 1); //remove element from array
                        }
                        that.dmSV.listFolder = folders;
                        that.dmSV.ChangeData.next(true);
                        this.dmSV.fileEditing.next(null);
                        this.dialog.close();
                      } else {
                        // $('#fullName').addClass('form-control is-invalid');
                        // $('#fullName').focus();
                        this.message = res.message;
                        this.errorshow = true;
                      }
                      that.changeDetectorRef.detectChanges();
                      this.notificationsService.notify(res.message);
                    });
                }
              });
          } else {
            this.notificationsService.notify(item.message);
            this.dmSV.fileEditing.next(null);
            this.dialog.close();
          }
        });
    }
  }

  disableSubItemAdd() {
    return (
      this.listSubFolder.length >= 5 ||
      this.subitem.level == '' ||
      this.subitem.type == '' ||
      this.subitem.format == ''
    );
  }

  openSubFolder() {
    this.indexSub = -1;
    this.subitem = new SubFolder();
    if (this.listSubFolder != null && this.listSubFolder != undefined)
      this.subitem.level = (this.listSubFolder.length + 1).toString();
    else this.subitem.level = '1';
    this.subitem.type = '';
    this.subitem.format = '';
    this.subItemLevel = '';
    this.subitem.description = '';
    this.disableSubItem = true;

    let dialog = this.callfc.openForm(
      SubFolderComponent,
      this.titleDialogPHysical,
      450,
      400,
      '',
      [this.functionID, this.indexSub, this.subitem, this.listSubFolder],
      ''
    );
    dialog.closed.subscribe((item) => {
      if (item.event) this.listSubFolder = item.event;
      this.changeDetectorRef.detectChanges();
    });
  }

  onDeleteSub(index) {
    this.listSubFolder.splice(index, 1);
    var newlist = [];
    for (var i = 0; i < this.listSubFolder.length; i++) {
      var item = JSON.parse(JSON.stringify(this.listSubFolder[i]));
      item.level = i + 1;
      newlist.push(Object.assign({}, item)); //push(new Object(), this.subitem);
    }
    this.listSubFolder = JSON.parse(JSON.stringify(newlist));
    this.changeDetectorRef.detectChanges();
  }

  onEditSub(index) {
    this.disableSubItem = false;
    this.indexSub = index;
    this.subitem = JSON.parse(JSON.stringify(this.listSubFolder[index]));
    this.subItemLevel = this.listSubFolder[index].level;
    let dialog = this.callfc.openForm(
      SubFolderComponent,
      this.titleDialogPHysical,
      450,
      400,
      '',
      [this.functionID, this.indexSub, this.subitem, this.listSubFolder],
      ''
    );
    dialog.closed.subscribe((item) => {
      if (item.event) this.listSubFolder = item.event;
      this.changeDetectorRef.detectChanges();
    });
  }

  removeUserRight(index) {
    this.fileEditing.permissions = this.fileEditing.permissions.filter(
      (x) => x.id != this.fileEditing.permissions[index].id
    );
    // this.folderService.updateFolderPermisson(this.fileEditing).subscribe(async res => {
    //   if (res) {
    //     this.dmSV.fileEditing.next(this.fileEditing);
    //     this.notificationsService.notify(res.message);
    //   }
    // });
  }

  isShowAll(action = false) {
    if (action) this.showAll = !this.showAll;
    return this.showAll;
  }

  SubFormat(item) {
    switch (item.type) {
      case '1':
        var idx = this.listFormat1.findIndex((x) => x.value == item.format);
        return idx > -1 ? this.listFormat1[idx].text : '';

      case '2':
        var idx = this.listFormat2.findIndex((x) => x.value == item.format);
        return idx > -1 ? this.listFormat2[idx].text : '';
      case '3':
        var idx = this.listFormat3.findIndex((x) => x.value == item.format);
        return idx > -1 ? this.listFormat3[idx].text : '';

      case '4':
        var idx = this.listFormat4.findIndex((x) => x.value == item.format);
        return idx > -1 ? this.listFormat4[idx].text : '';
    }
    return '';
  }

  SubLevel(item) {
    var idx = this.listLevel.findIndex((x) => x.value == item.level);
    return idx > -1 ? this.listLevel[idx].text : '';
  }

  SubType(item) {
    var idx = this.listType.findIndex((x) => x.value == item.type);
    return idx > -1 ? this.listType[idx].text : '';
    //return item.typeText;
  }

  openPhysical() {
    let dialog = this.callfc.openForm(
      PhysicalComponent,
      this.titleDialogPHysical,
      450,
      400,
      '',
      [this.functionID, this.location],
      ''
    );
    dialog.closed.subscribe((item) => {
      if (item && item.event) this.location = item.event;
    });
  }

  disableRight(item: string) {
    var ret = false;
    if (this.updateRight == false) return true;
    if (this.propertiesFolder) return true;

    switch (item) {
      case 'revision':
        ret = this.revision;
        break;
      case 'approval':
        ret = this.approval;
        break;
      case 'physical':
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
    this.dmSV.dataFileEditing.assign = this.assignRight;
    this.callfc.openForm(
      RolesComponent,
      this.titleRolesDialog,
      950,
      650,
      '',
      [this.functionID, null, null, null, this.propertiesFolder],
      ''
    );
  }

  checkFolderName() {
    if (this.folderName === '') return '1';
    else return '0';
  }

  validate(item) {
    switch (item) {
      case 'folderName':
        if (this.checkFolderName() != '0' && this.errorshow) {
          //this.errorshow = true;
          return 'w-100 dms-text-error is-invalid';
        } else {
          //  this.errorshow = true;
          return 'w-100';
        }
    }
    return '';
  }

  // validate(type) {
  //   return "form-control is-invalid error";
  // }

  valueChange($event, field) {
    if ($event != null) {
      switch (field) {
        case 'icon':
          if ($event) this.icon = $event;
          break;
      }
    }
  }
}
