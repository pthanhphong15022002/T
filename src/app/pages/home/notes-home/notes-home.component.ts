import { DomSanitizer } from '@angular/platform-browser';
import { Notes } from './../../../modules/wp/model/notes';
import { ApiHttpService } from 'codx-core';
import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { ChangedEventArgs } from '@syncfusion/ej2-calendars';
import { addClass } from '@syncfusion/ej2-base';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-notes-home',
  templateUrl: './notes-home.component.html',
  styleUrls: ['./notes-home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotesHomeComponent implements OnInit {
  @Input() dataAdd = new Notes();
  data: any;
  message: any;
  constructor(
    private api: ApiHttpService,
    private modalService: NgbModal,
  ) {
    this.onGetListNote()
  }

  ngOnInit(): void {
  }

  onLoad(args): void {
    let span: HTMLElement;
    //defines the custom HTML element to be added.
    span = document.createElement('span');
    //Use "e-icons" class name to load Essential JS 2 built-in icons.
    if (args.date.getDate() === 29) {
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

  onGetListNote() {
    let i = 0;
    this.api
    .exec<any>("ERM.Business.WP", "NotesBusiness", "GetListAsync")
    .subscribe((res) => {
      this.data = res;
      for(i; i <= res.length; i++)
      {
        //console.log("CHECK get date", res[i].createdOn)
        var date = "2022-04-22T02:12:18.256Z";
        console.log("CHECK date", date)
      }
      console.log("CHECK list note", res);
    });
  }

  openFormAddNote(content) {
    this.modalService.open(content, { centered: true });
  }

  valueChange(e) {
    this.message = e.data;
    console.log("CHECK valueChange", e.data);
  }

  onCreateNote() {
    this.dataAdd.memo = this.message,
    console.log("CHECK this.data", this.dataAdd);
    this.api
    .exec<any>("ERM.Business.WP", "NotesBusiness", "CreateNoteAsync", this.dataAdd)
    .subscribe((res) => {
      console.log("CHECK add note", res);
    });
  }

  onDeleteNote(recID) {
    this.api
    .exec<any>("ERM.Business.WP", "NotesBusiness", "DeleteNoteAsync", recID)
    .subscribe((res) => {
      console.log("CHECK delete note", res);
    });
  }

}
