import { Component, Injector, OnInit, Optional } from '@angular/core';
import { AlertConfirmInputConfig, CallFuncService, DialogData, DialogModel, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { CodxExportAddComponent } from '../codx-export/codx-export-add/codx-export-add.component';
import { CodxReportAddComponent } from './popup/codx-report-add/codx-report-add.component';
import { PopupShowDatasetComponent } from 'projects/codx-report/src/lib/popup-show-dataset/popup-show-dataset.component';
import { PopupAddReportComponent } from 'projects/codx-report/src/lib/popup-add-report/popup-add-report.component';

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
  loading:boolean = true;
  loaded:boolean = false;

  constructor(
    inject: Injector,
    private notificationSV: NotificationsService,
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
      this.api.execSv("rptrp","Codx.RptBusiness.RP","ReportListBusiness","GetByReportIDAsync",[reportID])
      .subscribe((res:any[]) => {
        if(res)
        {
          this.lstReport = res;
          this.dataSelected = res[0];
        }
        this.loaded = true;
        this.loading = false;
      });
    }
  }

  // get morefunc default
  getDefaultMoreFunc(){
    this.cache.moreFunction("CoDXSystem","").subscribe((mfc:any[]) => {
      if(mfc?.length > 0)
      {
        this.sysMoreFC = mfc.filter(element => {
          return element.functionID == "SYS03" || element.functionID == "SYS04" || element.functionID == "SYS02" ;
        }).sort((x,y) => (x.sorting - y.sorting));
      }
    });
  }
  // close popup
  close() {
    this.dialog.close();
  }

  clickMF(e:any,data:any){
    switch(e.functionID){
      case"SYS02": //xóa
        this.delete(data);
        break;
      case"SYS03": // sửa
        this.edit(data);
      break;
      case "SYS04":
        this.coppy(data)
        break;
    }
  }

  //coppy report
  coppy(data:any){
    this.api.execSv("rptrp","Codx.RptBusiness.RP","ReportListBusiness","CoppyAsync",data.recID)
      .subscribe((res2:any) => {
        if(res2 != null)
        {
          this.lstReport.push(res2);
          this.notificationSV.notifyCode("SYS006");
        }
        else
          this.notificationSV.notifyCode("SYS023");
      });
  }

  //delete report
  delete(data:any){
    this.notificationSV.alertCode("SYS030").subscribe((res:any) => {
      if(res.event.status == 'Y')
      {
        this.api.execSv("rptrp","Codx.RptBusiness.RP","ReportListBusiness","DeleteAsync",data.recID)
        .subscribe((res2:boolean) => {
          if(res2){
            this.lstReport = this.lstReport.filter(x => x.recID != data.recID);
            this.notificationSV.notifyCode("SYS008");
          }
          else
            this.notificationSV.notifyCode("SYS022");
        });
      }
    });
  }

  edit(data:any){
    let option = new DialogModel();
    option.DataService = this.dialog.dataService;
    option.FormModel = this.dialog.formModel;
    let obj = {
      module:data.moduleID,
      reportID:data.recID,
      reportType: this.dialog.formModel?.entityName
    };
    this.callfc.openForm(
      PopupAddReportComponent,
      '',
      screen.width,
      screen.height,
      " ",
      obj,
      '',
      option
    ).closed.subscribe((res:any)=>{
      if(res?.event)
      {
        this.dataSelected = res.event;
        this.detectorRef.detectChanges();
      }
    });
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
      this.api.execSv(this.dataSelected.service,"Codx.RptBusiness","ReportBusiness","ExportTemplateAsync",[this.dataSelected,this.jsParameters])
      .subscribe((res:any) => {
        if (res)
        {
          let fileName = this.dataSelected.reportName;
          if(fileName)
            fileName = this.dataSelected.reportName.split(".")[0];
          this.downloadFile(res,fileName);
          this.dialog.close(); 
        }
        else
        {
          this.notificationSV.notify("Hệ thống thực thi không thành công","2");
          this.dialog.close(); 
        }
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
