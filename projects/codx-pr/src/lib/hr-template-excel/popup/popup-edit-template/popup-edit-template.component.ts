import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CallFuncService, DialogData, DialogModel, DialogRef, NotificationsService, Util } from 'codx-core';
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
  user:any;
  @ViewChild("tmpViewDataSet") tmpViewDataSet:TemplateRef<any>;
  @ViewChild("tmpPopTutorial") tmpPopTutorial:TemplateRef<any>;

  constructor
  (
    private api:ApiHttpService,
    private notiSV:NotificationsService,
    private callFC:CallFuncService,
    private auth:AuthStore,
    private detectorRef:ChangeDetectorRef,
    @Optional() dialogRef?:DialogRef,
    @Optional() dialogData?:DialogData
  ) 
  {
    this.user = auth.get();
    this.dialog = dialogRef;
    if(dialogData && dialogData?.data)
    {
      let obj = dialogData.data;
      if(obj)
      {
        this.data = JSON.parse(JSON.stringify(obj.data));
        this.action = obj.action;
        this.headerText = dialogData.data.headerText;
        if(obj.groupSalCode) this.data.groupSalCodes = obj.groupSalCode.split(";").join(";");
      }
    }
  }
  ngOnInit(): void {
    if(this.data) this.getReportList(this.data.hrTemplateID,this.dialog?.formModel?.entityName);
    this.getRootReport();
  }

  ngAfterViewInit(): void {
  }

  getReportList(reportID:string,entityName:string){
    if(reportID && entityName)
    {
      let predicate = "ReportID = @0 && EntityName = @1"
      this.api.execSv("rptrp",'Codx.RptBusiness.RP',"ReportListBusiness","GetReportByPredidateAsync",[predicate,reportID,entityName])
      .subscribe((res:any) => {
        if(res && res.length > 0)
        {
          this.rpReportList = res[0];
          this.detectorRef.detectChanges();
        }
      });
    }
  }

  
  getRootReport(){
    let predicate = "ReportID = @0 && EntityName = @1 && IsCustomize = @2"
    let isCustomize = false;
    this.api.execSv("rptrp",'Codx.RptBusiness.RP',"ReportListBusiness","GetReportByPredidateAsync",[predicate,this.dialog?.formModel?.funcID,this.dialog?.formModel?.entityName,isCustomize])
    .subscribe((res:any) => {
      if(res && res?.length > 0)
      {
        this.rootReport = res[0];
        this.detectorRef.detectChanges();
      }
    });
  }

  valueChange(event:any){
    if(event && event?.field)
    {
      this.data[event.field] = event.data;
      this.detectorRef.detectChanges();
    }
  }

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

  add(data:any){
    if(data)
    {
      data.recID = Util.uid();
      data.templateCategory = "Payroll";
      if(this.rpReportList) this.data.templateID = this.rpReportList.templateID;
      data.createdBy = this.user.userID;
      data.createdOn = new Date();
      this.api.execSv("HR","HR","TemplateExcelBusiness","SaveAsync",[data])
      .subscribe((res:boolean) => {
        if(res)
        {
          this.notiSV.notifyCode("SYS006");
          this.dialog.close(data);
        }
        else this.notiSV.notifyCode("SYS023");
      });  
    }
      
  }

  edit(data:any){
    if(data)
    {
      this.api.execSv("HR","HR","TemplateExcelBusiness","UpdateAsync",[data])
      .subscribe((res:boolean) => {
        if(res)
        {
          this.notiSV.notifyCode("SYS007");
          this.dialog.close();
        }
        else this.notiSV.notifyCode("SYS021");
      });  
    }
  }

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
  
  viewDataSet(){
    if(this.rootReport)
    {
      this.api.execSv("BI","BI","CubesBusiness","GetByCubeIDAsync",this.rootReport.cubeID)
      .subscribe((res:any) => {
        if(res)
        {
          this.dataSets = res;
          this.detectorRef.detectChanges();
          let dialogModel = new DialogModel();
          dialogModel.FormModel = this.dialog.formModel;
          this.callFC.openForm(this.tmpViewDataSet,"",500, 700,"",null,"",dialogModel);
        }
      });
    }
  }

  addTemplate(){
    if(this.data && this.data?.hrTemplateID)
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
          this.rpReportList.id = "";
          this.rpReportList.reportID = this.data.hrTemplateID;
          this.rpReportList.templateID = adTemplateExcel.recID;
          this.rpReportList.isCustomize = true;
          this.rpReportList.createdBy = this.user.userID;
          this.rpReportList.createdOn = new Date();
          this.rpReportList.modifiedBy = "";
          this.rpReportList.modifiedOn = null;
          this.api.execSv("rptrp",'Codx.RptBusiness.RP',"ReportListBusiness","AddUpdateAsync",this.rpReportList)
          .subscribe();
        }
      });
    }
    else this.notiSV.notify("Vui lòng nhập mã bảng lương");
  }

  editTemplate(){
    this.api.execSv("SYS","AD","ExcelTemplatesBusiness","GetAsync",this.rootReport.templateID)
    .subscribe((res:any) => {
      if(res)
      {
        let dialogModel = new DialogModel();
        dialogModel.FormModel = this.dialog.formModel;
        this.callFC.openForm(
        CodxExportAddComponent,
        '',
        screen.width,
        screen.height,
        this.dialog.formModel.funcID,
        { data: res ,action: 'edit', type: 'excel', refType: 'RP_ReportList' },
        '',
        dialogModel);
      }
    });
    
  }

  viewInfo(){
    if(this.tmpPopTutorial)
    {
      let dialogModel = new DialogModel();
      dialogModel.FormModel = this.dialog.formModel;
      this.callFC.openForm(this.tmpPopTutorial,"",600, 500,"",null,"",dialogModel);
    }
  }
}
