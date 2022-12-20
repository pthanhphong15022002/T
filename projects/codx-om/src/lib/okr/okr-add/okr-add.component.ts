import { AfterViewInit, Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-okr-add',
  templateUrl: './okr-add.component.html',
  styleUrls: ['./okr-add.component.css']
})
export class OkrAddComponent implements OnInit , AfterViewInit{

  dataOKR : any;
  data : any;
  dialog : any;
  headerText = "Thêm mới mục tiêu";
  gridView: any;
  formModel: any;
  okrAddGroup: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    if(dt?.data[0]) this.gridView = dt?.data[0];
    if(dt?.data[1]) this.formModel = dt?.data[1];
    if(dt?.data[2]) this.headerText = dt?.data[2];
   
   }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    //Tạo formGroup
    this.okrAddGroup = this.formBuilder.group({
      shares: '5',
    });
    this.dataOKR = {
      okrName : "",
      note: ""
    }
  }
  onSaveForm(){
    debugger;
    var a = this.dataOKR;
    var b = this.okrAddGroup.value;
  }
}
