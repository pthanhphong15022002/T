import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  CacheService,
  DataRequest,
  FormModel,
  NotificationsService,
  ResourceModel,
  UIComponent,
  UIDetailComponent,
  Util,
} from 'codx-core';

import { CodxCommonService } from 'projects/codx-common/src/lib/codx-common.service';
import { CodxPrService } from '../../codx-pr.service';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { ViewKowcodeComponent } from '../view-kowcode/view-kowcode.component';

@Component({
  selector: 'view-detail-request-kowds',
  templateUrl: './view-detail-request-kowds.component.html',
  styleUrls: ['./view-detail-request-kowds.component.css'],
})
export class ViewDetailRequestKowDsComponent extends UIDetailComponent
implements OnChanges, AfterViewInit{  
  @Input() hideMF = true;
  @Input() hideFooter = false;
  itemDetail:any; 
  @ViewChild('tempEmployee', { static: true }) tempEmployee: TemplateRef<any>;
  @ViewChild('tempKowTotal', { static: true }) tempKowTotal: TemplateRef<any>; 

  dataValues=[];
  oFuncID='PRTPro18a';
  oFunList: any;
  renderedGrid=false;
  oFormModel :any;
  gridFM :any;
  cbbKowCode = [];
  tabControl = [
    {
      name: 'History',
      textDefault: 'Lịch sử',
      isActive: true,
      icon: 'icon-i-clock-history',
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      icon: 'icon-i-paperclip',
    },
    {
      name: 'Comment',
      textDefault: 'Bình luận',
      isActive: false,
      icon: 'icon-i-chat-right',
    },
  ];
  curRecID ='';
  totalKowPr: any;
  totalKowDV: any;
  vllKowCode: any;
  gridKow: any;
  loadedCBB = false;
  reloadGrid: boolean;
  funcList:any;
  runMode: any;
  createdName="";
    gridKowColumns= [];
  constructor(
    injector: Injector,
    private authStore: AuthStore,
    private codxCommonService: CodxCommonService,
    private codxShareService: CodxShareService,
    private codxPrService: CodxPrService,
    private notify: NotificationsService,
    private df: ChangeDetectorRef
  ) {
    super(injector);
    //Lấy thông tin formName, grvName để dịch label    
    this.codxPrService.getFormModel(this.oFuncID).then(fm=>{
      this.oFormModel = fm;
    });
    this.cache.functionList(this.funcID).subscribe(func=>{
      this.funcList= func;
      this.runMode = func?.runMode;
    })
  }
  onInit(): void {
    this.gridFM = new FormModel();
    this.gridFM.formName ='KowDs';
    this.gridFM.gridViewName ='grvKowDsUIByKow';
    this.gridFM.entityName ='TS_KowDs';
    this.cache.valueList("HRKows").subscribe(res=>{
      if(res){
        this.vllKowCode = res?.datas;
        this.df.detectChanges();
      }
    });
    this.cache.gridViewSetup('KowDs','grvKowDsUIByKow').subscribe((res:any)=>{
      if(res){
        this.gridKow = Util.camelizekeyObj(res);
      }
    });
    this.loadCbxKowCode();
    this.gridFM = new FormModel();
    this.gridFM.formName = 'KowDs';
    this.gridFM.gridViewName = 'grvKowDsUIByKow';
    this.gridFM.entityName = 'TS_KowDs';

    this.cache
      .gridViewSetup('KowDs', 'grvKowDsUIByKow')
      .subscribe((res: any) => {
        if (res) {
          this.gridKowColumns = [];
          this.gridKow = Util.camelizekeyObj(res);
          for (let field in this.gridKow) {
            if (this.gridKow[field]?.fieldName == 'EmployeeID') {
              this.gridKowColumns.push({
                headerTemplate: 'Nhân viên',
                template: this.tempEmployee,
                field: 'employeeID',
              });
            } else if (this.gridKow[field]?.fieldName == 'KowCode') {
              if (this.cbbKowCode?.length > 0) {
                this.cbbKowCode.forEach((kow) => {
                  this.gridKowColumns.push({
                    headerText: kow?.KowID,
                    template: this.tempEmployee,
                    field: kow?.KowID,
                    refField: 'kowCode',
                  });
                });
                this.renderedGrid = true;
                this.detectorRef.detectChanges();
              } else {
                let gridModel = new DataRequest();
                gridModel.pageLoading = false;
                gridModel.comboboxName = this.gridKow[field]?.referedValue;
                this.api
                  .execSv(
                    'HR',
                    'ERM.Business.Core',
                    'DataBusiness',
                    'LoadDataCbxAsync',
                    [gridModel]
                  )
                  .subscribe((cbx: any) => {
                    if (cbx && cbx[0] != null) {
                      this.cbbKowCode = JSON.parse(cbx[0]);
                      if (this.cbbKowCode?.length > 0) {
                        this.cbbKowCode.forEach((kow) => {
                          this.gridKowColumns.push({
                            headerText: kow?.KowID,
                            template: this.tempKowTotal,
                            field: kow?.KowID,
                            refField: 'kowCode',
                          });
                        });
                      }
                      this.renderedGrid = true;
                      this.detectorRef.detectChanges();
                    }
                  });
              }
            }
          }
        }
      });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.recID?.currentValue 
      //&& changes?.recID?.currentValue != this.curRecID
    )
    {
      this.curRecID = changes?.recID?.currentValue;
      this.loadData();
    }
  }
  loadData(){
    this.api.execSv(
      'HR',
      'ERM.Business.PR',
      'KowDsBusiness',
      'GetViewDetailAsync',
      [this.curRecID,this.funcID]
    ).subscribe((res:any)=>{
      this.itemDetail = res;
      this.cache.getCompany(this.itemDetail?.createdBy).subscribe(crea=>{
        this.createdName = crea?.employeeName ?? this.itemDetail?.createdBy;
        this.detectorRef.detectChanges();
      })
      this.setPrDvTotalKowGrid();
      this.detectorRef.detectChanges();
    });
  }
  setPrDvTotalKowGrid(){
    this.totalKowDV= this.itemDetail?.recID;
    this.totalKowPr = 'RecID == @0';
    this.detectorRef.detectChanges();
  }
  loadCbxKowCode(){
    let gridModel = new DataRequest();
    gridModel.pageLoading = false;
    gridModel.comboboxName ='HRKows';
    this.api.execSv(
      'HR',
      'ERM.Business.Core',
      'DataBusiness',
      'LoadDataCbxAsync',
      [gridModel]
    ).subscribe((cbx:any)=>{
      if(cbx && cbx[0]!=null){
        this.cbbKowCode= JSON.parse(cbx[0]);        
      }
      this.loadedCBB=true;
      this.df.detectChanges();
    });
  }
  ngAfterViewInit(): void {
  }
  changeDataMF(evt:any,data:any){
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(event, data?.unbounds);
    } else {
      
        evt.forEach((func) => {
          if (
            // Hiện: sửa - xóa - chép - gửi duyệt -
            func.functionID == "SYS02" ||
            func.functionID == "SYS03" ||
            func.functionID == "SYS04" 
          ) {
            func.disabled = true;
          }
          
        });
    }
  }
  openFormFuncID(evt:any){
    
  }
  explanPopup(){
    let dialogKowCode = this.callfc.openForm(ViewKowcodeComponent,"",350,500,null,this.cbbKowCode)
  }
}
