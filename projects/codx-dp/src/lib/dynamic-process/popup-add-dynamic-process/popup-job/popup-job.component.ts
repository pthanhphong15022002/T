import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-popup-job',
  templateUrl: './popup-job.component.html',
  styleUrls: ['./popup-job.component.scss']
})
export class PopupJobComponent implements OnInit {
  title = "thuan"
  dialog!: DialogRef;
  formModelMenu: FormModel;
  job = [];
  stepType = '';
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ){

   }
  ngOnInit(): void {
  }
  valueChange(e) {
    
  }


}
