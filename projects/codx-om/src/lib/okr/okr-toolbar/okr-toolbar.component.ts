import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModel } from 'codx-core';

@Component({
  selector: 'lib-okr-toolbar',
  templateUrl: './okr-toolbar.component.html',
  styleUrls: ['./okr-toolbar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OkrToolbarComponent implements OnInit {

  button?: ButtonModel;

  constructor() { }

  ngOnInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

}
