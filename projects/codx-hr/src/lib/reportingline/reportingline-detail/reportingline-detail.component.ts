import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-reportingline-detail',
  templateUrl: './reportingline-detail.component.html',
  styleUrls: ['./reportingline-detail.component.css']
})
export class ReportinglineDetailComponent implements OnInit {

  dialogData:any;
  dialogRef:DialogRef = null;
  title:string = "Chi tiết"
  constructor(
    @Optional() dialogData?:DialogData,
    @Optional() dialogRef?:DialogRef
  ) 
  {
    this.dialogData = dialogData.data;
    this.dialogRef = dialogRef;
  }

  ngOnInit(): void {
  }


  clickClosePopup(){
    this.dialogRef.close();
  }
}
