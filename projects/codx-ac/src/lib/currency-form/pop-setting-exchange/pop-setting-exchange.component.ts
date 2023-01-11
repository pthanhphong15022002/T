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
  headerText:string;
  dialog!: DialogRef;
  currencies: Currency;
  calculation : any;
  data:any;
  constructor(
    @Optional() dialogsetting?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    this.dialog = dialogsetting;
    this.headerText = dialogData.data?.headerText;
    this.currencies = dialogData.data?.data;
    if (this.currencies.calculation == '0') {
      this.calculation = false;
    }else{
      this.calculation = true;
    }
    
  }
  
  ngOnInit(): void {
  }
  valueChangelb(e: any) {
    
    if (e.data) {
      this.currencies[e.field] = '1';
      
    }else{
      this.currencies[e.field] = '0';
      
    }
  }
  valueChange(e: any) {
    if (e) {
      this.currencies[e.field] = e.data;
    }
  }
  onSave(){
    window.localStorage.setItem("dataexchange",JSON.stringify(this.currencies));
    var dataexchange = JSON.parse(localStorage.getItem('dataexchange'));
    if (dataexchange.Multiply !=null) {
      this.currencies.multiply = dataexchange.Multiply;
    }
    if (dataexchange.Calculation !=null) {
      this.currencies.calculation = dataexchange.Calculation;
    }
    this.dialog.close();
  }
}
