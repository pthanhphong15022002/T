import {
  Component,
  OnInit,
  Optional,
} from '@angular/core';
import {
  DialogRef,
  FormModel,
  CallFuncService,
  ApiHttpService,
  NotificationsService,
  CodxService,
  DialogData,
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
  dialog: DialogRef;
  dialogRangeLine: DialogRef;
  formModelRangeLine: FormModel = {
    formName: 'RangeLines',
    gridViewName: 'grvRangeLines',
  };
  showInput= true ;
  titleAction =''

  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    private callfc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,

  ) {
    this.dialog = dialog;
    this.master = dialog.dataService!.dataSelected;
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
      if (res && res.stop) {
        this.showInput = false;
      } else {
        this.showInput = true;
      }
    });
  }
  //#region Init
  ngOnInit(): void { 
    this.cache.functionList(this.dialog.formModel.funcID).subscribe((f) => {
      if (f) {
         var customName = f?.customName;
        this.title =
          this.titleAction +
          ' ' +
          customName.charAt(0).toLocaleLowerCase() +
          customName.slice(1);
      }
    });
  }
  //#endregion
  //#region master
  onSave() {
    this.dialog.dataService.save().subscribe((res) => {
      if (res && !res.error) {
        this.dialog.dataService.hasSaved = false;
        this.dialog.close();
      }
    });
  }
  //#endregion
  //#region line
  addLine(template: any) {
    this.line.rangeID = this.master.rangeID;
    if (this.action == 'add') {
      this.dialog.dataService.save().subscribe((res) => {
        if (res && !res.save.error || !res.save.error.isError) {
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
    if (!this.line.recID)
      this.onSaveLine(dialog);
    else
      this.onUpdateLine(dialog);
  }

  onSaveLine(dialog) {
    this.api
      .exec<any>('BS', 'RangeLinesBusiness', 'AddAsync', this.line)
      .subscribe((res) => {
        if (res) {
          this.lines.push(res);
          this.master.rangeLines = this.lines;
          this.line = new RangeLine();
          dialog.close();
        }
      });
  }

  onUpdateLine(dialog) {
    this.api
      .exec<any>('BS', 'RangeLinesBusiness', 'UpdateAsync', this.line)
      .subscribe((res) => {
        if (res) {
          this.lines.push(res);
          this.line = new RangeLine();
          dialog.close();
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
