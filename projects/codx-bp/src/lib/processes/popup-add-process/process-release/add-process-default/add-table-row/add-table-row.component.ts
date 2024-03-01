import { Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogData, DialogRef, Util } from 'codx-core';

@Component({
  selector: 'lib-add-table-row',
  templateUrl: './add-table-row.component.html',
  styleUrls: ['./add-table-row.component.css']
})
export class AddTableRowComponent implements OnInit{
  dialog:any;
  data:any[] = [];
  formModel:any;
  tableForm: FormGroup;
  constructor(
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.tableForm = new FormGroup({});
    this.formModel = dialog.formModel;
    this.dialog = dialog;
    this.data = dt?.data?.dataTable;
  }
  ngOnInit(): void {
    this.formatData();
  }

  formatData()
  {
    if(this.data)
    {
      this.data.forEach(element => {
        var field = element.fieldName.toLowerCase();
        this.tableForm.addControl(field, new FormControl(element.defaultValue ? element.defaultValue : "", (element.isRequired ? Validators.required : null)));
      });
    }
  }

  getField(key: string): string {
    if (!key) return '';
    key = key.toLowerCase();
    return Util.camelize(key);
  }

  
  editTable(index:any,e:any)
  {
    // if(typeof this.dataIns.datas[this.tableField][index] === 'string') {
    //   this.dataIns.datas[this.tableField][index] = {}
    // }
    // this.dataIns.datas[this.tableField][index][e?.field] = e?.data;
  }

  onSave()
  {
    this.tableForm.value.delete = true;
    this.tableForm.value.write = true;
    this.dialog.close(this.tableForm.value)
  }
}
