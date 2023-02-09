import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { EditSettingsModel } from '@syncfusion/ej2-angular-grids';
import { CacheService, CallFuncService, CodxFormComponent, CodxGridviewV2Component, DialogData, DialogRef, FormModel, NotificationsService, RequestOption, UIComponent, Util } from 'codx-core';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import { CodxAcService } from '../../codx-ac.service';
import { CashPayment } from '../../models/CashPayment.model';
import { CashPaymentLine } from '../../models/CashPaymentLine.model';


@Component({
  selector: 'lib-pop-add-cash',
  templateUrl: './pop-add-cash.component.html',
  styleUrls: ['./pop-add-cash.component.css']
})
export class PopAddCashComponent extends UIComponent implements OnInit {
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cardbodyRef') cardbodyRef: ElementRef;
  @ViewChild('cashRef') cashRef: ElementRef;
  @ViewChild('noteRef') noteRef: ElementRef;
  headerText: string;
  formModel: FormModel;
  dialog!: DialogRef;
  cashpayment:CashPayment;
  formType:any;
  ObjectID:any;
  refValue:any;
  cashpaymentline: Array<CashPaymentLine> = [];
  cashpaymentlineDelete: Array<CashPaymentLine> = [];
  fmCashPaymentsLines: FormModel = {
    formName: 'CashPaymentsLines',
    gridViewName: 'grvCashPaymentsLines',
    entityName: 'AC_CashPaymentsLines',
  };
  gridHeight: number;
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal',
  };
  data:any;
  tabInfo: TabModel[] = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Thảo luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Link', textDefault: 'Liên kết', isActive: false },
  ]
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) { 
    super(inject);
    this.dialog = dialog;
    this.ObjectID = '';
    this.data =null;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.cashpayment = dialog.dataService!.dataSelected;
    if (this.cashpayment.voucherNo != null) {
      this.acService
        .loadData(
          'ERM.Business.AC',
          'CashPaymentsLinesBusiness',
          'LoadDataAsync',
          this.cashpayment.recID
        )
        .subscribe((res: any) => {
          this.cashpaymentline = res;
        });
    }  
  }
  onInit(): void {
    
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  valueChange(e: any, type: any) {
    if(type == 'objectType'){
      if(e.data == '1'){
        this.ObjectID = 'Customers';
      } 
      if(e.data == '2'){
        this.ObjectID = 'VendorsAC';
      } 
      if(e.data == '3'){
        this.ObjectID = 'EmployeesAC';
      } 
      if(e.data == '4'){
        this.ObjectID = 'BanksAC';
      } 
      if(e.data == '5'){
        this.ObjectID = 'BusinessUnits';
      } 
      if(e.data == '6'){
        this.ObjectID = 'Warehouses';
      }
    }
    this.cashpayment[e.field] = e.data;
  }
  cellChanged(e:any){
    this.cashpaymentline[e.field] = e.value;
    this.data = JSON.stringify(this.cashpaymentline);
  }
  addRow() {
    let idx = this.grid.dataSource.length;
    let data = this.grid.formGroup.value;
    data.recID = Util.uid();
    data.write = true;
    data.delete = true;
    data.read = true;
    data.dr = 0;
    data.rowNo = idx + 1;
    data.transID = this.cashpayment.recID;
    this.grid.addRow(data, idx);
  }
  deleteRow(data){
    this.cashpaymentlineDelete.push(data);
    this.grid.deleteRow();
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.deleteRow(data);
        break;
    }
  }
onSave(){
  this.cashpayment.voucherDate = this.form.formGroup.value.voucherDate;
  this.cashpaymentline = this.data;
  console.log(this.cashpaymentline);
  if (this.formType == 'add') {
    this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.methodName = 'AddAsync';
        opt.className = 'CashPaymentsBusiness';
        opt.assemblyName = 'AC';
        opt.service = 'AC';
        opt.data = [this.cashpayment];
        return true;
      })
      .subscribe((res) => {
        if (res.save) {
          this.acService
              .addData('ERM.Business.AC', 'CashPaymentsLinesBusiness', 'AddAsync', this.cashpaymentline)
              .subscribe((res) => {
              });
              this.dialog.close();
              this.dt.detectChanges();
        } else {
        }
      });
  }
  if (this.formType == 'edit') {
    this.dialog.dataService
      .save((opt: RequestOption) => {
        opt.methodName = 'UpdateAsync';
        opt.className = 'CashPaymentsBusiness';
        opt.assemblyName = 'AC';
        opt.service = 'AC';
        opt.data = [this.cashpayment];
        return true;
      })
      .subscribe((res) => {
        if (res != null) {
          this.acService
              .addData('ERM.Business.AC', 'CashPaymentsLinesBusiness', 'UpdateAsync', [this.cashpaymentline,this.cashpaymentlineDelete])
              .subscribe((res) => {
              });
              this.dialog.close();
              this.dt.detectChanges();
        } else {
        }
      });
  }
}
}
