import { Component, Input, OnInit } from '@angular/core';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-view-assign',
  templateUrl: './codx-view-assign.component.html',
  styleUrls: ['./codx-view-assign.component.css']
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
