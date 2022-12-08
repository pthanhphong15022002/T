import {
  Component,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ChangeDetectorRef,
  inject,
  Injector,
} from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  NotificationsService,
  AuthStore,
  UIComponent,
  CacheService,
  Util,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';
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
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private cache: CacheService,
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
    if (nameVersion == null || nameVersion.trim() == '') {
      return this.msgErrorValidIsNull;
    }
    let check = true;
    this.revisions.forEach((element) => {
      if (element.versionName == nameVersion.trim()) {
        check = false;
      }
    });
    return check ? this.msgSucess : this.msgErrorValidExit;
  }

  onSave() {
    switch (this.checkValiName(this.verName)) {
      case this.msgErrorValidIsNull:
        this.notiService.notifyCode('SYS009', 0, '"' + this.enterName + '"');
        break;
      case this.msgErrorValidExit:
        this.notiService.alertCode('BP004').subscribe((x) => {
          if (x.event?.status == 'N') {
            return;
          } else {
            this.isUpdate = true;
            this.actionSave()
          }
        });
        break;
      case this.msgSucess:
        this.isUpdate = true;
        this.actionSave()
        break;
    }


  }
  actionSave(){
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
