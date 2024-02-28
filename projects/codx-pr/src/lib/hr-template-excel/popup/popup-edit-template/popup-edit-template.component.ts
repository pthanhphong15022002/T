import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogModel, DialogRef, NotificationsService, Util } from 'codx-core';
import { CodxExportAddComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export-add/codx-export-add.component';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'pr-popup-edit-template',
  templateUrl: './popup-edit-template.component.html',
  styleUrls: ['./popup-edit-template.component.css']
})
export class PopupEditTemplateComponent implements OnInit,AfterViewInit {

  dialog:DialogRef;
  data:any;
  action:string;
  headerText:string = "Chi tiết bảng lương";
  rpReportList:any;
  adTemplate:any;
  rootReport:any;
  rootTemplate:any;
  dataSets:any[] = [];

  @ViewChild("tmpViewDataSet") tmpViewDataSet:TemplateRef<any>;

  constructor
  (
    private api:ApiHttpService,
    private notiSV:NotificationsService,
    private callFC:CallFuncService,
    private detectorRef:ChangeDetectorRef,
    @Optional() dialogRef?:DialogRef,
    @Optional() dialogData?:DialogData
  ) 
  {
    this.dialog = dialogRef;
    if(dialogData && dialogData?.data)
    {
      let obj = JSON.parse(JSON.stringify(dialogData.data));
      if(obj)
      {
        this.data = obj.data;
        this.action = obj.data;
        this.headerText = dialogData.data.headerText;
        if(obj.groupSalCode)
        {
          this.data.groupSalCodes = obj.groupSalCode.split(",").join(";");
        }
      }
    }
  }
  ngOnInit(): void {
    this.getReportList(this.data.hrTemplateID,this.dialog?.formModel?.entityName);
    this.getRootReport();
  }

  ngAfterViewInit(): void {
  }

  // get RP_ReportList default
  getRootReport(){
    let predicate = "ReportID = @0 && EntityName = @1 && IsCustomize = @2"
    let isCustomize = false;
    this.api.execSv("rptrp",'Codx.RptBusiness.RP',"ReportListBusiness","GetReportByPredidateAsync",[predicate,this.dialog?.formModel?.funcID,this.dialog?.formModel?.entityName,isCustomize])
    .subscribe((res:any) => {
      if(res && res?.length > 0)
      {
        this.rootReport = res[0];
        this.getADTemplate(this.rootReport.templateID,true);
        this.getDataSet(this.rootReport.cubeID);
        this.detectorRef.detectChanges();
      }
    });
  }

  getADTemplate(templateID:string, root:boolean = false){
    this.api.execSv("SYS",'AD',"ExcelTemplatesBusiness","GetAsync",templateID)
    .subscribe((res:any) => {
      if(res)
      {
        if(root)
          this.rootTemplate = res;
        else
          this.adTemplate = res;
        this.detectorRef.detectChanges();
      }
    });
  }

  // get RP_ReportList by HRTemplateID
  getReportList(reportID:string,entityName:string){
    if(reportID && entityName)
    {
      let predicate = "ReportID = @0 && EntityName = @1"
      this.api.execSv("rptrp",'Codx.RptBusiness.RP',"ReportListBusiness","GetReportByPredidateAsync",[predicate,reportID,entityName])
      .subscribe((res:any) => {
        if(res && res.length > 0)
        {
          this.rpReportList = res[0];
          this.getADTemplate(this.rootReport.templateID,false);
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  //value change
  valueChange(event:any){
    if(event && event?.field)
    {
      this.data[event.field] = event.data;
      this.detectorRef.detectChanges();
    }
  }

  //on seo phôn
  onSaveForm(){
    if(!this.data.hrTemplateID)
      this.notiSV.notify("Vui lòng nhập mã bảng lương");
    else if(!this.data.hrTemplateName)
      this.notiSV.notify("Vui lòng nhập tên bảng lương");
    else
    {
      if(this.action === 'add')
        this.add(this.data);
      else if(this.action === 'edit')
        this.edit(this.data);
    }
  }

  // ác
  add(data:any){
    if(data)
    {
      data.recID = Util.uid();
      data.templateCategory = "Payroll";
      this.api.execSv("HR","HR","TemplateExcelBusiness","SaveAsync",[data, this.rpReportList.templateID])
      .subscribe((res:boolean) => {
        if(res)
        {
          this.notiSV.notifyCode("SYS006");
          this.dialog.close();
        }
        else this.notiSV.notifyCode("SYS023");
      });  
    }
      
  }

  // e đích
  edit(data:any){
    if(data)
    {
      this.api.execSv("HR","HR","TemplateExcelBusiness","UpdateAsync",[data, this.rpReportList.templateID])
      .subscribe((res:boolean) => {
        if(res)
        {
          this.notiSV.notifyCode("SYS006");
          this.dialog.close();
        }
        else this.notiSV.notifyCode("SYS023");
      });  
    }
  }

  //đao lót phai tem léc
  dowloadExampleTemplate(){
    if(this.rootReport)
    {
      this.api.execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      [this.rootReport?.templateID].join(";"))
      .subscribe(async (files:any) => {
        if (files && files?.length > 0){
          let file = files.pop();
          // let pathDisk = `${environment.urlUpload}/${file.pathDisk}`;
          let blob = await fetch(`${environment.urlUpload}/${file.pathDisk}`).then((r) => r.blob());
          let url = window.URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', file.fileName);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    }
  }

  // gét đa ta séc
  getDataSet(cubeID:string){
    if(cubeID)
    {
      this.api.execSv("BI","BI","CubesBusiness","GetByCubeIDAsync",[cubeID])
      .subscribe((res:any) => {
        if(res){
          this.dataSets = res;
          this.detectorRef.detectChanges();
        }
      });
    }
  }
  
  // viu đa ta séc
  viewDataSet(){
    let dialogModel = new DialogModel();
    dialogModel.FormModel = this.dialog.formModel;
    this.callFC.openForm(this.tmpViewDataSet,"",500, 700,"",null,"",dialogModel);
  }

  // add template
  addTemplate(){
    if(this.data && this.data.hrTemplateID)
    {
      let dialogModel = new DialogModel();
      dialogModel.FormModel = this.dialog.formModel;
      let popup = this.callFC.openForm(
        CodxExportAddComponent,
        '',
        screen.width,
        screen.height,
        this.dialog.formModel.funcID,
        { action: 'add', type: 'excel', refType: 'RP_ReportList' },
        '',
        dialogModel
      );
      popup.closed.subscribe((res: any) => {
        if(res && res?.event) 
        {
          let adTemplateExcel = res.event[0];
          this.rpReportList = JSON.parse(JSON.stringify(this.rootReport));
          this.rpReportList.recID = Util.uid();
          this.rpReportList.reportID = this.data.hrTemplateID;
          this.rpReportList.templateID = adTemplateExcel.recID;
          this.rpReportList.isCustomize = true;
          this.api.execSv("rptrp",'Codx.RptBusiness.RP',"ReportListBusiness","AddUpdateAsync",this.rpReportList)
          .subscribe();
        }
      });
    }
    else this.notiSV.notify("Vui lòng nhập mã bảng lương");
  }

  // edit template
  editTemplate(){
    let dialogModel = new DialogModel();
    dialogModel.FormModel = this.dialog.formModel;
    this.callFC.openForm(
    CodxExportAddComponent,
    '',
    screen.width,
    screen.height,
    this.dialog.formModel.funcID,
    { action: 'edit', type: 'excel', refType: 'RP_ReportList' },
    '',
    dialogModel);
  }
}
