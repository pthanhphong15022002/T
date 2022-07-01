import { FormGroup, FormControl } from '@angular/forms';
import { ApiHttpService, DialogData, DialogRef, ImageViewerComponent } from 'codx-core';
import { Component, OnInit, ChangeDetectorRef, Input, EventEmitter, ViewChild, Output, Optional } from '@angular/core';
import { NoteBooks } from '../../../model/NoteBooks.model';
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
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.dialog = dialog;
    this.formType = dt?.data[1];
    this.formModel = dialog?.formModel;
    if (this.formType == 'edit') {
      this.header = 'Cập nhật sổ tay';
      this.noteBooks = this.dialog.dataService?.dataSelected;
      this.data = this.dialog.dataService?.dataSelected;
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  valueChange(e) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      this.noteBooks[field] = dt?.value ? dt?.value : dt;
    }
  }

  initForm() {
    this.formAdd = new FormGroup({
      title: new FormControl(''),
      memo: new FormControl(''),
    });
    this.changeDetectorRef.detectChanges();
  }

  clearForm() {
    this.formAdd.controls['title'].setValue(null);
    this.formAdd.controls['memo'].setValue(null);
    this.changeDetectorRef.detectChanges();
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
        this.imageUpload
          .updateFileDirectReload(res.recID)
          .subscribe((result) => {
            if (result) {
              this.initForm();
              this.clearForm();
              this.loadData.emit();
              this.dialog.close();
              this.dialog.dataService.data.push(res);
              this.changeDetectorRef.detectChanges();
            }
          });
      }
    })
  }

  updateNoteBook() {
    this.dialog.dataService.save().subscribe(res => {
      this.dialog.dataService.setDataSelected(res);
      this.loadData.emit();
      this.dialog.close();
    })
    // this.api.exec<any>(
    //   'ERM.Business.WP',
    //   'NoteBooksBusiness',
    //   'UpdateNoteBookAsync',
    //   [this.data?.recID, this.noteBooks]
    // ).subscribe((res) => {
    //   if (res) {
    //     this.imageUpload
    //       .updateFileDirectReload(this.data?.recID)
    //       .subscribe((result) => {
    //         if (result) {
    //           this.loadData.emit();
    //           this.dialog.close();
    //           this.changeDetectorRef.detectChanges();
    //         }
    //       });
    //     this.dialog.close();
    //     this.changeDetectorRef.detectChanges();
    //   }
    // })
  }
}
