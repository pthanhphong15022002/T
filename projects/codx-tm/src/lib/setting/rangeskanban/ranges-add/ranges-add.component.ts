import { Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { DialogRef, FormModel, CallFuncService, DialogModel, Util, ApiHttpService, NotificationsService } from 'codx-core';
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
    private callfc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    this.lstRangeLine = [];
    this.dialog = dialog;
    this.range = dialog.dataService!.dataSelected;
    this.formModelRangeLine.userPermission = dialog.formModel.userPermission;
  }

  ngOnInit(): void { }

  openPopup(template: any, data = null) {
    this.dialog.dataService.save().subscribe(res => {
      if (res.save != null) {
        if (data)
          this.rangeLines = data;
        else {
          this.rangeLines.recID = Util.uid();
          this.rangeLines.rangeID = this.range.rangeID;
        }

        let dialog = this.callfc.openForm(template, '', 500, 400);
        dialog.closed.subscribe(res => {
          this.rangeLines = new RangeLine();
        })
      }
    });
  }

  saveLine(dialog) {
    this.api.execAction<any>('BS_RangeLines', [this.rangeLines], 'SaveAsync').subscribe(res => {
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


