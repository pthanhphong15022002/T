import { BP_Processes, BP_ProcessRevisions } from './../../models/BP_Processes.model';
import { Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { DialogData, DialogRef, CacheService, CallFuncService, AuthStore, NotificationsService } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-popup-add-processes',
  templateUrl: './popup-add-processes.component.html',
  styleUrls: ['./popup-add-processes.component.css'],
})
export class PopupAddProcessesComponent implements OnInit {
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
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;
    this.process = this.data;
    this.titleAction = dt.data[1];
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
      versions.createdOn = new Date();
      versions.createdBy = this.user.userID;
      versions.activedOn = this.process.activedOn;
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
    if (
      this.process.processName == null ||
      this.process.processName.trim() == ''
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ProcessName']?.headerText + '"'
      );
      return;
    }
    if (
      this.process.owner == null ||
      this.process.owner.trim() == ''
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Owner']?.headerText + '"'
      );
      return;
    }

    if (!this.process.activedOn ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ActivedOn']?.headerText + '"'
      );
      return;
    }
    if ( !this.process.expiredOn) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ExpiredOn']?.headerText + '"'
      );
      return;
    }
    //Chưa có mssg code
    if (this.process.activedOn >= this.process.expiredOn) {
      this.notiService.notify(
        'Vui lòng chọn ngày hiệu lực nhỏ hơn ngày hết hạn!'
      );
      return;
    }
    //Chưa có mssg code
    if (this.isCheckFromToDate(this.process.activedOn)) {
      this.notiService.notify(
        'Vui lòng chọn ngày hiệu lực lớn hơn ngày hiện tại!'
      );
      return;
    }

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

  //#region check date
  isCheckFromToDate(toDate) {
    var to = new Date(toDate);
    if (to <= new Date()) return true;
    else return false;
  }
  ////#endregion

  //#region event
  valueChange(e) {
    this.process[e.field] = e.data;
  }

  valueChangeTag(e) {
    this.process.tags = e.data;
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


  valueCbx(e) {
  }
  //#endregion event
}
