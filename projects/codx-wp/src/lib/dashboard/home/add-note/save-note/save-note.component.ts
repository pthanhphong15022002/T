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
  header = 'Sổ tay cá nhân';
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
    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
    this.dialogRef = data?.data?.dialogRef;
  }

  onInit(): void {}

  ngAfterViewInit() {
    console.log('check ssss', this.form);
  }

  onEditNote(recID) {
    this.data.transID = recID;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        this.data?.recID,
        this.data,
      ])
      .subscribe((res) => {
        if (res) {
          this.dialog.close();
          if (this.dialogRef != undefined) this.dialogRef.close();
          this.notificationsService.notifyCode('E0528');
          var object = [{ data: res, type: 'edit-save-note' }];
          this.noteService.data.next(object);
          this.changeDetectorRef.detectChanges();
        }
      });
  }
}
