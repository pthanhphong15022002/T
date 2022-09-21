import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, CallFuncService, DataRequest, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderService } from '@shared/services/folder.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileInfo, FileUpload, HistoryFile, ItemInterval, Permission, SubFolder } from '@shared/models/file.model';
import { FolderInfo } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { threadId } from 'worker_threads';
import { traceChildTaskBar } from '@syncfusion/ej2-gantt/src/gantt/base/css-constants';
import { AddUserComponent } from 'projects/codx-ad/src/lib/users/add-user/add-user.component';
import { AddRoleComponent } from '../addrole/addrole.component';

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
  codxView: any;
  dialog: any;
  titleDialog = 'Chia sẻ quyền'; 
  titleSave = 'Lưu';
  titleFunction = 'Chức năng';
  titleDescription = 'Mô tả';
  titleAllow = 'Cho phép';
  titleFullControl = 'Full control';
  titleRightDescription = 'Người dùng có tất cà quyền trên folder/file';
  titleCreateFolder = 'Tạo thư mục';
  titleAllowCreateFolder = 'Cho phép tạo thư mục';
  titleView = 'Xem';
  titleViewDescription = 'Cho phép xem chi tiết folder/file';
  titleUpdate = 'Sửa';
  titleUpdateDescription = 'Cho phép chỉnh sửa thông tin của folder/file';
  titleDelete = 'Xóa';
  titleDeleteDesc = 'Cho phép xóa folder/file';
  titleShare = 'Chia sẻ';
  titleShareDesc = 'Cho phép chia sẻ folder/file';
  titleAssign = 'Chia sẻ quyền';
  titleAssignDesc = 'Cho phép chia sẻ và chỉnh sửa quyền';
  titleUpload = 'Tải lên';
  titleUploadDesc = 'Cho phép upload file';
  titleDownload = 'Tải về';
  titleDownloadDesc = 'Cho phép download file';
  titleFromDate = 'Ngày hiệu lực';
  titleToDate = 'Ngày hết hạn';
  historyFile: HistoryFile;
  propertiesFolder = false;
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
  full: boolean = true;
  isSetFull = false;
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
 // permissions: Permission[];
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
  hasShare = false;
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
    private callfc: CallFuncService,
    private notificationsService: NotificationsService,
   // private confirmationDialogService: ConfirmationDialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
    ) {
    
   //   this.read = true;
      this.data = data.data;
      if (this.data[0] == "1")
        this.modePermission = true;
      else  
        this.modePermission = false;
      if(this.data[2])
        this.codxView = this.data[2];
      this.fileEditing =  JSON.parse(JSON.stringify(this.dmSV.dataFileEditing)); 
      this.id = this.fileEditing.recID;
      this.folderName = this.fileEditing.folderName
      if (this.fileEditing.folderName != null) {
        this.type = 'folder';
      }
      else 
        this.type = 'file';

      this.user = this.auth.get();
      this.dialog = dialog;    
      this.startDate = null;
      this.endDate = null;        
  }

  ngOnInit(): void {      
    this.changePermission(0);
    this.getRoleShare();
  }
  getData(recID:any)
  {
    this.api
    .execSv("DM", 'DM', 'FolderBussiness', 'GetFoldersByIDAsync', recID)
    .subscribe((item) => {
      
    });
  }
  getRoleShare()
  {
    if(this.fileEditing?.permissions && this.fileEditing?.permissions.length>0)
    {
      var item = this.fileEditing?.permissions.filter(x=>x.objectID == this.user?.userID);
      this.hasShare = item[0]?.assign;
    }
  }
  onSaveRightChanged($event, ctrl) {
    var value = $event.data;
    switch (ctrl) {
      case 'checkFolder':
        this.createSubFolder = value;
        this.changeDetectorRef.detectChanges();
        break;

      case 'checkSecurity':
        this.security = value;
        break;
      case "full":        
        this.full = value;        
        if (this.isSetFull) {
          this.create = value;
          // if (this.readRight) 
          this.read = value;
          //   if (this.deleteRight) 
          this.delete = value;
          //   if (this.updateRight)   
          this.update = value;
          //   if (this.uploadRight)   
          this.upload = value;
          //   if (this.shareRight)   
          this.share = value;
          //  if (this.downloadRight) 
          this.download = value;
          this.assign = value;
        }
        break;  
      case "approval":
        this.approval = value;
        //    if (!this.approval)
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
      case "fromdate":
        if (value != null)
          this.startDate = value.fromDate;      
        break;
      case "todate":
        if (value != null)
          this.endDate = value.fromDate;      
        break;
        default:
          this.isSetFull = false;
          this[ctrl]= value;
          break;
    }

    if (ctrl != 'full' && ctrl != 'copyrightsControl' && ctrl != 'revision' && ctrl != 'physical' && ctrl != 'approval' && value == false)
      this.full = false;

    if (this.assign && this.create && this.read && this.delete && this.update && this.upload && this.share && this.download)
      this.full = true;

     this.changeDetectorRef.detectChanges();
  }

  checkCurrentRightUpdate(owner = true) {
    if(!this.hasShare) return true;
    if (!this.isSystem) {
      if (this.user.administrator) 
        return false;
      else {                
        return !this.fileEditing.assign; //!this.assignRight;//this.fileEditing.assign;
      }      
    }
    else {
      return true;
      // if (owner) {
      //   if (this.objectType === "7")
      //     return true;
      //   else // objectType == 1        
      //   //  return !this.dmSV.parentAssign && !this.userID == this.user.userID
      //    return !this.fileEditing.assign && !this.user.administrator;
      // }
      // else       
      //   return true;
    }
  }

  checkCurrentRightUpdate1() {  
    if (!this.fileEditing.permissions[this.currentPemission].isSystem) {
      return !this.fileEditing.permissions[this.currentPemission].assign;//this.fileEditing.assign;
    }
    else {    
      return true;
    }
  }

  onSaveEditingFile() {
    if (this.fileEditing.fileName === "") {     
      return;
    }

    if (this.id != "") {
      // update file
      // save permisson
      this.fileService.updateFile(this.fileEditing).subscribe(item => {
        if (item.status == 0) {
          let res = item.data;
          if (res != null) {
            var files = this.dmSV.listFiles;
            let index = files.findIndex(d => d.recID.toString() === this.id);
            if (index != -1) {
              files[index].fileName = res.fileName;
            }
            this.dmSV.listFiles = files;
            this.dmSV.ChangeData.next(true);
            this.changeDetectorRef.detectChanges();         
          }
        }
        else {      
          this.errorshow = true;          
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
    }
  }



  checkItemRight(i) {
    //isSystem
    if (!this.fileEditing.permissions[i].isSystem)
      return !this.assignRight;
    else
      return true;
  }

  changePermission(index) {
    // alert(index);
    // save old permission   
    // alert(1);
   // this.currentPemission = index;
    debugger;
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
      this.full = this.fileEditing.permissions[index].create && this.fileEditing.permissions[index].read && this.fileEditing.permissions[index].update && this.fileEditing.permissions[index].delete && this.fileEditing.permissions[index].download && this.fileEditing.permissions[index].share && this.fileEditing.permissions[index].upload && this.fileEditing.permissions[index].assign;
    //  this.isSetFull = true;
      this.create = this.fileEditing.permissions[index].create;
      this.read = this.fileEditing.permissions[index].read;
      this.update = this.fileEditing.permissions[index].update;
      this.delete = this.fileEditing.permissions[index].delete;
      this.download = this.fileEditing.permissions[index].download;
      this.share = this.fileEditing.permissions[index].share;
      this.upload = this.fileEditing.permissions[index].upload;
      this.assign = this.fileEditing.permissions[index].assign;
      this.startDate = this.fileEditing.permissions[index].startDate;
      this.endDate = this.fileEditing.permissions[index].endDate;
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

  controlFocus(isFull){
    this.isSetFull = isFull;
    this.changeDetectorRef.detectChanges();    
  }


  removeUserRight(index, list: Permission[] = null) {
    var config = new AlertConfirmInputConfig();
        config.type = 'YesNo';
    this.notificationsService
    .alert('Thông báo', 'Bạn có chắc chắn muốn xóa?', config)
    .closed.subscribe((x) => {
      if (x.event.status == 'Y'){
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
          this.onSaveEditingFile();
        }
        else {
          this.fileEditing.folderName = this.folderName;
          this.fileEditing.folderId = this.dmSV.getFolderId();
          this.fileEditing.recID = this.id;
          this.folderService.updateFolder(this.fileEditing).subscribe(res => {
            if(res)
              this.codxView?.dataService.update(this.fileEditing).subscribe();
          });
        }
      };
    });
  } 

  allowSetRight() {
    // this.fileEditing.assign
    var right = this.dmSV.idMenuActive != '6' && this.dmSV.idMenuActive != '7' && this.assignRight;
    //var right = this.dmSV.idMenuActive != '6' && this.dmSV.idMenuActive != '7' && this.fileEditing.assign;
    right = true;
    return right;
  }

  onSaveRight() {
    if (this.endDate != null && this.endDate < this.startDate) {
    //  $('#endDateRole').addClass('form-control is-invalid');
      this.changeDetectorRef.detectChanges();
      return;
    }
    // save current permisssion
    if (this.currentPemission > -1 && this.fileEditing.permissions[this.currentPemission] != null && this.fileEditing.permissions[this.currentPemission].objectType!="7") {
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

    this.dmSV.fileEditing.next(this.fileEditing);
    this.changeDetectorRef.detectChanges();
    if (this.modePermission) {
      if (this.type == "file") {
        this.fileService.updatePermisson(this.fileEditing).subscribe(async res => {
          if (res != null) {            
            this.notificationsService.notify(res.message);
          }
        });
        //this.onSaveEditingFile();
      }
      else {
        // this.fileEditing.folderName = this.folderName;
        this.fileEditing.folderId = this.dmSV.getFolderId();       
        // this.folderService.updateFolder(this.fileEditing).subscribe(async res => {
        // });
        this.folderService.updateFolderPermisson(this.fileEditing).subscribe(async res => {
          if (res != null) {
            this.dmSV.fileEditing.next(this.fileEditing);
            this.notificationsService.notify(res.message);
          }
        });
      }
    }
    
    this.dialog.close(this.fileEditing);
    //this.modal
    //modal.dismiss('Cross click');// modal.close();
  }

  getObjectName(item, index) {
    // if (!item) return;
    // let perm = new Permission();
    // //perm.objectType = this.cbxsv.objectType;//item.userID; 
    // // perm.objectType = this.cbxsv.arrType[index];  
    // // var objectName = this.cbxsv.arrName[index];
    // // var objCbx = this.cbxsv.arrSetting;
    // var setting = null;
    // switch (objectName.trim().toLowerCase()) {
    //   case "owner":
    //     perm.objectName = item.userName;
    //     perm.objectID = item.userID;
    //     break;
    //   case "my group":
    //     perm.objectName = objectName;
    //     //perm.objectID = item.userGroup;
    //     perm.objectID = item.groupID;
    //     break;
    //   case "my team":
    //     perm.objectName = objectName;
    //     perm.objectID = item.orgUnitID;
    //     break;
    //   case "my departments":
    //     perm.objectName = objectName;
    //     perm.objectID = item.departmentID;
    //     break;
    //   case "my division":
    //     perm.objectName = objectName;
    //     perm.objectID = item.divisionID;
    //     break;
    //   case "my company":
    //     perm.objectName = objectName;
    //     perm.objectID = item.companyID;
    //     break;
    //   case "administrator":
    //   case "everyone":
    //     perm.objectName = objectName;
    //     break;
    //   case "orgHierachy":
    //     break;
    //   case "departments":
    //     setting = objCbx["HRDepartments"];
    //     if (setting) {
    //       var key = setting.viewMember;
    //       var value = setting.valueMember;
    //       perm.objectName = item[key];
    //       perm.objectID = item[value];
    //     }
    //     break;
    //   case "positions":
    //     setting = objCbx["Positions"];
    //     if (setting) {
    //       var key = setting.viewMember;
    //       var value = setting.valueMember;
    //       perm.objectName = item[key];
    //       perm.objectID = item[value];
    //     }
    //     break;
    //   case "roles":
    //     setting = objCbx["UserRoles"];
    //     if (setting) {
    //       var key = setting.viewMember;
    //       var value = setting.valueMember;
    //       perm.objectName = item[key];
    //       perm.objectID = item[value];
    //     }
    //     break;
    //   case "groups":
    //     setting = objCbx["UserGroups"];
    //     if (setting) {
    //       var key = setting.viewMember;
    //       var value = setting.valueMember;
    //       perm.objectName = item[key];
    //       perm.objectID = item[value];
    //     }
    //     break;
    //   case "users":
    //     setting = objCbx["Users"];
    //     if (setting) {
    //       var key = setting.viewMember;
    //       var value = setting.valueMember;
    //       perm.objectName = item[key];
    //       perm.objectID = item[value];
    //     }
    //     // if (setting) {
    //     //  // this.cbxsv.objectType = "U";
    //     //   var key = setting.viewMember;
    //     //   var value = setting.valueMember;
    //     //   perm.objectName = item.userName;
    //     //   perm.objectID = item.userID;
    //     // }
    //     break;
    // }
    // perm.read = true;
    // return perm;
  }

  checkedValue(type) {
    switch(type) {
      case "full":
        return this.fileEditing.permissions[this.currentPemission].full;
      case "read":
        return this.fileEditing.permissions[this.currentPemission].read;
      case "create":
        return this.fileEditing.permissions[this.currentPemission].create;
      case "update":
        return this.fileEditing.permissions[this.currentPemission].update;
      case "delete":
        return this.fileEditing.permissions[this.currentPemission].delete;
      case "download":
        return this.fileEditing.permissions[this.currentPemission].download;
      case "share":
        return this.fileEditing.permissions[this.currentPemission].share;
      case "upload":
        return this.fileEditing.permissions[this.currentPemission].upload;
      case "assign":
        return this.fileEditing.permissions[this.currentPemission].assign;
    }
    return false;
  }

  addRoleToList(list: Permission[], item: Permission) {
    var index = -1;
    if (list != null) {
      if (item != null && list.length > 0) {
        index = list.findIndex(d => (d.objectID != null && d.objectID.toString() === item.objectID) || (d.objectID == null && d.objectType == item.objectType));
      }
    }
    else {
      list = [];
    }

    if (index == -1) {
      item.read = true;
      item.download = false;
      item.full = false;
      item.share = false;
      item.update = false;
      item.create = false;
      item.delete = false;
      item.upload = false;
      item.assign = false;

      if (item.objectType.toLowerCase() == '9') {      
        item.download = true;
      }

      if (item.objectType.toLowerCase() == '7') {       
        item.download = true;
        item.full = true;
        item.share = true;
        item.update = true;
        item.create = true;
        item.delete = true;
        item.upload = true;       
      }

      list.push(Object.assign({}, item));
      this.currentPemission = list.length - 1;
    }

    return list;
  }

  onSaveRole($event) {  
    debugger;  
    console.log($event);
    if ($event.data != undefined) {
      var data = $event.data;
      for(var i=0; i<data.length; i++) {
        var item = data[i];
        var perm = new Permission;        
       // if (this.startDate != undefined && this.startDate != null)
        perm.startDate = this.startDate;
       // if (this.endDate != undefined && this.endDate != null)
        perm.endDate = this.endDate;
        perm.isSystem = false;
        perm.isActive = true;
        perm.objectName = item.text != null ? item.text : item.objectName;
        perm.objectID = item.id;
        perm.objectType = item.objectType;
        perm.read = true;
        this.fileEditing.permissions = this.addRoleToList(this.fileEditing.permissions, perm);
      }
      this.changePermission(this.currentPemission);
   //   this.changePermission(this.currentPemission);
     // this.changeDetectorRef.detectChanges();
      // data.forEach(item => {
        
      // });
    }
    
    // this.onRole = false;        
    // var data = $event;//this.cbxsv.dataSelcected;
    // if ($event.data)
    //   data = $event.data;
    // // $('#dms_share').css('z-index', '9999');
    // // $('#dms_properties').css('z-index', '9999');
    // // $('#dms_request-permission').css('z-index', '9999');
    // //  alert(1);
    // // console.log(data);
    // // let index = this.fileEditing.permission.findIndex(d => d.toString() === this.fileEditing.fileName.toString()); 
    // let index = 0;
    // data.forEach(item => {
    //   let perm = this.getObjectName(item, index);
    //   if (perm != null) {
    //     perm.isSystem = false;
    //     perm.isActive = true;
    //     perm.isSharing = false;//this.modeSharing;
    //     if (this.modeShare == "" && this.modeRequest == "") {
    //       if (this.fileEditing != null) {
    //         perm.startDate = this.startDate;
    //         perm.endDate = this.endDate;
    //         this.fileEditing.permissions = this.addRoleToList(this.fileEditing.permissions, perm);
    //         this.permissonActiveId = (this.fileEditing.permissions.length - 1).toString();
    //         this.changePermission(this.fileEditing.permissions.length - 1);
    //       }
    //     }
    //     else {
    //       if (this.modeRequest == "to" || this.modeShare == "to") {
    //         this.toPermission = this.addRoleToList(this.toPermission, perm);
    //         console.log(this.toPermission);
    //       }
    //       else if (this.modeRequest == "cc" || this.modeShare == "cc") {
    //         this.ccPermission = this.addRoleToList(this.ccPermission, perm);
    //       }
    //       else if (this.modeRequest == "by" || this.modeShare == "by") {
    //         this.byPermission = this.addRoleToList(this.byPermission, perm);
    //       }
    //       else {
    //         this.bccPermission = this.addRoleToList(this.bccPermission, perm);
    //       }
    //     }
    //   }
    //   index += 1;

    // });

    // // if (this.fileEditing != null && this.fileEditing.permissions != null && this.fileEditing.permissions.length > 0) {
    // //   this.changePermission(0);
    // // }
    // console.log(this.toPermission);
    // // this.cbxsv.dataSelcected = [];
    // // this.cbxsv.arrType = [];
    // // this.cbxsv.arrName = [];
    // this.changeDetectorRef.detectChanges();
    // modal.dismiss('Cross click');//modal.close();
  }
  
  // changeUser(e){

  // }
}