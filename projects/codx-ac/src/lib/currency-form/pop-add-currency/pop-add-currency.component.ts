import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, CacheService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogModel, DialogRef, FormModel, ImageViewerComponent, LayoutAddComponent, NotificationsService, RequestOption, SidebarModel, UIComponent } from 'codx-core';
import { CodxAdService } from 'projects/codx-ad/src/public-api';
import { Invoices } from 'projects/codx-ei/src/lib/models/invoice.model';
import { CurrencyFormComponent } from '../currency-form.component';
import { Currency } from '../models/Currency.model';
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
  formType:any;
  dialog!: DialogRef;
  dialogsetting :DialogRef;
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
    override api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    super(inject);
    this.dialog = dialog;
    this.dialogsetting = dialog;
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
          this.dialog.close(res.save);
          this.dt.detectChanges();
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
        if (res.save) {
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
  // opensetting(){
  //   this.title = 'Thiết lập tỷ giá';
  //   this.dialogsetting.dataService!.addNew().subscribe((res: any) => {
  //     var obj = {
  //       headerText: this.title,
  //       data : this.currencies
  //     };
  //     let op = new DialogModel();
  //     op.DataService = this.dialogsetting.dataService;
  //     op.FormModel = this.dialogsetting.formModel;
  //     this.dialogsetting = this.callfunc.openForm(PopSettingExchangeComponent, this.headerText,
  //       400,300,this.dialogsetting.dataService.funcID,obj,'', op,);
  //   });  
    
    
  // }
}