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
  @ViewChild('form') public form: CodxFormComponent;
  @Input() headerText: string;
  dialog!: DialogRef;
  exchangerate:ExchangeRates;
  gridViewSetup:any;
  exchangeRate:any;
  SourceType:any;
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
    this.exchangeRate ='';
    this.formtype = dialogData.data?.formtype;
    this.cache.gridViewSetup('ExchangeRates', 'grvExchangeRates').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (dialogData.data?.dataex != null) {
      this.exchangerate = dialogData.data?.dataex;
      this.exchangeRate = dialogData.data?.dataex.exchangeRate;
      this.SourceType = dialogData.data?.dataex.sourceType;
      this.note = dialogData.data?.dataex.note;   
    }
  }

  onInit(): void {
    
  }
  ngAfterViewInit() {
    this.exchangerate = this.form.formGroup.value;
  }
  valueChange(e:any){
    this.exchangeRate = e.data;
    this.exchangerate[e.field] = this.exchangeRate;
  }
  valueChangeSourceType(e:any){
    this.SourceType = e.data;
    this.exchangerate[e.field] = this.SourceType;
  }
  valueChangeNote(e:any){
    this.note = e.data;
    this.exchangerate[e.field] = this.note;
  }
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
      if (this.formtype == 'addexrate') {
        this.exchangerate.toDate = this.form.formGroup.value.toDate;
      }
      window.localStorage.setItem("dataexchangeRate",JSON.stringify(this.exchangerate));
    
    this.dialog.close();  
  }
}
