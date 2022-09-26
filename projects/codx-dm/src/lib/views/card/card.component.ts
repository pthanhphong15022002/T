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
  user: any;
  totalRating: number;
  totalViews: number;
  @Input() data: any;
  constructor(
    public dmSV: CodxDMService,
    private auth: AuthStore,
  ) {
  }

  ngOnInit(): void {
    this.user = this.auth.get();   
  }
  
  classRating(rating) {    
    var ret = "icon-star text-warning icon-16";
    if (rating == 0)
      ret = ret + " text-muted";
    return ret;
  }

  print() {
    //this.view.print();
    window.frames[0].postMessage(JSON.stringify({ 'MessageId': 'Action_Print' }), '*');
  }
}