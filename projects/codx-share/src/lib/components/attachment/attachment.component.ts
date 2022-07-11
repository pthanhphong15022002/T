import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  ViewChild,
  Input,
  ElementRef,
  Optional,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUpload, Permission } from '@shared/models/file.model';
import { NodeTreeAdd } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { FolderService } from '@shared/services/folder.service';
import { AlertConfirmInputConfig, AuthStore, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService, SidebarModel, ViewsComponent } from 'codx-core';
import * as moment from 'moment';
import { OpenFolderComponent } from '../openFolder/openFolder.component';
import { AttachmentService } from './attachment.service';

import { ViewEncapsulation, Inject } from '@angular/core';
import { EmitType, detach, isNullOrUndefined, createElement, EventHandler } from '@syncfusion/ej2-base';
import { UploaderComponent, FileInfo, SelectedEventArgs, RemovingEventArgs } from '@syncfusion/ej2-angular-inputs';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
import { CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY } from '@angular/cdk/overlay/overlay-directives';
import { EditFileComponent } from 'projects/codx-dm/src/lib/editFile/editFile.component';

// import { AuthStore } from '@core/services/auth/auth.store';
@Component({
  selector: 'codx-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
})
export class AttachmentComponent implements OnInit {
  user: any;
  titlemessage = 'Thông báo';
  remote = true;
  listRemoteFolder: any;
  listNodeAdd: any;
  selectId: string;
  closeResult = '';
  onRole = false;
  folderId = "";
  path: any;
  disableSave = false;
  breadcumb: string[];
  breadcumbLink = [];
  codetitle = 'DM059';
  codetitle2 = 'DM058';
  titleDialog = "Thêm file";
  title = 'Đã thêm file thành công';
  title2 = 'Vui lòng chọn file tải lên';
  fileUploadList: FileUpload[];
  remotePermission: Permission[];
  dialog: any;
  data: any;
  isFileList = false;  
  fileEditing: FileUpload;
  fileEditingTemp: FileUpload;

  @Input() formModel: any;
  @Input() allowExtensions: string;
  @Input() allowMultiFile = "1";
  @Input() objectType: string;
  @Input() objectId: string;
  @Input() folderType: string;
  @Input() functionID: string;
  @Input() type: string;
  @Input() idBrowse = "browse";
  @Input() popup = "1";
  @Input() hideBtnSave = "0";
  @Input() hideUploadBtn = "0";
  @Input() hideFolder = "0";
  @Input() hideDes = "0";
  @Input() hideImageUpload = "1";
  @Input() hideImageThumb = "1";
  @Input() displayThumb: string;
  @Output() fileAdded = new EventEmitter();
  @ViewChild('openFile') openFile;
  @ViewChild('openFolder') openFolder;
  @ViewChild('file') file: ElementRef;
  @Input('viewBase') viewBase: ViewsComponent;
  @Output() fileCount = new EventEmitter<any>();
  @Output() fileGet = new EventEmitter<any>();
  @ViewChild('templateupload') public uploadObj: UploaderComponent;
  // @Input('openFolder') openFolder: ViewsComponent;
  public uploadWrapper: HTMLElement = document.getElementsByClassName('e-upload')[0] as HTMLElement;
  public parentElement: HTMLElement;
  public proxy: any;
  public progressbarContainer: HTMLElement;
  public filesDetails: FileInfo[] = [];
  public filesList: HTMLElement[] = [];
  public dropElement: HTMLElement = document.getElementsByClassName('control-fluid')[0] as HTMLElement;


  constructor(private changeDetectorRef: ChangeDetectorRef,
    public modalService: NgbModal,
    private auth: AuthStore,
    private folderService: FolderService,
    private fileService: FileService,
    public atSV: AttachmentService,
    public cache: CacheService,
    private callfc: CallFuncService,
    private notificationsService: NotificationsService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef) {
    var d = data;
    this.user = this.auth.get();
    this.dialog = dialog;
    if (data != null) {
      this.objectType = data?.data.objectType;
      this.objectId = data?.data.objectId;
      this.folderType = data?.data.folderType;
      this.functionID = data?.data.functionID;
      this.type = data?.data.type;
      this.popup = data?.data.popup;
      this.hideBtnSave = data?.data.hideBtnSave;
    }

    this.fileUploadList = [];
    if (this.folderType == null || this.folderType == "")
      this.folderType = "3";

    if (this.type == null || this.type == "")
      this.type = "center";

    if (this.popup == null || this.popup == "")
      this.popup = "1";

    if (this.hideBtnSave == null || this.hideBtnSave == "")
      this.hideBtnSave = "0";
  }


