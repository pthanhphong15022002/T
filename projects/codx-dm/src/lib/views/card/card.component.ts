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
import { ViewFileDialogComponent } from 'projects/codx-share/src/lib/components/viewFileDialog/viewFileDialog.component';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements OnInit {  
  @Input() formModel: any;
  // @Input() type: any;
  // html: string;
  // count: number;
  // tenant: string;
  // oldFolderId: string;
  // _propertyName: string = "";
  // fullName: string = "";
  // id: string = "";
  // ext: string = "";
  user: any;
  // item: FolderInfo;
  totalRating: number;
  totalViews: number;
  // loaded: boolean;
  // loadedFile: boolean;
  // loadedFolder: boolean;
  // setting: any;
  // titleAccessDenied = "Bạn không có quyền truy cập thư mục này";
  @Input() data: any;
  //   @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
  // @ViewChild('view') view!: ViewsComponent;

  // @Output() eventShow = new EventEmitter<boolean>();
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
    private systemDialogService: SystemDialogService
  ) {
    // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {
    this.user = this.auth.get();   
  }

  print() {
    //this.view.print();
    window.frames[0].postMessage(JSON.stringify({ 'MessageId': 'Action_Print' }), '*');
  }
}