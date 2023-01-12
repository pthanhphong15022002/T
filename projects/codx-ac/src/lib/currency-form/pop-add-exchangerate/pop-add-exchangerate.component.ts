import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, Injector, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { CodxFormComponent, DialogData, DialogRef, UIComponent } from 'codx-core';
import { Currency } from '../models/Currency.model';
import { ExchangeRates } from '../models/ExchangeRates.model';

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
  note:any;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef, 
    @Optional() dialogadd?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    super(inject);
    this.dialog = dialogadd;
    this.headerText = dialogData.data?.headerText;

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
    // window.localStorage.setItem("dataexchangeRate",JSON.stringify(this.exchangerate));
    this.dialog.close();
  }
}
