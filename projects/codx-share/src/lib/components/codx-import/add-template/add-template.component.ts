import { Component, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-add-template',
  templateUrl: './add-template.component.html',
  styleUrls: ['./add-template.component.scss']
})
export class AddTemplateComponent implements OnInit{

  dialog:any;
  formModel:any;
  formModels:any;
  importAddTmpGroup: FormGroup;
  submitted = false;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
    this.formModel = dt.data[1];
  }
  ngOnInit(): void {
    this.formModels = {
      formName: 'IEConnections',
      gridViewName: 'grvIEConnections',
    };
    this.importAddTmpGroup = this.formBuilder.group({
      nameTmp: ['', Validators.required],
      sheetImport: '',
      password: [''],
      firstCell: 1,
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.importAddTmpGroup.controls;
  }
  
  close()
  {
    this.dialog.close();
  }
}
