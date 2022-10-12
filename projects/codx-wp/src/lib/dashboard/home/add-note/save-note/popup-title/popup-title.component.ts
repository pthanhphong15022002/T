import { NoteServices } from 'projects/codx-wp/src/lib/services/note.services';
import {
  Component,
  OnInit,
  Optional,
  Injector,
  ChangeDetectorRef,
} from '@angular/core';
import { Notes } from '@shared/models/notes.model';
import {
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';

@Component({
  selector: 'lib-popup-title',
  templateUrl: './popup-title.component.html',
  styleUrls: ['./popup-title.component.css'],
})
export class PopupTitleComponent extends UIComponent implements OnInit {
  dialog: DialogRef;
  dialogRef: any;
  dataNote: any;
  dataNoteBook: any;
  readOnly = false;
  gridViewSetup = {
    title: '',
  };
  empty = '';
  note: Notes = new Notes();

  constructor(
    private injector: Injector,
    private notificationsService: NotificationsService,
    private noteService: NoteServices,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() data?: DialogData,
    @Optional() dt?: DialogRef
  ) {
    super(injector);
    this.dialog = dt;
    this.dataNote = data?.data?.itemNoteUpdate;
    this.dataNoteBook = data?.data?.itemNoteBookUpdate;
    this.dialogRef = data?.data?.dialogRef;
    this.cache.gridViewSetup('Notes', 'grvNotes').subscribe((res) => {
      if (res) {
        this.gridViewSetup.title = res?.Title?.headerText;
      }
    });
  }

  onInit(): void {}

  valueChange(e) {
    if (e) {
      var dt = e.data;
      var field = e.field;
      this.note[field] = dt;
    }
  }

  onEditNote() {
    this.dataNote.transID = this.dataNoteBook.recID;
    this.dataNote.title = this.note.title;
    this.dataNote.isNote = false;
    if (this.dataNote.noteType !== 'text') this.dataNote.checkList.pop();
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        this.dataNote?.recID,
        this.dataNote,
      ])
      .subscribe((res) => {
        if (res) {
          this.notificationsService.notifyCode('E0528');
          this.changeDetectorRef.detectChanges();
          this.dialog.close();
          if (this.dialogRef != undefined) this.dialogRef.close(res);
        }
      });
  }
}
