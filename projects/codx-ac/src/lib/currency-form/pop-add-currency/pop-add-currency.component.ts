import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiHttpService, AuthStore, CacheService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, ImageViewerComponent, LayoutAddComponent, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAdService } from 'projects/codx-ad/src/public-api';
import { Invoices } from 'projects/codx-ei/src/lib/models/invoice.model';
import { CurrencyFormComponent } from '../currency-form.component';
import { Currency } from '../models/Currency.model';

@Component({
  selector: 'lib-pop-add-currency',
  templateUrl: './pop-add-currency.component.html',
  styleUrls: ['./pop-add-currency.component.css']
})
export class PopAddCurrencyComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @Input() headerText: string;
  @Output() loadData = new EventEmitter();
  currencies: Currency;
  dialog!: DialogRef;
  data: any;
  gridViewSetup:any;
  curID = '';
  symbol = '';
  curName ='';
  fiedName : boolean = false;
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private dt: ChangeDetectorRef, 
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) { 
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.currencies = dialog.dataService!.dataSelected;
    this.cache.gridViewSetup('Currencies', 'grvCurrencies').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    }
  ngOnInit(): void {
   
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
    this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.methodName = 'AddAsync';
        opt.className = 'CurrenciesBusiness';
        opt.assemblyName = 'BS';
        opt.service = 'BS';
        opt.data = this.currencies;
        return true;
      })
      .subscribe((res) => {
        if (res.save) {
          this.dialog.close(res.save);
          location.reload();
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
  valueChange(e: any) {
    if (e) {
      this.currencies[e.field] = e.data;
    }
  }
  valueChangelb(e: any) {
    if (e.data) {
      this.currencies[e.field] = '1';
      this.fiedName = e.data;
    }else{
      this.currencies[e.field] = '0';
      this.fiedName = e.data;
    }
  }
}