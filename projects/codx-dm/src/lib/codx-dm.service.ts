import { ChangeDetectorRef, Injectable, NgModule, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  finalize,
  map,
  Observable,
  share,
  Subject,
  windowWhen,
} from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import {
  DataItem,
  FolderInfo,
  ItemRight,
  NodeTree,
} from '@shared/models/folder.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import {
  AlertConfirmInputConfig,
  AuthService,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
  SidebarModel,
  ApiHttpService,
  CacheService,
  AuthStore,
} from 'codx-core';
import {
  FileInfo,
  FileUpload,
  HistoryFile,
  Permission,
  SubFolder,
  View,
} from '@shared/models/file.model';
import { CopyComponent } from './copy/copy.component';
import { EditFileComponent } from './editFile/editFile.component';
import { RolesComponent } from './roles/roles.component';
import { CreateFolderComponent } from './createFolder/createFolder.component';
import { ViewFileDialogComponent } from 'projects/codx-common/src/lib/component/viewFileDialog/viewFileDialog.component';
import { PropertiesComponent } from './properties/properties.component';
import { MoveComponent } from './move/move.component';
import { VersionComponent } from './version/version.component';
import { ShareComponent } from './share/share.component';
import { lvFileClientAPI } from '@shared/services/lv.component';
import { environment } from 'src/environments/environment';
import { AnyARecord } from 'dns';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CodxDMService {
  public dataTree: NodeTree[];
  public data = new BehaviorSubject<any>(null);
  public title = 'Thông báo';
  public titleCopy = 'Sao chép';
  public titleRename = 'Thay đổi tên';
  public titleUpdateFolder = 'Cập nhật thư mục';
  public titleDeleteConfirm = 'Bạn có chắc chắn muốn xóa ?';
  public titleTrashmessage = 'Bạn có muốn cho {0} vào thùng rác không ?';
  public titleNoRight = 'Bạn không có quyền download file này';
  public restoreFilemessage = '{0} đã có bạn có muốn ghi đè lên không ?';
  public restoreFoldermessage = '{0} đã có bạn có muốn ghi đè lên không ?';
  public titleAccessDenied = 'Bạn không có quyền truy cập thư mục này';
  public titleFileAccessDenied = 'Bạn không có quyền truy cập file này';
  public titleMessage = 'Thông báo';
  public titelRenamemessage = 'Bạn có muốn lưu với tên {0} không ?';
  public FOLDER_NAME = 'DM'; //"QUẢN LÝ TÀI LIỆU CÁ NHÂN";
  public titleEmptyTrash30 = 'Các mục trong thùng rác sẽ xóa vĩnh viễn trong';
  public titleDeleteeMessage =
    'Bạn có muốn xóa hẳn {0} không, bạn sẽ không phục hồi được nếu xóa hẳn khỏi thùng rác ?';
  public titleEmptyAction = 'Dọn sạch thùng rác';
  public titleNodaTa = 'Không có tài liệu';
  public titleNodaTaFolder = 'Thư mục hiện tại không chứa tài liệu nào!';
  public titleShareBy = 'Tài liệu chia sẻ';
  public titleRequestShare = 'Tài liệu yêu cầu';
  public titleRequestBy = 'Tài liệu được yêu cầu';

  public formModel: FormModel;
  public dataService: any;
  isData = this.data.asObservable();
  public modeStore = '0';
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
  public paraSetting: any;
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
  public fileUploadList: FileUpload[];
  public dataFileEditing: FileUpload;
  public listFolder = [];
  public listFiles = [];
  isSearchView = false;
  page = 1;
  totalPage = 1;
  pageSize = 50;
  ChunkSizeInKB = 1024 * 2;
  revision: boolean;
  moveable = false;
  itemRight: ItemRight;
  path: string;
  breakCumArr = [];
  //tài liệu yêu cầu / được yêu cầu DMT02 favoriteID
  dmFavoriteID: any;
  // public confirmationDialogService: ConfirmationDialogService;
  public ChangeData = new BehaviorSubject<boolean>(null);
  isChangeData = this.ChangeData.asObservable();

  public ChangeDataView = new BehaviorSubject<boolean>(null);
  isChangeDataView = this.ChangeDataView.asObservable();

  public refeshData = new BehaviorSubject<boolean>(null);
  isRefeshData = this.refeshData.asObservable();

  public ChangeDataViewFile = new BehaviorSubject<any>(null);
  isChangeDataViewFile = this.ChangeDataViewFile.asObservable();

  public ChangeOneFolder = new BehaviorSubject<any>(null);
  isChangeOneFolder = this.ChangeOneFolder.asObservable();

  public EmptyTrashData = new BehaviorSubject<boolean>(null);
  isEmptyTrashData = this.EmptyTrashData.asObservable();

  public Location = new BehaviorSubject<string>(null);
  isLocation = this.Location.asObservable();

  public ListSubFolder = new BehaviorSubject<SubFolder[]>(null);
  isListSubFolder = this.ListSubFolder.asObservable();

  public HideTree = new BehaviorSubject<boolean>(null);
  isHideTree = this.HideTree.asObservable();

  public updateHDD = new BehaviorSubject<any>(null);
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

  public setThumbnailWait = new BehaviorSubject<any>(null);
  isSetThumbnailWait = this.setThumbnailWait.asObservable();

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

  public deleteFileView = new BehaviorSubject<any>(null);
  isDeleteFileView = this.deleteFileView.asObservable();

  public changeClickData = new BehaviorSubject<any>(null);
  isChangeClickData = this.changeClickData.asObservable();

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

  public refreshTree = new BehaviorSubject<boolean>(null);
  isRefreshTree = this.refreshTree.asObservable();

  public breadcumbChange = new BehaviorSubject<any>(null);
  isChangeBreadCumb = this.breadcumbChange.asObservable();

  // public listFolder = new BehaviorSubject<FolderInfo[]>(null);
  // isListFolder = this.listFolder.asObservable();

  // public listFiles = new BehaviorSubject<FileInfo[]>(null);
  // islistFiles = this.listFiles.asObservable();

  // public pageNo = new BehaviorSubject<Number>(null);
  // isPageNo = this.pageNo.asObservable();

  // public pageSize = new BehaviorSubject<Number>(null);
  // isPageSize = this.pageSize.asObservable();

  // public total = new BehaviorSubject<number>(null);
  // isTotal = this.total.asObservable();

  // public totalPage = new BehaviorSubject<number>(null);
  // isTotalPage = this.totalPage.asObservable();

  public textSearch = new BehaviorSubject<string>(null);
  isTextSearch = this.textSearch.asObservable();

  public currentDMIndex = new BehaviorSubject<string>(null);
  isCurrentDMIndex = this.currentDMIndex.asObservable();

  public caches = new Map<string, Map<string, any>>();
  private cachedObservables = new Map<string, Observable<any>>();

  constructor(
    private domSanitizer: DomSanitizer,
    private cache: CacheService,
    private auth: AuthStore,
    private folderService: FolderService,
    private fileService: FileService,
    private callfc: CallFuncService,
    private api: ApiHttpService,
    private router: Router,
    //  private confirmationDialogService: ConfirmationDialogService,
    private notificationsService: NotificationsService
  ) {
    this.user = this.auth.get();
    this.currentNode = '';
    this.folderId.next('');
    this.disableInput.next(true);
  }

  ngOnInit(): void {}

  loadValuelist(vll: any): Observable<any> {
    let paras = ['VLL', vll];
    let keyRoot = 'VLL' + vll;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) {
        return c.get(key);
      }
    } else {
      this.caches.set(keyRoot, new Map<any, any>());
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key);
    }
    let observable = this.cache.valueList(vll).pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null;
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }
  //Load GridViewSetup
  loadGridView(formName: any, gridViewName: any): Observable<any> {
    let paras = [formName, gridViewName];
    let keyRoot = formName + gridViewName;
    let key = JSON.stringify(paras).toLowerCase();
    if (this.caches.has(keyRoot)) {
      var c = this.caches.get(keyRoot);
      if (c && c.has(key)) return c.get(key);
    }

    if (this.cachedObservables.has(key)) {
      this.cachedObservables.get(key);
    }
    let observable = this.cache.gridViewSetup(formName, gridViewName).pipe(
      map((res) => {
        if (res) {
          let c = this.caches.get(keyRoot);
          c?.set(key, res);
          return res;
        }
        return null;
      }),
      share(),
      finalize(() => this.cachedObservables.delete(key))
    );
    this.cachedObservables.set(key, observable);
    return observable;
  }

  getRight(folder: FolderInfo, funcID: any = '') {
    if (funcID && funcID != 'DMT00' && funcID != 'DMT02' && funcID != 'DMT03') {
      this.disableUpload.next(true);
      this.disableInput.next(true);
      return;
    }

    if(!folder) return;
    this.parentCreate = folder.create;
    this.parentRead = folder.read;
    this.parentUpdate = folder.write;
    this.parentShare = folder.share;
    this.parentDownload = folder.download;
    this.parentUpload = folder.upload;
    this.parentDelete = folder.delete;
    this.parentAssign = folder.assign;
    if (folder.revision != null) this.parentRevision = folder.revision;
    else this.parentRevision = false;
    this.revision = this.parentRevision;
    this.parentApproval = folder.approval;
    this.parentPhysical = folder.physical;
    this.parentCopyrights = folder.copyrights;
    this.parentApprovers = folder.approvers;
    this.parentRevisionNote = folder.revisionNote;
    this.parentLocation = folder.location;

    this.disableUpload.next(!folder.upload);
    this.disableInput.next(!folder.create);

    // if (
    //   this.idMenuActive == 'DMT03' ||
    //   this.idMenuActive == 'DMT02' ||
    //   this.idMenuActive == 'DMT05' ||
    //   this.idMenuActive == '7'
    // ) {
    //   if (
    //     folder.isSystem &&
    //     (folder.folderName.trim().toLocaleLowerCase() ==
    //       this.FOLDER_NAME.trim().toLocaleLowerCase() ||
    //       folder.folderName.trim().toLocaleLowerCase() ==
    //         this.user.userID.trim().toLocaleLowerCase()) &&
    //     (folder.level == '1' || folder.level == '2')
    //   ) {
    //     this.disableUpload.next(true);
    //     this.disableInput.next(true);
    //   } else {
    //     this.disableUpload.next(!this.parentUpload);
    //     this.disableInput.next(!this.parentCreate);
    //   }
    // } else {
    //   this.disableUpload.next(true);
    //   this.disableInput.next(true);
    // }
    // this.setRight.next(true);
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getAvatar(ex: string) {
    if (!ex) return 'file.svg';
    var ext = ex.toLocaleLowerCase();
    switch (ext) {
      case '.txt':
        return 'txt.svg';
      case '.doc':
      case '.docx':
        return 'doc.svg';
      case '.7z':
      case '.rar':
      case '.zip':
        return 'zip.svg';
      case '.jpg':
      case '.jpeg':
      case '.jfif':
        return 'jpg.svg';
      case '.mp4':
        return 'mp4.svg';
      case '.xls':
      case '.xlsx':
        return 'xls.svg';
      case '.pdf':
        return 'pdf.svg';
      case '.png':
        return 'png.svg';
      case '.js':
        return 'javascript.svg';
      case '.apk':
        return 'android.svg';
      case '.ppt':
        return 'ppt.svg';
      case '.mp3':
      case '.wma':
      case '.wav':
      case '.flac':
      case '.ogg':
      case '.aiff':
      case '.aac':
      case '.alac':
      case '.lossless':
      case '.wma9':
      case '.aac+':
      case '.ac3':
        return 'audio.svg';
      default:
        return 'file.svg';
    }
  }

  getThumbnail(data) {
    return `../../../assets/themes/dm/default/img/${this.getAvatar(
      data.extension
    )}`; //this.getAvatar(ext);
    // if (data.hasThumbnail == true) {
    //   let url = `${this.urlThumbnail}/${data.thumbnail}`;
    //   return url;// this.checkUrl(url, data);
    // } else return `../../../assets/themes/dm/default/img/${this.getAvatar(data.extension)}`; //this.getAvatar(ext);
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
    this.parentAssign = false;
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
    if (this.folderId == null) return '';
    else return this.folderId.getValue();
  }

  checkDownloadRight(file) {
    return file.download;
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

  openItem(data: any) {
    if (!data.fileName) {
      if (!data.read) {
        this.notificationsService.notifyCode('DM059');
        return;
      }

      if (this.idMenuActive == 'DMT08') return;

      this.level = data.level;
      if (this.level == '1') this.parentFolderId = '000000000000000000000000';
      else this.parentFolderId = data.parentId;

      this.isTree = false;
      this.folderName = data.folderName;
      this.currentNode = '';
      this.folderId.next(data.recID);
      this.folderID = data.recID;
      //this.nodeSelect.next(data);
      this.changeClickData.next(data);
      this.disableInput.next(false);
    } else {
      // open file
      if (!data.read) {
        this.notificationsService.notify('DM059');
        return;
      }
    }
  }

  checkDeleteRight(data: any) {
    if (data.isSystem && data.folderName != null) {
      return false;
    } else return data.delete; // && this.isSystem.toString() === "false";
  }

  async deleteFile(data: FileInfo, type: any): Promise<void> {
    var fullName = '';
    if (type == 'file') fullName = data.fileName;
    else fullName = data.folderName;

    var message = data.isDelete
      ? this.titleDeleteeMessage
      : this.titleTrashmessage;
    message = message.replace('{0}', fullName);

    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notificationsService
      .alert(this.title, this.titleDeleteConfirm, config)
      .closed.subscribe((x) => {
        if (x.event.status == 'Y') {
          if (this.checkDeleteRight(data)) {
            var id = data.recID;
            // this.isDelete = true;
            if (type == 'file') {
              this.fileService
                .deleteFileToTrash(id, this.folderId.getValue(), false)
                .subscribe(async (res) => {
                  if (res) {
                    let list = this.listFiles;
                    //list = list.filter(item => item.recID != id);

                    let index = list.findIndex(
                      (d) => d.recID.toString() === id.toString()
                    ); //find index in your array
                    if (index >= 0) {
                      list.splice(index, 1); //remove element from array
                      //this.changeData(null, list, id);
                      this.listFiles = list;
                      this.notificationsService.notifyCode(
                        'DM046',
                        0,
                        this.user?.userName
                      );
                      this.addFile.next(true);
                      //  this.changeDetectorRef.detectChanges();
                    }
                    this.deleteFileView.next(id);
                    this.fileService.getTotalHdd().subscribe((i) => {
                      this.updateHDD.next(i);
                      //   this.changeDetectorRef.detectChanges();
                    });
                  } else this.notificationsService.notifyCode('SYS022');
                });
            } else {
              this.folderService
                .deleteFolderToTrash(id, false)
                .subscribe(async (res) => {
                  if (res) {
                    this.listFolder = this.listFolder.filter(
                      (x) => x.recID != id
                    );
                    this.nodeDeleted.next(id);
                    this.fileService.getTotalHdd().subscribe((i) => {
                      this.updateHDD.next(i);
                      //  this.changeDetectorRef.detectChanges();
                    });
                  }
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
      this.fileService.bookmarkFile(id).subscribe(async (res) => {
        if (res) {
          let list = that.listFiles;
          let index = list.findIndex(
            (d) => d.recID.toString() === id.toString()
          ); //find index in your array

          if (that.idMenuActive == 'DMT04') {
            if (index > -1) {
              list.splice(index, 1); //remove element from array
            }
          } else {
            list[index] = res;
          }
          //  this.isBookmark = !this.isBookmark;
          this.listFiles = list;
          this.addFile.next(true);
          //this.ChangeDataViewFile.next(res);
          //   that.changeDetectorRef.detectChanges();
        }
      });
    } else {
      // folder
      // alert('bookmarks');
      this.folderService.bookmarkFolder(id).subscribe(async (res) => {
        if (res) {
          let list = that.listFolder;
          let index = list.findIndex(
            (d) => d.recID.toString() === id.toString()
          ); //find index in your array
          if (that.idMenuActive == 'DMT04') {
            if (index > -1) {
              if (
                list[index].isBookmark == false ||
                list[index].isBookmark == 'false'
              ) {
                that.nodeDeleted.next(id);
              }
              list.splice(index, 1); //remove element from array
            }
          } else {
            list[index] = res;
            that.nodeChange.next(list[index]);
          }
          // this.isBookmark = !this.isBookmark;
          this.listFolder = list;

          //this.ChangeData.next(true);
          this.addFile.next(true);
          //that.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  filterMoreFunction(e: any, data: any, modeView = false) {
    var bookmark = this.isBookmark(data);
    var type = this.getType(data, 'entity');
    var typeDMT05 = this.getType(data, 'name');
    var list =
      'DMT0226;DMT0227;DMT0228;DMT0229;DMT0230;DMT0231;DMT0232;DMT0233'; //DMT08
    var listFolder =
      'DMT0512;DMT0513;DMT0515;DMT0516;DMT0519;DMT0520;DMT0521;DMT0522;DMT0517;DMT0525';
    if (e) {
      for (var i = 0; i < e.length; i++) {
        if (this.idMenuActive == 'DMT05') {
          if (typeDMT05 == 'folder') {
            if (
              e[i].data != null &&
              listFolder.indexOf(e[i].data.functionID) > -1
            ) {
              e[i].disabled = false;
            } else e[i].disabled = true;
          } else {
            if (
              e[i].data != null &&
              e[i].data.entityName == 'DM_ShareFileInfo' &&
              e[i].data.functionID != 'DMT0535'
            )
              e[i].disabled = false;
            else e[i].disabled = true;
          }
        } else {
          if ((e[i].data != null && e[i].data.entityName == type) || e[i].data.functionID == "DMT0236")
            e[i].disabled = false;
          else e[i].disabled = true;
        }
        // DMT0204;DMT0216
        // khong phai cho duyet
        var listMove = 'DMT0204;DMT0216';

        if (
          data.isSystem ||
          (this.idMenuActive != 'DMT02' &&
            this.idMenuActive != 'DMT03' &&
            this.idMenuActive != 'DMT00')
        ) {
          if (
            e[i].data != null &&
            listMove.indexOf(e[i].data.functionID) > -1
          ) {
            e[i].disabled = true;
          }
        }
        // if (this.idMenuActive == "DMT03") {
        //   if (e[i].data != null && listMove.indexOf(e[i].data.functionID) > -1) {
        //     e[i].disabled = true;
        //   }
        // }
        if (this.idMenuActive != 'DMT06' && this.idMenuActive != 'DMT07') {
          if (e[i].data != null && list.indexOf(e[i].data.functionID) > -1) {
            e[i].disabled = true;
          }
        } else {
          //list = "DMT0226;DMT0227;DMT0228;DMT0229;DMT0230;DMT0231;DMT0232;DMT0233";
          //list = "DMT0226;DMT0227;DMT0230;DMT0231";
          //Chờ duyệt
          if (data.approvalStatus == '3') {
            if (data?.hasApproval) list = 'DMT0230;DMT0231';
            else list = 'DMT0232';
          }
          //Chờ duyệt phát hành
          else if (data.approvalStatus == '1') {
            if (
              (data.createdBy == this.user?.userID && data?.hasApproval) ||
              data?.hasApproval
            )
              list = 'DMT0240;DMT0241';
            else list = 'SYS02';
          }
          //Đã duyệt
          else if (data.approvalStatus == '5') {
            if (data?.approvalStatus == '8') list = 'DMT0226';
            else list = 'DMT0233';
          }
          //Đã duyệt phát hành
          else if (data.approvalStatus == '6') {
            list = 'DMT0243';
          }
          //Từ chối duyệt phát hành
          else if (data.approvalStatus == '7') {
            list = 'DMT0243';
          }
          //Đã thu hồi quyền , từ chối
          else if (data.approvalStatus == '8' || data.approvalStatus == '4') {
            list = 'DMT0230';
          } else list = 'DMT0227';
          if (e[i].data != null && list.indexOf(e[i].data.functionID) > -1) {
            e[i].disabled = false;

            if (data.approvalStatus == '1') e[i].isbookmark = false;
          } else {
            e[i].disabled = true;
          }

          // if (e[i].data != null && list.indexOf(e[i].data.functionID) == -1) {
          //   e[i].disabled = true;
          // }
        }
        // ""

        if (type == 'DM_FolderInfo' || typeDMT05 == 'folder') {
          // function in
          if (e[i].data != null && e[i].data.functionID == 'DMT0224') {
            e[i].disabled = true;
          }
          // data?.isblur = true
          // bookmark va unbookmark
          if (bookmark) {
            if (
              e[i].data != null &&
              (e[i].data.functionID == 'DMT0205' ||
                e[i].data.functionID == 'DMT0517')
            ) {
              e[i].disabled = true;
            }
          } else {
            if (
              e[i].data != null &&
              (e[i].data.functionID == 'DMT0223' ||
                e[i].data.functionID == 'DMT0525')
            ) {
              e[i].disabled = true;
            }
          }

          // phuc hoi khong phai trong thung rac
          if (
            this.idMenuActive != 'DMT08' &&
            e[i].data != null &&
            e[i].data.functionID == 'DMT0234'
          ) {
            e[i].disabled = true;
          }

          // thung rac  (view, phuc hoi, xoa)
          if (
            this.idMenuActive == 'DMT08' &&
            e[i].data != null &&
            e[i].data.functionID != 'DMT0206' &&
            e[i].data.functionID != 'DMT0234'
          ) {
            e[i].disabled = true;
          }
        } else {
          if (modeView) {
            list = 'DMT0212;DMT0217;DMT0225;DMT0222';
            if (e[i].data != null && list.indexOf(e[i].data.functionID) == -1) {
              e[i].disabled = true;
            } else {
              e[i].disabled = false;
            }
          }

          // bookmark va unbookmark
          if (bookmark) {
            if (
              e[i].data != null &&
              (e[i].data.functionID == 'DMT0217' ||
                e[i].data.functionID == 'DMT0517')
            ) {
              e[i].disabled = true;
            }
          } else {
            if (
              e[i].data != null &&
              (e[i].data.functionID == 'DMT0225' ||
                e[i].data.functionID == 'DMT0525')
            ) {
              e[i].disabled = true;
            }
          }
          // thung tac
          if (
            this.idMenuActive == 'DMT08' &&
            e[i].data != null &&
            e[i].data.functionID != 'DMT0210' &&
            e[i].data.functionID != 'DMT0219' &&
            e[i].data.functionID != 'DMT0235'
          ) {
            e[i].disabled = true;
          }

          // phuc hoi
          if (
            this.idMenuActive != 'DMT08' &&
            e[i].data != null &&
            e[i].data.functionID == 'DMT0235'
          ) {
            e[i].disabled = true;
          }
        }

        // xét quyền
        if (e[i].data) {
          e[i].isblur = false; // duoc view
          switch (e[i].data.functionID) {
            // folder
            case 'DMT0512':
            case 'DMT0201': // share thu muc
            case 'DMT0212': // chia se file
              if (!data.share) e[i].isblur = true; // duoc view
              break;
            case 'DMT0513': //Chỉnh sửa
            case 'DMT0515': //Thay đổi tên
            case 'DMT0202': // chinh sua thu muc
            case 'DMT0213': // chinh sua file
            case 'DMT0203': // Thay đổi tên thu muc
            case 'DMT0215': // thay doi ten file
              if (!data.write) e[i].isblur = true; // duoc view
              break;
            case 'DMT0516':
            case 'DMT0204': // di chuyen thu muc
            case 'DMT0216': // di chuyen file
              if (!data.moveable) e[i].isblur = true; // duoc view
              break;
            case 'DMT0519':
            case 'DMT0206': //delete
            case 'DMT0219': // xoa file
              if (!data.delete || data.isSystem) e[i].isblur = true; // duoc view
              break;
            // case "DMT0207": //permission
            //   break;
            // case "DMT0208": //yeu cau cap quyen
            //   break;
            case 'DMT0522':
            case 'DMT0209': //properties
            case 'DMT0222': //properties file
              //
              if (!data.read) e[i].isblur = true; // duoc view
              break;
            // case "DMT0224": // in folder
            //   break;
            // case "DMT0226": // xet duyet
            //   break;
            // case "DMT0227": // tu choi
            //   break;
            // case "DMT0228": // huy
            //   break;
            // case "DMT0229": // lay lay quyen
            //   break;
            case 'DMT0535':
            case 'DMT0233': // restore folder
            case 'DMT0235': // restore file
              if (!data.delete) e[i].isblur = true; // duoc view
              break;
            // file
            case 'DMT0510':
            case 'DMT0210': //xem file
              if (!data.read) e[i].isblur = true; // duoc view
              break;
            case 'DMT0511':
            case 'DMT0211': // download
              if (!data.download) e[i].isblur = true; // duoc view
              break;
            case 'DMT0514':
            case 'DMT0214': // Sao chép file
              if (!data.create) e[i].isblur = true; // duoc view
              break;
            case 'DMT0518':
            case 'DMT0218': // quan ly version
              if (!data.write || !data.revision) e[i].isblur = true; // duoc view
              if (!data.folderId && this.paraSetting.VersionControl)
                e[i].isblur = false;
              break;

            // case "DMT0220": // persmission file
            //   break;
            // case "DMT0221": //yeu cau cap quyen file
            //   break;
            // case "DMT0230": // xet duyet
            //   break;
            // case "DMT0231": // tu choi
            //   break;
            // case "DMT0232": // huy
            //   break;
            // case "DMT0234": // lay lay quyen
            //   break;
            // Thư mục mới
            case 'DMT0237':
              {
                if (!data.create) e[i].isblur = true; // duoc view
                break;
              }
            default: // duoc view
              e[i].isblur = false;
              break;
          }
        }
      }
    }
  }

  checkUrl(url, data) {
    /*
       var r = await lvFileClientAPI.postAsync(`/api/${this.appName}/files/info`,{
        UploadId: data.uploadId

      });
      if(r.HasThumb){
        alert(1);
      }
       */
    //return `../../../assets/themes/dm/default/img/${this.getAvatar(data.extension)}`;//this.getAvatar(ext);
    var ret = `../../../assets/themes/dm/default/img/${this.getAvatar(
      data.extension
    )}`; //'../../../assets/img/loader.gif';
    // try {
    //   const xhr = new XMLHttpRequest();
    //   xhr.open('GET', url, false);
    //   xhr.onload = () => {
    //     ret = xhr.responseURL; // http://example.com/test
    //   };
    //   xhr.send(null);
    //   return ret;
    // } catch {
    //   //  if (ret == '../../../assets/img/loader.gif')
    //   //    this.setThumbnailWait.next(data);
    //   return ret;
    // }
    // var http = new XMLHttpRequest();
    // http.open('HEAD', url, false);
    // http.send();
    // return http.status!=404;

    // var http = new XMLHttpRequest();
    // http.open('HEAD', url, false);
    // http.send();
    //  console.log(url);
    //  console.log(http.status);
  }

  getImage(data: any) {
    if (data?.folderName && !data?.extension)
      return '../../../assets/themes/dm/default/img/icon-folder.svg';
    else {
      if (data?.viewThumb && this.checkView(data?.read) == true)
        return environment.urlUpload + '/' + data.thumbnail;
      return `../../../assets/themes/dm/default/img/${this.getAvatar(
        data.extension
      )}`; //this.getAvatar(ext);
    }
  }

  getSvg(icon) {
    var path = window.location.origin;
    return `${path}/${icon}`;
  }

  checkIconFolder(folder) {
    if (folder.icon.indexOf('.') == -1) return false;
    else return true;
  }

  isBookmark(data: any) {
    var ret = false;
    if (data.bookmarks != null) {
      data.bookmarks.forEach((item) => {
        if (item.objectID == this.user?.userID) {
          ret = true;
        }
      });
    }
    return ret;
  }

  // checkBookmark() {
  //   return this.isBookmark;
  // }

  getBookmarksClass(item) {
    if (this.showBookmark(item)) return 'icon-bookmark text-warning icon-20';
    else return 'text-warning icon-20';
  }

  getFolderClass(name) {
    // name.indexOf
    return name;
  }

  showBookmark(item) {
    if (item.bookmarks != null) {
      var list = item.bookmarks.filter((x) => x.objectID == this.user?.userID);
      if (list.length > 0) return true;
      else return false;
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
      var list = data.filter((x) => x.rating > 0);
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
    if (download === null || download === undefined) return 0;
    else return download;
  }

  getViews(data: HistoryFile[]) {
    if (data) {
      // var list = data.filter(x => x.rating == 0);
      return data.filter(
        (x) =>
          (x.type != null && x.type == 'view') ||
          (x.note != null && x.note.indexOf('read file') > -1)
      ).length;
    } else return 0;
  }

  getType(item: any, ret: string) {
    var type = 'folder';
    if (ret == 'name') {
      if (item.extension) type = 'file';
    } else {
      // entity
      type = 'DM_FolderInfo';
      if (!item.folderName && item.extension) type = 'DM_FileInfo';
    }

    return type;
  }

  setRequest(
    type: string,
    recId: string,
    id: string,
    status: string,
    isActive: boolean
  ) {
    //
    if (type == 'file') {
      this.fileService
        .UpdateRequestAsync(recId, id, status, isActive, this.idMenuActive)
        .subscribe(async (res) => {
          let list = this.listFiles;
          var idTemplate = this.idMenuActive;
          //if (idTemplate == "11" || idTemplate == "12" || idTemplate == "13")
          if (idTemplate == 'DMT07' || idTemplate == '12' || idTemplate == '13')
            id = recId;

          if (this.idMenuActive != '10' && this.idMenuActive != '13') {
            let index = list.findIndex(
              (d) => d.id.toString() === id.toString()
            ); //find index in your array
            if (index > -1) {
              this.deleteFileView.next(list[index].recID);
              list.splice(index, 1); //remove element from array
              this.listFiles = list;
              this.notificationsService.notify(res.message);
            }
          } else {
            // xet duyet huy
            //if (this.idMenuActive == '13' && (status == "7" || status == "8")) {
            if (this.idMenuActive == '13' && (status == '7' || status == '8')) {
              let index = list.findIndex(
                (d) => d.id.toString() === id.toString()
              ); //find index in your array
              if (index > -1) {
                this.deleteFileView.next(list[index].recID);
                list.splice(index, 1); //remove element from array
                this.listFiles = list;
                this.notificationsService.notify(res.message);
              }
            } else {
              var files = this.listFiles;
              let index = files.findIndex(
                (d) => d.id.toString() === id.toString()
              );
              if (index != -1) {
                files[index].fileName = res.data.fileName;
                files[index] = res.data;
              }
              this.listFiles = files;
              this.notificationsService.notify(res.message);
            }
          }
        });
    } else {
      this.folderService
        .UpdateRequestAsync(recId, id, status, isActive)
        .subscribe(async (res) => {
          let list = this.listFolder;
          var idTemplate = this.idMenuActive;
          //   if (idTemplate == "11" || idTemplate == "12" || idTemplate == "13")
          if (idTemplate == 'DMT07' || idTemplate == '12' || idTemplate == '13')
            id = recId;
          //if (this.idMenuActive != '10' && this.idMenuActive != '13') {
          if (this.idMenuActive != '10' && this.idMenuActive != '13') {
            let index = list.findIndex(
              (d) => d.id.toString() === id.toString()
            ); //find index in your array
            if (index > -1) {
              this.deleteFileView.next(list[index].recID);
              list.splice(index, 1);
              this.listFolder = list;
              this.notificationsService.notify(res.message);
            }
          } else {
            // xet duyet huy
            if (this.idMenuActive == '13' && (status == '7' || status == '8')) {
              let index = list.findIndex((d) => d.id.toString() === id); //find index in your array
              if (index > -1) {
                this.deleteFileView.next(list[index].recID);
                list.splice(index, 1); //remove element from array
                this.listFolder = list;
                this.notificationsService.notify(res.message);
              }
            } else {
              var folder = this.listFolder;
              let index = folder.findIndex(
                (d) => d.id.toString() === id.toString()
              );
              if (index != -1) {
                folder[index] = res.data;
              }
              //this.dmSV.listFolder.next(folder);
              this.listFolder = folder;

              this.notificationsService.notify(res.message);
              //this.ChangeData.next(true);
            }
          }
        });
    }
  }

  async getToken() {
    try {
      lvFileClientAPI.setUrl(environment.urlUpload); //"http://192.168.18.36:8011");
      var retToken = await lvFileClientAPI.formPost('api/accounts/token', {
        username: 'admin/root',
        password: 'root',
      });
      if (retToken?.access_token)
        window.localStorage.setItem('lv-file-api-token', retToken.access_token);
      else
        this.notificationsService.notify(
          'Server lưu trữ tập tin không hoạt động'
        );
    } catch (ex) {
      this.notificationsService.notify(
        'Server lưu trữ tập tin không hoạt động'
      );
    }
  }

  clickMF($event, data: any, view: any = null) {
    var type = this.getType(data, 'name');
    let option = new SidebarModel();
    switch ($event.functionID) {
      // Hủy chờ xét duyệt
      case 'DMT0232': {
        this.setRequest(type, data.recID, data.id, '-2', true);
        break;
      }
      //Rút lại quyền sau khi đã duyệt
      case 'DMT0233':
      case 'DMT0243': {
        this.setRequest(
          type,
          data.recID,
          data.id,
          this.idMenuActive == 'DMT06' ? '9' : '8',
          true
        );
        break;
      }
      case 'DMT0226': // xet duyet thu muc
      case 'DMT0230': // xet duyet file
      case 'DMT0240':
        this.setRequest(
          type,
          data.recID,
          data.id,
          this.idMenuActive == 'DMT06' ? '5' : '6',
          true
        );
        break;
      case 'DMT0227': // tu choi xet duyet thu muc
      case 'DMT0231': // tu choi xet duyet file
      case 'DMT0241':
        this.setRequest(
          type,
          data.recID,
          data.id,
          this.idMenuActive == 'DMT06' ? '4' : '8',
          false
        );
        break;
      case 'DMT0510':
      case 'DMT0210': //view file
        var dialogModel = new DialogModel();
        dialogModel.IsFull = true;
        this.fileService.getFile(data.recID).subscribe((data) => {
          this.callfc.openForm(
            ViewFileDialogComponent,
            data.fileName,
            1000,
            800,
            '',
            data,
            '',
            dialogModel
          );
          var files = this.listFiles;
          if (files != null) {
            let index = files.findIndex(
              (d) => d.recID.toString() === data.recID
            );
            if (index != -1) {
              //var thumnail = files[index].thumbnail;
              files[index] = data;
            }
            this.listFiles = files;
            this.ChangeData.next(true);
          }
        });
        break;
      case 'DMT0511':
      case 'DMT0211': // download
        this.fileService.getFile(data.recID, false).subscribe(async (file) => {
          var id = file.recID;
          if (this.checkDownloadRight(file)) {
            this.fileService.downloadFile(id).subscribe(async (item2) => {
              let blob = await fetch(
                environment.urlUpload + '/' + file.pathDisk
              ).then((r) => r.blob());
              let url = window.URL.createObjectURL(blob);
              var link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', data.fileName);
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              var files = this.listFiles;
              if (files != null) {
                let index = files.findIndex((d) => d.recID.toString() === id);
                if (index != -1) {
                  files[index].countDownload = files[index].countDownload + 1;
                }
                this.listFiles = files;
                //this.ChangeData.next(true);
              }
            });
          } else {
            this.notificationsService.notify(this.titleNoRight);
          }
        });
        break;
      case 'DMT0522':
      case 'DMT0222': // properties file
        option.DataService = this.dataService;
        option.FormModel = this.formModel;
        option.Width = '550px';
        // let data = {} as any;
        data.title = this.titleUpdateFolder;
        data.id = data.recID;
        this.callfc.openSide(PropertiesComponent, data, option);
        break;
      case 'DMT0535':
      case 'DMT0234': // khoi phuc thu muc
      case 'DMT0235': // khoi phuc file
        this.restoreFile(data, type);
        break;
      case 'DMT0519':
      case 'DMT0206': // xoa thu muc
      case 'DMT0219': // xoa file
      case 'SYS02':
        this.deleteFile(data, type);
        break;

      //Chỉnh sửa thư mục hoặc file
      case 'DMT0513': {
        if (type == 'folder') {
          option.DataService = this.dataService;
          option.FormModel = this.formModel;
          option.Width = '550px';
          // let data = {} as any;
          data.title = this.titleUpdateFolder;
          data.id = data.recID;
          data.readonly = $event.functionID == 'DMT0209' ? true : false;
          this.callfc.openSide(CreateFolderComponent, data, option);
        } else {
          this.fileService.getFile(data.recID).subscribe((file) => {
            if (file) {
              var option = new DialogModel();
              option.FormModel = this.formModel;
              var isCopyRight = false;
              if (file.author) isCopyRight = true;
              this.callfc.openForm(
                EditFileComponent,
                '',
                800,
                800,
                '',
                ['', file, isCopyRight, $event?.data?.customName],
                '',
                option
              );
            }
          });
        }
        break;
      }

      case 'DMT0202': // chinh sua thu muc
      case 'DMT0209': {
      
        option.DataService = this.dataService;
        option.FormModel = this.formModel;
        option.Width = '550px';
        data.title = this.titleUpdateFolder;
        data.id = data.recID;
        data.readonly = $event.functionID == 'DMT0209' ? true : false;
        this.callfc.openSide(CreateFolderComponent, data, option);
        break;
      }

      case 'DMT0213': // chinh sua file
        this.fileService.getFile(data.recID).subscribe((file) => {
          if (file) {
            var option = new DialogModel();
            option.FormModel = this.formModel;
            var isCopyRight = false;
            if (file.author) isCopyRight = true;
            this.callfc.openForm(
              EditFileComponent,
              '',
              800,
              800,
              '',
              ['', file, isCopyRight, $event?.data?.customName],
              '',
              option
            );
          }
        });
        break;
      case 'DMT0520':
      case 'DMT0207': // permission
      case 'DMT0220': {
        if (type == 'file' || this.type == 'DM_FileInfo') {
          this.api
            .execSv(
              'DM',
              'DM',
              'FileBussiness',
              'GetFilesByIDAsync',
              data.recID
            )
            .subscribe((item: any) => {
              this.dataFileEditing = item;
              this.callfc
                .openForm(
                  RolesComponent,
                  '',
                  950,
                  650,
                  '',
                  ['1', data.recID, view, type, null, $event?.data?.customName],
                  ''
                )
                .closed.subscribe();
            });
        } else {
          this.api
            .execSv(
              'DM',
              'DM',
              'FolderBussiness',
              'GetFolderByIdAsync',
              data.recID
            )
            .subscribe((item: any) => {
              this.dataFileEditing = item;
              this.callfc
                .openForm(
                  RolesComponent,
                  '',
                  950,
                  650,
                  '',
                  ['1', data.recID, view, type, null, $event?.data?.customName],
                  ''
                )
                .closed.subscribe((item) => {
                  view?.dataService.update(item.event).subscribe();
                });
            });
        }
        break;
      }
      case 'DMT0517':
      case 'DMT0525':
      case 'DMT0205': // bookmark folder
      case 'DMT0223': // unbookmark folder
      case 'DMT0217': // bookmark file
      case 'DMT0225':
        this.setBookmark(data, type);
        break;
      case 'DMT0516':
      case 'DMT0204': // di chuyen
      case 'DMT0216': // di chuyen
        var title = `${this.titleCopy} ${type}`;
        this.callfc.openForm(
          MoveComponent,
          '',
          500,
          650,
          '',
          [type, data, title, true],
          ''
        );
        break;
      case 'DMT0514':
      case 'DMT0214': //"copy": // copy file hay thu muc
        var title = `${this.titleCopy}`;
        this.callfc.openForm(
          CopyComponent,
          '',
          650,
          250,
          '',
          [type, data, title, true],
          ''
        );
        break;
      case 'DMT0515':
      case 'DMT0203': //"rename": // copy file hay thu muc
      case 'DMT0215':
        var title = `${this.titleRename}`;
        this.callfc.openForm(
          CopyComponent,
          '',
          450,
          100,
          '',
          [type, data, title, false],
          ''
        );
        break;
      case 'DMT0518':
      case 'DMT0218': /// version file
        this.callfc.openForm(
          VersionComponent,
          '',
          650,
          600,
          '',
          [FormModel, data],
          ''
        );
        break;
      //request permission
      case 'DMT0521':
      case 'DMT0221':
      case 'DMT0208':
        //Là file
        if (data?.extension) {
          this.fileService.getFile(data.recID).subscribe((datas) => {
            option.DataService = this.dataService;
            option.FormModel = this.formModel;
            option.Width = '550px';
            datas.title = this.titleUpdateFolder;
            datas.id = datas.recID;
            this.callfc.openSide(ShareComponent, [type, datas, false], option);
          });
        } else {
          option.DataService = this.dataService;
          option.FormModel = this.formModel;
          option.Width = '550px';
          data.title = this.titleUpdateFolder;
          data.id = data.recID;
          this.callfc.openSide(ShareComponent, [type, data, false], option);
        }
        break;

      // share
      case 'DMT0512':
      case 'DMT0201':
      case 'DMT0212':
        option.DataService = this.dataService;
        option.FormModel = this.formModel;
        option.Width = '550px';
        // let data = {} as any;
        data.title = this.titleUpdateFolder;
        data.id = data.recID;
        this.callfc.openSide(ShareComponent, [type, data, true], option);
        break;

      //Sao chép đường dẫn thư mục
      case 'DMT0236':
      {
        this.copyToClipboard(this.getPath(data.recID,type))
            .then(() => console.log('text copied !'))
            .catch(() => console.log('error'));
          // navigator.clipboard.writeText(this.getPath());
          this.notificationsService.notifyCode("SYS041");
        break;
      }
      //Tạo mới thư mục con
      case 'DMT0237':
      {
        let curr = 
        {
          folderName : this.folderName,
          parentFolderId: this.parentFolderId,
          level: this.level,
          folderID: this.folderID
        };

        this.folderName = data.folderName;
        this.parentFolderId = data.parentId;
        this.parentFolder.next(data);
        this.level = data.level;
        this.folderID = data.recID;
        this.folderId.next(data.recID);
        var breadcumb = [];
        breadcumb = this.breadcumb.getValue();
        breadcumb.push(data.folderName);
        this.breadcumb.next(breadcumb);
        if (!this.breadcumbLink) this.breadcumbLink = [];
        this.breadcumbLink.push(data .recID);

        let option = new SidebarModel();
        option.DataService = this.dataService;
        option.FormModel = this.formModel;
        option.Width = '550px';
        let data2 = {} as any;
        data2.title = $event?.data?.customName;
        data2.id = null;
        data2.type = 'add';
        data2.isAddFolder = true;
        let result = this.callfc.openSide(CreateFolderComponent, data2, option);

        result.closed.subscribe(x=>{
          if(x.event)  this.openItem(data)
          else
          {
            this.folderName = curr.folderName;
            this.parentFolderId = curr.parentFolderId;
            this.level = data.level;
            this.folderID = curr.folderID;
            this.folderId.next(curr.folderID);
            var breadcumb = this.breadcumb.getValue();
            breadcumb.pop();
            this.breadcumb.next(breadcumb)
            this.breadcumbLink.pop()
          }
        })
        break;
      }
        
      default:
        break;
    }
  }

  getPath(id:any,type) {
    const queryParams:any = {};
    let url = null;
    let l = null;
    if(type == "folder")
    {
      queryParams._fo = id
      l = this.router.url.split('?')[0];
      url = this.router.serializeUrl(
        this.router.createUrlTree([`/` + l], {
          queryParams: queryParams,
        })
      );
    }
    else
    {
      queryParams.id= id;
      queryParams._fv = false;
      l = this.router.url.split('/');
      url = this.router.serializeUrl(
        this.router.createUrlTree([`/` + l[1] + `/viewfile`], {
          queryParams: queryParams,
        })
      );
    }
   
    return window.location.host + url;
  }

  copyToClipboard(textToCopy) {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      return navigator.clipboard.writeText(textToCopy);
    } else {
      // text area method
      let textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
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

  async restoreFile(data: any, type: string): Promise<void> {
    if (type === 'file') {
      this.fileService
        .restoreFile(data.recID, data.fileName)
        .subscribe(async (res) => {
          if (res.status == 0) {
            let list = this.listFiles;
            let index = list.findIndex(
              (d) => d.recID.toString() === data.recID.toString()
            ); //find index in your array
            if (index > -1) {
              list.splice(index, 1); //remove element from array
              this.listFiles = list;
              //   this.notificationsService.notify(res.message);
              this.ChangeData.next(true);
            }
          }

          if (res.status == 6) {
            var config = new AlertConfirmInputConfig();
            config.type = 'YesNo';
            this.notificationsService
              .alert(this.title, res.message, config)
              .closed.subscribe((x) => {
                if (x.event.status == 'Y') {
                  this.fileService
                    .restoreFile(data.recID, res.data.fileName, '1')
                    .subscribe(async (item) => {
                      if (item.status == 0) {
                        let list = this.listFiles;
                        let index = list.findIndex(
                          (d) => d.recID.toString() === data.recID.toString()
                        ); //find index in your array
                        if (index > -1) {
                          list.splice(index, 1); //remove element from array
                          this.listFiles = list;
                          this.notificationsService.notify(item.message);
                          this.ChangeData.next(true);
                        }
                      }
                    });
                }
              });
          } else {
            this.notificationsService.notify(res.message);
          }
        });
    } else {
      this.folderService.restoreFolder(data.recID).subscribe(async (res) => {
        if (res.status == 0) {
          let list = this.listFolder;
          //list = list.filter(item => item.recID != id);
          let index = list.findIndex(
            (d) => d.recID.toString() === data.recID.toString()
          ); //find index in your array
          if (index > -1) {
            list.splice(index, 1);
            this.listFolder = list;
            this.ChangeData.next(true);
            //this.dmSV.nodeDeleted.next(id);
            //this.changeDetectorRef.detectChanges();
          }
        }

        if (res.status == 2) {
          var config = new AlertConfirmInputConfig();
          config.type = 'YesNo';
          this.notificationsService
            .alert(this.title, res.message, config)
            .closed.subscribe((x) => {
              if (x.event.status == 'Y') {
                this.folderService
                  .copyFolder(data.recID.id, data.folderName, '', 1, 1)
                  .subscribe(async (item) => {
                    if (item.status == 0) {
                      let list = this.listFolder;
                      let index = list.findIndex(
                        (d) => d.recID.toString() === data.recID.id.toString()
                      ); //find index in your array
                      if (index > -1) {
                        list.splice(index, 1);
                        this.listFolder = list;
                        this.ChangeData.next(true);
                      }
                    }
                  });
              }
            });
        } else {
          this.notificationsService.notify(res.message);
        }
      });
    }
  }

  getSizeKB(item: any) {
    if (item.fileSize != undefined) {
      var kb = item.fileSize / 1024;
      return kb.toFixed(2).toString() + ' Kb';
    } else return '';
  }

  setFullHtmlNode(folder, text) {
    var item1 = '';
    var item2 = '';

    if (!folder.icon)
      item1 =
        '<img class="h-13px" src="../../../assets/themes/dm/default/img/icon-folder.svg">';
    else {
      if (folder.icon.indexOf('.') == -1)
        item1 = `<i class="${folder.icon}" role="presentation"></i>`;
      else {
        var path = `${folder.icon}`;
        item1 = `<img class="h-13px " src="${path}">`;
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
    if (
      folder.folderId != null &&
      this.idMenuActive == 'DMT02' &&
      (folder.folderId == 'DM' ||
        folder.folderId.indexOf(this.FOLDER_NAME) > -1) &&
      folder.isSystem &&
      (folder.level == '1' || folder.level == '2')
    ) {
      return true;
    } else return false;
  }

  changeTextSearch(
    text: any,
    total: any,
    totalPage: any,
    pageNo: any,
    paoaSize: any
  ) {
    this.textSearch.next(text);
    this.totalPage = total;
    // this.totalPage.next(totalPage);
    this.page = pageNo;
    //this.pageSize.next(paoaSize);
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

  emptyTrash() {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notificationsService.alertCode('DM068', config).subscribe((x) => {
      if (x.event.status == 'Y') {
        this.folderService.emptyTrash('').subscribe(async (res) => {
          if (res) {
            this.listFolder = [];
            this.listFiles = [];
            this.fileService.getTotalHdd().subscribe((i) => {
              this.updateHDD.next(i);
            });
            this.ChangeDataView.next(true);
            this.notificationsService.notifyCode('SYS008');
          }
        });
      }
    });
  }

  copyFileTo(id, fullName, toselectId) {
    var that = this;
    this.fileService
      .copyFile(id, fullName, toselectId, 1)
      .subscribe(async (res) => {
        if (res.status == 0) {
          let list = this.listFiles;
          // move
          let index = list.findIndex(
            (d) => d.recID.toString() === id.toString()
          ); //find index in your array
          if (index > -1) {
            list.splice(index, 1); //remove element from array
            this.listFiles = list;
            this.ChangeData.next(true);
          }
          // this.notificationsService.notify(res.message);
        }

        if (res.status == 6) {
          //let newNameMessage = this.titelRenamemessage.replace('{0}', res.data.fileName);
          var config = new AlertConfirmInputConfig();
          config.type = 'YesNo';
          this.notificationsService
            .alert(this.title, res?.message, config)
            .closed.subscribe((x) => {
              if (x.event.status == 'Y') {
                this.fileService
                  .copyFile(id, fullName, toselectId, 1, 1)
                  .subscribe(async (item) => {
                    if (item.status == 0) {
                      let list = this.listFiles;
                      // move
                      let index = list.findIndex(
                        (d) => d.recID.toString() === id.toString()
                      ); //find index in your array
                      if (index > -1) {
                        list.splice(index, 1); //remove element from array
                        this.listFiles = list;
                        this.ChangeData.next(true);
                      }
                      if (item.status == 0)
                        this.updateHDD.next(item.messageHddUsed);
                    }
                    that.notificationsService.notify(item.message);
                  });
              }
            });
        } else {
          this.notificationsService.notify(res.message);
        }
      });
  }

  copyFolderTo(id, fullName, toselectId) {
    //  var that = this;
    this.folderService
      .copyFolder(id, fullName, toselectId, 1)
      .subscribe(async (res) => {
        if (res.status == 0) {
          let list = this.listFolder;
          //this.nodeDeleted.next(id);
          //list = list.filter(item => item.recID != id);
          let index = list.findIndex(
            (d) => d.recID.toString() === id.toString()
          ); //find index in your array
          if (index > -1) {
            list.splice(index, 1); //remove element from array
            this.listFolder = list;
            this.ChangeData.next(true);
          }

          this.addFolder.next(res.data); // them node con
          this.ChangeData.next(true);
        }

        if (res.status == 2) {
          var config = new AlertConfirmInputConfig();
          config.type = 'YesNo';
          this.notificationsService
            .alert(this.title, res.message, config)
            .closed.subscribe((x) => {
              if (x.event.status == 'Y') {
                this.folderService
                  .copyFolder(id, fullName, toselectId, 1, 1)
                  .subscribe(async (item) => {
                    if (item.status == 0) {
                      let list = this.listFolder;
                      this.nodeDeleted.next(id);
                      //list = list.filter(item => item.recID != id);
                      let index = list.findIndex(
                        (d) => d.recID.toString() === id.toString()
                      ); //find index in your array
                      if (index > -1) {
                        list.splice(index, 1); //remove element from array
                        this.listFolder = list;
                        this.ChangeData.next(true);
                      }
                      this.fileService.getTotalHdd().subscribe((i) => {
                        this.updateHDD.next(i.messageHddUsed);
                      });
                    }
                    this.notificationsService.notify(item.message);
                  });
              }
            });
        } else {
          this.notificationsService.notify(res.message);
        }
      });
  }

  getFileName(name: any) {
    if (!name) return '';
    var arrName = name.split('.');
    if (arrName.length > 1) arrName.splice(arrName.length - 1, 1);
    return arrName.join('.');
  }

  countFavorite(funcID: any, favsID: any) {
    return this.api.execSv(
      'DM',
      'DM',
      'FolderBussiness',
      'CountFavoriteAsync',
      [funcID, favsID]
    );
  }
}
