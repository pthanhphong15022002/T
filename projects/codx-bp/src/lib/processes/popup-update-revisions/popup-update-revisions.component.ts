import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { FileUpload, View } from '@shared/models/file.model';
import { FileService } from '@shared/services/file.service';
import { Day } from '@syncfusion/ej2-angular-schedule';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogModel, DialogRef, NotificationsService, Util } from 'codx-core';
import moment from 'moment';
import { type } from 'os';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Subject, from, observable, Observable, of } from 'rxjs';
import { CodxBpService } from '../../codx-bp.service';
import { BP_Processes, BP_ProcessRevisions } from '../../models/BP_Processes.model';
import { PopupViewDetailProcessesComponent } from '../../popup-view-detail-processes/popup-view-detail-processes.component';
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
  dateLanguage: any;
  moreFunc: any;
  constructor(
    private bpService: CodxBpService,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    private change: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;
    this.getProcess = this.data;
    this.titleAction = dt.data.title;
    this.moreFunc = dt.data.moreFunc;
    // this.action = dt.data[0];
    // this.dateLanguage=dt.data[1].more;
    this.funcID = this.dialog.formModel.funcID;
    this.user = this.authStore.get();
    this.revisions = this.getProcess.versions.sort((a, b) => moment(b.createdOn).valueOf() - moment(a.createdOn).valueOf());
    this.title = this.titleAction;
  };



  ngOnInit(): void {
  }

  onClose() {
    this.dialog.close();
  }
  getProcessesStep(item) {
    this.bpService.getProcessesByVersionNo([this.data.recID, item.versionNo])
      .subscribe(proesses => {
        if (proesses) {
          this.dialog.close();
          // this.bpService.viewProcesses.next(proesses);
          let obj = {
            moreFunc: this.moreFunc,
            data: proesses,
            formModel: {
              entityName: "BP_Processes",
              entityPer: "BP_Processes",
              formName: "Processes",
              funcID: "BPT1",
              gridViewName: "grvProcesses",
              userPermission: null,
            },
          };

          let dialogModel = new DialogModel();
          dialogModel.IsFull = true;
          dialogModel.zIndex = 999;
          var dialog = this.callfc.openForm(
            PopupViewDetailProcessesComponent,
            '',
            Util.getViewPort().height - 100,
            Util.getViewPort().width - 100,
            '',
            obj,
            '',
            dialogModel
          );
        }
      })

  }
  //#endregion event
}

