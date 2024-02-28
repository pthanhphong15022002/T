import { E } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, HostBinding, Injector, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CodxGridviewV2Component, DialogModel, DialogRef, FormModel, NotificationsService, SidebarModel, UIDetailComponent } from 'codx-core';
import { PopupEditTemplateComponent } from '../popup/popup-edit-template/popup-edit-template.component';

@Component({
  selector: 'pr-view-detail-template',
  templateUrl: './view-detail-template.component.html',
  styleUrls: ['./view-detail-template.component.css']
})
export class ViewDetailTemplateComponent extends UIDetailComponent implements OnChanges, AfterViewInit {

  @HostBinding('class') get valid() { return "d-block w-100 h-100"; }
  @Input() runMode:string;
  @Input() formModel:FormModel;
  @Input() hideMF:boolean = true;

  data:any;
  gridColumns:any[] = [];
  loaded:boolean = false;
  tabControl = [
    {
      name: 'History',
      textDefault: 'Lịch sử',
      isActive: true,
      icon: 'icon-i-clock-history',
    },
    {
      name: 'Comment',
      textDefault: 'Thảo luận',
      isActive: false,
      icon: 'icon-i-chat-right',
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      icon: 'icon-i-paperclip',
    }
  ];
  @ViewChild("tmpEmpCell") tmpEmpCell:TemplateRef<any>;
  @ViewChild("tmpCellValue") tmpCellValue:TemplateRef<any>;
  @ViewChild("codxGrvV2") codxGrvV2:CodxGridviewV2Component;
  @ViewChild("tmpUpdateGroupSal") tmpUpdateGroupSal:TemplateRef<any>;

  constructor
  (
    private injector:Injector,
    private notiSV:NotificationsService
  ) 
  {
    super(injector);
  }

  onInit(): void {
    this.loadData(this.recID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes?.recID && changes?.recID?.currentValue !== changes?.recID?.previousValue)
    {
      this.loadData(this.recID);
    }
  }

  ngAfterViewInit(): void {
    this.gridColumns = [
      {
        field: 'employeeID',
        headerText: 'Nhân viên', // chưa có gridviewsetup
        template: this.tmpEmpCell,
      },
      {
        field: 'positionName',
        headerText: 'Bộ phận', // chưa có gridviewsetup
        template: this.tmpCellValue,
      },
      {
        field: 'departmentName',
        headerText: 'Phòng ban', // chưa có gridviewsetup
        template: this.tmpCellValue,
      },
      {
        field: 'groupSalName',
        headerText: 'Nhóm lương', // chưa có gridviewsetup
        template: this.tmpCellValue,
      }
    ];
    setTimeout(() => {
      this.setDetailBody();
    },2000);
    this.detectorRef.detectChanges();
  }

  loadData(recID:string){
    if(recID)
    {
      this.api.execSv("HR","HR","TemplateExcelBusiness","GetByIDAsync",[recID])
      .subscribe((res:any) => {
        if(res)
        {
          this.data = res;
          this.getADExcelTemplates(this.data.hrTemplateID,this.formModel.entityName);
          this.detectorRef.detectChanges();
        }
        this.loaded = true;
      });
    }
  }
  
  rpReportList:any;
  getADExcelTemplates(reportID:string,entityName:string){
    if(reportID && entityName)
    {
      let predicate = "ReportID = @0 && EntityName = @1"
      this.api.execSv("rptrp",'Codx.RptBusiness.RP',"ReportListBusiness","GetReportByPredidateAsync",[predicate,reportID,entityName])
      .subscribe((res:any) => {
        this.rpReportList = res;
        this.detectorRef.detectChanges();
      });
    }
  }

  clickMF(event:any){
    switch(event.functionID){
      case"SYS03":
        this.edit();
        break;
    }
  }

  edit(){
    let sidebarModel = new SidebarModel();
    sidebarModel.FormModel = this.formModel;
    sidebarModel.Width = '550px';
    this.callfc.openSide(PopupEditTemplateComponent,this.data,sidebarModel,this.funcID);
  }

  setDetailBody(){
    let header = document.getElementsByClassName("codx-detail-header")[0] as HTMLElement;
    let body = document.getElementsByClassName("codx-detail-body")[0] as HTMLElement;
    if(header && body)
    {
      header.classList.remove("mt-3");
      body.classList.remove("mt-2");
      body.style.setProperty("height",`calc(100% - ${header.clientHeight}px)`);
    }
  }

  changeDataMF(event:any){
    event.forEach(element => {
     if(element.functionID === "SYS01" || element.functionID === "SYS02" || element.functionID === "SYS03" || element.functionID === "SYS04")
     {
       element.disabled = false;
       element.isbookmark = element.functionID === "SYS01";
     }
     else element.disabled = true; 
    }); 
  }

  openPopupEditGroupSalCode(){
    if(this.tmpUpdateGroupSal)
    {
      let dialogModel = new DialogModel();
      dialogModel.FormModel = this.formModel;
      dialogModel.zIndex = 99;
      this.callfc.openForm(this.tmpUpdateGroupSal,"",600,400 ,this.formModel.funcID,null,"",dialogModel);
    }
  }

  groupSalCode:string = "";
  departmentIDs:string = "";
  skipGroupSalCode:boolean = false;
  valueChange(event:any){
    if(event && event.field)
    {
      let field = event.field;
      switch(field)
      {
        case "groupSalCode":
          this.groupSalCode = event.data;
          break;
        case "departmentID":
          this.departmentIDs = event.data.value.join(";");
          break;
        case "skipGroupSalCode":
          this.skipGroupSalCode = event.data;
          break;
      }
    }
  }

  updateGroupSalCode(dialog:DialogRef){
    if(!this.groupSalCode)
    {
      this.notiSV.notifyCode("HR061");
      return;
    }
    if(!this.departmentIDs)
    {
      this.notiSV.notifyCode("HR062");
      return;
    }
    this.notiSV.alertCode("HR063")
    .subscribe((confirm:any) => {
      if(confirm && confirm?.event?.status == "Y")
      {
        this.api.execSv("HR","HR","TemplateExcelBusiness","UpdateGroupSalCodeAsync",[this.groupSalCode,this.departmentIDs,this.skipGroupSalCode])
        .subscribe((res:boolean) => {
          if(res)
          {
            this.notiSV.notifyCode("SYS007");
            dialog.close();
          }
          else this.notiSV.notifyCode("SYS021");
        });
      }
    })
  }
}
