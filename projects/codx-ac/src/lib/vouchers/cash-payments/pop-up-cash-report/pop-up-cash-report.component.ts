import { Component, Injector, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { CashPayment } from '../../../models/CashPayment.model';

@Component({
  selector: 'lib-pop-up-cash-report',
  templateUrl: './pop-up-cash-report.component.html',
  styleUrls: ['./pop-up-cash-report.component.css']
})
export class PopUpCashReportComponent extends UIComponent implements OnInit{
  
  listReport: Array<any> = [];
  dialog!: DialogRef;
  cashPayment: CashPayment;
  report: any;
  url: string = 'ac/report/detail/'

  constructor(
    inject: Injector,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.cashPayment = dialogData.data?.data;
    this.listReport = dialogData.data?.reportList;
  }
  onInit(): void {
  }

  ngAfterViewInit() {
  }

  close() {
    this.dialog.close();
  }

  testReport(e: any)
  {
    console.log(e.reportID);
    this.codxService.navigate('', this.url + `${e.reportID}`);
    this.dialog.close();
  }
}
