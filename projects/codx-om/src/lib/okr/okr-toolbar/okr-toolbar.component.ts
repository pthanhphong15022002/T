import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ButtonModel } from 'codx-core';

@Component({
  selector: 'lib-okr-toolbar',
  templateUrl: './okr-toolbar.component.html',
  styleUrls: ['./okr-toolbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OkrToolbarComponent implements OnInit {

  button?: ButtonModel;
  @Output() click = new EventEmitter<string>();
  date = new Date();
  ops = ['m','q','y'];
  constructor() { }

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }
  buttonClick(event:any)
  {
    this.click.emit(event);
  }
  changeCalendar(event:any)
  {
    debugger;
  }
}
