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
  objectID: any;
  formAdd: FormGroup;
  readOnly = false;
  lstNoteBook: any = [];
  dialog: any;
  formType = '';

  @Input() dataAdd = new NoteBooks();
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
  }

  ngOnInit(): void {
    this.initForm();
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

  addNoteBooks() {
    this.dataAdd.title = this.title;
    this.dataAdd.memo = this.memo;

    this.api.exec<any>(
      'ERM.Business.WP',
      'NoteBooksBusiness',
      'CreateNoteBookAsync',
      this.dataAdd
    ).subscribe((res) => {
      if (res) {
        var dt = res;
        this.objectID = dt.recID;
        this.imageUpload
          .updateFileDirectReload(this.objectID)
          .subscribe((result) => {
            if (result) {
              this.initForm();
              this.clearForm();
              this.objectID = '';
              this.loadData.emit();

              this.dialog.dataService.data.push(dt);
              this.changeDetectorRef.detectChanges();
            }
          });
      }
    })
  }
}
