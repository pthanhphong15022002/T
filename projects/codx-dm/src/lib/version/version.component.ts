import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderInfo } from '@shared/models/folder.model';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { CodxDMService } from '../codx-dm.service';
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileUpload, ItemInterval } from '@shared/models/file.model';
import { resetInfiniteBlocks } from '@syncfusion/ej2-grids';
import { EmitType, detach, isNullOrUndefined, createElement, EventHandler } from '@syncfusion/ej2-base';
import { UploaderComponent, FileInfo, SelectedEventArgs, RemovingEventArgs } from '@syncfusion/ej2-angular-inputs';
import { lvFileClientAPI } from '@shared/services/lv.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionComponent implements OnInit {  
  @Input() formModel: any; 
  idBrowse = "browse";
  user: any;   
  setting: any;    
  titleDialog = 'Cập nhật phiên bản';  
  titleComment = 'Comment';
  titleUploadFile = '"Vui lòng file upload lên"';
  displayThumb = 'full';
  fullName: string;
  dialog: any;  
  updateversion: any;
  comment: string;
  path: any;
  historyID: string;
  fileEditing: FileUpload;
  fileUploadList: FileUpload[];
  interval: ItemInterval[];
  @ViewChild('view') view!: ViewsComponent;   
  @Output() eventShow = new EventEmitter<boolean>();
  @ViewChild('templateupload') public uploadObj: UploaderComponent;
  // @Input('openFolder') openFolder: ViewsComponent;
  public uploadWrapper: HTMLElement = document.getElementsByClassName('e-upload')[0] as HTMLElement;
  public parentElement: HTMLElement;
  public proxy: any;
  public progressbarContainer: HTMLElement;
  public filesDetails: FileInfo[] = [];
  public filesList: HTMLElement[] = [];
  public dropElement: HTMLElement = document.getElementsByClassName('control-fluid')[0] as HTMLElement;
  
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
   // private confirmationDialogService: ConfirmationDialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
    ) {
      this.dialog = dialog;
      this.formModel = data.data[0];
      this.fileEditing = data.data[1]; 
      this.comment = '';
  }

  ngOnInit(): void {   
    this.user = this.auth.get();     
    
  }

  ngOnDestroy() {
    //   this.atSV.openForm.unsubscribe();
    if (this.interval?.length > 0) {
      this.interval.forEach(element => {
        clearInterval(element.instant);
      });
    }
  }

  disableFolder() {
    return true;
  }
  // async handleFileInputUpdate(files: FileList) {
  //   this.fileUploadList = [];
  //   var file = files[0];
  //   let data: ArrayBuffer;
  //   data = await file.arrayBuffer();
  //   var fileUpload = new FileUpload();
  //   var content = this.arrayBufferToBase64(data);
  //   this.fileEditing.avatar = this.getAvatar(fileUpload.fileName);
  //   this.fileEditing.extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length) || file.name;
  //   this.fileEditing.createdBy = this.user.userID;//userName;
  //   this.fileEditing.createdOn = this.getNow();
  //   this.fileEditing.type = file.type;
  //   this.fileEditing.fileSize = file.size;
  //   this.fileEditing.fileName = file.name;
  //   this.fileEditing.data = content;
  //   this.fileEditing.reWrite = false;
  //   this.fileEditing.folderId = this.dmSV.folderId.getValue();
  //   this.newfile = file.name;
  //   this.updateversion = true;
  //   this.changeDetectorRef.detectChanges();
  //   return false;
  // }

  getNow() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var ret = dd + '/' + mm + '/' + yyyy;
    return ret;
  }

  arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  ngAfterViewInit(): void {    

    if (document.getElementById(this.idBrowse) != null) {
      var list = document.getElementsByName('UploadFiles');
      if (list?.length > 0) {
        for (var i = 0; i < list.length; i++) {
          if (document.getElementsByName('UploadFiles')[i].getAttribute("idbutton") == null) {
            document.getElementsByName('UploadFiles')[i].setAttribute("idbutton", this.idBrowse);
            break;
          }
        }
      }

      document.getElementById(this.idBrowse).onclick = () => {
        document.getElementsByClassName('e-file-select-wrap')[0].querySelector('button').click();
        return false;
      };

      this.dropElement = document.querySelector('#dropArea') as HTMLElement;
      document.getElementById(this.idBrowse).onclick = function () {
        document.getElementsByClassName('e-file-select-wrap')[0].querySelector('button').click();
        return false;
      }
    }   
  }

  getAvatar(filename: string) {
    if (filename == "" || filename == null)
      return "";
    var ext = filename.substring(filename.lastIndexOf('.'), filename.length) || filename;

    if (ext == null) {
      // alert(1);
      return "file.svg";
    }
    else {
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
  }

  convertBlobToBase64 = async (blob) => {
    return await this.blobToBase64(blob);
  }

  blobToBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });


  public readURL(liImage: HTMLElement, file: any) {
    let imgPreview: HTMLImageElement = liImage as HTMLImageElement;
    let imageFile: File = file.rawFile;
    let reader: FileReader = new FileReader();
    if (imageFile) {
      reader.readAsDataURL(imageFile);
    }
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  } 

  updateVersion() {

  }

  async addFileLargeLong() {
    // check dung luong dia cung
    var ret = this.fileEditing;
    var fileSize = parseInt(this.fileEditing.fileSize);
    var that = this;
    this.fileEditing.uploadId = "";
    function isAllowAddFileAsync() {
      return new Promise((resole, reject) => {
        that.fileService.isAllowAddFile(fileSize).subscribe(item => {
          if (item == "ok") {
            resole(item);
          }
          else {
            reject(item);
          }
        });
      });
    };

    try {      
      var item = await isAllowAddFileAsync();      
      this.dmSV.getToken();      
      var appName="hps-file-test";// Tam thoi de hard        
      var ChunkSizeInKB = this.dmSV.ChunkSizeInKB;//2*1024;
      var uploadFile = this.fileEditing.item.rawFile;
      var retUpload = await lvFileClientAPI.postAsync(`api/${appName}/files/register`, {        
        "Data": {
          "FileName":  uploadFile.name,
          "ChunkSizeInKB": ChunkSizeInKB,
          "FileSize": uploadFile.size,
          'thumbSize': {
            'width': 200, //Kích thước của file ảnh Thum bề ngang
            'height': 200//Kích thước của file ảnh Thum bề dọc
          },
          "IsPublic": true,
          ThumbConstraints:"30,60,120,300,500,600"         
        }
      });
      
      console.log(retUpload);
      // update len server urs và thumbnail
      this.fileEditing.thumbnail = retUpload.Data.RelUrlThumb; //"";
      this.fileEditing.uploadId = retUpload.Data.UploadId;//"";
      this.fileEditing.urlPath = retUpload.Data.RelUrlOfServerPath;//"";
      this.fileEditing.data = '';
      this.versionFile();

      //this.displayThumbnail(res.recID, res.pathDisk);      
      var sizeInBytes = uploadFile.size;
      var chunSizeInfBytes = ChunkSizeInKB * 1024;
      var numOfChunks = Math.floor(uploadFile.size/chunSizeInfBytes);
      if(uploadFile.size % chunSizeInfBytes>0){
        numOfChunks++;
      }

      //api/lv-docs/files/upload     
      for (var i = 0; i < numOfChunks; i++) {
        var start = i * chunSizeInfBytes;//Vị trí bắt đầu băm file
        var end = start + chunSizeInfBytes;//Vị trí cuối
        if (end > sizeInBytes)
          end = sizeInBytes;//Nếu điểm cắt cuối vượt quá kích thước file chặn lại
        var blogPart = uploadFile.slice(start, end);//Lấy dữ liệu của chunck dựa vào đầu cuối
        var fileChunk = new File(
          [ blogPart ],
          uploadFile.name,
          { type: uploadFile.type });//Gói lại thành 1 file chunk để upload
          var uploadChunk = await lvFileClientAPI.formPostWithToken(`api/${appName}/files/upload`,{      
            FilePart: fileChunk,
            UploadId: retUpload.Data.UploadId,
            Index: i          
          });
        console.log(uploadChunk);
      }
    }
    catch (ex) {
      this.fileEditing.uploadId = "0";
      this.notificationsService.notify(ex);
    }
    return ret;    
  }
  
  async handleFileInput(files: FileInfo[]) {    
    var file = files[0];    
    var data = await this.convertBlobToBase64(file.rawFile);  
    var type = file.type.toLowerCase();
    if (type == "png" || type == "jpg" || type == "bmp") {
      this.fileEditing.avatar = data;
    }
    else this.fileEditing.avatar = `../../../assets/codx/dms/${this.getAvatar(file.name)}`;
    this.fileEditing.extension = file.name.substring(file.name.lastIndexOf('.'), file.name.length) || file.name;
    this.fileEditing.createdBy = this.user.userName;//userName;
    this.fileEditing.createdOn = this.getNow();
    this.fileEditing.type = file.type;
    this.fileEditing.fileSize = file.size;
    this.fileEditing.fileName = file.name;
    this.fileEditing.data = '';
    this.fileEditing.reWrite = false;
    this.fileEditing.item = file;
    this.fileEditing.folderId = this.dmSV.folderId.getValue();   
    this.updateversion = true;
    this.changeDetectorRef.detectChanges();
    return false;
  }

  public onFileSelect(args: SelectedEventArgs): void {
    if (isNullOrUndefined(document.getElementById('dropArea').querySelector('.upload-list-root'))) {
      this.parentElement = createElement('div', { className: 'upload-list-root' });
      this.parentElement.appendChild(createElement('ul', { className: 'ul-element' }));
      document.getElementById('dropArea').appendChild(this.parentElement);
    }
    this.handleFileInput(args.filesData);
    args.cancel = true;
  }

  public formSelectedData(selectedFiles: FileInfo, proxy: any): void {
    console.log(selectedFiles);
    let liEle: HTMLElement = createElement('li', { className: 'file-lists', attrs: { 'data-file-name': selectedFiles.name } });
    liEle.appendChild(createElement('span', { className: 'file-name ', innerHTML: selectedFiles.name }));
    liEle.appendChild(createElement('span', { className: 'file-size ', innerHTML: this.uploadObj.bytesToSize(selectedFiles.size) }));
    if (selectedFiles.status === 'Ready to upload') {
      this.progressbarContainer = createElement('span', { className: 'progress-bar-container' });
      this.progressbarContainer.appendChild(createElement('progress', { className: 'progress', attrs: { value: '0', max: '100' } }));
      liEle.appendChild(this.progressbarContainer);
    } else { liEle.querySelector('.file-name').classList.add('upload-fails'); }
    let closeIconContainer: HTMLElement = createElement('span', { className: 'e-icons close-icon-container' });
    EventHandler.add(closeIconContainer, 'click', this.removeFiles, proxy);
    liEle.appendChild(closeIconContainer);
    document.querySelector('.ul-element').appendChild(liEle);
    this.filesList.push(liEle);
  }

  public removeFiles(args: any): void {
    let status: string = this.filesDetails[this.filesList.indexOf(args.currentTarget.parentElement)].status;
    if (status === 'File uploaded successfully') {
      this.uploadObj.remove(this.filesDetails[this.filesList.indexOf(args.currentTarget.parentElement)]);
    } else {
      detach(args.currentTarget.parentElement);
    }
    this.uploadObj.element.value = '';
  }

  
  txtValue($event, type) { 
    this.comment = $event.data;
  }

  onDeleteHistory(recID) {
    let index = this.fileEditing.history.findIndex(d => d.recID.toString() === recID); //find index in your array
    if (index > -1) {
      this.fileEditing.history.splice(index, 1);//remove element from array
      this.changeDetectorRef.detectChanges();
    }
  }

  openHistory(file) {
    this.historyID = file.recID;
    // if (this.fileEditing.history?.length > 0) {
    //   let index = this.fileEditing.history.findIndex(d => d.recID.toString() === file.recID); //find index in your array
    //   if (index > -1) {
    //     this.historyFile = this.fileEditing.history[index];
    //     this.changeDetectorRef.detectChanges();
    //  //   this.openDialogFolder(this.contentFileHistory, "", "history");
    //   }
    // }
  }

  displayThumbnail(data) {
    this.dmSV.setThumbnailWait.next(data);
  }


  // displayThumbnail(id, pathDisk) {
  //   var that = this;
  //   if (this.interval == null)
  //     this.interval = [];
  //   var files = this.dmSV.listFiles;
  //   var index = setInterval(() => {
  //     that.fileService.getThumbnail(id, pathDisk).subscribe(item => {
  //       if (item != null && item != "") {
  //         let index = files.findIndex(d => d.recID.toString() === id);
  //         if (index != -1) {
  //           files[index].thumbnail = item;
  //           that.dmSV.listFiles = files;
  //           that.dmSV.ChangeData.next(true);
  //           that.changeDetectorRef.detectChanges();
  //         }
  //         let indexInterval = this.interval.findIndex(d => d.id === id);
  //         if (indexInterval > -1) {
  //           clearInterval(this.interval[indexInterval].instant);
  //           this.interval.splice(indexInterval, 1);
  //         }
  //       }
  //     })
  //   }, 3000);

  //   var interval = new ItemInterval();
  //   interval.id = id;
  //   interval.instant = index;
  //   this.interval.push(Object.assign({}, interval));
  // }

  async serviceAddFile(fileItem: FileUpload): Promise<FileUpload> {
    try {
      fileItem.uploadId = '';      
      var appName = environment.appName; // Tam thoi de hard
      var ChunkSizeInKB = this.dmSV.ChunkSizeInKB;
      var uploadFile = fileItem.item.rawFile;
      var retUpload = await lvFileClientAPI.postAsync(
        `api/${appName}/files/register`,
        {
          Data: {
            FileName: uploadFile.name,
            ChunkSizeInKB: ChunkSizeInKB,
            FileSize: uploadFile.size,
            thumbSize: {
              width: 200, //Kích thước của file ảnh Thum bề ngang
              height: 200, //Kích thước của file ảnh Thum bề dọc
            },
            IsPublic: true,
            ThumbConstraints:"30,60,120,300,500,600"
          },
        }
      );
      fileItem.fileSize = uploadFile.size;
      fileItem.thumbnail = retUpload.Data?.RelUrlThumb; //"";
      fileItem.uploadId = retUpload.Data?.UploadId; //"";
      fileItem.urlPath = retUpload.Data?.RelUrlOfServerPath; //"";
    } catch (ex) {
      console.log(ex);
    }
    return fileItem;
  }


  async versionFile() {
    var that = this;
    if (this.fileEditing.item != '' && this.fileEditing.item != undefined && this.fileEditing.item != null) {
      this.fileEditing.comment = this.comment;
      await this.dmSV.getToken();
      var fileItem = this.fileEditing;
      var fileSize = parseInt(fileItem.fileSize);
      this.fileEditing = await this.serviceAddFile(fileItem);
      // function isAllowAddFileAsync() {
      //   return new Promise((resole, reject) => {
      //     that.fileService.isAllowAddFile(fileSize).subscribe((item) => {
      //       if (item == 'ok') {
      //         resole(item);
      //       } else {
      //         reject(item);
      //       }
      //     });
      //   });
      // }

      this.fileService.updateVersionFile(this.fileEditing).subscribe(async res => {
        if (res.status == 0) {
          var files = that.dmSV.listFiles;
          let index = files.findIndex(d => d.recID.toString() === this.fileEditing.recID);
          if (index != -1) {
            files[index] = res.data;
            files[index].recID = res.data.recID; // thumbmail
            files[index].fileName = res.data.fileName;
            files[index].thumbnail = `../../../assets/codx/dms/${this.dmSV.getAvatar(res.data.extension)}`;//"../../../assets/img/loader.gif";//res.data.thumbnail;
            that.displayThumbnail(res.data);
            this.dmSV.ChangeData.next(true);
          }
          // thumbmail
          that.dmSV.listFiles = files;
          that.changeDetectorRef.detectChanges();
          this.dialog.close();          
        }
        that.notificationsService.notify(res.message);
      });

      var appName = environment.appName; // Tam thoi de hard
      var uploadFile = fileItem.item.rawFile;
      var sizeInBytes = fileItem.fileSize; // uploadFile.size;
      var chunSizeInfBytes = this.dmSV.ChunkSizeInKB * 1024;
      var numOfChunks = Math.floor(fileItem.fileSize / chunSizeInfBytes);
      if (fileItem.fileSize % chunSizeInfBytes > 0) {
        numOfChunks++;
      }

      //api/lv-docs/files/upload
      for (var i = 0; i < numOfChunks; i++) {
        var start = i * chunSizeInfBytes; //Vị trí bắt đầu băm file
        var end = start + chunSizeInfBytes; //Vị trí cuối
        if (end > sizeInBytes) end = sizeInBytes; //Nếu điểm cắt cuối vượt quá kích thước file chặn lại
        var blogPart = uploadFile.slice(start, end); //Lấy dữ liệu của chunck dựa vào đầu cuối
        var fileChunk = new File([blogPart], uploadFile.name, {
          type: uploadFile.type,
        }); //Gói lại thành 1 file chunk để upload
        var uploadChunk = await lvFileClientAPI.formPostWithToken(
          `api/${appName}/files/upload`,
          {
            FilePart: fileChunk,
            UploadId: fileItem.uploadId,
            Index: i,
          }
        );
      }  
    }
    else {
      this.notificationsService.notify(this.titleUploadFile);
    }
  } 
 
}