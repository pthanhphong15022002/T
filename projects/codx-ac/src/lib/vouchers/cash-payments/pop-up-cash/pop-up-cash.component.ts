import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, DialogRef, NotificationsService, AuthService, DialogData } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { SelectionSettingsModel } from '@syncfusion/ej2-angular-grids';

@Component({
  selector: 'lib-pop-up-cash',
  templateUrl: './pop-up-cash.component.html',
  styleUrls: ['./pop-up-cash.component.css']
})
export class PopUpCashComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  cashpayment: any;
  dateNow:any = new Date();
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  editSettings: any = {
    allowAdding: false,
    allowDeleting: false,
    allowEditing: false,
    mode: 'Normal',
  };
  dataCash: Array<any> = [];
  objectName:any;
  oCash:any;
  oLine:any;
  dateSuggestion:any;
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private auth: AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.cashpayment = dialogData.data?.cashpayment;
    this.objectName = dialogData.data?.objectName;
  }
  onInit(): void {
    
  }

  ngAfterViewInit() {
    this.acService.setPopupSize(this.dialog,'80%','80%');
    this.dt.detectChanges();
  }
  close() {
    this.dialog.close();
  }
  valueChange(e: any) {

  }
  onSelected(e:any){
    this.oCash = e.data;
    let eleCheckbox = document.querySelector('.tabcash-content .e-content').querySelectorAll('input');
    for (let index = 0; index < eleCheckbox.length; index++) {
      if (index != e.rowIndex && eleCheckbox[index].checked) {
        eleCheckbox[index].click();
      }
    }
    this.acService.execApi('AC','CashPaymentsLinesBusiness','LoadDataAsync',[e.data.recID]).subscribe((res)=>{
      if (res) {
        this.oLine = res;
      }
    })
  }
  submit(){
    this.acService.execApi('AC', 'CashPaymentsBusiness', 'LoadDataCashSuggestAsync',[this.cashpayment.voucherDate,this.dateSuggestion]).subscribe((res:any)=>{
      if (res) {
        this.dataCash = res;
      }
    })
  }
}
