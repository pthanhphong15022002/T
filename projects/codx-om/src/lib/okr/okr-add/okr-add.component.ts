import { Component, OnInit, Optional } from '@angular/core';
import { DialogRef , DialogData} from 'codx-core';

@Component({
  selector: 'lib-okr-add',
  templateUrl: './okr-add.component.html',
  styleUrls: ['./okr-add.component.css']
})
export class OkrAddComponent implements OnInit {

  title = "Thêm bộ mục tiêu";
  dialog:any;
  formModel: any
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    //FormModel
    if(dt?.data[0]) this.formModel = dt?.data[0]
    this.dialog =  dialog;
  }

  ngOnInit(): void {
    alert(this.formModel?.funcID)
  }

}
