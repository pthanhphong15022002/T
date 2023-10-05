import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-add-ietables',
  templateUrl: './add-ietables.component.html',
  styleUrls: ['./add-ietables.component.css']
})
export class AddIetablesComponent implements OnInit {
  dialog:any;
  data:any;
  formModel:any;
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.formModel = 
    {
      formName: 'IETables',
      gridViewName: 'grvIETables'
    }
  }

  valueChange(e:any)
  {

  }
}
