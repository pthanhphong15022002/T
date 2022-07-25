import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { FolderInfo } from '@shared/models/folder.model';
import { FileInfo, HistoryFile, View } from '@shared/models/file.model';
import { ApiHttpService, AuthStore, CallFuncService, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { CodxDMService } from '../../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { CopyComponent } from '../../copy/copy.component';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements OnInit {
  @Input() listFolders: any;
  @Input() listFiles: any;
  @Input() formModel: any;
  @Input() type: any;  
  html: string;
  count: number;
  tenant: string;
  oldFolderId: string;
  _propertyName: string = "";
  fullName: string = "";
  id: string = "";
  ext: string = "";
  user: any;
  item: FolderInfo;
  totalRating: number;
  totalViews: number;  
  loaded: boolean;
  loadedFile: boolean;
  loadedFolder: boolean;
  setting: any;
  titleCopy = 'Sao chép';
  titleRename = 'Thay đổi tên';
//   @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  @ViewChild('view') view!: ViewsComponent; 
  
  @Output() eventShow = new EventEmitter<boolean>();
  constructor(  
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
    private folderService: FolderService,
    private fileService: FileService,
    private api: ApiHttpService,
    public dmSV: CodxDMService,
    private modalService: NgbModal,
    private auth: AuthStore,
    private notificationsService: NotificationsService,
    private callfc: CallFuncService,
   // private confirmationDialogService: ConfirmationDialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    ) {
   // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {   
    this.user = this.auth.get();
    //this.loaded = false;
   // this.loadedFile = false;
   // this.loadedFolder = true;
    //this.listFolders = this.dataFolders;
   // this.listFiles = this.dataFolders;
    // this.changeDetectorRef.detectChanges();
    // this.dmSV.isSortDirecttion.subscribe(res => {
    //   if (res == null || res != "1") {
    //     this.fileService.options.srtDirections = "1";
    //     this.folderService.options.srtDirections = "1";
    //   }
    //   else {
    //     this.fileService.options.srtDirections = "2";
    //     this.folderService.options.srtDirections = "2";
    //   }
    //   this.fileService.options.srtColumns = this.dmSV.sortColumn.getValue();
    //   this.folderService.options.srtColumns = this.dmSV.sortColumn.getValue();
    // });

    // this.dmSV.isListFolder.subscribe(res => {     
    //   this.refresh();
    //   this.loadedFolder = true;
    // });

    // this.dmSV.islistFiles.subscribe(res => {    
    //   this.refresh();      
    //   this.loadedFile = true;
    // });

    // this.dmSV.isAdd.subscribe(res => {
    //   if (res) {        
    //     this.refresh();
    //   }
    // });
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

  getMame(data) {
    if (data.folderName != null) {
      return data.folderName;
    }
    else {
      return data.fileName;
    }
  }

  getParentId(data) {
    if (data.folderName != null) {
      return data.parentId;
    }
    return data.folderId;
  }

  getType(data) {
    if (data.folderName == null) {
      return "file";
    }
    return "folder";
  }

  getExt(data) {
    if (data.folderName == null) {
      return data.extension;
    }
    return "";
  }

  onRightClick(event, data, type) {
    console.log(event);
   // this.data = data;
   // this.type = type;    
    event.preventDefault();
  }

  identifyFolder(index, folder) {
    return folder;
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

  getFolderClass(name) {
    // name.indexOf
    return name;
  }

  identifyFile(index, file) {
    return file;//file.fileName; 
  }

  // refresh(): void {
  //   //alert(1);
  //   this.listFolder = this.dmSV.listFolder.getValue();
  //   this.listFiles = this.dmSV.listFiles.getValue();
  //   //console.log(this.listFiles);
  //   // this.changeDetectorRef.markForCheck();
  //   this.changeDetectorRef.detectChanges();
  // }

  viewFile(file) {
   // alert(file.folderName);
  }

  clickMF($event, data, type) {
    switch($event.functionID) {
      case "copy": // copy file hay thu muc
        var title = `${this.titleCopy} ${type}`;
        this.callfc.openForm(CopyComponent, "", 450, 100, "", [type, data, title], "");   
        break;

      case "rename": // copy file hay thu muc
        var title = `${this.titleRename} ${type}`;
        this.callfc.openForm(CopyComponent, "", 450, 100, "", [type, data, title], "");   
        break;
    }  
  }

  getViews(data: HistoryFile[]) {
    if (data != null) {
      // var list = data.filter(x => x.rating == 0);
      return data.filter(x => (x.type != null && x.type == 'view') || (x.note != null && x.note.indexOf("read file") > -1)).length;
    }
    else
      return 0;
  }

  getRating(data: View[]) {
    let _sum = 0;
    this.totalViews = 0;
    if (data != null) {
      var list = data.filter(x => x.rating > 0);
      this.totalViews = list.length;
      //res.views.forEach(item => {
      for (var i = 0; i < list.length; i++) {
        _sum = _sum + list[i].rating;
      }
    }

    if (this.totalViews != 0) {
      this.totalRating = _sum / this.totalViews;
    }
    else {
      this.totalRating = 0;
    }
    this.totalRating = parseFloat(this.totalRating.toFixed(2));
    return this.totalRating;
    //alert(this.styleRating);
  }

  getSizeByte(size: any) {
    return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getSizeKB(size: any) {
    var kb = size / 1024;
    return kb.toFixed(2);
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

  getOldFolderId() {
    var id = this.dmSV.oldFolderId.getValue();
    if (id == null)
      return "0";
    else
      return id.toString();
  }

  onDbclick(item, permissions, id, level, parentid, fullName) {
    //if (!this.checkView(permissions)) {
    if (!item.read) {
      this.notificationsService.notify("Bạn không có quyền truy cập thư mục này");
      return;
    }

    if (this.dmSV.idMenuActive == "2")
      return;
    //  alert(id);
    // alert(level);
    this.loadedFile = false;
    this.loadedFolder = false;
    this.dmSV.level = level;
    if (level == "1")
      this.dmSV.parentFolderId = "000000000000000000000000";
    else
      this.dmSV.parentFolderId = parentid;
    this.dmSV.isTree = false;
    this.dmSV.folderName = fullName;
    this.dmSV.currentNode = '';
    this.dmSV.folderId.next(id);
    this.dmSV.disableInput.next(false);

    this.folderService.getFolder(id).subscribe(async res => {
      if (res != null) {
        this.dmSV.parentFolder.next(res);
        this.dmSV.getRight(res);
        this.dmSV.folderName = res.folderName;
        this.dmSV.parentFolderId = res.parentId;
        this.dmSV.add.next(true);
        this.changeDetectorRef.detectChanges();
      }
    });

    // this.dmSV.listFolder.next(null);

    // this.changeDetectorRef.detectChanges();

    this.folderService.getFolders(id).subscribe(async res => {
      //  this.dmSV.changeData(res, null, id); 
      this.dmSV.isTree = true;
      //  console.log(res);
      this.dmSV.listFolder.next(res);
      this.dmSV.listFiles.next(null);
      this.loadedFolder = true;
      this.changeDetectorRef.detectChanges();
    });

    this.fileService.getListActiveFiles(id, "").subscribe(async res => {
      //  this.dmSV.changeData(null, res, id);  
      // console.log(res);
      this.dmSV.listFiles.next(res);
      this.loadedFile = true;
      this.changeDetectorRef.detectChanges();
    });

  }

  showDownloadCount(download) {
    console.log(download);
    if (download === null || download === undefined)
      return 0;
    else
      return download;
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

  async setDownload(id): Promise<void> {
    this.fileService.downloadFile(id).subscribe(async res => {
      if (res && res.content != null) {
        let json = JSON.parse(res.content);
        var bytes = this.base64ToArrayBuffer(json);
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
    });
  }

  openDialogFile() {
    this.dmSV.openDialog(new FolderInfo())
  }

  fileFolderDropped($event) {
    if ($event.source.recID != $event.target.recID) {
      if ($event.source.fileName) {
        this.dmSV.copyFileTo($event.source.recID, $event.source.fileName, $event.target.recID);
      }
      else {
        this.dmSV.copyFolderTo($event.source.recID, $event.source.folderName, $event.target.recID);
      }
    }

  }

  getDataString(data) {
    return JSON.stringify(data);
  }

  getBookmarkString(data) {
    return JSON.stringify(data);
  }

  getPermissionString(data) {
    return JSON.stringify(data);
  }

  checkView(read: boolean) {
    //console.log(read);
    return read;
    // let ret = false;
    // permissions.forEach(item => {
    //   if ((item.objectID == this.user.userID || item.objectID == this.user.groupID) && item.isActive) {          
    //     if (item.read) ret = true;        
    //   }

    //   if (item.objectID == this.user.userID && item.objectType == "1" && item.approvers != "" && item.approvers != this.user.userID && !item.isActive) {          
    //     if (item.approvalStatus == "1")
    //       ret = false;
    //     else 
    //       ret = true;       
    //   }
    // });
    // return ret;
  }

  checkDownload(download) {
    // let ret = false;
    // permissions.forEach(item => {
    //   if ((item.objectID == this.user.userID || item.objectID == this.user.groupID) && item.isActive) {          
    //     if (item.download) ret = true;        
    //   }
    //   if (item.objectID == this.user.userID && item.objectType == "1" && item.approvers != "" && item.approvers != this.user.userID && !item.isActive) {          
    //     if (item.approvalStatus == "1")
    //       ret = false;
    //     else 
    //       ret = true;       
    //   }
    // });
    return download;
  }

  fileUploadDropped($event) {
    // if (this.dmSV.idMenuActive == "3" || this.dmSV.idMenuActive == "4") {
    //   var data = new DataItem();
    //   data.recID = "";
    //   data.type = "file";
    //   data.fullName = "";
    //   data.copy = false;
    //   data.dialog = "autoupload";
    //   data.id_to = "";
    //   data.files = $event;
    //   this.dmSV.setOpenDialog.next(data);
    // }
  }

  viewfile(item, permissions, content, fileName, id, ext) {
    // if (!item.read || this.dmSV.idMenuActive == '2') {7
    //   this.notificationsService.notify("Bạn không có quyền truy cập file này");
    //   return;
    // }

    // var obj = new objectPara();
    // obj.fileID = id;
    // obj.fileName = fileName;
    // obj.extension = ext;
    // obj.data = item;

    // this.fileService.getFile(id, true).subscribe(item => {
    //   if (item) {
    //     var files = this.dmSV.listFiles.getValue();
    //     let index = files.findIndex(d => d.recID.toString() === id);
    //     if (index != -1) {
    //       files[index] = item;
    //     }
    //     this.dmSV.listFiles.next(files);
    //     this.changeDetectorRef.detectChanges();
    //     this.systemDialogService.onOpenViewFileDialog.next(obj);
    //   }
    // })   
  }

  print() {
    //this.view.print();
    window.frames[0].postMessage(JSON.stringify({ 'MessageId': 'Action_Print' }), '*');
  }

  async download(): Promise<void> {
    if (this.item.download) {
      var that = this;
      this.fileService.downloadFile(this.item.recID).subscribe(async res => {
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
      });
    }
  }
}