import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  Optional,
} from '@angular/core';
import { Notes } from '@shared/models/notes.model';
import { NoteServices } from '../../../services/note.services';

@Component({
  selector: 'app-update-note-pin',
  templateUrl: './update-note-pin.component.html',
  styleUrls: ['./update-note-pin.component.scss'],
})
export class UpdateNotePinComponent implements OnInit {
  type: any;
  itemUpdate: Notes = new Notes();
  header = 'Cập nhật ghi chú ghim';
  dialog: any;
  readOnly = false;
  checkEditIsPin = false;
  data: any = [];
  dataOld: any;
  typeUpdate = '';

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private noteService: NoteServices,
    @Optional() data?: DialogData,
    @Optional() dt?: DialogRef
  ) {
    this.dialog = dt;
    this.itemUpdate = data.data?.itemUpdate;
    this.data = data.data?.data;
    this.typeUpdate = data.data?.typeUpdate;
  }

  ngOnInit(): void { }

  valueChange(e, item = null) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      if (field == 'checkboxUpdateNotePin') {
        if (dt == true || dt == '1') {
          this.checkEditIsPin = true;
          this.dataOld = item;
        }
      }
    }
  }

  onCheckEdit() {
    if (this.typeUpdate != undefined) this.onEditIsPin();
    else this.onEditNote();
  }

  onEditIsPin() {
    var isPin = !this.dataOld.isPin;
    this.dataOld.isPin = isPin;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        this.dataOld.recID,
        this.dataOld,
      ])
      .subscribe((res) => {
        this.dialog.close();
        var object = [{ data: res, type: 'edit' }];
        this.noteService.data.next(object);
        if (this.typeUpdate != undefined)
          this.noteService.dataUpdate.next(object);
        for (let i = 0; i < this.data.length; i++) {
          if (this.data[i].recID == this.dataOld?.recID) {
            this.data[i].isPin = res?.isPin;
          }
        }
      });
  }

  onEditNote() {
    if (this.checkEditIsPin == true) {
      this.onEditIsPin();
      var isPin = !this.itemUpdate.isPin;
      this.itemUpdate.isPin = isPin;
      this.api
        .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
          this.itemUpdate?.recID,
          this.itemUpdate,
        ])
        .subscribe((res) => {
          var object = [{ data: res, type: 'edit' }];
          this.noteService.data.next(object);
          this.dialog.close();
          this.notificationsService.notifyCode('SYS007');
          this.changeDetectorRef.detectChanges();
        });
    } else {
      this.notificationsService.notify(
        'Vui lòng chọn ghi chú thay thế',
        'error',
        2000
      );
    }
  }
}
