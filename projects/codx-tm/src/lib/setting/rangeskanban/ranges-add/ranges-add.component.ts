import { Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { DialogRef, FormModel, CallFuncService, DialogModel, Util, ApiHttpService, NotificationsService, CodxService } from 'codx-core';
import { RangeLine } from '../../../models/task.model';

@Component({
  selector: 'ranges-add',
  templateUrl: './ranges-add.component.html',
  styleUrls: ['./ranges-add.component.css']
})
export class PopAddRangesComponent implements OnInit {
  rangeLines = new RangeLine();
  lstRangeLine: RangeLine[];
  title = 'Thêm khoảng thời gian';
  range: any;
  dialog: DialogRef;

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
    this.range = dialog.dataService!.dataSelected;
    this.lstRangeLine = this.range.rangeLines || [];
    this.formModelRangeLine.userPermission = dialog.formModel.userPermission;
  }

  ngOnInit(): void { }

  openPopup(template: any, data = null) {
    this.dialog.dataService.save().subscribe(res => {
      if (!res?.save?.error || !res?.update?.error) {
        if (data)
          this.rangeLines = data;
        else {
          this.rangeLines.recID = Util.uid();
          this.rangeLines.rangeID = this.range.rangeID;
          // this.codxService.setAddNew(this.rangeLines, 'recID')
        }
        this.callfc.openForm(template, '', 500, 400);
      }
    });
  }

  saveLine(dialog) {
    let method = 'SaveAsync';

    if (!this.rangeLines['isNew'])
      method = 'UpdateAsync';

    this.api.execAction<any>('BS_RangeLines', [this.rangeLines], method).subscribe(res => {
      if (res) {
        this.lstRangeLine.push(this.rangeLines)
        this.rangeLines = new RangeLine();
      }
    })
  }

  onSave() {
    this.dialog.dataService
      .save()
      .subscribe(res => {
        if (res && !res.error) {
          this.dialog.close();
        }
      });
  }

  deletePopup(index) {
    this.lstRangeLine.splice(index, 1);
  }

  valueChange(data) {
    this.rangeLines[data.field] = data.data;
  }
}