  ngAfterViewInit(): void {
    if (this.objectId != "" && this.objectId != undefined) {
      this.fileService.getFileNyObjectID(this.objectId).subscribe(res => {
        if (res) {
          this.data = res;
          this.fileGet.emit(this.data);
          this.changeDetectorRef.detectChanges();
        }
      })
    };

    if (document.getElementById(this.idBrowse) != null) {     
      var list = document.getElementsByName('UploadFiles');
      if (list?.length > 0) {
        for(var i=0; i<list.length; i++) {
          if (document.getElementsByName('UploadFiles')[i].getAttribute("idbutton") == null)
          {
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
    // https://ej2.syncfusion.com/angular/documentation/uploader/template/#custom-template
    // https://ej2.syncfusion.com/angular/demos/#/bootstrap5/uploader/custom-file-list
    // document.getElementById('clearbtn').onclick = () => {
    //     if (!document.getElementsByClassName('upload-list-root')[0]) { return; }
    //     this.uploadObj.element.value = '';
    //     detach(document.getElementById('dropArea').querySelector('.upload-list-root'));
    //     this.filesList = [];
    //     this.filesDetails = [];
    // };
  }

  allowMultiple() {
    return this.allowMultiFile == "1" ? true : false;
  }
  
  // upload file tai day
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

  openPopup() {
    this.fileUploadList = [];
    // if (this.type == "center") {
    // }
    // else {
    //   //this.viewBase.currentView.openSidebarRight();
    // }
  }

  closePopup() {
    // this.notificationsService.alertCode('DM001')
    // this.cacheService.message('DM001')
  
    // if (this.data == undefined)
    //   this.data = [];

    // for (var i = 0; i < this.atSV.fileListAdded.length; i++) {
    //   this.data.push(Object.assign({}, this.atSV.fileListAdded[i]));
    // }

    this.fileAdded.emit({ data: this.data });

    if (this.type == "popup") {
      this.dialog.close();
    }

    this.fileUploadList = [];   
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this.getFolderPath();
    this.atSV.isSetDisableSave.subscribe(res => {
      this.disableSave = res;
      this.changeDetectorRef.detectChanges();
    });

    this.cache.message(this.codetitle).subscribe(item => {
      if (item != null) {
        this.title = item;
      }
    });

    this.cache.message(this.codetitle2).subscribe(item => {
      if (item != null) {
        this.title2 = item;
      }
    });

    this.atSV.isOpenForm.subscribe(item => {
      // alert(1);
      if (item == true)
        this.openPopup();
    });
  }

  ngOnDestroy() {
    //   this.atSV.openForm.unsubscribe();
  }

  onSelectionAddChanged($data, tree) {
    var id = $data.dataItem.recID;
    this.selectId = id;
    var that = this;
    var list = tree.getBreadCumb(id);
    var pathFolder = "";
    var pathID = "";

    var breadcumb = [];
    var breadcumbLink = [];

    that.selectId = id;
    // if (that.folderId == id) {
    //   that.dmSV.setDisableSave.next(true);
    // }
    // else that.dmSV.setDisableSave.next(false);

    for (var i = list.length - 1; i >= 0; i--) {
      if (pathFolder == "") {
        pathFolder = list[i].id;
        pathID = list[i].text;
      }
      else {
        pathFolder = pathFolder + ";" + list[i].id;
        pathID = pathID + ";" + list[i].text;
      }
      breadcumb.push(list[i].text);
      breadcumbLink.push(list[i].id);
    }

    this.breadcumbLink = breadcumbLink;
    this.breadcumb = breadcumb;

    this.changeDetectorRef.detectChanges();
    // save to folder cache
    this.folderService.updateFolderCache(this.listNodeAdd[0].recID, this.functionID, pathFolder, pathID).subscribe(item => {

    });

    if ($data.dataItem.items && $data.dataItem.items.length <= 0) {
      this.folderService.getFolders(id).subscribe(async res => {
        tree.addChildNodes($data.dataItem, res);
        that.changeDetectorRef.detectChanges();
      });
    }
    else {
      this.changeDetectorRef.detectChanges();
    }
  }

  disable() {
    return this.disableSave;
  }

  getFolderPath() {
    if (this.folderId == "") {
      this.folderService.getFoldersByFunctionID(this.functionID).subscribe(async res => {
        if (res != null) {
          this.listRemoteFolder = res;
          this.atSV.currentNode = '';
          this.atSV.folderId.next(res[0].folderId);
          // update breadcum
          var breadcumb = [];
          var breadcumbLink = [];
          var id = res[0].recID;
          if (res[0].history != null) {
            var listFolder = res[0].history.filter(x => x.objectType == this.functionID && x.objectID == this.user.userID);
            if (listFolder[0] != null && listFolder[0].folderPath != "") {
              var list = listFolder[0].folderPath.split(";");
              var listText = listFolder[0].pathDisk.split(";");
              id = list[list.length - 1];

              this.folderId = id;
              this.selectId = id;

              for (var i = 0; i < list.length; i++) {
                breadcumb.push(listText[i]);
                breadcumbLink.push(list[i]);
              }
            }
          }
          else {
            this.folderId = id;
            this.selectId = id;
            breadcumb.push(res[0].folderName);
            breadcumbLink.push(id);
          }

          this.atSV.breadcumb.next(breadcumb);
          this.atSV.breadcumbLink = breadcumbLink;
          this.atSV.folderId.next(id);

          this.changeDetectorRef.detectChanges();
          this.remotePermission = res[0].permissions;
        }
      });
    }
  }

  openFormFolder() {
    this.callfc.openForm(OpenFolderComponent, this.titleDialog, 500, 500, "", [this.functionID], "");
    // this.folderService.getFoldersByFunctionID(this.functionID).subscribe(async res => {
    //   if (res != null) {
    //     this.listRemoteFolder = res;
    //     this.listNodeAdd = res;
    //     if (res[0].history != null) {
    //       var listFolder = res[0].history.filter(x => x.objectType == this.functionID && x.objectID == this.user.userID);
    //       if (listFolder[0] != null && listFolder[0].folderPath != "") {
    //         var list = listFolder[0].folderPath.split(";");
    //         this.loadChildNode(res[0], 0, list);
    //       }
    //     }
    //     this.callfc.openForm(OpenFolderComponent, this.titleDialog, 500, 500, "", null, "");
    //     this.changeDetectorRef.detectChanges();
    //     this.remotePermission = res[0].permissions;
    //   }
    // });

    // let option = new SidebarModel();
    // option.DataService = this.view?.currentView?.dataService;
    // option.FormModel = this.view?.currentView?.formModel;
    // option.Width = '800px';


    // this.dialog.closed.subscribe(e => {
    //   console.log(e);
    // })

    /* this.callfc.openForm(this.openFolder, "Chọn thư mục", 400, null, null, "").subscribe((dialog: Dialog)=>{
      let that = this;
      dialog.close = function(e) {
        return that.closeOpenForm(e);
      }
    });   */
  }

  closeOpenForm(e: any) {
    // if(e.event[0]==true){
    //   that.notifySvr.notify("Gia hạn thành công");
    //   that.listview.addHandler(e.event[1],false,"recID")
    // }
    // else if(e.event[0] == false) that.notifySvr.notify("Gia hạn thất bại");
  }

  fileUploadDropped($event) {
    this.handleFileInput1($event);
  }

  changeValueAgencyText(event: any) {
    //this.disEdit.agencyName = this.dispatch.AgencyName = event.data
  }

  saveFiles() {
    this.onMultiFileSave();
  }

  onMultiFileSave() {
    // var config = new AlertConfirmInputConfig();
    //           config.type = "checkBox";
              
    //           this.notificationsService.alert(this.titlemessage, "item.message", config).closed.subscribe(x=>{
    //              console.log(x);
    //              if(x.event.status == "Y")
    //              { 
    //               //if (x.event.data)
    //              }
    //              else if (x.event.status == "N") {

    //              }
    //           });
    //           return;
    // this.dialog.close();
    // return;
    if (this.data == undefined)
      this.data = [];

    let total = this.fileUploadList.length;
    var that = this;
    for (var i = 0; i < total; i++) {
      this.fileUploadList[i].objectId = this.objectId;
    }
    this.atSV.fileListAdded = [];
    if (total > 1) {
      var done = this.fileService.addMultiFile(this.fileUploadList).toPromise().then(res => {
        if (res != null) {
          var newlist = res.filter(x => x.status == 6);
          var newlistNot = res.filter(x => x.status == -1);
          var addList = res.filter(x => x.status == 0 || x.status == 9);

          for(var i=0; i<addList.length; i++) {
            this.data.push(Object.assign({}, addList[i]));
          }            

          if (addList.length == this.fileUploadList.length) {
            this.atSV.fileList.next(this.fileUploadList);
            this.atSV.fileListAdded = addList;
            this.notificationsService.notify(this.title);
            this.closePopup();
            this.fileUploadList = [];
          }
          else {
            var item = newlist[0];
            var newUploadList = [];
            //   this.fileUploadList = [];
            //   this.fileUploadList = addList;
            // copy list
            for (var i = 0; i < this.fileUploadList.length; i++) {
              var file = this.fileUploadList[i];
              var index = newlist.findIndex(x => x.data.fileName == file.fileName);
              if (index > -1) {
                newUploadList.push(Object.assign({}, file));
              }
            }
            if (newlistNot.length > 0) {
              this.notificationsService.notify(newlistNot[0].message);             
              this.closePopup();
            }
            else {
              this.fileUploadList = newUploadList;
              var config = new AlertConfirmInputConfig();
              config.type = "checkBox";
              
              this.notificationsService.alert(this.titlemessage, item.message, config).closed.subscribe(x=>{
                if(x.event.status == "Y")
                 { 
                  // save all
                  if (x.event.data) {
                    for (var i = 0; i < this.fileUploadList.length; i++) {
                      this.fileUploadList[i].reWrite = true;
                    }
                    this.fileService.addMultiFile(this.fileUploadList).toPromise().then(result => {
                      var mess = '';
                      for (var i = 0; i < result.length; i++) {
                        var f = result[i];
                        mess = mess + (mess != "" ? "<br/>" : "") + f.message;

                      }
                      this.notificationsService.notify(mess);
                      this.fileUploadList = [];
                      this.closePopup();
                    });
                  }
                  else {
                    // save 1
                    var index = this.fileUploadList.findIndex(x => x.fileName == item.data.fileName);
                    this.fileUploadList[index].reWrite = true;
                    this.onMultiFileSave();
                  }
                 }
                 else if (x.event.status == "N") {
                  // cancel all
                  if (x.event.data) { 
                     this.fileUploadList = [];
                     this.closePopup();              
                  }
                  else {
                    // cancel 1
                    var index = this.fileUploadList.findIndex(x => x.fileName == item.data.fileName);
                    this.fileUploadList.splice(index, 1);//remove element from array
                    if (this.fileUploadList.length > 0)
                      this.onMultiFileSave();
                  }
                 }
              })

              // this.confirmationDialogService.confirmAll(this.titlemessage, item.message, this.fileUploadList.length > 1 ? true : false).then((confirmed) => {
              //     if (confirmed == "save_all") {
              //       for (var i = 0; i < this.fileUploadList.length; i++) {
              //         this.fileUploadList[i].reWrite = true;
              //       }
              //       this.fileService.addMultiFile(this.fileUploadList).toPromise().then(result => {
              //         var mess = '';
              //         for (var i = 0; i < result.length; i++) {
              //           var f = result[i];
              //           mess = mess + (mess != "" ? "<br/>" : "") + f.message;

              //         }
              //         this.notificationsService.notify(mess);
              //         this.fileUploadList = [];
              //         this.closeFileDialog('dms_file');
              //       });
              //     }
              //     else if (confirmed == "cancel_all") {
              //       // cancel all
              //       this.fileUploadList = [];
              //       this.closeFileDialog('dms_file');
              //     }
              //     else if (confirmed) {
              //       // save 1
              //       var index = this.fileUploadList.findIndex(x => x.fileName == item.data.fileName);
              //       this.fileUploadList[index].reWrite = true;
              //       this.onMultiFileSave();
              //     }
              //     else {
              //       // cancel one
              //       var index = this.fileUploadList.findIndex(x => x.fileName == item.data.fileName);
              //       this.fileUploadList.splice(index, 1);//remove element from array
              //       if (this.fileUploadList.length > 0)
              //         this.onMultiFileSave();
              //     }
              //   });
              // }
            }
          }
        }
      });
    }
    else if (total == 1) {
      this.addFile(this.fileUploadList[0]);
      this.atSV.fileList.next(this.fileUploadList);
    }
    else {
      // this.cacheService.message('DM001')
      // this.notificationsService.notifyCode("");
      this.notificationsService.notify(this.title2);
    }
  }

  addFile(fileItem: any) {
    var that = this;
    var done = this.fileService.addFile(fileItem).toPromise();
    if (done) {
      done.then(item => {
        if (item.status == 0) {
          this.notificationsService.notify(item.message);
          this.fileUploadList[0].recID = item.data.recID;
          // list.push(Object.assign({}, res));
          this.atSV.fileListAdded.push(Object.assign({}, item));
         // for(var i=0; i<addList.length; i++) {
          this.data.push(Object.assign({}, item));
          //}     
          this.closePopup();
        }
        else if (item.status == 6) {
          // ghi đè
          fileItem.recID = item.data.recID;
          this.rewriteFile(this.titlemessage, item.message, fileItem);
        }
        else
          this.notificationsService.notify(item.message);

      }).catch((error) => {
        console.log("Promise rejected with " + JSON.stringify(error));
      });
    }
  }

  rewriteFile(title: any, message: any, item: FileUpload) { 
    var config = new AlertConfirmInputConfig();
    config.type = "YesNo";
    this.notificationsService.alert(title, message, config).closed.subscribe(x=>{
      if(x.event.status == "Y")
      { 
        item.reWrite = true;
         var done = this.fileService.updateVersionFile(item).toPromise();
         if (done) {
           done.then(async res => {
             this.fileUploadList[0].recID = res.data.recID;
             this.atSV.fileListAdded.push(Object.assign({}, item));
             this.data.push(Object.assign({}, item));
             this.notificationsService.notify(res.message);
             this.closePopup();
             this.fileUploadList = [];
           }).catch((error) => {
             console.log("Promise rejected with " + JSON.stringify(error));
           });
         }
      }
    })
  }

  closeFileDialog(form): void {  
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

  onEditUploaded(file) {
    //alert('edit');
    this.callfc.openForm(EditFileComponent, this.titleDialog, 500, 500, "", [this.functionID], "");
  }

  onDeleteUploaded(file: string) {
    let index = this.fileUploadList.findIndex(d => d.fileName.toString() === file.toString()); //find index in your array
    if (index > -1) {
      this.fileUploadList.splice(index, 1);//remove element from array
      //  this.dmSV.fileUploadList.next(this.fileUploadList);
    }
  }

  
  editfile(file, multi = false, index = 0) {
    // let option = new SidebarModel();
    // //option.DataService = this.dataService;
    // option.FormModel = this.formModel;
    // option.Width = '550px';
    // let data = {} as any;
    // data.title = "test";
    // this.callfc.openSide(EditFileComponent, data, option);
  //  this.callfc.openSide(EditFileComponent, this.titleDialog, [this.functionID, file], null);
    this.callfc.openForm(EditFileComponent, this.titleDialog, 800, 800, "", [this.functionID, file], "");
  }
  

  sortBy() {
    if (this.fileUploadList != null)
      return this.fileUploadList.sort((a, b) => a.order - b.order)
    else
      return null;
  }

  selectFolderPath(dialog) {
    this.atSV.breadcumbLink = this.breadcumbLink;
    this.atSV.breadcumb.next(this.breadcumb);
    this.atSV.currentNode = '';
    this.atSV.folderId.next(this.selectId);
    dialog.hide();
    // var a = "";
    //dialog.hide(a);
    // this.closeOpenForm();
    // modal.dismiss();
  }

  setFullHtmlNode(folder, text) {
    var item1 = '';
    var item2 = '';

    if (folder.icon == '' || folder.icon == null || folder.icon == undefined)
      item1 = '<img class="max-h-18px" src="../../../assets/demos/dms/folder.svg">';
    else {
      if (folder.icon.indexOf(".") == -1)
        item1 = `<i class="${folder.icon}" role="presentation"></i>`;
      else {
        var path = `${this.path}/${folder.icon}`;
        item1 = `<img class="max-h-18px" src="${path}">`;
      }
    }

    if (!folder.read)
      item2 = `<i class="icon-per no-permission" role="presentation"></i>`;
    var fullText = `${item1}
                    ${item2}
                    <span class="mytree_node"></span>
                    ${text}`;

    return fullText;
  }

  disableFolderSelect() {
    return this.remote;
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

  getNow() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var ret = dd + '/' + mm + '/' + yyyy;
    return ret;
  }

  loadChildNode(parent, index, list) {
    var that = this;
    if (index < list.length) {
      var id = list[index];
      this.selectId = id;
      //   if (this.folderId == id) {
      //     this.dmSV.setDisableSave.next(true);
      //   }
      //   else this.dmSV.setDisableSave.next(false);

      this.folderService.getFolders(id).subscribe(async res => {
        // that.treeAdd.addChildNodes(parent, res);
        var nodeAdd = new NodeTreeAdd();
        var list = [];
        // list.push(Object.assign({}, res));
        // list.push(new, res)
        nodeAdd.parent = parent;
        nodeAdd.data = res;
        //  that.dmSV.addNodeTree.next(nodeAdd);
        that.changeDetectorRef.detectChanges();
        //var current =
        index++;
        var currentNode = null;
        if (index < list.length) {
          for (var i = 0; i < res.length; i++) {
            if (res[i].recID == list[index]) {
              currentNode = res[i];
            }
          }
          if (currentNode != null)
            that.loadChildNode(currentNode, index, list);
        }
      });
    }
  }

  selectFolder() {
    this.folderService.getFoldersByFunctionID(this.functionID).subscribe(async res => {
      if (res != null) {
        this.listRemoteFolder = res;
        this.listNodeAdd = res;
        if (res[0].history != null) {
          var listFolder = res[0].history.filter(x => x.objectType == this.functionID && x.objectID == this.user.userID);
          if (listFolder[0] != null && listFolder[0].folderPath != "") {
            var list = listFolder[0].folderPath.split(";");
            this.loadChildNode(res[0], 0, list);
          }
        }      
        this.changeDetectorRef.detectChanges();
        this.remotePermission = res[0].permissions;
      }
    });

    // DM058: Vui lòng chọn file tải lên
    // DM059: Đã thêm file thành công
    //  this.openDialogFolder(this.openFolder, "sm", "folder");
  } 
 

  uploadFile() {    
    console.log(this.uploadObj);
    var ctrl = document.querySelector("[idbutton='" + this.idBrowse + "']") as HTMLElement;
    if (ctrl != null)
      ctrl.click();    
  }

  async handleFileInput1(files: FileList) {

    var count = this.fileUploadList.length;
    this.getFolderPath();
    //console.log(files);
    for (var i = 0; i < files.length; i++) {
      let index = this.fileUploadList.findIndex(d => d.fileName.toString() === files[i].name.toString()); //find index in your array
      if (index == -1) {
        let no = count + i;
        let data: ArrayBuffer;
        data = await files[i].arrayBuffer();
        var fileUpload = new FileUpload();
        var item = this.arrayBufferToBase64(data);
        fileUpload.order = i;
        fileUpload.fileName = files[i].name;
        fileUpload.avatar = this.getAvatar(fileUpload.fileName);
        fileUpload.extension = files[i].name.substring(files[i].name.lastIndexOf('.'), files[i].name.length) || files[i].name;
        fileUpload.createdBy = this.user.userName;
        fileUpload.createdOn = this.getNow();
        fileUpload.type = files[i].type;
        fileUpload.objectType = this.objectType;
        fileUpload.objectId = this.objectId;
        fileUpload.fileSize = files[i].size;
        fileUpload.fileName = files[i].name;
        fileUpload.funcId = this.functionID;
        fileUpload.folderType = this.folderType;
        fileUpload.reWrite = false;
        fileUpload.data = item;
        fileUpload.item = files[i];
        fileUpload.folderId = this.folderId;
        fileUpload.permissions = this.remotePermission;
        this.fileUploadList.push(Object.assign({}, fileUpload));

      }
    }
    this.fileCount.emit(files.length);
    files = null;
    if (this.file)
      this.file.nativeElement.value = "";
    //  this.dmSV.fileUploadList.next(this.fileUploadList);
    this.fileAdded.emit({ data: this.fileUploadList });
    this.changeDetectorRef.detectChanges();

    return false;
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

  // const convertBlobToBase64 = async (blob) => {
  //   return await blobToBase64(blob);
  // }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  addPermissionForRoot(list: Permission[]) {
   // var id = this.dmSV.folderId.getValue();
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
   // }
    return permissions;
  }

  async handleFileInput(files: FileInfo[]) {

    //var count = this.fileUploadList.length;
    this.getFolderPath();
    //console.log(files);
    var addedList = [];
    for (var i = 0; i < files.length; i++) {
      let index = this.fileUploadList.findIndex(d => d.fileName.toString() === files[i].name.toString()); //find index in your array
      if (index == -1) {
        var data = await this.convertBlobToBase64(files[i].rawFile);
        var fileUpload = new FileUpload();
        fileUpload.order = i;
        fileUpload.fileName = files[i].name;
        var type = files[i].type.toLowerCase();
        if (type == "png" || type == "jpg" || type == "bmp")
        {        
          fileUpload.avatar = data;
        }
        else fileUpload.avatar = `../../../assets/codx/dms/${this.getAvatar(fileUpload.fileName)}`;
        fileUpload.extension = files[i].name.substring(files[i].name.lastIndexOf('.'), files[i].name.length) || files[i].name;
        fileUpload.createdBy = this.user.userName;
        fileUpload.createdOn = this.getNow();
        fileUpload.type = files[i].type;
        fileUpload.objectType = this.objectType;
        fileUpload.objectId = this.objectId;
        fileUpload.fileSize = files[i].size;
        fileUpload.fileName = files[i].name;
        fileUpload.funcId = this.functionID;
        fileUpload.folderType = this.folderType;
        fileUpload.reWrite = false;
        fileUpload.data = data.toString();
        fileUpload.item = files[i];
        fileUpload.folderId = this.folderId;
        //fileUpload.permissions = this.remotePermission;
      //  if (this.parentFolder != null && this.parentFolder.permissions != null)
       //    fileUpload.permissions = JSON.parse(JSON.stringify(this.parentFolder.permissions));//Object.assign({}, this.parentFolder.permissions);
      // fileUpload = this.addEveryOnePermission(fileUpload);
        fileUpload.permissions = this.addPermissionForRoot(fileUpload.permissions);
        // if (this.remote) {
        //   fileUpload.permissions = this.remotePermission;
        // }
        addedList.push(Object.assign({}, fileUpload));
        this.fileUploadList.push(Object.assign({}, fileUpload));

      }
    }
    //   this.fileAdded.emit({ data: this.fileUploadList });
  //  this.fileCount.emit(data: addedList);
     this.fileCount.emit({ data: this.fileUploadList });
    files = null;
    if (this.file)
      this.file.nativeElement.value = "";
    //  this.dmSV.fileUploadList.next(this.fileUploadList);
   // this.fileAdded.emit({ data: this.fileUploadList });
    this.changeDetectorRef.detectChanges();

    return false;
  }
}
