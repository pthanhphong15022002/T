import { Component, OnInit, Optional } from '@angular/core';
import {
  DialogRef,
  FormModel,
  CallFuncService,
  ApiHttpService,
  NotificationsService,
  CodxService,
  DialogData,
  RequestOption,
  CacheService,
} from 'codx-core';
import { RangeLine } from '../../../models/task.model';

@Component({
  selector: 'ranges-add',
  templateUrl: './addEdit.component.html',
  styleUrls: ['./addEdit.component.css'],
})
export class AddEditComponent implements OnInit {
  line: RangeLine = new RangeLine();
  lines: RangeLine[];
  title = 'Thêm khoảng thời gian';
  action = 'add';
  master: any;
  orgData: any;
  dialog: DialogRef;
  dialogRangeLine: DialogRef;
  formModelRangeLine: FormModel = {
    formName: 'RangeLines',
    gridViewName: 'grvRangeLines',
  };
  titleAction = '';
  disabledShowInput = false;
  planceHolderAutoNumber = '';
  gridViewSetup: any;
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private callfc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.master = dialog.dataService!.dataSelected;
    this.orgData = JSON.parse(JSON.stringify(this.master));
    this.lines = this.master.rangeLines || [];
    this.action = dialogData.data[0];
    this.titleAction = dialogData.data[1];
    this.formModelRangeLine.userPermission = dialog.formModel.userPermission;

    this.api
      .execSv<any>(
        'SYS',
        'AD',
        'AutoNumberDefaultsBusiness',
        'GetFieldAutoNoAsync',
        [this.dialog.formModel.funcID, this.dialog.formModel.entityName]
      )
      .subscribe((res) => {
        if (res && !res.stop) {
          this.disabledShowInput = true;
          this.cache.message('AD019').subscribe((mes) => {
            if (mes)
              this.planceHolderAutoNumber = mes?.customName || mes?.description;
          });
        } else {
          this.disabledShowInput = false;
        }
      });
  }
  //#region Init
  ngOnInit(): void {
    this.cache
      .gridViewSetup(
        this.dialog.formModel.formName,
        this.dialog.formModel.gridViewName
      )
      .subscribe((res) => {
        if (res) this.gridViewSetup = res;
      });

    this.dialog.beforeClose.subscribe((res) => {
      if (res.event == null && this.action == 'edit') {
        this.master.rangeName = this.orgData.rangeName;
        this.master.note = this.orgData.note;
      }
      this.dialog.dataService.clear();
    });
  }
  //#endregion
  //#region master
  onSave() {
    if (!this.master['updateColumn']) {
      this.dialog.close(true);
      return;
    }

    this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.service = 'BS';
        opt.assemblyName = 'BS';
        opt.className = 'RangesBusiness';
        if (this.action == 'add') opt.methodName = 'AddAsync';
        else opt.methodName = 'UpdateAsync';

        opt.data = this.dialog.dataService.dataSelected;
        return true;
      }, 0)
      .subscribe((res) => {
        if (res && !res.error) {
          this.dialog.dataService.hasSaved = false;
          this.dialog.dataService.update(this.master).subscribe();
          this.dialog.close(true);
        }
      });
  }
  //#endregion
  //#region line
  addLine(template: any) {
    if (this.action == 'add') {
      this.dialog.dataService.save().subscribe((res) => {
        if ((res && !res.save.error) || !res.save.error.isError) {
          this.line.rangeID = this.master.rangeID =
            this.dialog.dataService.dataSelected.rangeID;
          this.callfc.openForm(template, '', 500, 400);
        }
      });
    } else {
      this.callfc.openForm(template, '', 500, 400);
    }
  }

  updateLine(e, item) {
    this.line = item;
    this.callfc.openForm(e, '', 500, 400);
  }

  saveLine(dialog) {
    if (!this.line.recID) this.onSaveLine(dialog);
    else this.onUpdateLine(dialog);
  }

  onSaveLine(dialog) {
    this.api
      .exec<any>('BS', 'RangeLinesBusiness', 'AddAsync', this.line)
      .subscribe((res) => {
        if (res) {
          this.lines.push(res);
          this.master.rangeLines = this.lines;
          this.line = new RangeLine();
          dialog.close(true);
        }
      });
  }

  onUpdateLine(dialog) {
    this.api
      .exec<any>('BS', 'RangeLinesBusiness', 'UpdateAsync', this.line)
      .subscribe((res) => {
        if (res) {
          let idx = this.lines.findIndex((x) => x.id == this.line.id);
          if (idx > -1) this.lines[idx] = this.line;
          this.line = new RangeLine();
          this.master.rangeLines = this.lines;
          dialog.close(true);
        }
      });
  }

  removeLine(item, index) {
    this.api
      .exec<any>('BS', 'RangeLinesBusiness', 'DeleteAsync', item)
      .subscribe((res) => {
        if (res) this.lines.splice(index, 1);
      });
  }

  valueChange(data) {
    this.line[data.field] = data.data;
  }
  //#endregion
}
