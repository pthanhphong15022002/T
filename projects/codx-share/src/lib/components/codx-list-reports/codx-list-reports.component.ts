import { Component, Injector, OnInit, Optional } from '@angular/core';
import { CallFuncService, DialogData, DialogModel, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { CodxExportAddComponent } from '../codx-export/codx-export-add/codx-export-add.component';
import { CodxReportAddComponent } from './popup/codx-report-add/codx-report-add.component';

@Component({
  selector: 'lib-codx-list-reports',
  templateUrl: './codx-list-reports.component.html',
  styleUrls: ['./codx-list-reports.component.css']
})
export class CodxListReportsComponent extends UIComponent implements OnInit{
  
  lstReport: any[] = [];
  dialog!: DialogRef;
  report: any;
  url: string = '';
  headerText: string = '';
  dataSource:string = "";
  reportID:string = "";
  dataSelected:any = null;
  entityName:string = "RP_ReportList";
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private callfunc:CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.lstReport = dialogData.data?.reportList;
    this.url = dialogData.data?.url;
    this.headerText = dialogData.data?.headerText;
    this.reportID = dialogData?.data?.reportID;
    this.dataSource = dialogData?.data?.dataSource;

  }
  onInit(): void {
    if(!this.lstReport || this.lstReport?.length == 0)
    {
      this.getReportList(this.reportID);
    }
    this.getDefaultMoreFunc();
  }

  ngAfterViewInit() {
  }

  // get report list
  getReportList(reportID:string){
    if(reportID)
    {
      this.api.execSv("rptsys","Codx.RptBusiness.CM","ReportBusiness","GetListReportByReportIDAsync",[reportID])
      .subscribe((res:any[]) => {
        if(res?.length > 0)
        {
          res.forEach((x:any,index:number) =>{
            x.selected = index == 0;
          });
          this.lstReport = res;
        }
      });
    }
  }

  sysMoreFC:any = null;
  // get morefunc default
  getDefaultMoreFunc(){
    this.cache.moreFunction("CoDXSystem","").subscribe((mfc:any[]) => {
      if(mfc?.length > 0)
      {
        this.sysMoreFC = mfc.filter(element => {
          return element.functionID == "SYS02" || element.functionID == "SYS03";
        }).sort((x,y) => (x.sorting - y.sorting));
      }
    });
  }
  // close popup
  close() {
    this.dialog.close();
  }

  clickMF(event:any,data:any){
  }
  //seletecd item
  selectedItem(data:any){
    this.lstReport.forEach(x => x.selected = x.recID == data.recID);
    this.dataSelected = data;
  }
  // export 
  clickExport(){
    switch(this.dataSelected.displayMode)
    {
      case"1": // printPlayout
        break;
      case"2": // pdf
        break;
      case "3": // excel
        this.exportToExcel();
        break;
      case "4": // word
        this.exportToWord();
        break;
    }
    
  }
  // export to excel
  exportToExcel(){
    this.api
    .execSv<any>(
      'SYS',
      'Core',
      'CMBusiness',
      'ExportExcelDataAsync',
      [this.dataSource, this.dataSelected.templateID]
    )
    .subscribe((item) => {
      if (item) {
        this.downloadFile(item);
      }
    });
  }
  // export to word
  exportToWord(){
    this.api
      .execSv<any>(
        'SYS',
        'Core',
        'ExportWordBusiness',
        'ExportWordTemplateAsync',
        [null, this.dataSelected.templateID, this.dataSource]
      )
      .subscribe((item) => {
        if (item) {
          this.downloadFile(item);
        }
      });
  }

  // dowload file
  downloadFile(data: any) {
    var sampleArr = this.base64ToArrayBuffer(data[0]);
    this.saveByteArray(this.dataSelected.reportName, sampleArr);
  }
  // convert base64
  base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }
  //save byte array
  saveByteArray(reportName, byte) {
    var dataType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (this.dataSelected.displayMode == '4') dataType = 'application/msword';
    var blob = new Blob([byte], {
      type: dataType,
    });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
  }

}
