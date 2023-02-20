import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, Injector, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { CodxFormComponent, DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { Currency } from '../../models/Currency.model';
import { ExchangeRates } from '../../models/ExchangeRates.model';

@Component({
  selector: 'lib-pop-add-exchangerate',
  templateUrl: './pop-add-exchangerate.component.html',
  styleUrls: ['./pop-add-exchangerate.component.css']
})
export class PopAddExchangerateComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  @Input() headerText: string;
  dialog!: DialogRef;
  exchangerate:ExchangeRates;
  gridViewSetup:any;
  exchangeRate:any;
  sourceType:any;
  formtype:any;
  toDate:any;
  note:any;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef, 
    private notification: NotificationsService,
    @Optional() dialogadd?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    super(inject);
    this.dialog = dialogadd;
    this.headerText = dialogData.data?.headerText;
    this.exchangeRate = '';
    this.cache.gridViewSetup('ExchangeRates', 'grvExchangeRates').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (dialogData.data?.data != null) {
      this.exchangerate = dialogData.data?.data;
      this.toDate = dialogData.data?.data.toDate;
      this.exchangeRate = dialogData.data?.data.exchangeRate;
      this.sourceType = dialogData.data?.data.sourceType;
      this.note = dialogData.data?.data.note;   
    }
  }
//#endregion

  //#region Init
  onInit(): void {
    
  }
  ngAfterViewInit() {
    if (this.exchangerate == null) {
      this.exchangerate = this.form.formGroup.value;
      this.toDate = new Date();
      this.exchangerate.recID = Guid.newGuid();
      this.exchangerate.toTime = new Date();
    }
  }
  //#endregion

  //#region Function
  valueChangeexchangeRate(e:any){
    this.exchangeRate = e.data;
    this.exchangerate[e.field] = e.data;
  }
  valueChangeToDate(e:any){
    this.toDate = e.data.fromDate;
    this.exchangerate[e.field] = e.data.fromDate;
  }
  valueChangeSourceType(e:any){
    this.sourceType = e.data;
    this.exchangerate[e.field] = e.data;
  }
  valueChangeNote(e:any){
    this.note = e.data;
    this.exchangerate[e.field] = e.data;
  }
  //#endregion

  //#region CRUD
  onSave(){    
      if (this.exchangeRate.trim() == '' || this.exchangeRate == null) {
        this.notification.notifyCode(
          'SYS009',
          0,
          '"' + this.gridViewSetup['ExchangeRate'].headerText + '"'
        );
        return;
      }
      if (isNaN(this.exchangeRate)) {
        this.notification.notify("Tỷ giá phải là số","2");
        return;
      }
      window.localStorage.setItem("dataexchangeRate",JSON.stringify(this.exchangerate));
      this.dialog.close();  
  }
  //#endregion
}
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
