import { FormGroup, FormControl } from '@angular/forms';
import { ApiHttpService, DialogData, DialogRef, ImageViewerComponent, CRUDService } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, Input, EventEmitter, ViewChild, Output, Optional } from '@angular/core';
import { NoteBooks } from '../../../model/NoteBooks.model';
import { NoteBookServices } from '../../../services/notebook.services';
@Component({
  selector: 'app-add-update-note-book',
  templateUrl: './add-update-note-book.component.html',
  styleUrls: ['./add-update-note-book.component.scss']
})
export class AddUpdateNoteBookComponent implements OnInit {

  title: any;
  memo: any;
  formAdd: FormGroup;
  readOnly = false;
  dialog: any;
  formType = '';
  formModel: any;
  data: any;
  header = 'Thêm mới sổ tay';

  noteBooks: NoteBooks = new NoteBooks();
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private noteBookService: NoteBookServices,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.dialog = dialog;
    this.formType = dt?.data[1];
    this.formModel = dialog?.formModel;
    if (this.formType == 'edit') {
      this.header = 'Cập nhật sổ tay';
      this.noteBooks = JSON.parse(JSON.stringify(this.dialog.dataService?.dataSelected));
      this.data = JSON.parse(JSON.stringify(this.dialog.dataService?.dataSelected));
    }
  }

  ngOnInit(): void {
  }

  valueChange(e) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      this.noteBooks[field] = dt?.value ? dt?.value : dt;
    }
  }


  saveNoteBooks() {
    if (this.formType == 'add') {
      this.addNoteBooks();
    } else this.updateNoteBook();
  }

  addNoteBooks() {
    this.api.exec<any>(
      'ERM.Business.WP',
      'NoteBooksBusiness',
      'CreateNoteBookAsync',
      this.noteBooks
    ).subscribe((res) => {
      if (res) {
        if (this.imageUpload) {
          this.imageUpload
            .updateFileDirectReload(res.recID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
                this.dialog.close();
                (this.dialog.dataService as CRUDService).add(res).subscribe();
              }
            });
        }
        else
          (this.dialog.dataService as CRUDService).add(res).subscribe();
      }
    })
  }

  updateNoteBook() {
    this.api.exec<any>(
      'ERM.Business.WP',
      'NoteBooksBusiness',
      'UpdateNoteBookAsync',
      this.noteBooks
    ).subscribe((res) => {
      if (res) {
        if (this.imageUpload) {
          this.imageUpload
            .updateFileDirectReload(this.data?.recID)
            .subscribe((result) => {
              (this.dialog.dataService as CRUDService).update(res).subscribe();
              this.loadData.emit();
            });
        } else {
          (this.dialog.dataService as CRUDService).update(res).subscribe();
        }
        this.dialog.close();
      }
    })
  }
}
