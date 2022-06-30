import { DialogData, AuthStore, ApiHttpService } from 'codx-core';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { Notes } from '@shared/models/notes.model';

@Component({
  selector: 'app-save-note',
  templateUrl: './save-note.component.html',
  styleUrls: ['./save-note.component.scss']
})
export class SaveNoteComponent implements OnInit {

  user: any;
  predicate = "CreatedBy=@0";
  dataValue = "";
  memo: any;
  checkList: any;
  noteType: any;
  dataAdd = new Notes();
  dataUpdate = new Notes();
  objectID: any;
  recID: any;

  constructor(
    private authStore: AuthStore,
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() data?: DialogData,
  ) {
    this.user = this.authStore.get();
    this.dataValue = this.user?.userID;
    this.memo = data.data?.memo;
    this.checkList = data.data?.checkList;
    this.noteType = data.data?.noteType;
    this.recID = data.data?.recID;
   }

  ngOnInit(): void {
  }

  onEditNote(recID) {
    if (this.noteType == "check" || this.noteType == "list") {
      this.dataUpdate.memo = null;
      this.dataUpdate.checkList = this.checkList;

    } else {
      this.dataUpdate.checkList = null;
      this.dataUpdate.memo = this.memo;
    }
    this.dataUpdate.isPin = false;
    this.dataUpdate.showCalendar = false;
    this.dataUpdate.transID = recID;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.recID, this.dataUpdate])
      .subscribe((res) => {
        if (res) {
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  saveNote(recID) {
    this.onEditNote(recID);
  }

}
