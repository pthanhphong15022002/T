import { ApiHttpService, DialogData } from 'codx-core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'app-update-detail-note-book',
  templateUrl: './update-detail-note-book.component.html',
  styleUrls: ['./update-detail-note-book.component.scss']
})
export class UpdateDetailNoteBookComponent implements OnInit {

  data: any;
  title:any;
  memo:any;
  lstNote: any = [];
  file: any = [];

  @ViewChild('attachment') attachment: AttachmentComponent

  constructor(
    private api: ApiHttpService,
    @Optional() data?: DialogData
  ) { 
    this.data = data.data?.item;
    this.lstNote = data.data?.lstNote;
  }

  ngOnInit(): void {
  }

  valueChange(e) {
    if(e) {
      var field = e.field;
      if(field == 'title') {
        this.title = e.data;
      } else if(field == 'memo') {
        this.memo = e.data.value;
      }
    }
  }

  popup(evt: any) {
    this.attachment.openPopup();
    console.log("CHECK file", this.file);
  }

  updateNote() {
    if(this.title == null) {
      this.title = this.data?.title;
    } else if(this.memo == null) {
      this.memo = this.data?.memo;
    }
    this.api.exec<any>(
      'ERM.Business.WP',
      'NoteBooksBusiness',
      'UpdateNoteBookDetailAsync',
      [this.data?.recID, this.title, this.memo]
    ).subscribe((res) => {
      if (res) {
        var dt = res;
        this.lstNote.addHandler(dt, false, 'recID');
      }
    })
  }

}
