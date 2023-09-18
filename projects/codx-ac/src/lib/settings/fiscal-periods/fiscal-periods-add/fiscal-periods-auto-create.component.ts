import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { CRUDService, CodxFormComponent, DataService, DialogData, DialogModel, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { FiscalPeriodsAutoCreate } from './model/FiscalPeriodsAutoCreate.model';

@Component({
  selector: 'lib-fiscal-periods-auto-create',
  templateUrl:'./fiscal-periods-auto-create.component.html',
  styleUrls: ['./fiscal-periods-auto-create.component.css'],
})
export class FiscalPeriodsAutoCreateComponent extends UIComponent implements OnInit{
  
  //#region Constructor
  @ViewChild('form') public form: CodxFormComponent;
  listReport: Array<any> = [];
  dialog!: DialogRef;
  gridViewSetup: any;
  headerText: string = 'Thêm mới năm tài chính';
  listFiscalYear: any;
  fiscalPeriodsAutoCreate: FiscalPeriodsAutoCreate = new FiscalPeriodsAutoCreate;
  isAddNew: any;
  
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData,
  ) {
    super(inject);
    this.dialog = dialog;
    this.gridViewSetup = dialogData.data?.gridViewSetup;
    this.setDefault();
    this.getListFiscalYear();
  }
  //#endregion

  //#region Init
  onInit(): void {
  }

  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.fiscalPeriodsAutoCreate); 
  }
  //#endregion

  //#region Event
  valueChange(e: any)
  {
    switch(e.field)
    {
      case 'fiscalYear':
        this.fiscalPeriodsAutoCreate.fiscalYear = e.crrValue;
        if(e.crrValue)
          this.setDatebyFiscalYear();
        break;
      case 'periodControl':
        {
          console.log(e.data);
          this.fiscalPeriodsAutoCreate.periodControl = e.data;
          if(e.data == true)
            this.fiscalPeriodsAutoCreate.moduleControl = false;
          else
            this.fiscalPeriodsAutoCreate.moduleControl = true;
          this.form.formGroup.patchValue({moduleControl: this.fiscalPeriodsAutoCreate.moduleControl,});
        }
        break;
      case 'moduleControl':
        {
          console.log(e.data);
          this.fiscalPeriodsAutoCreate.moduleControl = e.data;
          if(e.data == true)
            this.fiscalPeriodsAutoCreate.periodControl = false;
          else
            this.fiscalPeriodsAutoCreate.periodControl = true;
          this.form.formGroup.patchValue({periodControl: this.fiscalPeriodsAutoCreate.periodControl,});
        }
        break;
      case 'fiscalPeriodControl':
        this.fiscalPeriodsAutoCreate.fiscalPeriodControl = e.data;
        if(this.fiscalPeriodsAutoCreate.fiscalPeriodControl == true &&
            !this.fiscalPeriodsAutoCreate.fiscalYear
          )
          {
            this.fiscalPeriodsAutoCreate.startDate = new Date(new Date().getFullYear(), 0, 1);
            this.fiscalPeriodsAutoCreate.endDate = new Date(new Date().getFullYear(), 11, 31);
            this.form.formGroup.patchValue({startDate: this.fiscalPeriodsAutoCreate.startDate});
            this.form.formGroup.patchValue({endDate: this.fiscalPeriodsAutoCreate.endDate});
          }
        break;
      case 'startDate':
        this.fiscalPeriodsAutoCreate.startDate = e.data;
        this.validateDate();
        this.validateStartYear();
        break;
      case 'endDate':
        this.fiscalPeriodsAutoCreate.endDate = e.data;
        this.validateDate();
        this.validateEndYear();
        break;
      case 'period':
        this.fiscalPeriodsAutoCreate.period = e.data;
        break;
      case 'periodUoM':
        this.fiscalPeriodsAutoCreate.periodUoM = e.data;
        break;
    }
  }

  onSelectCbx(e: any)
  {
    this.fiscalPeriodsAutoCreate.oldFiscalYear = e.itemData.value;
  }

  close() {
    this.dialog.close();
  }
  //#endregion

  //#region Method
  onSave()
  {
    if(!this.validateDate())
      return;

    if(!this.validateStartYear())
      return;

    if(!this.validateEndYear())
      return;

    if(this.form.formGroup?.invalid)
      return;

    if(this.fiscalPeriodsAutoCreate.moduleControl)
      this.isAddNew = true;
    else
      this.isAddNew = false;
    
    this.convertToLocalDate();

    //Custom data add trong dataservice
    this.dialog.dataService.addDatas.set(this.fiscalPeriodsAutoCreate.fiscalYear,true);
    this.dialog.dataService .save((o)=>this.beforeSave(o), 0, '', 'SYS006', true)
    .subscribe(res=>{
      this.dialog.close();
      this.dt.detectChanges();
    });
  }
  //#endregion

  //#region Function

  //Hàm gọi tự động tạo năm tài chính
  beforeSave(o:any){
      const t = this;
      o.service = "AC",
      o.assemblyName = "AC",
      o.className = "FiscalPeriodsBusiness",
      o.methodName = "CreateFiscalYearAsync",
      o.data =  [
        t.isAddNew,
        t.fiscalPeriodsAutoCreate.startDate,
        t.fiscalPeriodsAutoCreate.endDate,
        t.fiscalPeriodsAutoCreate.fiscalYear,
        t.fiscalPeriodsAutoCreate.oldFiscalYear,
        t.fiscalPeriodsAutoCreate.period,
        t.fiscalPeriodsAutoCreate.periodUoM,
      ];
      return true;
  }

  //Thiết lập mặc định cho form tự động tạo kỳ tài chính
  setDefault()
  {
    this.fiscalPeriodsAutoCreate.moduleControl = false;
    this.fiscalPeriodsAutoCreate.periodControl = true;
    this.fiscalPeriodsAutoCreate.fiscalPeriodControl = true;
    this.fiscalPeriodsAutoCreate.startDate = new Date(new Date().getFullYear(), 0, 1);
    this.fiscalPeriodsAutoCreate.endDate = new Date(new Date().getFullYear(), 11, 31);
    this.fiscalPeriodsAutoCreate.period = 1;
  }

  //Thay đổi năm của ngày bắt đầu và ngày kết thúc theo năm tài chính
  setDatebyFiscalYear()
  {
    //Set Fiscal Year cho ngày bắt đầu
    var startDate = new Date(this.fiscalPeriodsAutoCreate.startDate);
    startDate.setFullYear(this.fiscalPeriodsAutoCreate.fiscalYear);
    this.fiscalPeriodsAutoCreate.startDate = startDate;

    //Set Fiscal Year cho ngày kết thúc
    var endDate = new Date(this.fiscalPeriodsAutoCreate.endDate);
    endDate.setFullYear(this.fiscalPeriodsAutoCreate.fiscalYear);
    this.fiscalPeriodsAutoCreate.endDate = endDate;

    this.form.formGroup.patchValue({startDate: this.fiscalPeriodsAutoCreate.startDate});
    this.form.formGroup.patchValue({endDate: this.fiscalPeriodsAutoCreate.endDate});
  }

  //Lấy danh sách năm tài chính có trong DB
  getListFiscalYear()
  {
    this.acService
      .loadComboboxData$('FiscalPeriods', 'AC')
      .subscribe((periods) => {
        this.listFiscalYear = [
          ...new Set(periods.map((p) => Number(p.FiscalYear))),
        ];
        if(this.listFiscalYear.length > 0)
        {
          this.fiscalPeriodsAutoCreate.oldFiscalYear = this.listFiscalYear.at(0);
        }
      });
  }

  //Kiểm tra ngày bắt đầu không lớn hơn ngày kết thúc
  validateDate()
  {
    if(this.fiscalPeriodsAutoCreate.startDate && this.fiscalPeriodsAutoCreate.endDate)
    {
      var startDate = new Date(this.fiscalPeriodsAutoCreate.startDate);
      var endDate = new Date(this.fiscalPeriodsAutoCreate.endDate);
      if(startDate.getTime() >  endDate.getTime())
      {
        this.notification.notifyCode(
          'AC0024',
          0,
          '"' + '' + '"'
        );
        return false;
      }
      return true;
    }
    return false
  }

  //Kiểm tra ngày bắt đầu và ngày kết thúc phải nằm trong năm tài chính
  validateStartYear()
  {
    if(this.fiscalPeriodsAutoCreate.startDate && this.fiscalPeriodsAutoCreate.fiscalYear)
    {
      var startDate = new Date(this.fiscalPeriodsAutoCreate.startDate);
      if(startDate.getFullYear() != this.fiscalPeriodsAutoCreate.fiscalYear)
      {
        this.notification.notifyCode(
          'AC0023',
          0,
          '"' + this.gridViewSetup.StartDate.headerText + '"'
        );
        return false;
      }
      return true;
    }
    return false
  }

  validateEndYear()
  {
    if(this.fiscalPeriodsAutoCreate.fiscalYear && this.fiscalPeriodsAutoCreate.endDate)
    {
      var endDate = new Date(this.fiscalPeriodsAutoCreate.endDate);
      if(endDate.getFullYear() != this.fiscalPeriodsAutoCreate.fiscalYear)
      {
        this.notification.notifyCode(
          'AC0023',
          0,
          '"' + this.gridViewSetup.EndDate.headerText + '"'
        );
        return false;
      }
      return true;
    }
    return false
  }

  convertToLocalDate()
  {
    var startDate = new Date(this.fiscalPeriodsAutoCreate.startDate);
    this.fiscalPeriodsAutoCreate.startDate = startDate.toLocaleString();

    var endDate = new Date(this.fiscalPeriodsAutoCreate.endDate);
    this.fiscalPeriodsAutoCreate.endDate = endDate.toLocaleString();
  }
  //#endregion
}
