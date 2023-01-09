import { Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { Currency } from '../models/Currency.model';
import { PopAddCurrencyComponent } from '../pop-add-currency/pop-add-currency.component';

@Component({
  selector: 'lib-pop-setting-exchange',
  templateUrl: './pop-setting-exchange.component.html',
  styleUrls: ['./pop-setting-exchange.component.css']
})
export class PopSettingExchangeComponent implements OnInit {
  @ViewChild('Upload') Upload?:PopAddCurrencyComponent ;
  headerText:string;
  dialog!: DialogRef;
  currencies: Currency;
  fiedName : any;
  data:any;
  constructor(
    @Optional() dialogsetting?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    this.dialog = dialogsetting;
    this.headerText = dialogData.data?.headerText;
    this.currencies = dialogData.data?.data;
    this.fiedName = this.currencies.calculation;
    console.log(this.fiedName);
  }
  
  ngOnInit(): void {
  }
  valueChangelb(e: any) {
    // console.log(e.data)
    // // if (e.data) {
    // //   this.currencies[e.field] = '1';
    // //   this.fiedName = e.data;
    // // }else{
    // //   this.currencies[e.field] = '0';
    // //   this.fiedName = e.data;
    // // }
  }
  valueChange(e: any) {
    if (e) {
      this.currencies[e.field] = e.data;
    }
  }
  onSave(){
    
  }
}
