import { ApiHttpService, DialogData } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, Input, Optional, ViewChild } from '@angular/core';
import { UpdateDetailNoteBookComponent } from '../update-detail-note-book/update-detail-note-book.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';

@Component({
  selector: 'app-add-detail-note-books',
  templateUrl: './add-detail-note-books.component.html',
  styleUrls: ['./add-detail-note-books.component.scss']
})
export class AddDetailNoteBooksComponent implements OnInit {

  title: any;
  memo: any;
  recID: any
  lstNote: any = [];
  checkUpdate = false;

  @ViewChild('attachment') attachment: AttachmentComponent
  @ViewChild('file') file: UpdateDetailNoteBookComponent

  constructor(private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    public atSV: AttachmentService,
    @Optional() data?: DialogData) {
    this.recID = data.data?.recID;
    this.lstNote = data.data?.lstNote;
  }

  ngOnInit(): void {
  }

  valueChange(e) {
    if (e) {
      var field = e.field;
      if (field == "title") {
        this.title = e.data;
      } else if (field == "memo") {
        this.memo = e.data.value;
      }
    }
  }

  addNoteBookDetails() {
    this.api.exec<any>(
      'ERM.Business.WP',
      'NoteBooksBusiness',
      'CreateNoteBookDetailsAsync',
      [this.recID, this.title, this.memo]
    ).subscribe((res) => {
      if (res) {
        var dt = res;
        this.lstNote.addHandler(dt, true, 'recID');
      }
    })
  }

  popup(evt: any) {
    this.attachment.openPopup();
  }

  fileAdded(e) {
    this.checkUpdate = true;
    this.file.file = e;
    console.log("CHECK asdasasd", this.file.file)
  }
}
