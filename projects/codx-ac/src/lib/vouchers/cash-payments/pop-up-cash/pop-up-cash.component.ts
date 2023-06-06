import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { UIComponent, CodxFormComponent, DialogRef, NotificationsService, AuthService, DialogData } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { DateTime } from '@syncfusion/ej2-angular-charts';

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
    allowAdding: true,
    allowDeleting: true,
    allowEditing: true,
    mode: 'Normal',
  };
  dataCash: Array<any> = [];
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
    this.cashpayment = dialogData.data.cashpayment;
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
  submit(){
    this.api
      .exec<any>('AC', 'CashPaymentsBusiness', 'LoadDataAsync', [])
      .subscribe((res) => {
        if (res) {
          this.dataCash = res;
        }
      })
  }
}
