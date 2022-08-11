import { Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'codx-references',
  templateUrl: './codx-references.component.html',
  styleUrls: ['./codx-references.component.css']
})
export class CodxReferencesComponent implements OnInit {
  @Input() formModel?: FormModel;
  @Input() dataTree = [];
  dialog :any
  // popoverList: any;
  // popoverDetail: any;
  // lstTaskbyParent = [];
  // @Output() clickMoreFunction = new EventEmitter<any>();

  constructor(
    private api: ApiHttpService,
    private callfc : CallFuncService ,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {}

  ngOnInit(): void {
   
  }
  ngAfterViewInit(): void {
  }

  // clickMF(e: any, dt?: any) {
  //   this.clickMoreFunction.emit({ e: e, data: dt });
  // }

}
