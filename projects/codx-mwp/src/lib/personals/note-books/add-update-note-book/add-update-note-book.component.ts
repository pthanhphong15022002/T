import { FormGroup, FormControl } from '@angular/forms';
import {
  ApiHttpService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  CRUDService,
  CacheService,
  CodxFormComponent,
  RequestOption,
} from 'codx-core';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  EventEmitter,
  ViewChild,
  Output,
  Optional,
} from '@angular/core';
import { NoteBooks } from '../../../model/NoteBooks.model';
import { NoteBookServices } from '../../../services/notebook.services';
@Component({
  selector: 'app-add-update-note-book',
  templateUrl: './add-update-note-book.component.html',
  styleUrls: ['./add-update-note-book.component.scss'],
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
  empty = '';
  gridViewSetup = {
    title: '',
    memo: '',
  };

  noteBooks: NoteBooks = new NoteBooks();
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild('form') form: CodxFormComponent;
  @Output() loadData = new EventEmitter();

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private noteBookService: NoteBookServices,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formType = dt?.data[1];
    this.formModel = dialog?.formModel;
    if (this.formType == 'edit') {
      this.header = 'Cập nhật sổ tay';
      this.noteBooks = JSON.parse(
        JSON.stringify(this.dialog.dataService?.dataSelected)
      );
      this.data = JSON.parse(
        JSON.stringify(this.dialog.dataService?.dataSelected)
      );
    }
    this.cache.gridViewSetup('NoteBooks', 'grvNoteBooks').subscribe((res) => {
      if (res) {
        this.gridViewSetup.title = res?.Title?.headerText;
        this.gridViewSetup.memo = res?.Memo?.headerText;
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
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
    console.log("check dialog noteBook", this.dialog);
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt), -1)
      .subscribe((res) => {
        if (res) {
          this.imageUpload
            .updateFileDirectReload(res.recID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
          this.dialog.close();
        }
      });
  }

  updateNoteBook() {
    this.dialog.dataService
      .save((opt: any) => this.beforeSave(opt))
      .subscribe((res) => {
        if (res) {
          if (this.imageUpload) {
            this.imageUpload
              .updateFileDirectReload(this.data?.recID)
              .subscribe((result) => {
                this.loadData.emit();
              });
          } else {
          }
          this.dialog.close();
        }
      });
  }

  beforeSave(op: RequestOption) {
    var data = [];
    op.service = 'WP';
    op.assemblyName = 'ERM.Business.WP';
    op.className = 'NoteBooksBusiness';
    if (this.formType == 'add') {
      op.methodName = 'CreateNoteBookAsync';
      data = [this.noteBooks];
    }
    if (this.formType == 'edit') {
      op.methodName = 'UpdateNoteBookAsync';
      data = [this.noteBooks];
    }
    op.data = data;
    return true;
  }
}
