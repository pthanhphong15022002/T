import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-okr-add',
  templateUrl: './okr-add.component.html',
  styleUrls: ['./okr-add.component.css']
})
export class OkrAddComponent implements OnInit {

  dataOKR : any;
  data : any;
  dialog : any;
  headerText = "Thêm mới mục tiêu";
  gridView: any;
  formModel: any;
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    if(dt?.data[0]) this.gridView = dt?.data[0];
    if(dt?.data[1]) this.formModel = dt?.data[1];
    if(dt?.data[2]) this.headerText = dt?.data[2];
   
   }

  ngOnInit(): void {
    
  }
  onSaveForm(){
    
  }
}
