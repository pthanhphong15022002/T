import { ApiHttpService, ImageViewerComponent } from 'codx-core';
import { Component, Input, OnInit, AfterViewInit, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { NoteBooks } from '../../../model/NoteBooks.model';

@Component({
  selector: 'app-update-note-book',
  templateUrl: './update-note-book.component.html',
  styleUrls: ['./update-note-book.component.scss']
})
export class UpdateNoteBookComponent implements OnInit, AfterViewInit {

  data: any;
  dataUpdate = new NoteBooks();
  title: any;
  memo: any;
  lstNoteBook: any = [];


  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();
  constructor(private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

  valueChange(e) {
    if (e) {
      var field = e.field;
      if (field == 'title') {
        this.title = e.data;
      } else if (field == 'memo') {
        this.memo = e.data.value;
      }
    }
  }

  updateNoteBook(data) {
    if (this.title != null) {
      this.dataUpdate.title = this.title;
      this.dataUpdate.memo = data?.memo;
    } else if (this.memo != null) {
      this.dataUpdate.title = data?.title;
      this.dataUpdate.memo = this.memo;
    } else {
      this.dataUpdate.title = data?.title;
      this.dataUpdate.memo = data?.memo;
    }

    this.api.exec<any>(
      'ERM.Business.WP',
      'NoteBooksBusiness',
      'UpdateNoteBookAsync',
      [data?.recID, this.dataUpdate]
    ).subscribe((res) => {
      var dt = res;
      if (dt) {
        this.imageUpload
          .updateFileDirectReload(data?.recID)
          .subscribe((result) => {
            if (result) {
              this.loadData.emit();
              this.changeDetectorRef.detectChanges();
            }
          });
        this.lstNoteBook.addHandler(dt, false, 'recID');
        this.changeDetectorRef.detectChanges();
      }
    })
  }
}
