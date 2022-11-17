import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { FileUpload, View } from '@shared/models/file.model';
import { FileService } from '@shared/services/file.service';
import { Day } from '@syncfusion/ej2-angular-schedule';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import moment from 'moment';
import { type } from 'os';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Subject, from, observable, Observable, of } from 'rxjs';
import { CodxBpService } from '../../codx-bp.service';
import { BP_Processes, BP_ProcessRevisions } from '../../models/BP_Processes.model';
import { RevisionsComponent } from '../revisions/revisions.component';
@Component({
  selector: 'lib-popup-update-revisions',
  templateUrl: './popup-update-revisions.component.html',
  styleUrls: ['./popup-update-revisions.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PopupUpdateRevisionsComponent implements OnInit {
  @Input() process = new BP_Processes();
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('view') codxview!: any;
  data: any;
  dialog: DialogRef;
  title = '';
  titleAction = '';
  action: any;
  gridViewSetup: any;
  listCombobox = {};
  listName = '';
  fieldValue = '';
  funcID: any;
  showLabelAttachment = false;
  isHaveFile = false;
  revisions: BP_ProcessRevisions[] = [];
  getProcess = new BP_Processes;
  test1 = '';
  user: any;
  dateLanguage:any;
  constructor(
    private callfc: CallFuncService,
    private authStore: AuthStore,
    private change: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;
    this.getProcess = this.data;
    // this.titleAction = dt.data;
    // this.action = dt.data[0];
    // this.dateLanguage=dt.data[1].more;
    this.funcID = this.dialog.formModel.funcID;
    this.user = this.authStore.get();
    this.revisions = this.getProcess.versions.sort((a,b) => moment(b.createdOn).valueOf() - moment(a.createdOn).valueOf());
    this.title = this.titleAction;
  };



  ngOnInit(): void {
    // gán tạm label
    this.titleAction='Cập nhật phiên bản';
    console.log(this.revisions);
  }

  onCreate() {
    var obj = {
      more: 'BPT103',
      data: this.getProcess,
    };
    var dialogRevisions = this.callfc.openForm(
      RevisionsComponent,
      '',
      500,
      350,
      '',
      obj
      );
      dialogRevisions.closed.subscribe((e) => {
        if (e?.event != null && e?.event.versions.length > 0) {
          this.getProcess.versions = e.event?.versions;
          this.getProcess.versionNo = e.event?.versionNo;
           this.revisions = e?.event.versions.sort((a,b) => moment(b.createdOn).valueOf() - moment(a.createdOn).valueOf());
          this.dialog.close(this.getProcess);
          this.change.detectChanges();
        }
      });
  }
  //#endregion event
}

