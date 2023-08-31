import { T } from '@angular/cdk/keycodes';
import {
  Component,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  Optional,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { BeforeUploadEventArgs, RemovingEventArgs, RenderingEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import {
  ApiHttpService,
  AuthStore,
  NotificationsService,
  CacheService,
  DialogData,
  DialogRef,
  Util,
  CallFuncService,
  DialogModel,
  AlertConfirmInputConfig,
  DataRequest,
} from 'codx-core';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AttachmentService } from 'projects/codx-share/src/lib/components/attachment/attachment.service';
import { CodxExportAddComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export-add/codx-export-add.component';
import { utils } from 'xlsx';
import { PopupEditParamComponent } from '../popup-edit-param/popup-edit-param.component';
import {L10n } from '@syncfusion/ej2-base';
import { FileInfo } from '@shared/models/file.model';

import { EmitType } from '@syncfusion/ej2-base';
import { environment } from 'src/environments/environment';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { Html } from '@syncfusion/ej2-angular-diagrams';

L10n.load({
  vi: {
    "uploader": {
      "Browse": "Duyệt ...",
      "Clear": "Xóa tất cả",
      "Upload": "Tải lên",
      "dropFilesHint": "Hoặc thả tập tin ở đây",
      "invalidMaxFileSize": "Kích thước tệp quá lớn",
      "invalidMinFileSize": "Kích thước tệp quá nhỏ",
      "invalidFileType": "Loại tệp không được phép",
      "uploadFailedMessage": "Không thể tải lên tệp",
      "uploadSuccessMessage": "Tải tài liệu thành công",
      "removedSuccessMessage": "Xóa tệp thành công",
      "removedFailedMessage": "Không thể xóa tệp",
      "inProgress": "Đang tải lên",
      "readyToUploadMessage": "Sẵn sàng để tải lên",
      "abort": "Huỷ bỏ",
      "remove": "Loại bỏ",
      "cancel": "Hủy bỏ",
      "delete": "Xóa  tệp",
      "pauseUpload": "Tạm dừng tải lên tệp",
      "pause": "Tạm ngừng",
      "resume": "Sơ yếu lý lịch",
      "retry": "Thử lại",
      "fileUploadCancel": "Đã hủy tải lên tệp"
    },
  }})
@Component({
  selector: 'popup-add-report',
  templateUrl: './popup-add-report.component.html',
  styleUrls: ['./popup-add-report.component.scss'],
})
export class PopupAddReportComponent implements OnInit, AfterViewInit {
  @ViewChild('tabInfo') tabInfo: TemplateRef<any>;
  @ViewChild('tabParam') tabParam: TemplateRef<any>;
  @ViewChild('tabSignature') tabSignature: TemplateRef<any>;
  @ViewChild('tabTemplate') tabTemplate: TemplateRef<any>;
  @ViewChild('uploader') uploader!: UploaderComponent;
  @ViewChild("codxATM") codxATM : AttachmentComponent;
  files:any=[];
  title: string = 'Thêm mới báo cáo';
  tabContent: any[] = [];
  tabTitle: any[] = [];
  dialog: any;
  data: any;
  reportID: any;
  recID: any;
  checkFile = false;
  defaultName: any;
  className: any;
  description: any;
  assemblyName: any;
  methodName: any;
  moduleName: any;
  menuInfo = {
    icon: 'icon-info',
    text: 'Thông tin chung',
    name: 'Description',
    subName: 'Description Info',
    subText: 'Description Info',
  };
  menuParam = {
    icon: 'icon-assignment_turned_in',
    text: 'Tham số báo cáo',
    name: 'Report parameters',
    subName: 'Report parameters',
    subText: 'Report parameters',
  };
  menuSignature = {
    icon: 'icon-assignment',
    text: 'Chữ ký',
    name: 'Sinatures',
    subName: 'Sinatures',
    subText: 'Sinatures',
  };
  menuTemplate = {
    icon: 'icon-grid_on',
    text: 'Excel Template',
    name: 'ExcelTemplate',
    subName: 'ExcelTemplate',
    subText: 'ExcelTemplate',
  };

  moreFunction = [
    {
      id: 'edit',
      icon: 'icon-edit',
      text: 'Chỉnh sửa',
      textColor: '#307CD2',
    },
    {
      id: 'delete',
      icon: 'icon-delete',
      text: 'Xóa',
      textColor: '#F54E60',
    },
  ];
  parameters: any = [];
  signatures: any = [];
  dataEx:any=[];
  fields: any = {};
  module:any;
  rootFunction:any = null;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    public atSV: AttachmentService,
    private cache: CacheService,
    private callFuncService: CallFuncService,
    // private realHub: RealHubService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    if(dt?.data?.module){
      this.module = dt.data.module;
    }
    if(dt?.data?.reportID){
      this.reportID = dt.data.reportID;
    }
    this.dialog = dialog;
  }

  ngOnInit(): void {
    if (this.reportID) 
    {
      this.getReport();
      this.getExcelTemplate();
     }
     else this.setDefaut();
     
  }

  ngAfterViewInit(): void {
    this.tabContent = [this.tabInfo, this.tabParam, this.tabSignature, this.tabTemplate];
    this.tabTitle = [this.menuInfo, this.menuParam, this.menuSignature];
  }

  getReport(){
    this.api
    .execSv(
      'rptrp',
      'Codx.RptBusiness.RP',
      'ReportListBusiness',
      'GetAsync',
      [this.reportID])
    .subscribe((res: any) => {
      if (res) {
        this.data = res;
        this.recID = this.data.recID;
        this.parameters = this.data.parameters;
        this.getRootFunction(this.data.moduleID, this.data.reportType);
        if(this.data.displayMode == "3" || this.data.displayMode == "4")
        {
          let fileIcon = this.data.displayMode == "3" ? "xls.svg":"doc.svg";
          this.data.icon = `../../../assets/codx/dms/${fileIcon}`;
          this.getFileTemplate(this.data.templateID);
        }
        else
        {
          this.data.icon = "../../../assets/codx/dms/file.svg";
        }
      } 
      else
      {
        this.setDefaut();
      }
    });
  }

  setReportParams(){
    this.notiService.alertCode("Nếu chọn sẽ định dạng lại toàn bộ tham số, tiếp tục?")
    .subscribe((res:any)=>{
      if(res.event.status == 'Y')
      {
        this.api.execSv(
            'rptrp',
            'Codx.RptBusiness',
            'LVReportHelper',
            'GetReportParamsAsync',
            [this.reportID])
            .subscribe((res: any) => {
              if (res) 
              {
                this.parameters = res;
                this.data.parameters = this.parameters;
                this.api.execSv(
                  'rptrp',
                  'Codx.RptBusiness.RP',
                  'ReportListBusiness',
                  'AddUpdateAsync',
                  [this.data])
                  .subscribe();
              }
          });
      }
    })
  }

  setDefaut() {
    this.recID = Util.uid();
    this.data = {};
    this.data.description = null;
    this.data.displayMode = "1";
    this.cache.functionList(this.module)
    .subscribe((res) => {
      if (res) {
        this.moduleName = res.module;
        this.data.moduleID=this.moduleName;
        this.api.execSv("rptrp",
        'Codx.RptBusiness.RP',
        'ReportListBusiness',
        'CreateFunctionIDAsync',[ this.moduleName,'R'])
        .subscribe((res:any)=>{
          if(res){
            this.reportID = res;
            this.data.reportID = this.reportID;
          }
        })
      }
    });
  }

  editParam(evt: any){
    if(evt){
      let option = new DialogModel();
      option.FormModel = this.dialog.formModel;
     let dialog = this.callFuncService.openForm(
        PopupEditParamComponent,
        '',
        600,
        800,
        this.dialog?.formModel?.funcID,
        evt,
        '',
        option
      );
      dialog.closed.subscribe((res:any)=>{
        if(res.event){
         let dataReturned = res.event;
         if(!dataReturned.recID){
          dataReturned.recID = Util.uid();
          dataReturned.createdBy = this.authStore.get().userID;
          dataReturned.createdOn = new Date;
          this.parameters.push(dataReturned);
         }
         else{
          let idx = this.parameters.findIndex((x:any)=> x.controlName == dataReturned.controlName || x.recID == dataReturned.recID);
          if(idx>-1){
            this.parameters[idx] = dataReturned;
          }
         }
         this.data.parameters = this.parameters;

        }
      })
    }
  }

  deleteParam(evt: any){
    if(evt && evt.recID){
      this.notiService.alertCode("Xóa tham số?").subscribe((res:any)=>{
        if(res.event.status == 'Y')
        {
          // this.api.execSv(
          //   'SYS',
          //   'ERM.Business.SYS',
          //   'ReportParametersBusiness',
          //   'DeleteReportParamAsync',
          //   evt.recID
          // )
          // .subscribe((res: any) => {
          //   if (res) {
          //     this.getReportParams();
          //   }
          // });
        }
      })
    }
  }

  oldParamData: any;
  actionBegin(evt:any){
    if(evt.requestType == "beginEdit"){
      this.oldParamData = evt.rowData;
    }
  }

  getExcelTemplate(){
    this.api.execSv("SYS","ERM.Business.AD","ExcelTemplatesBusiness","GetByRefAsync",['R',this.reportID]).subscribe((res:any)=>{
      if(res) this.dataEx = res;
      this.changeDetectorRef.detectChanges();
    })
  }

  setTitle(evt: any) {}

  buttonClick(evt: any) {}

  excelTemplate(){
    let op = new DialogModel();
    let dialog = this.callFuncService.openForm(CodxExportAddComponent,"",screen.width,screen.height,"",{action:'add',type:'excel',refType:'R',refID:this.reportID},"",op)
    dialog.closed.subscribe((res:any)=>{
      if(res.event){
      }
    })
  }

  editTemplate(action:string,data:any){
    if(action == 'edit'){
      let op = new DialogModel();
      op.DataService = data;
      let dialog = this.callFuncService.openForm(CodxExportAddComponent,"",screen.width,screen.height,this.dialog?.formModel?.funcID,{action:'edit',type:'excel',refType:'R',refID:this.reportID},"",op)
      dialog.closed.subscribe((res:any)=>{
        if(res.event){
        }
      })
    }
    if(action == 'delete'){
      var config = new AlertConfirmInputConfig();
      config.type = 'YesNo';
      //SYS003
      this.notiService
        .alert('Thông báo', 'Bạn có chắc chắn muốn xóa ?', config)
        .closed.subscribe((x) => {
          if (x.event.status == 'Y') {
            var entity ='AD_ExcelTemplates';
            this.api
              .execAction(entity, [data], 'DeleteAsync')
              .subscribe((item:any) => {
                if (item == true) {
                  this.notiService.notifyCode('RS002');
                  this.dataEx = this.dataEx.filter(
                    (x) => x.recID != item[1][0].recID
                  );
                } else this.notiService.notifyCode('SYS022');
              });
          }
        });
    }
  }

  valueChange(evt: any) {
    this.data[evt.field] = evt.data;
  }

  getRootFunction(module:string, type:string){
    this.api.execSv("SYS","ERM.Business.SYS","FunctionListBusiness","GetFuncByModuleIDAsync",[module,type]).subscribe((res:any)=>{
      this.rootFunction = res;
    })
  }

  isLoaded = false;
  saveForm() {
    this.isLoaded = true;
    this.api
      .execSv(
        'rptrp',
        'Codx.RptBusiness.RP',
        'ReportListBusiness',
        'AddUpdateAsync',
        [this.data])
        .subscribe((res:any) => {
        if(this.data.isUpload && this.data.reportContent)
        {
          this.setDataset();
        }
        else
        {
          this.dialog.close(this.data);
        }
        this.isLoaded = false;
      });

  }

  setDataset(){
    this.api.execSv(this.data.service,'Codx.RptBusiness','ReportBusiness','SetDatasetAsync',this.reportID)
    .subscribe((res:boolean) => {
      this.dialog.close(this.data);
    });
  }

  valueRadio(evt: any) {
    if (evt.field == 'signatures') {
      this.data[evt.field] = parseInt(evt.data);
    } else {
      this.data[evt.field] = evt.data;
    }
  }



  clickUpload(type:string)
  {
    if(type == "word/excel")
    {
      this.uploadTemplate()
    }
    else
    {
      this.data.displayMode = "1";
      (this.uploader.element as HTMLElement)?.click();  
    }
  }

  templateType:string = "";
  uploadTemplate(){
    var gridModel = new DataRequest();
    gridModel.funcID = this.data.reportID;
    gridModel.formName = this.data.formName;
    gridModel.entityName = this.data.entityName;
    gridModel.gridViewName = this.data.gridViewName;
    this.callFuncService.openForm(
      CodxExportComponent,
      null,
      900,
      700,
      '',
      [
        gridModel,
        this.data.recID
      ],
      null
    ).closed.subscribe((res:any) => {
      if(res?.event)
      {
        this.data.templateID = res.event.templateInfo.recID;
        this.data.location = res.event.templateInfo.templateName;
        this.data.description = res.event.templateInfo.description;
        this.data.reportContent = "";
        this.blockBtn = true;
        this.templateType = res.event.templateType;
        if(res.event.templateType == "AD_WordTemplates")
        {
          this.data.displayMode = "4";
          this.data.icon = "../../../assets/codx/dms/docx.svg";
        }
        else
        {
          this.data.displayMode = "3";
          this.data.icon = "../../../assets/codx/dms/xlsx.svg";
        }
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  pathDisk:string = "";
  fileTemplate:any = null;
  getFileTemplate(templateID:string)
  {
    if(templateID)
    {
      this.api
      .execSv(
      'DM',
      'ERM.Business.DM',
      'FileBussiness',
      'GetFilesByIbjectIDAsync',
      [templateID]).subscribe((res:any) =>{
        if(res?.length > 0)
        {
          this.pathDisk = `${environment.urlUpload}/${res[0].pathDisk}`;
        }
        this.fileTemplate = res;
      });
    }
  }

  dowloadReportFile(){
    let linkSource = this.data.reportContent;
    let fileName = this.data.location ? this.data.location : this.data.reportName;
    if(linkSource != "" && linkSource?.split(',').length == 1)
    {
        linkSource = `data:application/${fileName ? fileName.split('.')[1]: 'rdl'};base64,${linkSource}`
    }
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  downloadReportFile(){
    let fileName = this.data.location ? this.data.location : this.data.reportName;
    this.api.execSv(
      this.data.service,
      'Codx.RptBusiness',
      'ReportBusiness',
      'GetReportFileAsync',
      [this.data.recID])
      .subscribe((res:any)=>{
        let linkSource = res;
        if(linkSource.split(',').length ==1){
          linkSource = `data:application/${fileName ? fileName.split('.')[1]: 'rdl'};base64,${linkSource}`
        }
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      });
  }

  removeReportFile(){
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService
    .alert("Thông báo", 'Bạn có chắc chắn muốn xóa ?', config)
    .closed.subscribe((x) => {
      if (x.event.status == 'Y')
      {
        this.data.reportContent = "";
        this.blockBtn = true;
        this.data.location = "";
        this.data.displayMode = null;
      }
    });
  }
  removeTemplate(e:any){
    this.data.displayMode = null;
    this.data.templateID = "";
    this.data.location = "";
    this.data.description = "";
  }

  blockBtn:boolean = false;
  selectedReportFile(e:any){
    if(e.filesData.length == 0) return;
    let file = e.filesData[0].rawFile;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    let t = this;
    this.blockBtn = false;
    reader.onload = function () {
      let strBase64 = reader.result;
      if((strBase64 as string)?.split(',')?.length > 1){
        strBase64 = (strBase64 as string).split(',')[1];
      }
      t.data.reportContent = strBase64;
      t.data.location = file.name;
      t.data.icon = "../../../assets/codx/dms/file.svg";
      t.data.size = t.formatBytes(file.size);
    };

  }

  formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    let k = 1024
    let dm = decimals < 0 ? 0 : decimals;
    let sizes = ['Bytes', 'KB', 'MB', 'GB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
