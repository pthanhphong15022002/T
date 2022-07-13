import { Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { DialogRef, FormModel, CallFuncService, DialogModel, Util, ApiHttpService, NotificationsService, CodxService } from 'codx-core';
import { RangeLine } from '../../../models/task.model';

@Component({
  selector: 'ranges-add',
  templateUrl: './addEdit.component.html',
  styleUrls: ['./addEdit.component.css']
})
export class AddEditComponent implements OnInit {
  line: RangeLine = new RangeLine();
  lines: RangeLine[];
  title = 'Thêm khoảng thời gian';
  master: any;
  dialog: DialogRef;
  dialogRangeLine: DialogRef;
  formModelRangeLine: FormModel = {
    formName: 'RangeLines',
    gridViewName: 'grvRangeLines',
  };

  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private codxService: CodxService,
    private callfc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.master = dialog.dataService!.dataSelected;
    this.lines = this.master.line || [];
    this.formModelRangeLine.userPermission = dialog.formModel.userPermission;
  }
  //#region Init
  ngOnInit(): void { }
  //#endregion
  //#region master
  onSave() {
    this.dialog.dataService.save().subscribe(res => {
      if (res && !res.error) {
        this.dialog.dataService.hasSaved = false;
        this.dialog.close();
      }
    });
  }
  //#endregion
  //#region line
  addLine(template: any, data = null) {
    this.dialog.dataService.save().subscribe(res => {
      if (!res?.save?.error || !res?.update?.error) {
        if (!this.dialog.dataService.dataSelected.isNew())
          this.dialog.dataService.hasSaved = true;
        if (data)
          this.line = data;
        else {
          this.line.recID = Util.uid();
          this.line.rangeID = this.master.rangeID;
          this.codxService.setAddNew(this.line, 'recID')
        }
        this.callfc.openForm(template, '', 500, 400);
      }
    });
  }

  saveLine(dialog) {
    this.api.exec<any>('BS', 'RangeLinesBusiness', 'AddEditRangeLineAsync', this.line).subscribe(res => {
      if (res) {
        if (this.line['isNew'])
          this.lines.push(res)
        this.line = new RangeLine();
        dialog.close();
      }
    })
  }

  removeLine(item, index) {
    this.api.exec<any>('BS', 'RangeLinesBusiness', 'DeleteRangeLineAsync', item).subscribe(res => {
      if (res)
        this.lines.splice(index, 1);
    })
  }

  valueChange(data) {
    this.line[data.field] = data.data;
  }
  //#endregion


}


