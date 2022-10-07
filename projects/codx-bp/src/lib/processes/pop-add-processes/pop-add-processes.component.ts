import { BP_Processes } from './../../models/BP_Processes.model';
import { Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { DialogData, DialogRef, CacheService, CallFuncService } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-pop-add-processes',
  templateUrl: './pop-add-processes.component.html',
  styleUrls: ['./pop-add-processes.component.css'],
})
export class PopAddProcessesComponent implements OnInit {
  @Input() process = new BP_Processes();
  @ViewChild('attachment') attachment: AttachmentComponent;

  data: any;
  dialog: any;
  title = ' quy trình mới';
  titleAction = '';
  action: any;
  gridViewSetup: any;
  listCombobox = {};
  listName = '';
  fieldValue = '';
  constructor(
    private cache: CacheService,
    private callfc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));
    this.dialog = dialog;
    this.process = this.data;
    this.titleAction = dt.data[1];
    this.action = dt.data[0];

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
    this.title = this.titleAction + this.title;
  }

  ngOnInit(): void {}

  //#region method
  beforeSave(op) {
    var data = [];
    if (this.action == 'add' || this.action == 'copy') {
      op.method = 'AddProcessesAsync';
      op.className = 'ProcessesBusiness';
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
        this.attachment?.clearData();
        this.dialog.close();
      });
  }
  async onSave() {
    if (this.attachment?.fileUploadList?.length)
      (await this.attachment.saveFilesObservable()).subscribe((res) => {
        if (res) {
          this.process.attachments = Array.isArray(res) ? res.length : 1;
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

  addFile(e) {}

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
