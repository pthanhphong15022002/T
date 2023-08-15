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
  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('uploader') uploader!: UploaderComponent;

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
  displayMode:string = "";

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
      this.reportID)
    .subscribe((res: any) => {
      if (res) {
        this.data = res;
        this.recID = this.data.recID;
        this.displayMode = this.data.displayMode;
        this.parameters = this.data.parameters;
        this.getRootFunction(this.data.moduleID, this.data.reportType);
        if(this.data.displayMode == "3" || this.data.displayMode == "4")
        {
          this.getFileTemplate(this.data.templateID);
        }
        if(this.data.reportContent){
          if(this.data.reportContent.split(',').length ==1){
            this.data.reportContent = `data:application/${this.data.reportName ?this.data.reportName.split('.')[1]: 'rdl'};base64,${this.data.reportContent}`
          }

          let file = this.dataBase64toFile(this.data.reportContent,this.data.location ? this.data.location : this.data.reportName);
          let fileInfo:any = {};
          fileInfo.id=file.name;
          fileInfo.name = file.name;
          fileInfo.rawFile = file;
          fileInfo.type=file.type;
          fileInfo.statusCode='1';
          fileInfo.status='Sẵn sàng';
          fileInfo.size =file.size;
          let filePop:any={};
          filePop.name=this.data.location ? this.data.location : this.data.reportName;
          filePop.size = file.size;
          filePop.type = file.type.split('/')[1];
          this.files.push(filePop);
          let ins = setInterval(()=>{
            if(this.uploader){
              clearInterval(ins);
              this.uploader.filesData=[];
              this.uploader.filesData.push(fileInfo);
              this.uploader.refresh();
            }
          },50)

        }
      } else {
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
    this.displayMode = "";
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
  popup() {
    if (this.attachment && this.attachment.fileUploadList.length == 0) {
      this.attachment.uploadFile();
      this.checkFile = true;
    }
  }

  valueChange(evt: any) {
    this.data[evt.field] = evt.data;
  }

  valueRadio(evt: any) {
    if (evt.field == 'signatures') {
      this.data[evt.field] = parseInt(evt.data);
    } else {
      this.data[evt.field] = evt.data;
    }
  }

  getRootFunction(module:string, type:string){
    this.api.execSv("SYS","ERM.Business.SYS","FunctionListBusiness","GetFuncByModuleIDAsync",[module,type]).subscribe((res:any)=>{
      this.rootFunction = res;
    })
  }

  saveForm() {
    if (!this.data.recID)
    {
      this.data.recID = this.recID;
    }
    if(!this.data.customName) {
      this.data.customName = this.data.defaultName;
    }  
    if(!this.data.service)
    {
      this.data.service = 'rpt' + this.data.moduleID.toLowerCase();
    }
    if (!this.data.reportType) {
      this.data.reportType = 'R';
    }
    if(this.data.reportContent && this.data.reportContent.split(',').length >1)
    {
      this.data.reportContent = this.data.reportContent.split(',')[1];
    }
    this.data.displayMode = this.displayMode;
    this.api
      .execSv(
        'rptrp',
        'Codx.RptBusiness.RP',
        'ReportListBusiness',
        'AddUpdateAsync',
        [this.data])
        .subscribe((res:any) => {
        if(this.data.reportContent){
          this.setDataset();
        }
        this.dialog.close();
      });

  }
  setDataset(){
    let serviceName = this.data.service;
    if (!serviceName) {
      serviceName = 'rpt' + this.moduleName.toLowerCase();
    }
    this.api.execSv(serviceName,'Codx.RptBusiness','ReportBusiness','SetDatasetAsync',this.reportID).subscribe();
  }


  uploading(e:BeforeUploadEventArgs){
  }
  beforeUpload(e:BeforeUploadEventArgs){
  }
  isBlockBtn:boolean = false;
  fileSelected(e:any){
    debugger;
    if(e.filesData.length == 0) {
      this.notiService.notify("Bạn chưa chọn file","2");
      return;
    }
    let file = e.filesData[0].rawFile;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    let t=this;

    this.isBlockBtn = false;
    reader.onload = function () {
      let strBase64 = reader.result;
      if((strBase64 as string).split(',').length > 1){
        strBase64 = (strBase64 as string).split(',')[1];
      }
      t.data.reportContent = strBase64;
      t.data.location = file.name;
    };

}
 onFileRemove(args: RemovingEventArgs): void {
  args.postRawFile = false;
  this.data.reportContent='';
  this.data.location='';
  }

  download(){
    if(this.data?.service && this.data?.reportName)
    {
      let fileName = this.data.reportName;
      this.api.execSv(this.data.service,
      'Codx.RptBusiness',
      'ReportBusiness',
      'GetReportRootFileAsync',
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
  }

  fileRendering(e:any){
    let iconEle = document.createElement('i');
    iconEle.classList.add('icon-i-cloud-arrow-down','icon-20','text-hover-primary','icon-download-report')
    iconEle.title = 'download';
    let t= this;
    iconEle.addEventListener('click',function(){
      t.downloadCustomFile();
    });
    e.element.insertBefore(iconEle,e.element.lastChild)
  }

  private downloadCustomFile(){
    let linkSource = this.data.reportContent;
    if(linkSource.split(',').length ==1){
        linkSource = `data:application/${this.data.reportName ?this.data.reportName.split('.')[1]: 'rdl'};base64,${linkSource}`
        }
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = this.data.reportName;
      downloadLink.click();
  }

  private dataBase64toFile(dataStr:string, filename:string) {
    let arr = dataStr.split(','),
        mime =this.data.reportName.split('.')[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    if(arr.length>1){
      mime = arr[0]?.match(/:(.*?);/)[1]
    }
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  clickUpload(mode:string)
  {
    this.displayMode = mode;
    if(mode == "0")
    {
      let ctrl = this.uploader.element as HTMLElement;
      ctrl?.click();
    }
    else     
    {
      let option = new DialogModel();
      option.FormModel = this.dialog.formModel;
      option.DataService = null;
      this.callFuncService
        .openForm(
          CodxExportAddComponent,
          null,
          1100,
          800,
          null,
          {
            action: 'add',
            type: mode == "3" ? "excel" : "word",
            refType: "RP_ReportList",
            refID: this.data.recID,
            formModel: this.dialog.formModel
          },
          '',
          option
        ).closed.subscribe((res:any) => {
          if(res?.event?.length > 0)
          {
            this.data.templateID = res.event[0].recID;
            this.data.reportName = res.event[2];
          }
        })
    }
  }
  clickDowload(mode:string){
    if(mode =="0")
      this.downloadCustomFile();
    else
    {
      if(this.pathDisk){
        const downloadLink = document.createElement("a");
        downloadLink.href = this.pathDisk;
        downloadLink.download = this.data.reportName;
        downloadLink.click();
      }
      else{
        this.notiService.notify("Template không tồn tại","2");
      }
    }
  }

  pathDisk:string = "";
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
        if(res?.length > 0){
          this.pathDisk = `${environment.urlUpload}/${res[0].pathDisk}`;
        }
        
      });
    }
  }
}
class GuId {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
