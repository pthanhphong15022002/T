import { Component, Input, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthStore, CacheService, CallFuncService, DialogData, DialogModel, DialogRef, Util } from 'codx-core';
import moment from 'moment';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxBpService } from '../../codx-bp.service';
import { BP_Processes, BP_ProcessRevisions } from '../../models/BP_Processes.model';
import { PopupViewDetailProcessesComponent } from '../../popup-view-detail-processes/popup-view-detail-processes.component';
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
  user: any;
  dateLanguage: any;
  moreFunc: any;
  userId:string = '';
  isAdmin: false;
  isAdminBp: false;
  firstNameVersion: string = '';
  constructor(
    private bpService: CodxBpService,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    private cache: CacheService,
    public sanitizer: DomSanitizer,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;
    this.getProcess = this.data;
    this.titleAction = dt.data.title;
    this.moreFunc = dt.data.moreFunc;
    this.userId = dt.data.userId;
    this.isAdmin = dt.data.isAdmin;
    this.isAdminBp = dt.data.isAdminBp;
    this.funcID = this.dialog.formModel.funcID;
    this.user = this.authStore.get();
    this.revisions = this.getProcess.versions.sort((a, b) => moment(b.createdOn).valueOf() - moment(a.createdOn).valueOf());
    this.title = this.titleAction;
    this.cache.message('BP001').subscribe((res) => {
      if (res) {
        this.firstNameVersion = Util.stringFormat(
          res.defaultName.trim(),
          ': ' + 'V0.0'
        );
        console.log(res.defaultName);
      }
    });

  };



  ngOnInit(): void {
  }

  onClose() {
    this.dialog.close();
  }

  openProcessStep(process, role){
    let editRole = false;
    if(role){
      editRole = process.write && !process.deleted ? true : false;
    }
    let obj = {
      moreFunc: this.moreFunc,
      data: process,
      formModel: {
        entityName: "BP_Processes",
        entityPer: "BP_Processes",
        formName: "Processes",
        funcID: "BPT1",
        gridViewName: "grvProcesses",
        userPermission: null,
      },
      editRole,
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

  getProcessesStep(item) {
    if(item?.versionNo == this.data?.versionNo){
      this.dialog.close();
      this.openProcessStep(this.data, true);
    }else{
      this.bpService.getProcessesByVersion([this.data.recID, item.versionNo])
      .subscribe(proesses => {
        if (proesses) {
          this.dialog.close();
          this.openProcessStep(proesses, false);
        }
      })
    }
  }
  //#endregion event
}

