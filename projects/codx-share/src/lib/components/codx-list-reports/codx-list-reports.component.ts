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
  dialog: DialogRef = null;
  report: any;
  url: string = '';
  sysMoreFC:any = null;
  headerText: string = '';
  dataSource:string = "";
  reportID:string = "";
  dataSelected:any = null;
  entityName:string = "RP_ReportList";
  jsParameters:string = "";
  loading:boolean = false;
  loaded:boolean = false;

  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private callfunc:CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.reportID = dialogData?.data?.reportID;
    this.jsParameters = dialogData?.data?.parameters;
  }
  onInit(): void {
    if(this.reportID)
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
      this.api.execSv("rptsys","Codx.RptBusiness.CM","ReportBusiness","GetByReportIDAsync",[reportID])
      .subscribe((res:any[]) => {
        if(res)
          this.lstReport = res;
        this.loaded = true;
      });
    }
  }

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
    this.dataSelected = data;
  }
  // export 
  clickExport(){
    if(!this.loading)
    {
      this.loading = true;
      this.api.execSv(this.dataSelected.service,"Codx.RptBusiness.CM","ReportBusiness","ExportTemplateAsync",[this.dataSelected,this.jsParameters])
      .subscribe((res:any) => {
        if (res)
        {
          let fileName = this.dataSelected.reportName;
          if(fileName)
            fileName = this.dataSelected.reportName.split(".")[0];
          this.downloadFile(res,fileName); 
        };
        this.loading = false; 
      });
    }
  }




  // dowload file
  downloadFile(data: any,fileName:string) {
    var sampleArr = this.base64ToArrayBuffer(data[0]);
    this.saveByteArray(fileName, sampleArr);
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
    link.download = reportName;
    link.click();
  }

}
