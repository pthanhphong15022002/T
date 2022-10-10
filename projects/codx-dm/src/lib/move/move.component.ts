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
import { FileInfo, FileUpload, ItemInterval } from '@shared/models/file.model';
import { resetInfiniteBlocks } from '@syncfusion/ej2-grids';

@Component({
  selector: 'move',
  templateUrl: './move.component.html',
  styleUrls: ['./move.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveComponent implements OnInit {
  @Input() listFolders: any;
  @Input() listFiles: any;
  @Input() formModel: any;
  @Input() type: any;
  //listFolders: FolderInfo[];
 // listFiles: FileInfo[];
  selection = 0;
  listNodeMove: FileUpload[] = [];
  //listNodeMove: any;
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
  //type1: string;
  //data: any;
  //Mustache = require('mustache');
  errorshow = false;
  loaded: boolean;
  loadedFile: boolean;
  loadedFolder: boolean;
  setting: any;  
  title = 'Thông báo';
  titleFullName = 'Nhập lại tên mới';
  titleSave = "Lưu";
  mess = '. Bạn có muốn ghi đè';
  titleMessage = "Tên bắt buộc.";
  titleRequired = "Tên bắt buộc.";
  titleDialog = 'Di chuyển/Sao chép tới';
  titleCopyTo = 'Copy to';
  titleMove = 'Move';
  path: string;
  disableSave = false;
  dialog: any;
  data: FileInfo;  
  objectType: string;
  copy = false;
  selectId: string;
  interval: ItemInterval[];
//   @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  @ViewChild('view') view!: ViewsComponent; 
  
  @Output() eventShow = new EventEmitter<boolean>();
  checkFolderName: any;
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
   //   this.titleDialog = data.data.title;
      this.objectType = data.data[0];
      this.data = data.data[1];
      this.id = this.data.recID;
     // this.titleDialog = data.data[2];
      this.copy = data.data[3];
      if (this.data != null) {
        if (this.objectType == "file") {
          this.fullName = this.data.fileName;
        }
        else 
          this.fullName = this.data.folderName;
      }
   // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {   
    this.user = this.auth.get();     
    this.folderService.options.funcID = this.dmSV.idMenuActive; 
    this.folderService.getFolders("").subscribe(async res => {    
      if (res != null) {
        this.listNodeMove = res[0].filter(item => item.read && item.recID.toString() != this.id);      
        this.selection = 0; 
        this.changeDetectorRef.detectChanges();
      }        
    });
  }

  onSaveRightChanged($event, ctrl) { 
    switch(ctrl) {
      case "copyto":
        this.selection = 0;
        break;
      case "move":
        this.selection = 1;
        break;
    }
    this.changeDetectorRef.detectChanges();    
  }

  radioChange(event) {
   // $("#subjstree").jstree("hide_node", this.id);
    // hide node
    // if (this.selection == 1) {
    //   $("#subjstree").jstree("hide_node", this.id);
    // }
    // else {
    //   // show all
    //   $("#subjstree").jstree("show_node", this.id);
    // }
  }
  disable() {
    return this.disableSave;
  }

 /*  CheckFolderName() {     
    if (this.fullName === "")
      return "1";  
    else
      return "0";
  }
  validate(item) {  
    this.errorshow = false;
    switch (item) {  
      case "fullName":
        if (this.CheckFolderName() != "0") {        
          return "w-100 border border-danger is-invalid";       
        }
        else {
          return "w-100";      
        }
    }  
    return "";    
  }
  changeValue($event, type) {
    debugger;
    console.log($event);
    switch(type) {
      case "fullName":
        this.fullName = $event.data;    
     //   alert(this.folderName);
        break;
    }
  } */
 
  displayThumbnail(id, pathDisk) {
    var that = this;
    if (this.interval == null)
      this.interval = [];
    var files = this.dmSV.listFiles;
    var index = setInterval(() => {
      that.fileService.getThumbnail(id, pathDisk).subscribe(item => {
        if (item != null && item != "") {
          let index = files.findIndex(d => d.recID.toString() === id);
          if (index != -1) {
            files[index].thumbnail = item;
            that.dmSV.listFiles = files;
            that.dmSV.ChangeData.next(true);
            that.changeDetectorRef.detectChanges();
          }
          let indexInterval = this.interval.findIndex(d => d.id === id);
          if (indexInterval > -1) {
            clearInterval(this.interval[indexInterval].instant);
            this.interval.splice(indexInterval, 1);
          }
        }
      })
    }, 3000);

    var interval = new ItemInterval();
    interval.id = id;
    interval.instant = index;
    this.interval.push(Object.assign({}, interval));
  }

  SaveData() {
    var that = this;
    if (this.fullName === "") {
      this.changeDetectorRef.detectChanges();
      return;      
    }

    if (this.objectType == 'file') {
      // doi ten file   
      if (this.copy) {
        this.fileService.copyFile(that.id, that.fullName, "").subscribe(async res => {
          if (res.status == 0) {
            var files = that.dmSV.listFiles;
            if (files == null) files = [];
            res.data.thumbnail = `../../../assets/codx/dms/${this.dmSV.getAvatar(res.data.extension)}`;//"../../../assets/img/loader.gif";
            files.push(Object.assign({}, res.data));
            this.dmSV.listFiles = files;
            this.dmSV.ChangeData.next(true);
            that.displayThumbnail(res.data.recID, res.data.pathDisk);
            this.modalService.dismissAll();
          }
          else {       
            this.titleMessage = res.message;
            this.errorshow = true;
          }

          if (res.status == 6) 
          {         
            var config = new AlertConfirmInputConfig();
            config.type = "YesNo";
            debugger;
            this.notificationsService.alert(this.title, res.message, config).closed.subscribe(x => { 
              if(x.event.status == "Y") {
                that.fileService.copyFile(that.id, that.fullName, "", 0, 1).subscribe(async item => {
                  if (item.status == 0) {
                    var files = that.dmSV.listFiles;
                    if (files == null) files = [];

                    let index = files.findIndex(d => d.recID.toString() === item.data.recID);
                    if (index != -1) {
                      item.data.thumbnail = `../../../assets/codx/dms/${this.dmSV.getAvatar(item.data.extension)}`;//"../../../assets/img/loader.gif";
                      files[index] = item.data;
                      that.displayThumbnail(item.data.recID, item.data.pathDisk);
                      that.dmSV.listFiles = files;
                    }
                    this.dmSV.ChangeData.next(true);
                    this.changeDetectorRef.detectChanges();  
                    this.dialog.close();                  
                  }
                  that.notificationsService.notify(item.message);
                });
              }
            });         
          }
        });
      }
      else {
        // rename
        this.fileService.renameFile(that.id, that.fullName).subscribe(async res => {
          if (res.status == 0) {
            var files = that.dmSV.listFiles;
            let index = files.findIndex(d => d.recID.toString() === this.id);
            if (index != -1) {
              files[index].fileName = this.fullName;
            }
            this.dmSV.listFiles = files;
            this.dmSV.ChangeData.next(true);
            this.dialog.close();         
          }
          else {          
            this.titleMessage = res.message;
            this.errorshow = true;
          }

          if (res.status == 6) {     
            var config = new AlertConfirmInputConfig();
            config.type = "YesNo";
            this.notificationsService.alert(this.title, res.message, config).closed.subscribe(x => { 
              that.fileService.renameFile(that.id, res.data.fileName).subscribe(async item => {
                if (item.status == 0) {
                  var files = that.dmSV.listFiles;
                  let index = files.findIndex(d => d.recID.toString() === this.id);
                  if (index != -1) {
                    files[index].fileName = item.data.fileName;
                  }
                  that.dmSV.listFiles = files;
                  this.dmSV.ChangeData.next(true);
                  that.modalService.dismissAll();
                  that.changeDetectorRef.detectChanges();
                }
                that.notificationsService.notify(item.message);
              });
            });
          }
          else {
            this.notificationsService.notify(res.message);
            this.dialog.close();         
          }
        });
      }
    }
    else {
      this.folderService.renameFolder(that.id, that.fullName).subscribe(async res => {
        if (res.status == 0) {
          let folder = new FolderInfo();
          folder.recID = that.id;
          folder.folderName = that.fullName;
          //    that.dmSV.nodeChange.next(folder);
          var folders = that.dmSV.listFolder;
          //folders.forEach(item => )
          let index = folders.findIndex(d => d.recID.toString() === that.id);
          if (index != -1) {
            folders[index].folderName = that.fullName;
            this.dmSV.nodeChange.next(folders[index]);
          }
          this.dmSV.listFolder = folders;
          this.dmSV.ChangeData.next(true);
          this.changeDetectorRef.detectChanges();
          this.dialog.close();
         // this.modalService.dismissAll();
        }
        else {
       //   $('#fullName').addClass('form-control is-invalid');
      //    $('#fullName').focus();
          this.titleMessage = res.message;
          this.errorshow = true;
        }

        // thu muc da cc 
        if (res.status == 2) {
          that.fullName = res.data.folderName;
          var config = new AlertConfirmInputConfig();
          config.type = "YesNo";
          this.notificationsService.alert(this.title, res.message, config).closed.subscribe(x => { 
            var id = '';
            this.folderService.copyFolder(that.id, res.data.folderName, "", 1, 1).subscribe(async item => {
              if (item.status == 0) {
                // id = item.data.recID; 
              //  that.dmSV.isTree = false;
                this.dmSV.currentNode = '';
                this.dmSV.folderId.next(item.data.parentId);
                var folders = this.dmSV.listFolder;
                let index = folders.findIndex(d => d.recID.toString() === that.id);
                if (index > -1) {
                  folders[index] = item.data;
                  that.dmSV.nodeChange.next(folders[index]);
                }
                this.dmSV.listFolder = folders;                    
                this.dmSV.ChangeData.next(true);
              //  that.modalService.dismissAll();                      
                this.changeDetectorRef.detectChanges();
                this.dialog.close();
              }
              else {
                that.titleMessage = item.message;
                that.errorshow = true;
                that.notificationsService.notify(item.message);
              }
            });
          });
        }
        else {
          this.notificationsService.notify(res.message);
          this.dialog.close();
        //  this.modalService.dismissAll();
        }
      });
    }
  }
 
  // setFullHtmlNode(folder, text) {
  //   var item1 = '';
  //   var item2 = '';

  //   if (folder.icon == '' || folder.icon == null || folder.icon == undefined)
  //     item1 =
  //       '<img class="max-h-18px" src="../../../assets/codx/dms/folder.svg">';
  //   else {
  //     if (folder.icon.indexOf('.') == -1)
  //       item1 = `<i class="${folder.icon}" role="presentation"></i>`;
  //     else {
  //       var path = `${this.path}/${folder.icon}`;
  //       item1 = `<img class="max-h-18px" src="${path}">`;
  //     }
  //   }

  //   if (!folder.read)
  //     item2 = `<i class="icon-per no-permission" role="presentation"></i>`;
  //   var fullText = `${item1}
  //                   ${item2}
  //                   <span class="mytree_node"></span>
  //                   ${text}`;

  //   return fullText;
  // }
  
  onSelectionAddChanged($node, tree) {
    var id = $node.data.recID;
    this.selectId = id;       
    if ($node.data.items && $node.data.items.length <= 0) {
      this.folderService.getFolders(id).subscribe(async res => {
        tree.addChildNodes($node.data, res[0]);
        this.changeDetectorRef.detectChanges();
      });
    }    
  }

  CopyDataTo() {
    debugger;
    var that = this;
    if (this.objectType == 'file') {
      this.fileService.copyFile(this.id, this.fullName, that.selectId, this.selection).subscribe(async res => {
        if (res.status == 0) {
          let list = that.dmSV.listFiles;
          if (list == null) list = [];
          // move
          if (that.selection == 1) {
            let index = list.findIndex(d => d.recID.toString() === that.id.toString()); //find index in your array
            if (index > -1) {
              list.splice(index, 1);//remove element from array             
              that.dmSV.listFiles = list;
              that.changeDetectorRef.detectChanges();
            }
          }
          else {
            if (res.data.folderId == that.id) {
              list.push(Object.assign({}, res.data));
              that.dmSV.listFiles = list;
              that.changeDetectorRef.detectChanges();
            }
          }          
          that.dmSV.ChangeData.next(true);
          this.dialog.close();
        }
        else {      
          that.notificationsService.notify(res.message);
          that.errorshow = true;
        }

        if (res.status == 6) {
          //  let newNameMessage = this.renamemessage.replace("{0}", res.data.fileName);
          var config = new AlertConfirmInputConfig();
          config.type = "YesNo"/* "checkBox" */;
          debugger;
          res.message = res.message + this.mess;
          this.notificationsService.alert(this.title, res.message, config).closed.subscribe(x=>{
            if(x.event.status == "Y") {
              that.fileService.copyFile(that.id, that.fullName, that.selectId, that.selection, 1).subscribe(async item => {
                if (item.status == 0) {
                  let files = that.dmSV.listFiles;
                  if (files == null) files = [];

                  if (that.selection == 1) {
                    let index = files.findIndex(d => d.recID.toString() === that.id.toString()); //find index in your array
                    if (index > -1) {
                      files.splice(index, 1);//remove element from array             
                      that.dmSV.listFiles = files;
                      that.changeDetectorRef.detectChanges();
                    }
                  }
                  else {
                    if (item.data.folderId == that.selectId) {
                      files.push(Object.assign({}, item.data));
                      that.dmSV.listFiles = files;
                      that.changeDetectorRef.detectChanges();
                    }
                  }
                  this.dmSV.ChangeData.next(true);
                  this.dialog.close();                  
                }
                this.notificationsService.notify(item.message);
              });
            }
          });
        }
        else {
          that.notificationsService.notify(res.message);
        }        
      });
    }
    else {
      this.folderService.copyFolder(that.id, that.fullName, that.selectId, that.selection, 2).subscribe(async res => {
        if (res.status == 0) {
          var list = that.dmSV.listFolder;
          if (list == null)
            list = [];
          // move
          if (that.selection == 1) {
            // let list = this.dmSV.listFolder.getValue();
            this.dmSV.nodeDeleted.next(that.id);           
            let index = list.findIndex(d => d.recID.toString() === that.id.toString()); //find index in your array
            if (index > -1) {
              list.splice(index, 1);//remove element from array
              that.dmSV.listFolder = list;
             // that.changeDetectorRef.detectChanges();
            }
          }
          this.dmSV.addFolder.next(res.data); // them node con
          that.dmSV.ChangeData.next(true);
          that.changeDetectorRef.detectChanges();
          that.dialog.close();         
        }
        else {        
          that.notificationsService.notify(res.message);
          that.errorshow = true;
        }
        // thu muc da ce 
        if (res.status == 2) {

          var config = new AlertConfirmInputConfig();
          config.type = "checkBox";
          
          this.notificationsService.alert(this.title, res.message, config).closed.subscribe(x=>{
            if(x.event.status == "Y") {
              this.folderService.copyFolder(that.id, that.fullName, that.selectId, that.selection, 1).subscribe(async item => {
                if (item.status == 0) {
                  that.dmSV.isTree = false;
                  this.dmSV.currentNode = '';
                  this.dmSV.folderId.next(item.data.recID);
                  var folders = this.dmSV.listFolder;
                  let index = folders.findIndex(d => d.recID.toString() === that.id);
                  if (index > -1 && that.selection == 1) {
                    folders.splice(index, 1);//remove element from array
                    that.dmSV.nodeDeleted.next(that.id);
                  }
                  that.dmSV.listFolder = folders;
                  that.dmSV.ChangeData.next(true);
                  // that.dmSV.nodeSelect.next(item.data);
                  // this.dmSV.changeData(folders, null, that.dmSV.getFolderId());
                  that.changeDetectorRef.detectChanges();
                  //this.modalService.dismissAll();
                  that.dialog.close();
                }
                else {
                //  $('#fullNameMove').addClass('form-control is-invalid');
                //  $('#fullNameMove').focus();
                //  that.message = item.message;
                  that.errorshow = true;
                }
                that.changeDetectorRef.detectChanges();
                that.notificationsService.notify(item.message);
              });
            }
          });

        }
        else {
          that.notificationsService.notify(res.message);
          that.dialog.close();
        }
      });
    }
  }
}