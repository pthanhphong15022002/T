import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-add-process-default',
  templateUrl: './add-process-default.component.html',
  styleUrls: ['./add-process-default.component.css']
})
export class AddProcessDefaultComponent implements OnInit{
  process:any;
  data:any;
  dialog:any;
  table = [];
  constructor(
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  )
  {
    this.process = dt?.data;
    this.dialog = dialog;
  }
  ngOnInit(): void {
    this.getData();
  }

  getData()
  {
    this.data = this.process.steps.filter(x=>x.activityType == "Form")[0];
    this.data.settings = typeof this.data.settings === 'string' ? JSON.parse(this.data.settings) : this.data.settings;
  }

  formatData()
  {
  
  }
}
