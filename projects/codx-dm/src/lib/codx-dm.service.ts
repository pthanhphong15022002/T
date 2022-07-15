import { ChangeDetectorRef, Injectable, NgModule, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { DataItem, FolderInfo, NodeTree } from "@shared/models/folder.model";
import { FolderService } from "@shared/services/folder.service";
import { FileService } from "@shared/services/file.service";
import { AuthService, FormModel, NotificationsService } from "codx-core";
import { FileInfo, FileUpload, Permission } from "@shared/models/file.model";

@Injectable({
    providedIn: 'root'
})

export class CodxDMService {    
    public dataTree: NodeTree[];
    public data = new BehaviorSubject<any>(null);

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
    // public confirmationDialogService: ConfirmationDialogService;

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

    public listFolder = new BehaviorSubject<FolderInfo[]>(null);
    isListFolder = this.listFolder.asObservable();

    public listFiles = new BehaviorSubject<FileInfo[]>(null);
    islistFiles = this.listFiles.asObservable();

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
    private FOLDER_NAME = "QUẢN LÝ TÀI LIỆU CÁ NHÂN";
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

    openFile(id, folder, type) {
        this.fileID = id;
        this.folderID = folder;
        this.type = type;
        this.openFileDialog.next(true);
    }

    checkUserForder(folder) {
        return false;
        if (this.idMenuActive == "3" && (folder.folderId == "DM" || folder.path.indexOf(this.FOLDER_NAME) > -1) && folder.isSystem && (folder.level == "1" || folder.level == "2")) {
            return true;
        }
        else
            return false;
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

    getThumbnail(data) {
        if (data != "") {
            var url = 'data:image/png;base64,' + data;
            return this.domSanitizer.bypassSecurityTrustUrl(data);
        }
        else
            return "";
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
    changeData(folders: any, files: any, folderId: any) {      
      this.listFolder.next(folders);        
      this.listFiles.next(files);        
    }

    // open folder    
    openDialog(value) {
      this.data.next(value);
    }

    // getTemplate() {
    //     return [
    //         new DMItem(DetailComponent),
    //         new DMItem(ListComponent),
    //         new DMItem(HomeComponent),
    //         new DMItem(SearchComponent),
    //         new DMItem(PendingComponent),
    //         new DMItem(AcceptComponent)
    //     ];
    // }

    emptyTrash() {
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
      //             // this.notificationsService.notify("res.message");   
      //         }
      //     })
      //     .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));       
    }

    copyFileTo(id, fullName, toselectId) {
        var that = this;
        this.fileService.copyFile(id, fullName, toselectId, 1).subscribe(async res => {
            if (res.status == 0) {
                let list = this.listFiles.getValue();
                // move                                    
                let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
                if (index > -1) {
                    list.splice(index, 1);//remove element from array             
                    this.listFiles.next(list);
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
                let list = this.listFolder.getValue();
                this.nodeDeleted.next(id);
                //list = list.filter(item => item.recID != id);
                let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
                if (index > -1) {
                    list.splice(index, 1);//remove element from array
                    this.listFolder.next(list);
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