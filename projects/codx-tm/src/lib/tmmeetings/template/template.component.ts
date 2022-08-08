import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {

  dialog: any;
  data: any;
  title: '';
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.dialog = dialog;
    this.data = dt?.data;
  }

  ngOnInit(): void {
  }

}
