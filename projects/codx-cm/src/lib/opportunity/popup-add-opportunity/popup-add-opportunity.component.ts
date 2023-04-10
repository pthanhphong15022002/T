import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CM_Opportunities } from '../../models/cm_model';

@Component({
  selector: 'lib-popup-add-opportunity',
  templateUrl: './popup-add-opportunity.component.html',
  styleUrls: ['./popup-add-opportunity.component.scss']
})
export class PopupAddOpportunityComponent implements OnInit {

 // setting values in system
  dialog: DialogRef;
  //type any
  formModel:any;
  // type string
  titleAction:string = '';

  // Data struct Opportunity
  opportunity: CM_Opportunities;

  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef

  ) {
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.titleAction = dt?.data?.titleAction;
   }


  ngOnInit(): void {
  }


  valueChange($event){

  }
  saveOpportunity(){

  }
  cbxChange($event){

  }
}
