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
import { AnimationSettingsModel, DialogComponent } from '@syncfusion/ej2-angular-popups';

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
  @Output() viewFile = new EventEmitter<any>();
  constructor(
    public dmSV: CodxDMService,
    private auth: AuthStore,
    private fileService: FileService,
    private notificationsService: NotificationsService
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
  clickMoreFunction(e,data:any)
  {
    if(e?.functionID == "DMT0210")
    {
      this.fileService.getFile(data.recID).subscribe(data => {
        if(data)
        {
          this.viewFile.emit(data);
        }
      })
    }
    else this.dmSV.clickMF(e, data)
  }
  dbView()
  {
    if(this.data?.recID && this.data?.fileName != null)
    {
      if (!this.data.read) {
        this.notificationsService.notifyCode("DM059");
        return;
      }
      this.fileService.getFile(this.data?.recID).subscribe((data) => {
        this.viewFile.emit(data);
      });
    }
    this.dmSV.openItem(this.data);
  }
}