import {
  ApiHttpService,
  CacheService,
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
import { I } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-update-note-pin',
  templateUrl: './update-note-pin.component.html',
  styleUrls: ['./update-note-pin.component.scss'],
})
export class UpdateNotePinComponent implements OnInit {
  type: any;
  itemUpdate: Notes = new Notes();
  header = 'Cập nhật ghi chú ghim';
  dialog: DialogRef;
  readOnly = false;
  checkEditIsPin = false;
  data: any = [];
  dataOld: any;
  messageParam: any;
  predicate = 'IsPin=@0';
  dataValue = 'true';
  maxPinNotes = 0;
  component: any;
  formType: any;
  typeUpdate: any = '';

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private noteService: NoteServices,
    private cache: CacheService,
    @Optional() data?: DialogData,
    @Optional() dt?: DialogRef
  ) {
    this.dialog = dt;
    this.itemUpdate = data.data?.itemUpdate;
    this.data = data.data?.data;
    this.maxPinNotes = data.data?.maxPinNotes;
    this.formType = data.data?.formType;
    this.typeUpdate = data.data?.typeUpdate;
  }

  ngOnInit(): void {
    this.cache.message('WP003').subscribe((res) => {
      if (res && res.description) {
        var mess = res.description;
        this.messageParam = mess.replace('{0}', this.maxPinNotes);
      }
    });
  }

  ngAfterViewInit() {
    this.noteService.dataUpdate.next(null);
  }

  valueChange(e, item = null) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      if (field == 'checkboxUpdateNotePin') {
        if (dt == true || dt == '1' || dt) {
          this.checkEditIsPin = true;
          this.dataOld = item;
        }
      }
    }
  }

  onSave() {
    if (this.checkEditIsPin) {
      this.onEditNoteOld();
      if (this.formType == 'edit') {
        var isPin = !this.itemUpdate.isPin;
        this.itemUpdate.isPin = isPin;
        this.itemUpdate.isNote = true;
        this.api
          .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
            this.itemUpdate?.recID,
            this.itemUpdate,
          ])
          .subscribe((res) => {
            if (res) {
              var object = [{
                data: res,
                type: 'edit-note-drawer',
                formType: this.formType,
              }];
              this.noteService.data.next(object);
              this.noteService.dataUpdate.next(object);
              this.dialog.close(res);
            }
          });
      }
    } else {
      this.notificationsService.notify(
        'Vui lòng chọn ghi chú thay thế',
        'error',
        2000
      );
    }
  }

  onEditNoteOld() {
    var isPin = !this.dataOld.isPin;
    this.dataOld.isPin = isPin;
    this.dataOld.isNote = true;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        this.dataOld.recID,
        this.dataOld,
      ])
      .subscribe((res) => {
        if (res) {
          var object = [{
            data: res,
            type: 'edit-note-drawer',
            formType: this.formType,
          }];
          this.noteService.data.next(object);
          if (this.formType == 'add') {
            this.noteService.dataUpdate.next(object);
            this.dialog.close(res);
          }
        }
      });
  }
}
