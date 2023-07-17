import { Component, Injector, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-codx-list-reports',
  templateUrl: './codx-list-reports.component.html',
  styleUrls: ['./codx-list-reports.component.css']
})
export class CodxListReportsComponent extends UIComponent implements OnInit{
  
  listReport: Array<any> = [];
  dialog!: DialogRef;
  report: any;
  url: string = '';
  headerText: string = 'Danh sách report';

  constructor(
    inject: Injector,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.listReport = dialogData.data?.reportList;
    this.url = dialogData.data?.url;
  }
  onInit(): void {
  }

  ngAfterViewInit() {
  }

  close() {
    this.dialog.close();
  }

  gotoReportDetail(e: any)
  {
    this.codxService.navigate('', this.url + `${e.recID}`);
    this.dialog.close();
  }
}
