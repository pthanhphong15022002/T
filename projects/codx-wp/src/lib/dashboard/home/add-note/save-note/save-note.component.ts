import { PopupTitleComponent } from './popup-title/popup-title.component';
import {
  DialogData,
  AuthStore,
  ApiHttpService,
  DialogRef,
  UIComponent,
  NotificationsService,
  CodxFormComponent,
} from 'codx-core';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  Injector,
  ViewChild,
} from '@angular/core';
import { Notes } from '@shared/models/notes.model';
import { NoteServices } from 'projects/codx-wp/src/lib/services/note.services';

@Component({
  selector: 'app-save-note',
  templateUrl: './save-note.component.html',
  styleUrls: ['./save-note.component.scss'],
})
export class SaveNoteComponent extends UIComponent implements OnInit {
  user: any;
  predicate = 'CreatedBy=@0';
  dataValue = '';
  data = new Notes();
  header = '';
  dialog: any;
  dialogRef: any;

  @ViewChild('form') form: CodxFormComponent;

  constructor(
    private injector: Injector,
    private authStore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private noteService: NoteServices,
    @Optional() data?: DialogData,
    @Optional() dt?: DialogRef
  ) {
    super(injector);
    this.dialog = dt;
    this.data = data?.data?.itemUpdate;
    debugger;
    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
    this.dialogRef = data?.data?.dialogRef;
  }

  onInit(): void {}

  ngAfterViewInit() {
    if (this.form) {
      this.header = this.form.headerText;
    }
  }

  onEditNote(itemNoteBook) {
    var obj = {
      itemNoteUpdate: this.data,
      itemNoteBookUpdate: itemNoteBook,
      dialogRef: this.dialog,
    };  
    this.callfc.openForm(PopupTitleComponent, '', 400, 100, '', obj);
  }
}
