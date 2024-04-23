import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef } from 'codx-core';
import { AddImportDetailsComponent } from '../add-import-details/add-import-details.component';

@Component({
  selector: 'lib-add-ietables',
  templateUrl: './add-ietables.component.html',
  styleUrls: ['./add-ietables.component.css']
})
export class AddIetablesComponent implements OnInit {
  type:any;
  dialog:any;
  data:any = {};
  formModel:any;
  formModels:any;
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
    this.type = dt?.data?.type;
    this.sourceField = dt?.data?.sourceField;
    this.selectedSheet = dt?.data?.selectedSheet;
    this.formModel = dt?.data?.formModel;
    if(this.type == "edit") this.data =  dt?.data?.data;
    this.formModels = 
    {
      formName: 'IETables',
      gridViewName: 'grvIETables'
    }
  }
  ngOnInit(): void {
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

  openFormAddImportDetail(data:any , type = 'new')
  {
    if(type == 'edit' && !data?.mappingTemplate) return;

    let formModel =
    {
      formName: this.formModel?.formName,
      gridViewName: this.formModel?.gridViewName
    }

    let entityName = data?.destinationTable;
    if(entityName)
    {
      let formName = entityName.split("_")[1];
      let gridViewName = 'grv' + formName;
  
      if(formName) formModel.formName = formName;
      if(gridViewName) formModel.gridViewName = gridViewName;
    }

    this.callfunc.openForm(
      AddImportDetailsComponent,
      null,
      1000,
      800,
      '',
      [
        formModel,
        this.data,
        this.sourceField[0],
        data?.mappingTemplate,
        type
      ],
      null
    );
  }

  onSave()
  {
    this.dialog.close(this.data);
  }
}
