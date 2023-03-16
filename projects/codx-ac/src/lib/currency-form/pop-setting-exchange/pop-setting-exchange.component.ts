import { Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { DialogData, DialogRef, NotificationsService } from 'codx-core';
import { Currency } from '../../models/Currency.model';
import { PopAddCurrencyComponent } from '../pop-add-currency/pop-add-currency.component';

@Component({
  selector: 'lib-pop-setting-exchange',
  templateUrl: './pop-setting-exchange.component.html',
  styleUrls: ['./pop-setting-exchange.component.css']
})
export class PopSettingExchangeComponent implements OnInit {
  //#region Contructor
  headerText:string;
  dialog!: DialogRef;
  currencies: Currency;
  calculation : any;
  currentdate:any;
  forwarddate:any;
  data:any;
  multiplication:any;
  division:any;
  constructor(
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.currencies = dialogData.data?.data;
    if (this.currencies.calculation == '1') {
      this.currentdate = true;
    }else{
      this.forwarddate = true;
    }
    if (this.currencies.multi) {
      this.multiplication = true;
    }else{
      this.division = true;
    }
  }
  //#endregion

  //#region Init
  ngOnInit(): void {
  }
  //#endregion

  //#region Function
  valueChangeCalculation(e: any) {
    if (e.component.name == 'currentdate') {
      if (e.data) {
        this.currentdate = e.data;  
        this.forwarddate = false;
        this.currencies[e.field] = '1'; 
      }
    }else{
      if (e.data) {
        this.forwarddate = e.data;  
        this.currentdate = false;
        this.currencies[e.field] = '2'; 
      }
    }
  }
  valueChangeMulti(e: any) {
    if (e.component.name == 'multiplication') {
      if (e.data) {
        this.multiplication = e.data;  
        this.division = false;
        this.currencies[e.field] = true; 
      }
    }else{
      if (e.data) {
        this.division = e.data;  
        this.multiplication = false;
        this.currencies[e.field] = false; 
      }
    }
  }
  //#endregion
  
  //#region CRUD
  onSave(){
    this.notification.notifyCode('DP007', 0, '');
    window.localStorage.setItem("dataexchange",JSON.stringify(this.currencies));
    this.dialog.close();
  }
  //#endregion
}
