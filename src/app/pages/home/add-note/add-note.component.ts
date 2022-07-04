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
  note: Notes = new Notes();
  message: any;
  listNote: any = [];
  type = 'text';
  label = 'Hiển thị trên lịch';
  showCalendar = false;
  pin = false;
  // lstview: any = [];
  // lstviewNotePin: any;
  // typeList_: any;
  // ngForLstview_: any;
  formType = '';
  data: any;
  predicate = 'CreatedBy=@0';
  dataValue = '';
  user: any;
  dialog: any;
  formAdd: FormGroup;
  readOnly = false;

  @ViewChild('txtNoteEdit') txtNoteEdit: ElementRef;
  @ViewChild('imageUpLoad') imageUpload: ImageViewerComponent;
  @ViewChild("form", { static: true }) form: any;
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
    this.data = dt.data?.data;
    this.formType = dt.data?.formType;
    if(this.formType == 'edit') {
      this.note = dt.data?.dataUpdate;
    }
    // this.typeList_ = dt.data?.typeLst;
    // this.ngForLstview_ = dt.data?.ngForLstview;
    // this.lstviewNotePin = dt.data?.lstviewNotePin;
  }
  ngAfterViewInit() {
    console.log(this.imageUpload);
  }

  ngOnInit(): void {
    this.initForm();
  }

  saveNote() {
    if(this.formType == 'add') this.onCreateNote();
    else this.onEditNote();
  }

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
    this.api
      .exec<any>(
        'ERM.Business.WP',
        'NotesBusiness',
        'CreateNoteAsync',
        this.note
      )
      .subscribe((res) => {
        if (res) {
          this.imageUpload
            .updateFileDirectReload(res?.recID)
            .subscribe((result) => {
              if (result) {
                this.loadData.emit();
              }
            });
          this.data.push(res);
          if (this.note?.showCalendar == true) {
            debugger;
            this.changeDetectorRef.detectChanges();
            var today: any = document.querySelector(
              ".e-footer-container button[aria-label='Today']"
            );
            if (today) {
              today.click();
            }
          }
        }
      });
  }

  onEditNote() {
    // if (this.itemUpdate.noteType == "check" || this.itemUpdate.noteType == "list") {
    //   this.dataAdd.memo = null;
    //   this.dataAdd.checkList = this.listNote;

    // } else {
    //   this.dataAdd.checkList = null;
    //   this.dataAdd.memo = this.message;
    // }
    // this.dataAdd.noteType = this.itemUpdate.noteType;
    // this.dataAdd.isPin = this.itemUpdate.isPin;
    // this.dataAdd.showCalendar = this.itemUpdate.showCalendar;
    this.note;
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "UpdateNoteAsync", [this.note?.recID, this.note])
      .subscribe((res) => {
        if (res) {
          for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].recID == this.note?.recID) {
              // this.data[i].checkList = res.checkList;
              this.data[i].memo = res.memo;
            }
          }
          this.changeDetectorRef.detectChanges();
        }
      });
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
    var a = this.note
    var b = this.form;
    debugger;
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

  // onEditNote(recID) {
  //   if (this.type == 'check' || this.type == 'list') {
  //     this.dataUpdate.memo = null;
  //     this.dataUpdate.checkList = this.listNote;
  //   } else {
  //     this.dataUpdate.checkList = null;
  //     this.dataUpdate.memo = this.message;
  //   }
  //   this.dataUpdate.noteType = this.type;
  //   this.dataUpdate.isPin = false;
  //   this.dataUpdate.showCalendar = false;
  //   this.dataUpdate.transID = recID;
  //   this.api
  //     .exec<any>('ERM.Business.WP', 'NotesBusiness', 'UpdateNoteAsync', [
  //       this.data.recID,
  //       this.dataUpdate,
  //     ])
  //     .subscribe((res) => {
  //       if (res) {
  //         this.changeDetectorRef.detectChanges();
  //       }
  //     });
  // }

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
