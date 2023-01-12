import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { update } from '@syncfusion/ej2-angular-inplace-editor';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogModel, DialogRef, FormModel, ImageViewerComponent, LayoutAddComponent, NotificationsService, RequestOption, SidebarModel, UIComponent, ViewModel, ViewsComponent, ViewType } from 'codx-core';
import { CodxAdService } from 'projects/codx-ad/src/public-api';
import { Invoices } from 'projects/codx-ei/src/lib/models/invoice.model';
import { CodxAcService } from '../../codx-ac.service';
import { CurrencyFormComponent } from '../currency-form.component';
import { Currency } from '../models/Currency.model';
import { ExchangeRates } from '../models/ExchangeRates.model';
import { PopAddExchangerateComponent } from '../pop-add-exchangerate/pop-add-exchangerate.component';
import { PopSettingExchangeComponent } from '../pop-setting-exchange/pop-setting-exchange.component';

@Component({
  selector: 'lib-pop-add-currency',
  templateUrl: './pop-add-currency.component.html',
  styleUrls: ['./pop-add-currency.component.css']
})
export class PopAddCurrencyComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @Input() headerText: string;
  currencies: Currency;
  exchangerate : ExchangeRates;
  objectExchange:Array<ExchangeRates> = [];
  toDate:any;
  exchange:any;
  formType:any;
  dialog!: DialogRef;
  data: any;
  gridViewSetup:any;
  curID :string;
  symbol :string;
  curName :string;
  fiedName : boolean = false;
  disabled : boolean = false;
  title:any;
  constructor(
    private inject: Injector,
    override cache: CacheService,
    private acService: CodxAcService,
    override api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
    
  ) { 
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.currencies = dialog.dataService!.dataSelected;
    this.curID = '';
    this.symbol = '';
    this.curName = '';
    this.cache.gridViewSetup('Currencies', 'grvCurrencies').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (this.currencies.currencyID != null) {
      this.curID = this.currencies.currencyID;
      this.symbol = this.currencies.symbol;
      this.curName = this.currencies.currencyName;
      this.disabled = true;
      
    }
    }
    onInit(): void {
      
    }

  ngAfterViewInit() {
  }
  onSave(){
    var dataexchange = JSON.parse(localStorage.getItem('dataexchange'));
    if (dataexchange.Multiply != null) {
      this.currencies.multiply = dataexchange.Multiply;
    }
    if (this.curID.trim() == '' || this.curID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CurrencyID'].headerText + '"'
      );
      return;
    }
    if (this.symbol.trim() == '' || this.symbol == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['Symbol'].headerText + '"'
      );
      return;
    }
    if (this.curName.trim() == '' || this.curName == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['CurrencyName'].headerText + '"'
      );
      return;
    }
    if (this.formType == 'add') {   
      this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.methodName = 'AddAsync';
        opt.className = 'CurrenciesBusiness';
        opt.assemblyName = 'BS';
        opt.service = 'BS';
        opt.data = [this.currencies];
        return true;
      })
      .subscribe((res) => {
        if (res.save) {        
          for(var i=0;i<this.objectExchange.length;i++){
            this.objectExchange[i].CurrencyID = this.curID;   
          }
          console.log(this.objectExchange);
          this.api.exec(
            'ERM.Business.BS',
            'ExchangeRatesBusiness',
            'AddAsync',
            [this.objectExchange]
          ).subscribe((res:[])=>{
            if(res){
              window.localStorage.removeItem("dataexchangeRate");
              window.localStorage.removeItem("dataexchange");
              this.dialog.close();
              this.dt.detectChanges();
            }
          });       
        }else{
          this.notification.notifyCode(
            'SYS031',
            0,
            '"' + this.curID + '"'
          );
          return;      
        }

      });
    }
    if (this.formType == 'edit') {
      this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.methodName = 'UpdateAsync';
        opt.className = 'CurrenciesBusiness';
        opt.assemblyName = 'BS';
        opt.service = 'BS';
        opt.data = [this.currencies];
        return true;
      })
      .subscribe((res) => {
        console.log(res);
        if (res.save || res.update) {
          this.dialog.close(res.save);
          this.dt.detectChanges();
        }
      });
    }
    
  }
  valueChangecurID(e: any) {
    if (e) {
      this.curID = e.data;
      this.currencies[e.field] = this.curID;
    }
  }
  valueChangesymbol(e: any) {
    if (e) {
      this.symbol = e.data;
      this.currencies[e.field] = this.symbol;
    }
  }
  valueChangecurName(e: any) {
    if (e) {
      this.curName = e.data;
      this.currencies[e.field] = this.curName;
    }
  }
  opensetting(){
    this.title = 'Thiết lập tỷ giá';
    var obj = {
            headerText: this.title,
            data : this.currencies
          };
    let optionForm = new DialogModel();
      optionForm.DataService = this.view?.currentView?.dataService;
      optionForm.FormModel = this.view?.currentView?.formModel;
      var dialog = this.callfc.openForm(
        PopSettingExchangeComponent,
        '',
        400,
        300,
        '',
        obj,
        '',
        optionForm
      );
  }
  openPopup(){
    this.title = 'Thêm tỷ giá';
    var obj = {
            headerText: this.title,
            data : this.currencies
          };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'ExchangeRates';
    dataModel.gridViewName = 'grvExchangeRates';
    dataModel.entityName = 'BS_ExchangeRates';
    opt.FormModel = dataModel;
    this.cache.gridViewSetup('ExchangeRates','grvExchangeRates').subscribe(res=>{
      if(res){  
        var dialogexchange = this.callfc.openForm(
          PopAddExchangerateComponent,
          '',
          350,
          500,
          '',
          obj,
          '',
          opt
        );
        dialogexchange.closed.subscribe((x) => {
          // var dataexchangeRate = JSON.parse(localStorage.getItem('dataexchangeRate'));
          // if (dataexchangeRate != null) {
          //   let customObj = new ExchangeRates();
          //   customObj.ToDate = dataexchangeRate.toDate;
          //   customObj.exchangeRate = dataexchangeRate.exchangeRate;
          //   this.objectExchange.push(customObj);
          // }
        });
      }
    });
  }
}