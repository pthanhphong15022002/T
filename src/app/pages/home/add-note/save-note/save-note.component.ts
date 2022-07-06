import { DialogData, AuthStore, ApiHttpService, DialogRef, UIComponent } from 'codx-core';
import { ChangeDetectorRef, Component, OnInit, Optional, Injector } from '@angular/core';
import { Notes } from '@shared/models/notes.model';

@Component({
  selector: 'app-save-note',
  templateUrl: './save-note.component.html',
  styleUrls: ['./save-note.component.scss']
})
export class SaveNoteComponent extends UIComponent implements OnInit {

  user: any;
  predicate = "CreatedBy=@0";
  dataValue = "";
  data = new Notes();
  header = 'Sổ tay cá nhân';
  dialog: any;

  constructor(private injector: Injector,
    private authStore: AuthStore,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() data?: DialogData,
    @Optional() dt?: DialogRef,
  ) {
    super(injector);
    this.dialog = dt;
    this.data = data?.data?.data;
    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
  }

  onInit(): void {
  }

  onEditNote(recID) {
    this.data.transID = recID;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.data?.recID, this.data])
      .subscribe((res) => {
        if (res) {
          this.dialog.close();
          this.changeDetectorRef.detectChanges();
        }
      });
  }

}
