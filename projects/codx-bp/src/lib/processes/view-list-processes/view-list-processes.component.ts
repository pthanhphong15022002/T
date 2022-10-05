import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-view-list-processes',
  templateUrl: './view-list-processes.component.html',
  styleUrls: ['./view-list-processes.component.css']
})
export class ViewListProcessesComponent implements OnInit {

  @Input() data?: any
  @Input() formModel?: FormModel;
  @Output() clickMoreFunction = new EventEmitter<any>();

  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) { }

  ngOnInit(): void {
  }

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({ e: e, data: dt })
  }
}
