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

  title: string = 'Thêm mới báo cáo';
  tabContent: any[] = [];
  tabTitle: any[] = [];
  dialog: any;
  data: any;
  fuctionItem: any = {};
  reportID: any;
  recID: any;
  checkFile = false;
  defaultName: any;
  className: any;
  description: any;
  assemblyName: any;
  methodName: any;
  moduleName: any;
  funcID: any;
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
  rootFunction:any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    public atSV: AttachmentService,
    private cache: CacheService,
    private callFuncService: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    if(dt.data.rootFunction){
      this.rootFunction = dt.data.rootFunction;
    }
    else if(dt.data && !dt.data.rootFunction){
      this.reportID = dt?.data;
    }
    this.dialog = dialog;
    if (this.dialog.formModel) {
      this.funcID = this.dialog.formModel.funcID;
    }
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.tabContent = [this.tabInfo, this.tabParam, this.tabSignature, this.tabTemplate];
    this.tabTitle = [this.menuInfo, this.menuParam, this.menuSignature,this.menuTemplate];
    if (this.reportID) {
     this.getReport();
     this.getExcelTemplate();
     //this.getReportParams();

    } else this.setDefaut();
  }

  getReport(){
    this.api
    .execSv(
      'rptsys',
      'Codx.RptBusiniess.SYS',
      'ReportListBusiness',
      'GetByReportIDAsync',
      this.reportID
    )
    .subscribe((res: any) => {
      if (res) {
        this.data = res;
        this.recID = this.data.recID;
        this.parameters = this.data.parameters;
        this.getRootFunction(this.data.moduleID, this.data.reportType);
      } else {
        this.setDefaut();
      }
    });
  }

  // getReportParams(){
  //   this.api
  //   .execSv(
  //     'rptsys',
  //     'Codx.Businiess.CM',
  //     'LVReportHelper',
  //     'GetReportParamAsync',
  //     this.reportID
  //   )
  //   .subscribe((res: any) => {
  //     if (res) {
  //       this.parameters = res.parameters;
  //     }
  //   });
  // }

  setReportParams(){
    this.notiService.alertCode("Nếu chọn sẽ định dạng lại toàn bộ tham số, tiếp tục?").subscribe((res:any)=>{
      if(res.event.status == 'Y'){
        let serviceName = this.data.service;
        if (!this.data.service) serviceName = 'rpt' + this.moduleName;
        if(serviceName.includes('undefined')){
          serviceName = 'rptsys';
        }
         this.api
              .execSv(
                'rptsys',
                'Codx.RptBusiness.CM',
                'LVReportHelper',
                'GetReportParamsAsync',
                this.reportID
              )
              .subscribe((res: any) => {
                if (res) {
                  this.parameters = res;
                  this.data.parameters = this.parameters;
                  this.api.execSv('rptsys',
                  'Codx.RptBusiniess.SYS',
                  'ReportListBusiness',
                  'UpdateReportInfoAsync',
                  this.data).subscribe()
                }
              });
      }
    })
  }

  setDefaut() {
    this.recID = Util.uid();
    this.data = {};
    this.data.description = null;

    this.cache.functionList(this.rootFunction).subscribe((res) => {
      if (res) {
        this.moduleName = res.module;
        this.data.moduleID=this.moduleName;
        this.api.execSv("rptsys", 'Codx.RptBusiniess.SYS',
        'ReportListBusiness',
        'CreateFunctionIDAsync',[ this.moduleName,'R']).subscribe((res:any)=>{
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
        this.funcID,
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
        if(res.event.status == 'Y'){
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

  // cellSave(evt: any){
  //   if(evt.action == 'edit'){
  //     if(JSON.stringify(this.oldParamData) == JSON.stringify(evt.data)) return;
  //     this.api
  //     .execSv(
  //       'SYS',
  //       'ERM.Business.SYS',
  //       'ReportParametersBusiness',
  //       'UpdateReportParamAsync',
  //       evt.data
  //     )
  //     .subscribe((res: any) => {
  //       if (res) {
  //         this.getReportParams();
  //       }
  //     });
  //   }
  // }
  setTitle(evt: any) {}

  buttonClick(evt: any) {}

  excelTemplate(){
    let op = new DialogModel();
    let dialog = this.callFuncService.openForm(CodxExportAddComponent,"",screen.width,screen.height,this.funcID,{action:'add',type:'excel',refType:'R',refID:this.reportID},"",op)
    dialog.closed.subscribe((res:any)=>{
      if(res.event){
        debugger
      }
    })
  }
  editTemplate(action:string,data:any){
    if(action == 'edit'){
      let op = new DialogModel();
      op.DataService = data;
      let dialog = this.callFuncService.openForm(CodxExportAddComponent,"",screen.width,screen.height,this.funcID,{action:'add',type:'excel',refType:'R',refID:this.reportID},"",op)
      dialog.closed.subscribe((res:any)=>{
        if(res.event){
          debugger
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
      if(res){
        this.rootFunction = res.functionID;
      }
    })
  }

  async saveForm() {
    if (!this.data.recID) {
      this.data.recID = this.recID;
    }
    if (this.attachment && this.attachment.fileUploadList.length > 0) {
      this.attachment.objectId = this.recID;

      (await this.attachment.saveFilesObservable()).subscribe((item2: any) => {

        if (item2?.status == 0) {
        }


      });
      this.data.reportName = this.data.location =
      this.attachment.fileUploadList[0].fileName;
    }
    if(!this.data.customName) this.data.customName = this.data.defaultName;
    if (!this.data.service) this.data.service = 'rpt' + this.moduleName;
    if(this.data.assemblyName) this.data.service = this.data.assemblyName.split(".").pop();
    this.fuctionItem.functionID = this.data.reportID;
    this.fuctionItem.functionType = 'R';
    this.fuctionItem.parentID = this.funcID;
    this.fuctionItem.defaultName = this.fuctionItem.customName =
      this.data.defaultName;
    this.fuctionItem.description = this.data.description;
    this.fuctionItem.module = this.moduleName;
    this.fuctionItem.width = 0;
    this.fuctionItem.height = 0;

    if (!this.data.reportType) {
      this.data.reportType = 'R';
    }
    if (!this.data.service) {
      this.data.service = this.data.assemblyName;
    }
    this.api
      .execSv(
        'rptsys',
        'Codx.RptBusiniess.SYS',
        'ReportListBusiness',
        'AddUpdateAsync',
        [this.data, this.fuctionItem]
      )
      .subscribe((res) => {
        this.setDataset();
        this.dialog.close();
      });

  }
  setDataset(){
    let serviceName = this.data.service;
    if (!this.data.service) serviceName = 'rpt' + this.moduleName;
     this.api
          .execSv(
            'rptsys',
            'Codx.RptBusiness.CM',
            'LVReportHelper',
            'SetReportDatasetAsync',
            this.reportID
          )
          .subscribe();
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
