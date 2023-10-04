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
  NotificationsService,
  CacheService,
  Util,
  AuthStore,
} from 'codx-core';
import { CodxBpService } from '../../codx-bp.service';
import {
  BP_Processes,
  BP_ProcessRevisions,
} from '../../models/BP_Processes.model';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
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
  more: any;
  comment = '';
  funcID: any;
  disableTitle = true;
  versionDefault: string;
  verName: string;
  verNameDefault: string;
  verNo: string;
  entityName: string;
  version = new BP_ProcessRevisions();
  msgErrorValidExit = 'msgErrorValidExit'; // Check name exist
  msgErrorValidIsNull = 'msgErrorValidIsNull'; // Check name is null or don't select
  msgSucess = 'msgSucess'; //Condtion sucess
  isUpdate: boolean = false;
  gridViewSetup: any;
  fucntionIdMain: any;
  enterComment: any;
  enterName: any;
  msgCodeNameVersionIsExist: string = 'BP002';
  user: any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private cache: CacheService,
    private authStore: AuthStore,
    private change: ChangeDetectorRef,
    private bpService: CodxBpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dt?.data));
    this.dialog = dialog;
    this.more = this.data?.more;
    this.funcID = this.more?.functionID;
    this.entityName = this.more?.entityName;
    this.process = this.data?.data;
    this.fucntionIdMain = this.data?.funcIdMain;
    this.revisions = this.process?.versions;
    this.user = this.authStore.get();
    this.headerText = dt?.data.more.defaultName;
    this.verNo = 'V' + this.revisions.length.toString() + '.0';
    this.cache.message('BP001').subscribe((res) => {
      if (res) {
        this.verNameDefault = Util.stringFormat(
          res.defaultName,
          '' + this.verNo.toString() + ''
        );
      }
    });
    this.comment = '';
    this.cache
      .gridViewSetup('ProcessRevisions', 'grvProcessRevisions')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
          this.enterComment = this.gridViewSetup['Comment']?.description;
          this.enterName = this.gridViewSetup['VersionName']?.headerText;
        }
      });
  }

  ngOnInit(): void {}

  //#region event
  valueChange(e) {
    if (e?.data) {
      this.verName = e?.data;
    }
    this.changeDetectorRef.detectChanges;
  }

  valueComment(e) {
    if (e?.data) {
      this.comment = e?.data ? e?.data : '';
    }
    this.changeDetectorRef.detectChanges;
  }
  //#endregion
  checkValiName(nameVersion: string) {
    let check = true;
    if (nameVersion === null || nameVersion.trim() === '') {
      return this.msgErrorValidIsNull;
    }

    for (let element of this.revisions) {
      if (
        element.versionName &&
        element?.versionName.toUpperCase() == nameVersion.trim().toUpperCase()
      ) {
        check = false;
        return this.msgErrorValidExit;
      }
    }
    return this.msgSucess;
  }

  onSave() {
    switch (this.checkValiName(this.verName)) {
      case this.msgErrorValidIsNull:
        this.notiService.notifyCode('SYS009', 0, '"' + this.enterName + '"');
        break;
      case this.msgErrorValidExit:
        this.notiService.notifyCode(this.msgCodeNameVersionIsExist);
        break;
      case this.msgSucess:
        this.isUpdate = true;
        this.actionSave();
        break;
    }
  }
  actionSave() {
    if (this.isUpdate) {
      this.bpService
        .updateRevision(
          this.funcID,
          this.process.recID,
          this.verNo,
          this.verName,
          this.comment,
          this.entityName,
          this.fucntionIdMain
        )
        .subscribe((res) => {
          if (res) {
            this.process.versionNo = res.versionNo;
            this.process.versions = res.versions;
            this.dialog.close(this.process);
            this.notiService.notifyCode('SYS007');
          }
        });
    }
  }
}
