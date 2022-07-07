import { ApiHttpService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { Component, OnInit, Input, ChangeDetectorRef, Optional } from '@angular/core';
import { Notes } from '@shared/models/notes.model';

@Component({
  selector: 'app-update-note-pin',
  templateUrl: './update-note-pin.component.html',
  styleUrls: ['./update-note-pin.component.scss']
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

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    @Optional() data?: DialogData,
    @Optional() dt?: DialogRef,
  ) {
    this.dialog = dt;
    this.itemUpdate = data.data?.itemUpdate;
    this.data = data.data?.data;
  }

  ngOnInit(): void {
  }

  valueChange(e, item = null) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      if (field == "checkboxUpdateNotePin") {
        if (dt == true || dt == '1') {
          this.checkEditIsPin = true;
          this.dataOld = item;
        }
      }
    }
  }

  onEditIsPin() {
    var isPin = !this.dataOld.isPin;
    this.dataOld.isPin = isPin;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.dataOld.recID, this.dataOld])
      .subscribe((res) => {
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
        .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.itemUpdate?.recID, this.itemUpdate])
        .subscribe((res) => {
          this.dialog.close();
          this.notificationsService.notify(
            'Thực thi thành công',
            'error',
            2000
          );
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
