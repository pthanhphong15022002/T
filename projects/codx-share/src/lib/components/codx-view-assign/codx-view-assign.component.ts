import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-assign',
  templateUrl: './codx-view-assign.component.html',
  styleUrls: ['./codx-view-assign.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxViewAssignComponent implements OnInit {
  @Input() formModel?: FormModel;
  @Input() dataTree = [];
  @Input() vllStatus = "TMT004" ;
  dialog :any
  constructor() { }

  ngOnInit(): void {
  }

}
