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
  data:any;
  calculationName:any;
  constructor(
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.currencies = dialog.dataService!.dataSelected;
    if (this.currencies.calculation == '0') {
      this.calculation = false;
    }else{
      this.calculation = true;
    }
  }
  //#endregion

  //#region Init
  ngOnInit(): void {
  }
  //#endregion

  //#region Function
  valueChangelb(e: any) {
    if (e.data) {
      this.currencies[e.field] = '1';
      this.calculation = true;
    }else{
      this.currencies[e.field] = '0';
      this.calculation = false;
    }
  }
  valueChange(e: any) {
      this.currencies[e.field] = e.data;
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
