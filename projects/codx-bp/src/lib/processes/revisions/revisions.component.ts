import {
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  AuthStore,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import {
  BP_Processes,
  BP_ProcessRevisions,
} from '../../models/BP_Processes.model';

@Component({
  selector: 'lib-revisions',
  templateUrl: './revisions.component.html',
  styleUrls: ['./revisions.component.css'],
})
export class RevisionsComponent implements OnInit {
  @ViewChild('attachment') attachment: AttachmentComponent;
  @Input() process = new BP_Processes();

  revisions: BP_ProcessRevisions[] = [];
  headerText = '';
  data: any;
  dialog: any;
  recID: any;
  more: any;
  comment = '';
  funcID: any;
  user: any;
  testHeader:any;
  version = new BP_ProcessRevisions();
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private authStore: AuthStore,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dt?.data));
    // this.testHeader = JSON.parse(JSON.stringify(dt?.data));
    this.dialog = dialog;
    this.more = this.data?.more;
    this.funcID = this.more?.functionID;
    this.process = this.data?.data;
    this.revisions = this.process?.versions;
    this.headerText = 'Quản lý phiên bản';
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
   this.process.versionNo='';
   this.comment=''
  }

  //#region event
  valueChange(e) {
    if (e?.data) {
      this.process.versionNo = e.data;
    }
  }

  valueComment(e) {
    if (e?.data) {
      this.comment = e?.data ? e?.data : '';
    }
    this.changeDetectorRef.detectChanges;
  }
  //#endregion

  onSave() {
    this.api
      .execSv<any>('BP', 'BP', 'ProcessesBusiness', 'UpdateVersionAsync', [
        this.funcID,
        this.process.recID,
        this.process.versionNo,
        this.comment,
      ])
      .subscribe((res) => {
        if (res) {
            this.dialog.close(res);
            this.notiService.notifyCode('SYS007');
        }
      });
  }
}
