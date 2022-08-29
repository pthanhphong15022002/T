import { T } from "@angular/cdk/keycodes";
import { Component, ViewEncapsulation, OnInit, AfterViewInit, ChangeDetectorRef, Optional, ViewChild, TemplateRef } from "@angular/core";
import { ApiHttpService, AuthStore, NotificationsService, CacheService, DialogData, DialogRef, Util } from "codx-core";
import { AttachmentComponent } from "projects/codx-share/src/lib/components/attachment/attachment.component";
import { AttachmentService } from "projects/codx-share/src/lib/components/attachment/attachment.service";
import { utils } from "xlsx";

@Component({
  selector: 'popup-add-report',
  templateUrl: './popup-add-report.component.html',
  styleUrls: ['./popup-add-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PopupAddReportComponent implements OnInit, AfterViewInit {
  @ViewChild('tabInfo') tabInfo : TemplateRef<any>;
  @ViewChild('tabParam') tabParam : TemplateRef<any>;
  @ViewChild('tabSignature') tabSignature : TemplateRef<any>;
  @ViewChild('attachment') attachment : AttachmentComponent;

  title: string = 'Thêm mới báo cáo';
  tabContent: any[] = [];
  tabTitle: any[] = [];
  dialog: any;
  data : any ;
  fuctionItem:any = {};
  reportID: any;
  recID: any;
  checkFile = false;
  defaultName: any;
  className: any;
  description: any;
  assemblyName: any;
  methodName: any;
  moduleName: any;
  funcID:any;
  menuInfo= {
    icon: 'icon-info',
    text: 'Thông tin chung',
    name: 'Description',
    subName: 'Description Info',
    subText: 'Description Info',
  };
  menuParam= {
    icon: 'icon-assignment_turned_in',
    text: 'Tham số báo cáo',
    name: 'Report parameters',
    subName: 'Report parameters',
    subText: 'Report parameters',
  };
  menuSignature= {
    icon: 'icon-assignment',
    text: 'Chữ ký',
    name: 'Sinatures',
    subName: 'Sinatures',
    subText: 'Sinatures',
  };
  parameters: any = [];
  signatures: any = [];
  fields: any = {};
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private notiService: NotificationsService,
    public atSV: AttachmentService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ){
    this.reportID = dt?.data;
    this.dialog = dialog;
    if(this.dialog.formModel){
      this.funcID = this.dialog.formModel.funcID;
    }
   
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.tabContent = [
      this.tabInfo,
      this.tabParam,
      this.tabSignature
    ];
    this.tabTitle = [
      this.menuInfo,
      this.menuParam,
      this.menuSignature
    ];
 

    if(this.reportID){
      this.api.execSv("SYS", "ERM.Business.SYS", "ReportListBusiness", "GetByReportIDAsync", this.reportID).subscribe((res: any) => {
        if (res) {
         this.data = res;
         this.recID = this.data.recID;
        }else{
         this.setDefaut() ;
        }
      });
      this.api.execSv("SYS", "ERM.Business.SYS", "ReportParametersBusiness", "GetReportParamAsync", this.reportID).subscribe((res: any) => {
        if (res) {
         this.parameters = res.parameters;
        }
      });
    }else this.setDefaut() ;
  }
  setDefaut(){
    this.recID= Util.uid();
    this.data = {};
    this.data.description = null;

    this.cache.functionList(this.funcID).subscribe(res=>{
     if(res){
      this.moduleName = res.module;
      this.api.execSv("SYS","ERM.Business.SYS","ReportListBusiness","CreateFunctionIDAsync",[this.moduleName, 'R'] ).subscribe(res=>{
        if(res){
          this.data.reportID = res;
        }
      })
     }  
    });
  }

  setTitle(evt:any){

  }

  buttonClick(evt:any){

  }

  popup() {
    if(this.attachment && this.attachment.fileUploadList.length == 0){
      this.attachment.uploadFile();
      this.checkFile = true;
    }

  }

  valueChange(evt:any){
    this.data[evt.field] = evt.data;
  }

  valueRadio(evt: any){
    if(evt.field == 'signatures'){
      this.data[evt.field] = parseInt(evt.data);
    }
    else{
      this.data[evt.field] = evt.data;
    }
  }

  saveForm(){
    if(!this.data.recID){
      this.data.recID = this.recID;
    }
    if(this.attachment && this.attachment.fileUploadList.length > 0){
      this.data.reportName = this.data.location = this.attachment.fileUploadList[0].fileName;
    }

    this.fuctionItem.functionID = this.data.reportID;
    this.fuctionItem.functionType = 'R';
    this.fuctionItem.parentID = this.funcID;
    this.fuctionItem.defaultName =this.fuctionItem.customName = this.data.defaultName;
    this.fuctionItem.description = this.data.description;
    this.fuctionItem.module = this.moduleName;
    this.fuctionItem.width = 0;
    this.fuctionItem.height = 0;
    if(!this.data.reportType){
      this.data.reportType ='1';
    }
    if(!this.data.service){
      this.data.service = this.data.assemblyName;
    }
    console.log(this.fuctionItem);
    this.api.execSv("SYS","ERM.Business.SYS","ReportListBusiness","AddUpdateAsync",[this.data,this.fuctionItem]).subscribe(res=>{
      console.log(res);
      this.dialog.close();

    })


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
