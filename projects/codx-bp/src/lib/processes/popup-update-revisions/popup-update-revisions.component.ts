import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { FileUpload, View } from '@shared/models/file.model';
import { FileService } from '@shared/services/file.service';
import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { type } from 'os';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { Subject } from 'rxjs';
import { CodxBpService } from '../../codx-bp.service';
import { BP_Processes, BP_ProcessRevisions } from '../../models/BP_Processes.model';

@Component({
  selector: 'lib-popup-update-revisions',
  templateUrl: './popup-update-revisions.component.html',
  styleUrls: ['./popup-update-revisions.component.css']
})
export class PopupUpdateRevisionsComponent implements OnInit {
  @Input() process = new BP_Processes();
  @ViewChild('attachment') attachment: AttachmentComponent;

  data: any;
  dialog: any;
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
  revisions :  BP_ProcessRevisions[] = [];
  user: any;
  constructor(
    private cache: CacheService,
    private callfc: CallFuncService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;
    this.process = this.data;
    this.titleAction = dt.data;
    this.action = dt.data[0];
    this.funcID = this.dialog.formModel.funcID;
    this.user = this.authStore.get();

    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    this.title = this.titleAction;
  }

  ngOnInit(): void {
    if(this.action === 'edit'){
      this.showLabelAttachment = this.process?.attachments > 0 ? true : false;

    }
  }

  //#region method
  beforeSave(op) {
    var data = [];
    if (this.action == 'add' || this.action == 'copy') {
      op.method = 'AddProcessesAsync';
      op.className = 'ProcessesBusiness';

      var versions = new BP_ProcessRevisions();
      this.process.versionNo = 'V0.0';
      versions.versionNo = this.process.versionNo;
      versions.comment = 'Phiên bản đầu';
      versions.createdOn = new Date();
      versions.createdBy = this.user.userID;
      this.revisions.push(versions) ;
      this.process.versions = this.revisions;
      data = [this.process];
    } else if (this.action == 'edit') {
      op.method = 'UpdateProcessesAsync';
      op.className = 'ProcessesBusiness';
      data = [this.process];
    }

    op.data = data;
    return true;
  }

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        this.attachment?.clearData();
        if (res) {
          this.dialog.close([res.save]);
        } else this.dialog.close();
      });
  }

  onUpdate() {
    this.dialog.dataService
    .save((option: any) => this.beforeSave(option))
    .subscribe((res) => {
      if (res.update) {
        this.attachment?.clearData();
        this.dialog.close(res.update);
      }
    });
  }
  async onSave() {
    if (this.attachment?.fileUploadList?.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          var countAttack = 0;
          countAttack = Array.isArray(res) ? res.length : 1;
          if(this.action === 'edit'){
            this.process.attachments += countAttack;
          }else{
            this.process.attachments = countAttack;
          }
          if (this.action === 'add' || this.action === 'copy') this.onAdd();
          else this.onUpdate();
        }
      });
    else {
      if (this.action === 'add' || this.action === 'copy') this.onAdd();
      else this.onUpdate();
    }
  }
  //#endregion method

  //#region event
  valueChange(e) {
    this.process[e.field] = e.data;
  }

  valueDateChange(e){
    this.process[e.field] = e.data.fromDate;

  }

  eventApply(e){
    console.log(e);
    var data = e.data[0];
    switch (data.objectType) {
      case 'U':
        this.process.owner = data.id;
        break;
    }

  }



  addFile(e) {
    this.attachment.uploadFile();

  }
  getfileCount(e) {
    if (e.data.length > 0) this.isHaveFile = true;
    else this.isHaveFile = false;
    if (this.action != 'edit') this.showLabelAttachment = this.isHaveFile;
  }
  fileAdded(e) {}
  openShare(share: any, isOpen) {
    if (isOpen == true) {
      // this.listCombobox = {
      //   U: 'Users',
      // };
      this.listName = 'Users';
      this.fieldValue = 'owner';
      this.callfc.openForm(share, '', 420, window.innerHeight);
    }
  }

  valueCbx(e, fieldValue) {
  }
  //#endregion event
}

