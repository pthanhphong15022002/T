import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, Injector, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';
import { Currency } from '../models/Currency.model';
import { ExchangeRates } from '../models/ExchangeRates.model';

@Component({
  selector: 'lib-pop-add-exchangerate',
  templateUrl: './pop-add-exchangerate.component.html',
  styleUrls: ['./pop-add-exchangerate.component.css']
})
export class PopAddExchangerateComponent extends UIComponent implements OnInit {
  @Input() headerText: string;
  dialog!: DialogRef;
  exchangerate:ExchangeRates;
  gridViewSetup:any;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef, 
    @Optional() dialogadd?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    super(inject);
    this.dialog = dialogadd;
    this.headerText = dialogData.data?.headerText;
    // this.cache.gridViewSetup('ExchangeRates', 'grvExchangeRates').subscribe((res) => {
    //   if (res) {
    //    console.log(this.gridViewSetup);
    //   }
    // });
  }

  onInit(): void {
  }
  onSave(){
    
  }
}
