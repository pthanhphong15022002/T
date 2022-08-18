import { Component, Input, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogRef, DialogData } from 'codx-core';

@Component({
  selector: 'lib-codx-alert',
  templateUrl: './codx-alert.component.html',
  styleUrls: ['./codx-alert.component.scss']
})
export class CodxAlertComponent implements OnInit {

  funcID:string = "";
  dialog:DialogRef = null;
  constructor(
    private route:ActivatedRoute,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) 
  {
    this.dialog = dialog;
    this.funcID = data.data;
  }

  ngOnInit(): void { 

  }

}
