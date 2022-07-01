import { FormGroup, FormControl } from '@angular/forms';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { SaveNoteComponent } from './save-note/save-note.component';
import {
  ApiHttpService,
  AuthStore,
  CallFuncService,
  DialogData,
  DialogRef,
  ImageViewerComponent,
} from 'codx-core';
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  Optional,
  EventEmitter,
  Output,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NoteGoal, Notes } from '@shared/models/notes.model';
@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss'],
})
export class AddNoteComponent implements OnInit {
  dataAdd = new Notes();
  dataUpdate = new Notes();
  note:  Notes = new Notes();
  message: any;
  listNote: any = [];
  type = 'text';
  label = 'Hiển thị trên lịch';
  showCalendar = false;
  pin = false;
  lstview: any = [];
  lstviewNotePin: any;
  typeList_: any;
  ngForLstview_: any;
  objectID: any;
  checkCreate = null;
  data: any;
  predicate = 'CreatedBy=@0';
  dataValue = '';
  user: any;
  dialog: any;
  formAdd: FormGroup;
  readOnly = false;

  @ViewChild('txtNoteEdit') txtNoteEdit: ElementRef;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @Output() loadData = new EventEmitter();
  @Output() closePopup = new EventEmitter();

  constructor(
    private api: ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    private callfc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.dialog = dialog;
    this.lstview = dt.data?.lstview;
    this.typeList_ = dt.data?.typeLst;
    this.ngForLstview_ = dt.data?.ngForLstview;
    this.lstviewNotePin = dt.data?.lstviewNotePin;
  }
  ngAfterViewInit() {
    console.log(this.imageUpload);
  }

  ngOnInit(): void {
    this.initForm();
  }

  valueProperty(e) {}

  initForm() {
    this.formAdd = new FormGroup({
      noteType: new FormControl(''),
      memo: new FormControl(''),
      checkList: new FormControl(''),
    });
    this.changeDetectorRef.detectChanges();
  }

  clearForm() {
    this.formAdd.controls['noteType'].setValue(null);
    this.formAdd.controls['memo'].setValue(null);
    this.formAdd.controls['checkList'].setValue(null);
    this.changeDetectorRef.detectChanges();
  }

  valueChange(e, item = null) {
    if (e) {
      var field = e.field;
      var dt = e.data;
      this.note[field] = dt?.value ? dt?.value : dt;
      // if (field == 'textarea') {
      //   this.message = e.data.value;
      // } else if (field == 'showCalendar') {
      //   this.showCalendar = e.data.checked;
      // } else if (field == 'status') {
      //   item['status'] = e.data.checked;
      // } else if (field == 'listNote') {
      //   this.listNote = item.checkList.listNote;
      // } else if (item) {
      //   this.message = '';
      //   this.checkCreate = '';
      //   item[field] = e.data;
      // }
    }
  }

  onCreateNote() {
    // if (this.type == 'check' || this.type == 'list') {
    //   this.dataAdd.memo = null;
    //   this.dataAdd.checkList = this.listNote;
    //   this.dataAdd.checkList.shift();
    // } else {
    //   this.dataAdd.checkList = null;
    //   this.dataAdd.memo = this.message;
    // }
    // this.dataAdd.showCalendar = this.showCalendar;

    this.note.noteType = this.type;
    this.note.isPin = this.pin;
    this.note;
    if (this.checkCreate != null || this.message != null) {
      this.api
        .exec<any>(
          'ERM.Business.WP',
          'NotesBusiness',
          'CreateNoteAsync',
          this.note
        )
        .subscribe((res) => {
          if (res) {
            var obj: any = { result: res };
            this.dialog.hide(obj);

            this.data = res;
            var dt = res;
            this.objectID = dt.recID;
            this.imageUpload
              .updateFileDirectReload(dt.recID)
              .subscribe((result) => {
                if (result) {
                  this.loadData.emit();
                  this.changeDetectorRef.detectChanges();
                }
              });

            this.lstview.addHandler(dt, true, 'recID');
            this.changeDetectorRef.detectChanges();

            if (this.showCalendar == true) {
              this.ngForLstview_.push(res);
              this.changeDetectorRef.detectChanges();

              var today: any = document.querySelector(
                ".e-footer-container button[aria-label='Today']"
              );
              if (today) {
                today.click();
              }
            }
          }
          this.closePopup.emit();
        });
    }
  }

  onType(type) {
    this.type = type;
    this.listNote = [];
    if (type == 'list' || type == 'check') {
      var todoCheck = { status: type == 'check' ? 0 : null, listNote: '' };
      this.listNote.push(todoCheck);
      this.changeDetectorRef.detectChanges();
    }
    this.changeDetectorRef.detectChanges();
  }

  onUpdateNote(item: NoteGoal) {
    this.listNote[0] = {
      status: this.type == 'check' ? 0 : null,
      listNote: '',
    };
    var dt = { status: item.status, listNote: item.listNote };
    this.listNote.push(Object.assign({}, dt));
    this.changeDetectorRef.detectChanges();
    var ele = document.getElementsByClassName('test-textbox');
    if (ele) {
      let htmlEle = ele[0] as HTMLElement;
      htmlEle.focus();
    }
  }

  isPin() {
    this.pin = !this.pin;
    this.changeDetectorRef.detectChanges();
  }

  onEditNote(recID) {
    if (this.type == 'check' || this.type == 'list') {
      this.dataUpdate.memo = null;
      this.dataUpdate.checkList = this.listNote;
    } else {
      this.dataUpdate.checkList = null;
      this.dataUpdate.memo = this.message;
    }
    this.dataUpdate.noteType = this.type;
    this.dataUpdate.isPin = false;
    this.dataUpdate.showCalendar = false;
    this.dataUpdate.transID = recID;
    this.api
      .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
        this.data.recID,
        this.dataUpdate,
      ])
      .subscribe((res) => {
        if (res) {
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  openFormNoteBooks() {
    var obj = {
      noteType: this.data.noteType,
      memo: this.data.memo,
      checkList: this.data.checkList,
      recID: this.data.recID,
    };
    this.callfc.openForm(SaveNoteComponent, 'Cập nhật ghi chú', 0, 0, '', obj);
  }
}
