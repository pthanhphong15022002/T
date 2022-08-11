import { ChangeDetectorRef, Injectable, NgModule, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { DataItem, FolderInfo, ItemRight, NodeTree } from "@shared/models/folder.model";
import { FolderService } from "@shared/services/folder.service";
import { FileService } from "@shared/services/file.service";
import { AlertConfirmInputConfig, AuthService, CallFuncService, FormModel, NotificationsService, SidebarModel } from "codx-core";
import { FileInfo, FileUpload, HistoryFile, Permission, SubFolder, View } from "@shared/models/file.model";
import { CopyComponent } from "./copy/copy.component";
import { EditFileComponent } from "./editFile/editFile.component";
import { RolesComponent } from "./roles/roles.component";
import { CreateFolderComponent } from "./createFolder/createFolder.component";
import { ViewFileDialogComponent } from "projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component";
import { PropertiesComponent } from "./properties/properties.component";
import { MoveComponent } from "./move/move.component";
import { VersionComponent } from "./version/version.component";
import { ShareComponent } from "./share/share.component";

@Injectable({
    providedIn: 'root'
})

export class CodxDMService {    
    public dataTree: NodeTree[];
    public data = new BehaviorSubject<any>(null);
    title = 'Thông báo';
    titleCopy = 'Sao chép';
    titleRename = 'Thay đổi tên';
    titleUpdateFolder = 'Cập nhật thư mục';
    titleDeleteConfirm = 'Bạn có chắc chắn muốn xóa ?';
    titleTrashmessage = 'Bạn có muốn cho {0} vào thùng rác không ?';
    titleDeleteeMessage = 'Bạn có muốn xóa hẳn {0} không, bạn sẽ không phục hồi được nếu xóa hẳn khỏi thùng rác ?';
    titleNoRight = "Bạn không có quyền download file này";
    isData = this.data.asObservable();   
    public modeStore = "0";
    public hideTree = false;
    public parentApproval = false;
    public parentPhysical = false;
    public parentCopyrights: any;
    public parentCopyrightsControl: any;
    public parentApprovers: string;
    public parentRevisionNote: string;
    public parentLocation: string;
    public isSearch = false;
    public parentFull = true;
    public parentCreate = true;
    public parentRead = true;
    public parentUpdate = true;
    public parentShare = true;
    public parentDownload = true;
    public parentUpload = true;
    public parentAssign = true;
    public parentDelete = true;
    public loading = false;
    public parentRevision = false;
    public thumbnail: string;
    public folderName: string;
    public parentFolderName: string;
    public parentFolderId: string;
    public isTree = false;
    public level: string;
    public folderType: any;
    public idMenuActive: string;
    public confirmAll: boolean;
    public checkedDone: boolean;
    public checkedSaveDone: boolean;
    public user: any;
    public currentOldDMIndex: string;
    public breadcumbLink: string[];
    public fileID: string;
    public folderID: string;
    public type: string;
    public currentNode: string;
    public listDialog = [];
    public loadedFile: boolean;
    public loadedFolder: boolean;
    public fileUploadList: FileUpload[];
    public dataFileEditing: FileUpload;
    public listFolder = [];
    public listFiles = [];
    itemRight: ItemRight;
    path: string;
    // public confirmationDialogService: ConfirmationDialogService;
    public ChangeData = new BehaviorSubject<boolean>(null);
    isChangeData = this.ChangeData.asObservable();

    public EmptyTrashData = new BehaviorSubject<boolean>(null);
    isEmptyTrashData = this.EmptyTrashData.asObservable();

    public Location = new BehaviorSubject<string>(null);
    isLocation = this.Location.asObservable();

    public ListSubFolder = new BehaviorSubject<SubFolder[]>(null);
    isListSubFolder = this.ListSubFolder.asObservable();

    public HideTree = new BehaviorSubject<boolean>(null);
    isHideTree = this.HideTree.asObservable();

    public updateHDD = new BehaviorSubject<string>(null);
    isUpdateHDD = this.updateHDD.asObservable();

    public openFileDialog = new BehaviorSubject<boolean>(null);
    isOpenFile = this.openFileDialog.asObservable();

    public setRight = new BehaviorSubject<boolean>(null);
    isSetRight = this.setRight.asObservable();

    public sortColumn = new BehaviorSubject<string>(null);
    isSortColumn = this.sortColumn.asObservable();

    public sortDirecttion = new BehaviorSubject<string>(null);
    isSortDirecttion = this.sortDirecttion.asObservable();

    public parentFolder = new BehaviorSubject<FolderInfo>(null);
    isParentFolder = this.parentFolder.asObservable();

    public breadcumb = new BehaviorSubject<string[]>(null);
    isBreadcum = this.breadcumb.asObservable();

    public breadcumbTree = new BehaviorSubject<string[]>(null);
    isBreadcumTree = this.breadcumbTree.asObservable();

    public listPermission = new BehaviorSubject<Permission[]>(null);
    isListPermission = this.listPermission.asObservable();

    public listTags = new BehaviorSubject<any>(null);
    isListTags = this.listTags.asObservable();

    public percentUpload = new BehaviorSubject<string>(null);
    isPercentUpload = this.percentUpload.asObservable();

    public hideShowBoxLicense = new BehaviorSubject<boolean>(null);
    isHideShowBoxLicense = this.hideShowBoxLicense.asObservable();

    public addNodeTree = new BehaviorSubject<any>(null);
    isAddNodeTree = this.addNodeTree.asObservable();

    public hideShowBoxInfo = new BehaviorSubject<boolean>(null);
    isHideShowBoxInfo = this.hideShowBoxInfo.asObservable();

    public fileEditing = new BehaviorSubject<FileUpload>(null);
    isFileEditing = this.fileEditing.asObservable();

    public fileUploadListAdd = new BehaviorSubject<boolean>(null);
    isFileUploadListAdd = this.fileUploadListAdd.asObservable();

    public setDisableSave = new BehaviorSubject<boolean>(null);
    isSetDisableSave = this.setDisableSave.asObservable();

    public setOpenDialog = new BehaviorSubject<DataItem>(null);
    isSetOpenDialog = this.setOpenDialog.asObservable();

    public menuIdActive = new BehaviorSubject<string>(null);
    isMenuIdActive = this.menuIdActive.asObservable();

    public menuActive = new BehaviorSubject<string>(null);
    isMenuActive = this.menuActive.asObservable();

    public changeList = new BehaviorSubject<boolean>(null);
    isChangeList = this.changeList.asObservable();

    public disableInput = new BehaviorSubject<boolean>(null);
    isDisableInput = this.disableInput.asObservable();

    public openCreateFolder = new BehaviorSubject<boolean>(null);
    isOpenCreateFolder = this.openCreateFolder.asObservable();

    public disableUpload = new BehaviorSubject<boolean>(null);
    isDisableUpload = this.disableUpload.asObservable();

    public editFile = new BehaviorSubject<any>(null);
    isEditFile = this.editFile.asObservable();

    public addFile = new BehaviorSubject<any>(null);
    isAddFile = this.addFile.asObservable();

    public editFolder = new BehaviorSubject<any>(null);
    isEditFolder = this.editFolder.asObservable();

    public addFolder = new BehaviorSubject<any>(null);
    isAddFolder = this.addFolder.asObservable();

    public oldFolderId = new BehaviorSubject<string>(null);
    isOldFolderId = this.oldFolderId.asObservable();

    public folderId = new BehaviorSubject<string>(null);
    isFolderId = this.folderId.asObservable();

    public nodeDeleted = new BehaviorSubject<string>(null);
    isNodeDeleted = this.nodeDeleted.asObservable();

    public nodeRootSelect = new BehaviorSubject<FolderInfo>(null);
    isNodeRootSelect = this.nodeRootSelect.asObservable();

    public nodeSelect = new BehaviorSubject<FolderInfo>(null);
    isNodeSelect = this.nodeSelect.asObservable();

    public nodeChange = new BehaviorSubject<FolderInfo>(null);
    isNodeChange = this.nodeChange.asObservable();

    public add = new BehaviorSubject<any>(null);
    isAdd = this.add.asObservable();

    public listFolderAside = new BehaviorSubject<FolderInfo[]>(null);
    isListFolderAside = this.listFolderAside.asObservable();

    public refreshTree = new BehaviorSubject<string>(null);
    isRefreshTree = this.refreshTree.asObservable();

    // public listFolder = new BehaviorSubject<FolderInfo[]>(null);
    // isListFolder = this.listFolder.asObservable();

    // public listFiles = new BehaviorSubject<FileInfo[]>(null);
    // islistFiles = this.listFiles.asObservable();

    public pageNo = new BehaviorSubject<Number>(null);
    isPageNo = this.pageNo.asObservable();

    public pageSize = new BehaviorSubject<Number>(null);
    isPageSize = this.pageSize.asObservable();

    public total = new BehaviorSubject<number>(null);
    isTotal = this.total.asObservable();

    public totalPage = new BehaviorSubject<number>(null);
    isTotalPage = this.totalPage.asObservable();

    public textSearch = new BehaviorSubject<string>(null);
    isTextSearch = this.textSearch.asObservable();

    public currentDMIndex = new BehaviorSubject<string>(null);
    isCurrentDMIndex = this.currentDMIndex.asObservable();
    private titleMessage = 'Thông báo';
    private titleCopymessage = 'Bạn có muốn lưu lên không ?';
    private titelRenamemessage = 'Bạn có muốn lưu với tên {0} không ?';
    private FOLDER_NAME = "DM";//"QUẢN LÝ TÀI LIỆU CÁ NHÂN";
    public titleEmptyTrash30 = "Các mục trong thùng rác sẽ xóa vĩnh viễn trong 30 ngày";
    public titleEmptyAction = 'Dọn sạch thùng rác';
    public titleNodaTa = 'Không có tài liệu';
    public titleNodaTaFolder = 'Thư mục hiện tại không chứa tài liệu nào!';
    public formModel: FormModel;    
    public dataService: any;
    constructor(
        private domSanitizer: DomSanitizer,
        private auth: AuthService,
        private folderService: FolderService,
        private fileService: FileService,
        private callfc: CallFuncService,
        //  private confirmationDialogService: ConfirmationDialogService,  
        private notificationsService: NotificationsService
    ) {
        var data: any = this.auth.user$;
        this.user = data.source.value;
        this.currentNode = '';
        this.folderId.next("");
        this.disableInput.next(true);        
    }

    ngOnInit(): void {

    }  

    getRight(folder: FolderInfo) {
        this.parentCreate = folder.create;
        this.parentRead = folder.read;
        this.parentUpdate = folder.write;
        this.parentShare = folder.share;
        this.parentDownload = folder.download;
        this.parentUpload = folder.upload;
        this.parentDelete = folder.delete;
        this.parentAssign = folder.assign;
        if (folder.revision != null)
            this.parentRevision = folder.revision;
        else
            this.parentRevision = false;

        this.parentApproval = folder.approval;
        this.parentPhysical = folder.physical;
        this.parentCopyrights = folder.copyrights;
        this.parentApprovers = folder.approvers;
        this.parentRevisionNote = folder.revisionNote;
        this.parentLocation = folder.location;

        if (this.idMenuActive == "4" || this.idMenuActive == "3" || this.idMenuActive == "6" || this.idMenuActive == "7") {

            if (folder.isSystem && (folder.folderName.trim().toLocaleLowerCase() == this.FOLDER_NAME.trim().toLocaleLowerCase() || folder.folderName.trim().toLocaleLowerCase() == this.user.userID.trim().toLocaleLowerCase()) && (folder.level == "1" || folder.level == "2")) {
                this.disableUpload.next(true);
                this.disableInput.next(true);
            }
            else {
                this.disableUpload.next(!this.parentUpload);
                this.disableInput.next(!this.parentCreate);
            }
        }
        else {
            this.disableUpload.next(true);
            this.disableInput.next(true);
        }

        this.setRight.next(true);
    }

    
    formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';
  
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
      const i = Math.floor(Math.log(bytes) / Math.log(k));
  
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    getAvatar(ext: string) {
        if (ext == null) return "file.svg";
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

    getThumbnail(data, ext) {
        if (data != "") {
            var url = 'data:image/png;base64,' + data;
            return this.domSanitizer.bypassSecurityTrustUrl(data);
        }
        else
            return `../../../assets/codx/dms/${this.getAvatar(ext)}`;//this.getAvatar(ext);
    }

    deniedRight() {
        this.parentFull = false;
        this.parentCreate = false;
        this.parentRead = false;
        this.parentUpdate = false;
        this.parentShare = false;
        this.parentDownload = false;
        this.parentUpload = false;
        this.parentDelete = false;
        this.setRight.next(true);
    }

    resetRight() {
        this.parentFull = true;
        this.parentCreate = true;
        this.parentRead = true;
        this.parentUpdate = true;
        this.parentShare = true;
        this.parentDownload = true;
        this.parentUpload = true;
        this.parentDelete = true;
        this.parentAssign = true;
        this.setRight.next(true);
    }
   
    getFolderId() {
        if (this.folderId == null) return "";
        else return this.folderId.getValue();
    }    
    
    checkDownloadRight(file) {
        return file.download;;
    }
    
    base64ToArrayBuffer(base64) {
        var binaryString = window.atob(base64);
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var i = 0; i < binaryLen; i++) {
            var ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }
      
    checkDeleteRight(data: any) {    
        if (data.isSystem && data.folderName != null) {          
            return false;
        }
        else
            return data.delete;// && this.isSystem.toString() === "false";
    }

    async deleteFile(data: FileInfo, type: any): Promise<void> {
        var fullName = '';
        if (type == 'file')
            fullName = data.fileName;
        else
            fullName = data.folderName;

        var message = data.isDelete ? this.titleDeleteeMessage : this.titleTrashmessage;
        message = message.replace("{0}", fullName);
        
        var config = new AlertConfirmInputConfig();
        config.type = "YesNo";
        this.notificationsService.alert(this.title, this.titleDeleteConfirm, config).closed.subscribe(x=>{
            if(x.event.status == "Y")
            {
                if (this.checkDeleteRight(data)) { 
                var id = data.recID;                
                // this.isDelete = true;
                if (type == 'file') {
                  this.fileService.deleteFileToTrash(id, this.folderId.getValue(), false).subscribe(async res => {
                    let list = this.listFiles;
                    //list = list.filter(item => item.recID != id);
                    let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
                    if (index > -1) {
                      list.splice(index, 1);//remove element from array
                      //this.changeData(null, list, id);   
                      this.listFiles = list;
                      this.ChangeData.next(true);
                    //  this.changeDetectorRef.detectChanges();
                    }
    
                    this.fileService.getTotalHdd().subscribe(i => {
                      this.updateHDD.next(i.messageHddUsed);
                   //   this.changeDetectorRef.detectChanges();
                    })
                  });
                }
                else {
                  this.folderService.deleteFolderToTrash(id, false).subscribe(async res => {
                    let list = this.listFolder;
                    //list = list.filter(item => item.recID != id);
                    let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
                    this.nodeDeleted.next(id);
                    if (index > -1) {
                      list.splice(index, 1);//remove element from array
                      this.nodeDeleted.next(id);
                      this.listFolder = list;
                      this.ChangeData.next(true);
                      //  this.dmSV.changeData(list, null, id);                       
                    //  this.changeDetectorRef.detectChanges();
                    }
    
                    this.fileService.getTotalHdd().subscribe(i => {
                      this.updateHDD.next(i.messageHddUsed);
                    //  this.changeDetectorRef.detectChanges();
                    })
                  });
                }
                }
            }
        });
    }
     
    setBookmark(data: FileInfo, type: string) {
        var id = data.recID;
        var that = this;       
        if (type === 'file') {
          this.fileService.bookmarkFile(id).subscribe(async res => {
            if (res) {
              let list = that.listFiles;
              let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
    
              if (that.idMenuActive == "DMT04") {
                if (index > -1) {
                  list.splice(index, 1);//remove element from array            
                }
              }
              else {
                list[index] = res;
              }
            //  this.isBookmark = !this.isBookmark;
              this.listFiles = list;
              this.ChangeData.next(true);
           //   that.changeDetectorRef.detectChanges();
            }
          });
        }
        else {
          // folder
          // alert('bookmarks');
          this.folderService.bookmarkFolder(id).subscribe(async res => {
            if (res) {
              let list = that.listFolder;
              let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
              if (that.idMenuActive == "DMT04") {
                if (index > -1) {
                  if (list[index].isBookmark == false || list[index].isBookmark == "false") {
                    that.nodeDeleted.next(id);
                  }
                  list.splice(index, 1);//remove element from array            
                }
              }
              else {
                list[index] = res;
                if (that.idMenuActive == "DMT02" || that.idMenuActive == "DMT02") {
                  that.nodeChange.next(list[index]);
                }
              }
             // this.isBookmark = !this.isBookmark;
              this.listFolder = list;
              this.ChangeData.next(true);
              //that.changeDetectorRef.detectChanges();
            }
          });
        }
      }

    filterMoreFunction(e: any, data: any) {    
      var type = this.getType(data, "entity");
      if (e) {          
        for(var i=0; i<e.length; i++) {       
          if (e[i].data != null && e[i].data.entityName == type)
            e[i].disabled = false;     
          else
            e[i].disabled = true;     
        }      
      }
    }

    getImage(data) {
      if (data.folderName != undefined)
        return '../../../assets/codx/dms/folder.svg';
      else
        return this.getThumbnail(data.thumbnail, data.extension);
    }

    getSvg(icon) {
      var path = window.location.origin;
      return `${path}/${icon}`;
    }

    checkIconFolder(folder) {
      if (folder.icon.indexOf('.') == -1)
        return false;
      else
        return true;
    }

    getBookmarksClass(item) {
      if (this.showBookmark(item))
        return "icon-bookmark text-warning icon-20";
      else
        return "text-warning icon-20";
    }

    getFolderClass(name) {
      // name.indexOf
      return name;
    }

    showBookmark(item) {
      if (item.bookmarks != null) {
        var list = item.bookmarks.filter(x => x.objectID == this.user.userID.toString());
        if (list.length > 0)
          return true;
        else
          return false;
      }
      return false;
    }

    checkView(read: boolean) {      
      return read;     
    }

    getRating(data: View[]) {
      let _sum = 0;
      var totalViews = 0;
      if (data != null) {
        var list = data.filter(x => x.rating > 0);
        totalViews = list.length;
        //res.views.forEach(item => {
        for (var i = 0; i < list.length; i++) {
          _sum = _sum + list[i].rating;
        }
      }
  
      var totalRating = 0;
      if (totalViews != 0) {
        totalRating = _sum / totalViews;
      }
     
      totalRating = parseFloat(totalRating.toFixed(2));
      return totalRating;    
    }

    showDownloadCount(download) {   
      if (download === null || download === undefined)
        return 0;
      else
        return download;
    }
    
    getViews(data: HistoryFile[]) {
      if (data != null) {
        // var list = data.filter(x => x.rating == 0);
        return data.filter(x => (x.type != null && x.type == 'view') || (x.note != null && x.note.indexOf("read file") > -1)).length;
      }
      else
        return 0;
    }
    
    getType(item: any, ret: string) {
      var type = 'folder';      
      if (ret == "name") {
        if (item.folderName == null || item.folderName == undefined)
          type = 'file';
      }
      else {
        // entity
        type = 'DM_FolderInfo';
        if (item.folderName == null || item.folderName == undefined)
          type = 'DM_FileInfo';
      }
      
      return type;
    }

    clickMF($event, data: any) {        
        var type =  this.getType(data, "name");
        let option = new SidebarModel();

        switch($event.functionID) {
          case "DMT0210": //view file
            this.fileService.getFile(data.recID).subscribe(data => {
                this.callfc.openForm(ViewFileDialogComponent, data.fileName, 1000, 800, "", data, "");
                var files = this.listFiles;
                if (files != null) {
                  let index = files.findIndex(d => d.recID.toString() === data.recID);
                  if (index != -1) {
                    files[index] = data;
                  }
                  this.listFiles = files;                    
                  this.ChangeData.next(true);                
                }
            });
            break;

          case "DMT0211": // download
            this.fileService.getFile(data.recID).subscribe(file => {      
                var id = file.recID;
                var that = this;
                if (this.checkDownloadRight(file)) {
                this.fileService.downloadFile(id).subscribe(async res => {
                    if (res && res.content != null) {
                      let json = JSON.parse(res.content);
                      var bytes = that.base64ToArrayBuffer(json);
                      let blob = new Blob([bytes], { type: res.mimeType });
                      let url = window.URL.createObjectURL(blob);
                      var link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", res.fileName);
                      link.style.display = "none";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                    var files = this.listFiles;
                    if (files != null) {
                      let index = files.findIndex(d => d.recID.toString() === id);
                      if (index != -1) {
                        files[index].countDownload = files[index].countDownload + 1;
                      }
                      this.listFiles = files;                    
                      this.ChangeData.next(true);                
                    }
                });
                }
                else {
                this.notificationsService.notify(this.titleNoRight);
                }
             });
            break;
            
          case "DMT0222": // properties file         
            option.DataService = this.dataService;
            option.FormModel = this.formModel;
            option.Width = '550px';
            // let data = {} as any;
            data.title = this.titleUpdateFolder;
            data.id =  data.recID;            
            this.callfc.openSide(PropertiesComponent, data, option);            
            break;

          case "DMT0206":  // xoa thu muc
          case "DMT0219": // xoa file
             this.deleteFile(data, type);            
            break;

          case "DMT0202": // chinh sua thu muc  
          case "DMT0209":          
           
            option.DataService = this.dataService;
            option.FormModel = this.formModel;
            option.Width = '550px';
           // let data = {} as any;
            data.title = this.titleUpdateFolder;
            data.id =  data.recID;            
            this.callfc.openSide(CreateFolderComponent, data, option);            
            break;

        case "DMT0213":  // chinh sua file   
            this.callfc.openForm(EditFileComponent, "", 800, 800, "", ["", data], "");
            break;

          case "DMT0207":  // permission
          case "DMT0220":
            this.dataFileEditing = data;            
            this.callfc.openForm(RolesComponent, "", 950, 650, "", [""], "");
            break;

          case "DMT0205":  // bookmark
          case "DMT0217":
            this.setBookmark(data, type);
            break;

          case "DMT0204": // di chuyen
          case "DMT0216": // di chuyen
            var title = `${this.titleCopy} ${type}`;
            this.callfc.openForm(MoveComponent, "", 450, 400, "", [type, data, title, true], "");   
            break;  

          case "DMT0214": //"copy": // copy file hay thu muc
            var title = `${this.titleCopy} ${type}`;
            this.callfc.openForm(CopyComponent, "", 450, 100, "", [type, data, title, true], "");   
            break;
    
          case "DMT0203": //"rename": // copy file hay thu muc
          case "DMT0215":
            var title = `${this.titleRename} ${type}`;
            this.callfc.openForm(CopyComponent, "", 450, 100, "", [type, data, title, false], "");   
            break;

          case "DMT0218": /// version file
            this.callfc.openForm(VersionComponent, "", 650, 600, "", [FormModel, data], "");   
            break;   

          //request permisssion  
          case "DMT0221":
          case "DMT0208":
            option.DataService = this.dataService;
            option.FormModel = this.formModel;
            option.Width = '550px';
          
           // let data = {} as any;
            data.title = this.titleUpdateFolder;
            data.id =  data.recID;            
            this.callfc.openSide(ShareComponent, [type, data, false], option);      
            break;
            break;  
          // share
          case "DMT0201":   
          case "DMT0212":          
            option.DataService = this.dataService;
            option.FormModel = this.formModel;
            option.Width = '550px';
          
           // let data = {} as any;
            data.title = this.titleUpdateFolder;
            data.id =  data.recID;            
            this.callfc.openSide(ShareComponent, [type, data, true], option);      
            break;
          default:
            break;    
        }  
      }

    getSizeKB(item: any) {
      if (item.fileSize != undefined) {
        var kb = item.fileSize / 1024;
        return kb.toFixed(2).toString() + 'Kb';
      }
      else 
        return '';
    }

    setFullHtmlNode(folder, text) {
      var item1 = '';
      var item2 = '';
  
      if (folder.icon == '' || folder.icon == null || folder.icon == undefined)
        item1 = '<img class="h-15px" src="../../../assets/codx/dms/folder.svg">';
      else {
        if (folder.icon.indexOf('.') == -1)
          item1 = `<i class="${folder.icon}" role="presentation"></i>`;
        else {
          var path = `${this.path}/${folder.icon}`;
          item1 = `<img class="h-15px " src="${path}">`;
        }
      }
  
      if (!folder.read)
        item2 = `<i class="icon-per no-permission me-2" role="presentation"></i>`;
      var fullText = `${item1}
                      ${item2}
                      <span class="mytree_node  me-2"></span>
                      ${text}`;
  
      return fullText;
    }

    checkUserForder(folder) {
       // return true;
        if (folder.folderId != null && this.idMenuActive == "DMT02" && (folder.folderId == "DM" || folder.folderId.indexOf(this.FOLDER_NAME) > -1) && folder.isSystem && (folder.level == "1" || folder.level == "2")) {
          return true;
        }
        else
          return false;
    }

    changeTextSearch(text: any, total: any, totalPage: any, pageNo: any, paoaSize: any) {
        this.textSearch.next(text);
        this.total.next(total);
        this.totalPage.next(totalPage);
        this.pageNo.next(pageNo);
        this.pageSize.next(paoaSize);
    }

    changeAddFile(file: any) {
        this.addFile.next(file);
    }

    changeAddFolder(folder: any) {
        this.addFolder.next(folder);
    }

    changeEditFile(file: any) {
        this.editFile.next(file);
    }

    changeEditFolder(folder: any) {
        this.editFolder.next(folder);
    }

    changeParentFolder(id: any) {
        this.oldFolderId.next(id);
    }

    changeFolder(id: any) {
        this.currentNode = '';
        this.folderId.next(id);
    }

    changeTemplate(index: any) {
        this.currentDMIndex.next(index);
    }

    // edit folder
    // changeData(folders: any, files: any, folderId: any) {      
    //   this.listFolder = folders;        
    //   this.listFiles = files;        
    //   this.ChangeData.next(true);
    // }

    emptyTrash() {
      var config = new AlertConfirmInputConfig();
      config.type = "YesNo";
      this.notificationsService.alert(this.title, this.titleDeleteeMessage, config).closed.subscribe(x=>{
          if(x.event.status == "Y") {
            this.folderService.emptyTrash("").subscribe(async res => {
            //  this.listFiles.next(null);
            //  this.listFolder.next(null);
              this.fileService.getTotalHdd().subscribe(i => {
                  this.updateHDD.next(i.messageHddUsed);
              })
              this.EmptyTrashData.next(true);
          });
          }
      });

      // this.confirmationDialogService.confirm(this.titlemessage, "Bạn co muốn xóa tất cả trong thùng rác ?")
      //     .then((confirmed) => {
      //         if (confirmed) {
      //             this.folderService.emptyTrash("").subscribe(async res => {
      //                 this.listFiles.next(null);
      //                 this.listFolder.next(null);
      //                 this.fileService.getTotalHdd().subscribe(i => {
      //                     this.updateHDD.next(i.messageHddUsed);
      //                 })
      //             });                  
      //         }
      //     })
      //     .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));       
    }

    copyFileTo(id, fullName, toselectId) {
        var that = this;
        this.fileService.copyFile(id, fullName, toselectId, 1).subscribe(async res => {
            if (res.status == 0) {
                let list = this.listFiles;
                // move                                    
                let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
                if (index > -1) {
                    list.splice(index, 1);//remove element from array             
                    this.listFiles = list;
                    this.ChangeData.next(true);
                }
                this.notificationsService.notify(res.message);
            }

            if (res.status == 6) {
                let newNameMessage = this.titelRenamemessage.replace("{0}", res.data.fileName);
                // this.confirmationDialogService.confirm(this.titlemessage, res.data.fileName + newNameMessage)
                //     .then((confirmed) => {
                //         if (confirmed) {
                //             that.fileService.copyFile(id, res.data.fileName, toselectId, 1).subscribe(async item => {
                //                 if (item.status == 0) {
                //                     let list = this.listFiles.getValue();
                //                     // move                                    
                //                     let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
                //                     if (index > -1) {
                //                         list.splice(index, 1);//remove element from array             
                //                         this.listFiles.next(list);
                //                     }
                //                     if (item.status == 0)
                //                         this.updateHDD.next(item.messageHddUsed);

                //                 }
                //                 that.notificationsService.notify(item.message);
                //             });
                //         }
                //     })
                //     .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));                      
            }
            else {
                this.notificationsService.notify(res.message);
            }
        })
    }

    copyFolderTo(id, fullName, toselectId) {
        var that = this;
        this.folderService.copyFolder(id, fullName, toselectId, 1).subscribe(async res => {
            if (res.status == 0) {
                let list = this.listFolder;
                this.nodeDeleted.next(id);
                //list = list.filter(item => item.recID != id);
                let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
                if (index > -1) {
                    list.splice(index, 1);//remove element from array
                    this.listFolder = list;                    
                    this.ChangeData.next(true);
                }
            }

            if (res.status == 2) {
                // this.confirmationDialogService.confirm(this.titlemessage, res.message + this.copymessage)
                //     .then((confirmed) => {
                //         if (confirmed) {
                //             this.folderService.copyFolder(id, fullName, toselectId, 1, 1).subscribe(async item => {
                //                 if (item.status == 0) {
                //                     let list = this.listFolder.getValue();
                //                     this.nodeDeleted.next(id);
                //                     //list = list.filter(item => item.recID != id);
                //                     let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
                //                     if (index > -1) {
                //                         list.splice(index, 1);//remove element from array
                //                         this.listFolder.next(list);
                //                     }
                //                     this.fileService.getTotalHdd().subscribe(i => {
                //                         this.updateHDD.next(i.messageHddUsed);
                //                     })
                //                 }
                //                 this.notificationsService.notify(item.message);
                //             });
                //         }
                //     })
                //     .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));                      
            }
            else {
                this.notificationsService.notify(res.message);
            }
        });
    }
}