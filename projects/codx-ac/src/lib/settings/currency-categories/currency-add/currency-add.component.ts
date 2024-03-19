import { formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApiHttpService,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxGridviewV2Component,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIComponent,
  Util,
} from 'codx-core';
import { ExchangerateAddComponent } from '../currency-exchangerate-add/currency-exchangerate-add.component';
import { ExchangeRateSettingAddComponent } from '../currency-exchangerate-setting-add/currency-exchangerate-setting-add.component';
import { CodxAcService } from '../../../codx-ac.service';
import { Subject, map, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-currency-add',
  templateUrl: './currency-add.component.html',
  styleUrls: [
    './currency-add.component.css',
    '../../../codx-ac.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyAddComponent extends UIComponent implements OnInit {

  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  headerText: string;
  dataDefault: any;
  lstExchangeRate: any;
  dialog!: DialogRef;
  dialogData!: DialogData;
  gridViewSetup: any;
  title: any;
  lblAdd: any;
  lblEdit: any;
  lblExChangeRate:any;
  lblExChangeRateSetting:any;
  funcName: any;
  multiplication:any;
  division:any;
  fmExchangeRates:FormModel={
    formName:'ExchangeRates',
    gridViewName:'grvExchangeRates',
    entityName:'BS_ExchangeRates',
    entityPer: 'BS_ExchangeRates',
  }
  exchangeRatesService: CRUDService;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    override cache: CacheService,
    override api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.funcName = dialogData.data?.funcName;
    if (!dialogData?.data?.dataDefault?.calculation && !dialogData?.data?.dataDefault?._isEdit){
      dialogData.data.dataDefault.calculation = '2';
    }   

    this.dataDefault = {...dialogData?.data?.dataDefault};
    this.dialogData = {...dialogData};

    this.exchangeRatesService = this.acService.createCRUDService(
      inject,
      this.fmExchangeRates,
      'BS'
    );
  }
  //#endregion Contructor

  //#region Init
  onInit(): void {
    this.cache.message('AC0033').subscribe((res) => {
      if (res) {
        this.lblAdd = res?.customName;
      }
    });

    this.cache.message('AC0034').subscribe((res) => {
      if (res) {
        this.lblEdit = res?.customName;
      }
    });

    this.cache.message('AC0036').subscribe((res) => {
      if (res) {
        this.lblExChangeRate = res?.customName;
      }
    });

    this.cache.message('AC0037').subscribe((res) => {
      if (res) {
        this.lblExChangeRateSetting = res?.customName;
      }
    });
    
    //? get data exchangerate by currencyID
    if (this.dataDefault._isEdit) {
      let options2 = new DataRequest();
      options2.entityName = 'BS_ExchangeRates';
      options2.pageLoading = false;
      options2.predicates = 'CurrencyID=@0';
      options2.dataValues = this.dataDefault.currencyID;
      this.api
        .execSv('BS', 'Core', 'DataBusiness', 'LoadDataAsync', options2)
        .pipe(map((r) => r?.[0] ?? [])).subscribe((res:any)=>{
          this.lstExchangeRate = res || [];
          this.detectorRef.detectChanges();
        })
    }else{
      this.lstExchangeRate = [];
      this.detectorRef.detectChanges();
    }
  }

  ngAfterViewInit() {
  }

  onAfterInit(e){
    this.setValidateForm(); //? set require cho form
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Event

  /**
   * *Hàm xử lí thay đổi value
   * @param event 
   */
  valueChange(event){
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    if (event && value) {
      switch(field.toLowerCase()){
        case 'currencyid':
          this.form.setValue('isoCode',value,{});
          break;
      }
    }
  }

  //#endregion Event

  //#region Function

  /**
   * *Hàm set require cho form
   */
  setValidateForm(){
    let rCurrencyID = true;
    let lsRequire :any = [];
    if(this.form.data?._keyAuto == 'CurrencyID') rCurrencyID = false; //? thiết lập không require khi dùng đánh số tự động tài khoản
    lsRequire.push({field : 'CurrencyID',isDisable : false,require:rCurrencyID});
    this.form.setRequire(lsRequire);
  }

  /**
   * *Hàm mở form thiết lập tỷ giá
   */
  openFormSettingExChange(){
    let data = {
      headerText: this.lblExChangeRateSetting.toUpperCase(),
      dataDefault: {...this.form.data},
    };
    let option = new DialogModel()
    option.FormModel = {...this.form.formModel};
    option.FormModel.currentData = {...this.form.data};
    let dialog = this.callfc.openForm(
      ExchangeRateSettingAddComponent,
      '',
      400,
      300,
      '',
      data,
      '',
      option
    );
    dialog.closed.subscribe((res:any) => {
      if (res && res?.event) {
        this.form.setValue('calculation',res?.event.calculation,{});
        this.form.setValue('multi',res?.event.multi,{});
      }
    });
  }

  /**
   * *Hàm thêm mới tỷ giá 
   */
  addNewExchangeRate() {
    this.exchangeRatesService.addNew().subscribe((res: any) => {
      if (res) {
        let data = {
          headerText: (this.lblAdd + ' ' + this.lblExChangeRate).toUpperCase(),
          dataDefaultExRate: { ...res },
          lstExchangeRate: this.lstExchangeRate,
        };
        let option = new DialogModel();
        option.DataService = this.exchangeRatesService
        option.FormModel = this.fmExchangeRates;
        this.cache.gridViewSetup(this.fmExchangeRates.formName, this.fmExchangeRates.gridViewName).subscribe((o) => {
          let dialog = this.callfc.openForm(
            ExchangerateAddComponent,
            '',
            300,
            450,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              this.lstExchangeRate.push(res?.event);
            }
          });
        })

      }
    })
  }

  /**
   * *Hàm chỉnh sửa tỷ giá
   * @param dataEdit 
   */
  editExchangeRate(dataEdit: any) {
    dataEdit.isEdit = true;
    let data = {
      headerText: (this.lblEdit + ' ' + this.lblExChangeRate).toUpperCase(),
      dataDefaultExRate: {...dataEdit},
      lstExchangeRate: [...this.lstExchangeRate],
    };
    let option = new DialogModel();
    option.DataService = this.exchangeRatesService
    option.FormModel = this.fmExchangeRates;
    this.cache.gridViewSetup(this.fmExchangeRates.formName, this.fmExchangeRates.gridViewName).subscribe((o) => {
      let dialog = this.callfc.openForm(
        ExchangerateAddComponent,
        '',
        300,
        450,
        '',
        data,
        '',
        option
      );
      dialog.closed.subscribe((res) => {
        if (res && res?.event) {
          let index = this.lstExchangeRate.findIndex(x => x.recID == res?.event.recID)
          if(index > -1){
            this.lstExchangeRate[index] = res?.event;
            this.detectorRef.detectChanges();
          }
        }
      });
    })
  }

  /**
   * *Hàm xóa tỷ giá
   * @param data 
   */
  deleteExchangeRate(data: any) {
    this.exchangeRatesService.delete([data], true,null,null,null,null,null,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.error) {
        let index = this.lstExchangeRate.findIndex((x) => x.recID == data.recID);
        if (index > -1) {
          this.lstExchangeRate.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  /**
   * *Hàm hỗ trợ ngFor không render lại toàn bộ data
   */
  trackByFn(index, item) {
    return item.recID;
  }

  //#endregion Function

  //#region Method

  /**
   * *Hàm lưu tiền tệ 
   * @param type 
   */
  onSave(type) {
    this.form.save((opt: RequestOption) => {
      opt.methodName = (this.form.data.isAdd || this.form.data.isCopy) ? 'SaveAsync' : 'UpdateAsync';
      opt.className = 'CurrenciesBusiness';
      opt.assemblyName = 'BS';
      opt.service = 'BS';
      opt.data = [this.form.data,this.lstExchangeRate];
      return true;
    }, 0, '', '', false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (!res) return;
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      if (this.form.data.isAdd || this.form.data.isCopy)
        this.notification.notifyCode('SYS006');
      else
        this.notification.notifyCode('SYS007');
      this.dialog.close();
    })
    // this.form.save(null, 0, '', '', false).pipe(takeUntil(this.destroy$))
    // .subscribe((res: any) => {
    //   if(!res) return;
    //   if (res || res.save || res.update) {
    //     if (res || !res.save.error || !res.update.error) {
    //       if (type == 'save') {
    //         this.dialog.close(); 
    //       }else{
    //         this.dialog.dataService.clear();
    //         this.dialog.dataService.addNew().subscribe((res: any) => {
    //           if (res) {
    //             res.isAdd = true;
    //             if(this.form.data.isEdit || this.form.data.isCopy) this.headerText = (this.lblAdd + ' ' + this.funcName).toUpperCase();
    //             this.form.refreshData({...res});
    //             this.lstExchangeRate = [];
    //             this.detectorRef.detectChanges();
    //           }
    //         });
    //       }
    //       if (this.form.data.isAdd || this.form.data.isCopy)
    //         this.notification.notifyCode('SYS006');
    //       else 
    //         this.notification.notifyCode('SYS007');
    //     }
    //   }
    // });

  }
 
  //#endregion
}
