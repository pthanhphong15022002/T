import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef } from 'codx-core';
import { AddImportDetailsComponent } from '../add-import-details/add-import-details.component';

@Component({
  selector: 'lib-add-ietables',
  templateUrl: './add-ietables.component.html',
  styleUrls: ['./add-ietables.component.css']
})
export class AddIetablesComponent implements OnInit {
  dialog:any;
  data:any = {};
  formModel:any;
  sourceField:any;
  selectedSheet:any;
  constructor(
    private callfunc: CallFuncService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
    this.sourceField = dt?.data?.sourceField;
    this.selectedSheet = dt?.data?.selectedSheet;
  }
  ngOnInit(): void {
    this.formModel = 
    {
      formName: 'IETables',
      gridViewName: 'grvIETables'
    }

    this.setValue();
  }

  setValue()
  {
    this.data.sourceTable = this.selectedSheet;
  }

  valueChange(e:any)
  {
    this.data[e?.fileName] = e?.data
  }

  openFormAddImportDetail()
  {
    this.callfunc.openForm(
      AddImportDetailsComponent,
      null,
      1000,
      800,
      '',
      [
        this.formModel,
        this.data,
        this.sourceField[0],
      ],
      null
    );
  }

  onSave()
  {
    this.dialog.close(this.data);
  }
}
