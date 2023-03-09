import { formatDate } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Optional,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { update } from '@syncfusion/ej2-angular-inplace-editor';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewV2Component,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  ImageViewerComponent,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { CodxAdService } from 'projects/codx-ad/src/public-api';
import { Invoices } from 'projects/codx-ei/src/lib/models/invoice.model';
import { CodxAcService } from '../../codx-ac.service';
import { CurrencyFormComponent } from '../currency-form.component';
import { Currency } from '../../models/Currency.model';
import { ExchangeRates } from '../../models/ExchangeRates.model';
import { PopAddExchangerateComponent } from '../pop-add-exchangerate/pop-add-exchangerate.component';
import { PopSettingExchangeComponent } from '../pop-setting-exchange/pop-setting-exchange.component';

@Component({
  selector: 'lib-pop-add-currency',
  templateUrl: './pop-add-currency.component.html',
  styleUrls: ['./pop-add-currency.component.css'],
})
export class PopAddCurrencyComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @Input() headerText: string;
  currencies: Currency;
  exchangerate: ExchangeRates = new ExchangeRates();
  objectExchange: Array<ExchangeRates> = [];
  objectExchangeDelete: Array<ExchangeRates> = [];
  formType: any;
  dialog!: DialogRef;
  gridViewSetup: any;
  title: any;
  validate: any = 0;
  moreFuncNameAdd:any;
  moreFuncNameEdit:any;
  funcName:any;
  constructor(
    private inject: Injector,
    override cache: CacheService,
    private acService: CodxAcService,
    override api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.currencies = dialog.dataService!.dataSelected;
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let add = res.find((x) => x.functionID == 'SYS01');
        let edit = res.find((x) => x.functionID == 'SYS03');
        if (add) this.moreFuncNameAdd = add.defaultName;
        if (edit) this.moreFuncNameEdit = edit.customName;
      }
    });
    this.cache.gridViewSetup('Currencies', 'grvCurrencies').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
    if (this.formType == 'edit') {
      if (this.currencies.currencyID != null) {
        this.api
          .exec(
            'ERM.Business.BS',
            'ExchangeRatesBusiness',
            'LoadDataExchangeRatesAsync',
            [this.currencies.currencyID]
          )
          .subscribe((res: []) => {
            this.objectExchange = res;
          });
      }
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.cache.moreFunction('ExchangeRates', 'grvExchangeRates').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACS20801');
        if (m) this.funcName = m.defaultName;
      }
    });
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
      this.currencies[e.field] = e.data;
  }
  //#endregion

  //#region Function
  opensetting() {
    this.title = 'Thiết lập' + ' ' + this.funcName;
    var obj = {
      headerText: this.title,
    };
    let optionForm = new DialogModel();
    optionForm.DataService = this.dialog.dataService;
    optionForm.FormModel = this.dialog.formModel;
    var dialog = this.callfc.openForm(
      PopSettingExchangeComponent,
      '',
      500,
      350,
      '',
      obj,
      '',
      optionForm
    );
    dialog.closed.subscribe((x) => {
      var dataexchange = JSON.parse(localStorage.getItem('dataexchange'));
      if (dataexchange != null) {
        this.currencies.multi = dataexchange.multi;
        this.currencies.calculation = dataexchange.calculation;
      }
      window.localStorage.removeItem('dataexchange');
    });
  }
  openPopup() {
    this.title = this.moreFuncNameAdd + ' ' + this.funcName;
    var obj = {
      headerText: this.title,
      dataex:this.objectExchange,
      type:'add'
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'ExchangeRates';
    dataModel.gridViewName = 'grvExchangeRates';
    dataModel.entityName = 'BS_ExchangeRates';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('ExchangeRates', 'grvExchangeRates')
      .subscribe((res) => {
        if (res) {
          var dialogexchange = this.callfc.openForm(
            PopAddExchangerateComponent,
            '',
            500,
            450,
            '',
            obj,
            '',
            opt
          );
          dialogexchange.closed.subscribe((x) => {
            var dataexchangeRate = JSON.parse(
              localStorage.getItem('dataexchangeRate')
            );
            if (dataexchangeRate != null) {
              this.api
                .exec(
                  'ERM.Business.BS',
                  'ExchangeRatesBusiness',
                  'ValidateExchangeDateAsync',
                  [this.objectExchange, dataexchangeRate]
                )
                .subscribe((res: []) => {
                  if (res) {
                    this.objectExchange.push(dataexchangeRate);
                  } else {
                    this.notification.notify(
                      'Tỷ giá ngày ' +
                        formatDate(
                          dataexchangeRate.toDate,
                          'dd/MM/yyyy',
                          'en-US'
                        ) +
                        ' đã tồn tại',
                      '2'
                    );
                  }
                  window.localStorage.removeItem('dataexchangeRate');
                });
            }
          });
        }
      });
  }
  deleteExchangerate(data: any) {
    let index = this.objectExchange.findIndex((x) => x.recID == data.recID);
    this.objectExchange.splice(index, 1);
    this.objectExchangeDelete.push(data);
  }
  editExchangerate(data: any) {
    this.title = this.moreFuncNameEdit + ' ' + this.funcName;
    var obj = {
      headerText: this.title,
      data: { ...data },
      type:'edit'
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'ExchangeRates';
    dataModel.gridViewName = 'grvExchangeRates';
    dataModel.entityName = 'BS_ExchangeRates';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('ExchangeRates', 'grvExchangeRates')
      .subscribe((res) => {
        if (res) {
          var dialogexchangeedit = this.callfc.openForm(
            PopAddExchangerateComponent,
            '',
            500,
            400,
            '',
            obj,
            '',
            opt
          );
          dialogexchangeedit.closed.subscribe((x) => {
            var dataexchangeRate = JSON.parse(
              localStorage.getItem('dataexchangeRate')
            );
            if (dataexchangeRate != null) {
              let index = this.objectExchange.findIndex(
                (x) => x.recID == dataexchangeRate.recID
              );
              this.objectExchange[index] = dataexchangeRate;
            }
            window.localStorage.removeItem('dataexchangeRate');
          });
        }
      });
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.currencies);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.currencies[keymodel[i]] == null ||
              this.currencies[keymodel[i]] == ''
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  clearCurrencies(){
    this.objectExchange = [];
  }
  //#endregion

  //#region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
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
              this.api
                .exec('ERM.Business.BS', 'ExchangeRatesBusiness', 'AddAsync', [
                  this.currencies.currencyID,
                  this.objectExchange,
                ])
                .subscribe((res: []) => {
                  if (res) {
                    this.dialog.close();
                    this.dt.detectChanges();
                  }
                });
            } else {
              this.notification.notifyCode('SYS031', 0, '"' + this.currencies.currencyID + '"');
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
              this.api
                .exec(
                  'ERM.Business.BS',
                  'ExchangeRatesBusiness',
                  'UpdateAsync',
                  [this.currencies.currencyID, this.objectExchange, this.objectExchangeDelete]
                )
                .subscribe((res: []) => {
                  if (res) {
                    this.dialog.close();
                    this.dt.detectChanges();
                  }
                });
            }
          });
      }
    }
  }
  onSaveAdd(){
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
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
          this.api
            .exec('ERM.Business.BS', 'ExchangeRatesBusiness', 'AddAsync', [
              this.currencies.currencyID,
              this.objectExchange,
            ])
            .subscribe((res: []) => {
              if (res) {
                this.clearCurrencies();
                this.dialog.dataService.clear();
                this.dialog.dataService.addNew().subscribe((res) => {
                  this.form.formGroup.patchValue(res);
                  this.currencies = this.dialog.dataService!.dataSelected;
                });
              }
            });
        } else {
          this.notification.notifyCode('SYS031', 0, '"' + this.currencies.currencyID + '"');
          return;
        }
      });
    }
  }
  //#endregion
}
