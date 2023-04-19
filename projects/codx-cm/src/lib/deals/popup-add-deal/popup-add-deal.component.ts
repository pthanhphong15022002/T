import { Component, OnInit, Optional } from '@angular/core';
import { DialogRef, DialogData } from 'codx-core';

@Component({
  selector: 'lib-popup-add-deal',
  templateUrl: './popup-add-deal.component.html',
  styleUrls: ['./popup-add-deal.component.scss']
})
export class PopupAddDealComponent  implements OnInit {

  // setting values in system
   dialog: DialogRef;
   //type any
   formModel:any;
   // type string
   titleAction:string = '';

   // Data struct Opportunity
    opportunity: any;

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

