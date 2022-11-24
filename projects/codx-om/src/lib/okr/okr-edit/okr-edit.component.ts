import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-okr-edit',
  templateUrl: './okr-edit.component.html',
  styleUrls: ['./okr-edit.component.css']
})
export class OkrEditComponent implements OnInit {

  dataOKR : any;
  data : any;
  dialog : any;
  headerText = "Chỉnh sửa mục tiêu";
  gridView: any;
  formModel: any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    if(dt?.data[0]) this.gridView = dt?.data[0];
    if(dt?.data[1]) this.formModel = dt?.data[1];
   }

  ngOnInit(): void {
  }

}
