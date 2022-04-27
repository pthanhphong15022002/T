
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService } from 'codx-core';
import { Component, ViewEncapsulation, OnInit, Input, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ChangedEventArgs } from '@syncfusion/ej2-calendars';
import { addClass } from '@syncfusion/ej2-base';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Console } from 'console';
import { StatusNote } from '@shared/models/enum/enum';
import { NoteGoal, Notes } from '@shared/models/notes.model';
@Component({
  selector: 'app-notes-home',
  templateUrl: './notes-home.component.html',
  styleUrls: ['./notes-home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotesHomeComponent implements OnInit, AfterViewInit {
  @Input() dataAdd = new Notes();
  data: any;
  message: any;
  listNote: any[] = [];
  indexEditNote = -1;
  contentNoteEdit = "";
  noteAddText: any;
  check: any;
  disabled: boolean = true;
  isUpdate = false;
  type: any;
  lock = false;
  getDate = {};
  getMonth: any;
  getYear: any;
  isCalendar = false;
  count = 0;
  num = 0;

  STATUS_NOTE = StatusNote;

  @ViewChild("txtNoteEdit") txtNoteEdit: ElementRef;
  @ViewChild('listview') lstView: any;
  constructor(
    private api: ApiHttpService,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    //this.onGetListNote()
  }
  ngAfterViewInit() {

  }

  ngOnInit(): void {
    console.log("CHECK listView", this.lstView);
  }

  onLoad(args): void {
    let span: HTMLElement;
    span = document.createElement('span');
    if (args.date.getDate() === this.getDate && args.date.getMonth() === this.getMonth && args.date.getFullYear() === this.getYear) {
      let span: HTMLElement;
      span = document.createElement('span');
      span.setAttribute('class', 'e-icons blue');
      addClass([args.element], ['special', 'e-day', 'birthday']);
      args.element.firstElementChild.setAttribute('title', 'Birthday !');
      args.element.setAttribute('title', ' Birthday !');
      args.element.setAttribute('data-val', 'Birthday!');
      args.element.appendChild(span);
    }
    if (args.date.getDate() === 15) {
      let span: HTMLElement;
      span = document.createElement('span');
      span.setAttribute('class', 'e-icons red');
      addClass([args.element], ['special', 'e-day', 'farewell']);
      args.element.firstElementChild.setAttribute('title', 'Farewell !');
      args.element.setAttribute('title', 'Farewell !');
      args.element.setAttribute('data-val', 'Farewell!');
      args.element.appendChild(span);
    }
  }
  onValueChange(args: any) {
    let title: string = '';
    if (args.event) {
      /*Displays selected date in the label*/
      title = args.event.currentTarget.getAttribute('data-val');
      title = title == null ? "" : " ( " + title + " )";
    }
    (document.getElementById('selected')).textContent = 'Selected Value: ' + args.value.toLocaleDateString() + title;
  }

  onGetListNote(item) {
    var date = item.createdOn;
    var dateParse = new Date(Date.parse(date));
    this.getDate = dateParse.getDate();
    this.getMonth = dateParse.getMonth();
    this.getYear = dateParse.getFullYear();
  }

  openFormAddNote(content) {
    this.modalService.open(content, { centered: true });
  }

  valueChange(e, item = null) {
    if (e) {
      var field = e.field;
      if (field == "textarea")
        this.message = e.data;
      else if (item) {
        this.message = "";
        item[field] = e.data;
      }
    }

  }

  onCreateNote() {
    if (this.type == "check" || this.type == "list") {
      this.dataAdd.memo = null;
      this.dataAdd.checkList = this.listNote;
      this.dataAdd.checkList.shift();

    } else {
      this.dataAdd.checkList = null;
      this.dataAdd.memo = this.message
    }
    console.log("CHECK this.dataAdd", this.dataAdd)
    if (this.dataAdd.checkList != null && this.dataAdd.memo != undefined) {
      this.api
        .exec<any>("ERM.Business.WP", "NotesBusiness", "CreateNoteAsync", this.dataAdd)
        .subscribe((res) => {
        });
    }
    this.listNote = [];
  }

  onDeleteNote(recID) {
    this.api
      .exec<any>("ERM.Business.WP", "NotesBusiness", "DeleteNoteAsync", recID)
      .subscribe((res) => {
      });
  }
  onType(type) {
    this.type = type;
    this.listNote = [];
    if (type == "list" || type == "check") {
      var todoCheck = { "status": type != "check" ? null : 0, "listNote": "" };
      this.listNote.push(todoCheck);
      this.changeDetectorRef.detectChanges();
    }
  }

  onUpdateNote(item: NoteGoal) {
    var dt = { "status": item.status, "listNote": item.listNote };
    this.listNote.push(Object.assign({}, dt));
    this.changeDetectorRef.detectChanges();
  }
}
