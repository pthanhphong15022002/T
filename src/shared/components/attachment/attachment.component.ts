import {
    Component,
    OnInit,
    ChangeDetectorRef,
    Output,
    EventEmitter,
    ViewChild,
    Input,
    ElementRef,
  } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUpload, Permission } from '@shared/models/file.model';
import { NodeTreeAdd } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { FolderService } from '@shared/services/folder.service';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { AlertConfirmInputConfig, AuthStore, CallFuncService, NotificationsService, ViewsComponent } from 'codx-core';
  import * as moment from 'moment';
import { AttachmentService } from './attachment.service';
 // import { AuthStore } from '@core/services/auth/auth.store';
  @Component({
    selector: 'attachment',
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
    fileUploadList: FileUpload[];
    remotePermission: Permission[];    
    @Input() objectType: string;
    @Input() objectId: string;
    @Input() folderType: string;    
    @Input() functionID: string;
    @Input() type: string;
    @Output() fileAdded = new EventEmitter();
    @ViewChild('openFile') openFile;
    @ViewChild('openFolder') openFolder;
    @ViewChild('file') file: ElementRef;
    @Input('viewBase') viewBase: ViewsComponent;
   // @Input('openFolder') openFolder: ViewsComponent;
    
    constructor(private changeDetectorRef: ChangeDetectorRef,
        public modalService: NgbModal,
        private auth: AuthStore,
        private folderService: FolderService,
        private fileService: FileService,
        public atSV: AttachmentService,
        private callfc: CallFuncService,
        private notificationsService: NotificationsService) {
        this.user = this.auth.get();
        this.fileUploadList = [];
        if (this.folderType == null || this.folderType == "")
          this.folderType = "3";
    }

    openPopup() {
      this.fileUploadList = [];
      if (this.type == "center") {
        this.callfc.openForm(this.openFile, "File upload", 700, null, null, "").subscribe((dialog: Dialog)=>{
          let that = this;
          dialog.close = function(e) {
            return that.closeOpenForm(e);
          }
        });  
      }
      else {
        this.viewBase.currentView.openSidebarRight();
      }
    }

    closePopup(modal){
      this.fileAdded.emit({ data: this.fileUploadList  });
      if (this.type == 'center') 
          modal.hide();
        else {
          this.viewBase.currentView.closeSidebarRight();
          this.atSV.openAttachment.next(false);
          
        }
        this.fileUploadList = [];
    }

    ngOnInit(): void {
      this.getFolderPath();
      this.atSV.isSetDisableSave.subscribe(res => {
        this.disableSave = res;
        this.changeDetectorRef.detectChanges();
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
        this.folderService.getFolders(id, "3").subscribe(async res => {
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
      if (this.folderId =="") {
        this.folderService.getFoldersByFunctionID(this.functionID).subscribe(async res => {
          if (res != null) {
            this.listRemoteFolder = res;
            this.atSV.currentNode = '';
            this.atSV.folderId.next(res[0].folderId);
            this.objectId = this.objectId;
            this.objectType = this.objectType;
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

    openFormFolder()
    {
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

      
      this.callfc.openForm(this.openFolder, "Open Folder", 400, null, null, "").subscribe((dialog: Dialog)=>{
        let that = this;
        dialog.close = function(e) {
          return that.closeOpenForm(e);
        }
      });  
    }

    closeOpenForm(e: any)
    {
      // if(e.event[0]==true){
      //   that.notifySvr.notify("Gia hạn thành công");
      //   that.listview.addHandler(e.event[1],false,"recID")
      // }
      // else if(e.event[0] == false) that.notifySvr.notify("Gia hạn thất bại");
    }

    fileUploadDropped($event) {
        this.handleFileInput($event);
    } 

    changeValueAgencyText(event:any)
    {
      //this.disEdit.agencyName = this.dispatch.AgencyName = event.data
    }

    onMultiFileSave(modal) {        
        let total = this.fileUploadList.length;
        var that = this;       
        if (total > 1) {          
          var done = this.fileService.addMultiFile(this.fileUploadList).toPromise().then(res => {
            if (res != null) {
              var newlist = res.filter(x => x.status == 6);
              var newlistNot = res.filter(x => x.status == -1);              
              var addList = res.filter(x => x.status == 0 || x.status == 9);
    
              if (addList.length == this.fileUploadList.length) {
                this.atSV.fileList.next(this.fileUploadList);
                this.notificationsService.notify("Đã thêm file thành công");
                this.fileUploadList = [];
                this.closePopup(modal);                     
              }
              else {
                var item = newlist[0];
                var newUploadList = [];
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
                  //this.closeFileDialog('dms_file');         
                  this.closePopup(modal);              
                }
                else {
                  this.fileUploadList = newUploadList;                 
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
          this.addFile(this.fileUploadList[0], modal);
          this.atSV.fileList.next(this.fileUploadList);
          this.closePopup(modal);        
        }
        else {
          this.notificationsService.notify("Vui lòng chọn file tải lên");
        }
    }

    addFile(fileItem: any, modal: any) {        
        var that = this;       
        var done = this.fileService.addFile(fileItem).toPromise();
        if (done) {
            done.then(item => {
            if (item.status == 0) {
                this.notificationsService.notify(item.message);
            }
            else if (item.status == 6) {
                // ghi đè
                fileItem.recID = item.data.recID;
                this.rewriteFile(this.titlemessage, item.message, fileItem, modal);
            }
            else
                this.notificationsService.notify(item.message);

            }).catch((error) => {
            console.log("Promise rejected with " + JSON.stringify(error));
            });
        }       
    }
      
    rewriteFile(title: any, message: any, item: FileUpload, modal: any) {
        var that = this;
        var config  = new AlertConfirmInputConfig();
        config.type = "YesNo";    
      
        this.notificationsService.alert(title, message, config).subscribe((res: Dialog)=>{
          let that = this;                    
          res.close = function(e) {
            item.reWrite = true;
            var done = this.fileService.updateVersionFile(item).toPromise();
            if (done) {
              done.then(async res => {                
                this.fileUploadList = [];
                this.notificationsService.notify(res.message);
                this.closePopup(modal); 
              }).catch((error) => {
                console.log("Promise rejected with " + JSON.stringify(error));
              });
            }
          }
        })
        
        // this.confirmationDialogService.confirm(title, message).then((confirmed) => {
        //   if (confirmed) {
        //     item.reWrite = true;
        //     var done = this.fileService.updateVersionFile(item).toPromise();
        //     if (done) {
        //       done.then(async res => {                
        //         this.fileUploadList = [];
        //         this.notificationsService.notify(res.message);
        //         this.modalService.dismissAll();
        //       }).catch((error) => {
        //         console.log("Promise rejected with " + JSON.stringify(error));
        //       });
        //     }
        //   }
        // });
    }

    closeFileDialog(form): void {
        //$('#dms_properties').removeClass('offcanvas-on');
        // $('#' + form).css('z-index', '1000');
        // $('#' + form).removeClass('offcanvas-on');
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
    
    onDeleteUploaded(file: string) {
        let index = this.fileUploadList.findIndex(d => d.fileName.toString() === file.toString()); //find index in your array
        if (index > -1) {
            this.fileUploadList.splice(index, 1);//remove element from array
            //  this.dmSV.fileUploadList.next(this.fileUploadList);
        }
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
    
          this.folderService.getFolders(id, "3").subscribe(async res => {
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
            // FolderPath
            //for (var i = 0; i < res.length; i++) {
            // this.loadChildNode();
            // }
            // this.refreshSelect(res);
            //   this.loadSelectEventTreeSelect();
            this.changeDetectorRef.detectChanges();
            this.remotePermission = res[0].permissions;
          }
        });
    
      //  this.openDialogFolder(this.openFolder, "sm", "folder");
    }

    // openDialogFolder(content, size: string = "", name: string = '') {

    //     if (this.dmSV.listDialog.indexOf(name) > -1)
    //       return;
    
    //     if (this.dmSV.listDialog == null)
    //       this.dmSV.listDialog = [];
    
    //     if (this.isFileList) {
    //       this.fileUploadList = [];
    //       this.dmSV.fileUploadList.next(this.fileUploadList);
    //     }
    
    //     if (name != "") {
    //       this.dmSV.listDialog.push(name);
    //     }
    
    //     // const modalRef = this.modalService.open(NgbdModalContent, {windowClass: 'modal-holder', centered: true});
    //     //this.modalServic
    //     // console.log(content.toString());
    //     //  content.dismiss();
    //     this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: size, windowClass: 'custom-class my-dialog' }).result.then((result) => {
    //       //  alert(1);
    //       this.closeResult = `Closed with: ${result}`;
    //     }, (reason) => {
    //       // alert(2);
    //       if (name != '') {
    //         var index = this.dmSV.listDialog.indexOf(name);
    //         if (index > -1)
    //           this.dmSV.listDialog.splice(index, 1);
    //       }
    //       this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //     });
    
    //     // this.dialogRef.afterClosed().pipe(
    //     //   finalize(() => this.dialogRef = undefined)
    //     // );
    
    //     //  $('.my-dialog').css("z-index", '9999');
    //   }

    private getDismissReason(reason: any): string {
        // if (!this.onRole) {
        //   $('#dms_share').css('z-index', '9999');
        //   $('#dms_properties').css('z-index', '9999');
        //   $('#dms_request-permission').css('z-index', '9999');
        // }
    
        // if (reason === ModalDismissReasons.ESC) {
        //   return 'by pressing ESC';
        // } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        //   return 'by clicking on a backdrop';
        // } else {
        //   return `with: ${reason}`;
        // }
        return "";
      }

    async handleFileInput(files: FileList) {

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
        this.changeDetectorRef.detectChanges();
        files = null;             
        if (this.file) 
          this.file.nativeElement.value = "";      
        //  this.dmSV.fileUploadList.next(this.fileUploadList);
        return false;
    }
  }
  