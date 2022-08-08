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
import { FileInfo, FileUpload, ItemInterval, Permission } from '@shared/models/file.model';
import { resetInfiniteBlocks } from '@syncfusion/ej2-grids';

@Component({
  selector: 'share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareComponent implements OnInit {  
  @Input() formModel: any;    
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
  titleDialog = `Chia sẻ qua email`;  
  fileEditing: FileUpload;
  path: string;  
  dialog: any;
  data: FileInfo;    
  postblog: any;
  sentemail: any;
  type: string;
  toPermission: Permission[];
  byPermission: Permission[];
  ccPermission: Permission[];
  bccPermission: Permission[];
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
   // private confirmationDialogService: ConfirmationDialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
    ) {
      this.dialog = dialog;       
      this.type = data.data[0];
      this.formModel = dialog.formModel;  
    //  this.id = this.data.recID;     
  }

  ngOnInit(): void {   
    this.user = this.auth.get();        
  }

  removeUserRight(index, list: Permission[] = null) {
    // if (list == null) {
    //   if (this.fileEditing != null && this.fileEditing.permissions != null && this.fileEditing.permissions.length > 0) {
    //     this.fileEditing.permissions.splice(index, 1);//remove element from array  
    //     this.changePermission(0);
    //   }
    // }
    // else {
    //   if (list != null && list.length > 0) {
    //     list.splice(index, 1);//remove element from array  
    //     this.changeDetectorRef.detectChanges();
    //   }
    // }

    // if (this.type == "file") {
    //   this.onSaveEditingFile(null);
    // }
    // else {
    //   this.fileEditing.folderName = this.folderName;
    //   this.fileEditing.folderId = this.dmSV.getFolderId();
    //   this.fileEditing.recID = this.id;
    //   this.folderService.updateFolder(this.fileEditing).subscribe(async res => {
    //   });
    // }
  }

  onShare() {

  }

  copyPath() {

  }

  onSaveRightChanged($event, type) {

  }

}