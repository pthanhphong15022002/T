import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeViewComponent implements OnInit {
  @Input() data?: any
  @Input() formModel?: FormModel;

  @Output() clickMoreFunction = new EventEmitter<any>();
  
  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) { }

  ngOnInit(): void {
  }

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({e:e,data:dt})
  }
}
