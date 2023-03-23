import { Targets } from './../../../../../codx-om/src/lib/model/okr.model';
import { AfterViewInit, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {data} from './data'
import { CrmcustomerDetailComponent } from '../../crmcustomer/crmcustomer-detail/crmcustomer-detail.component';
import { ButtonModel, CacheService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'codx-table',
  templateUrl: './codx-table.component.html',
  styleUrls: ['./codx-table.component.scss']
})
export class CodxTableComponent extends UIComponent
implements OnInit, AfterViewInit {
  data: Object[];
  pageSettings: Object;
  initialSort: Object;
  allowPaging = false;
  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];

  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('itemViewList', { static: true })
  itemViewList: TemplateRef<any>;
  @ViewChild('itemCustomerName', { static: true })
  itemCustomerName: TemplateRef<any>;
  @ViewChild('itemContact', { static: true })
  itemContact: TemplateRef<any>;
  @ViewChild('itemAddress', { static: true }) itemAddress: TemplateRef<any>;
  @ViewChild('itemPriority', { static: true }) itemPriority: TemplateRef<any>;
  @ViewChild('itemCreatedBy', { static: true }) itemCreatedBy: TemplateRef<any>;
  @ViewChild('itemCreatedOn', { static: true }) itemCreatedOn: TemplateRef<any>;
  @ViewChild('itemPhone', { static: true }) itemPhone: TemplateRef<any>;
  @ViewChild('itemEmail', { static: true }) itemEmail: TemplateRef<any>;
  @ViewChild('customerDetail') customerDetail: CrmcustomerDetailComponent;
  @ViewChild('itemContactName', { static: true })
  itemContactName: TemplateRef<any>;
  @ViewChild('itemMoreFunc', { static: true })
  itemMoreFunc: TemplateRef<any>;
  @ViewChild('itemFields', { static: true })
  itemFields: TemplateRef<any>;
  dataObj?: any;
  columnGrids = [];
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  // showButtonAdd = false;
  button?: ButtonModel;
  dataSelected: any;
  //region Method
  funcID = '';
  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName = 'DP_Processes';
  className = 'ProcessesBusiness';
  method = 'GetListProcessesAsync';
  idField = 'recID';
  //endregion

  titleAction = '';
  vllPriority = 'TM005';
  crrFuncID = '';

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  async onInit(): Promise<void> {
    this.allowPaging = true;
    this.data = data.map((item, index )=> {
      return {index,...item}
    });
    this.pageSettings = { pageCount: 5 };
    // this.initialSort = {
    //   columns: [{ field: 'Freight', direction: 'Ascending' },
    //   { field: 'CustomerName', direction: 'Descending' }]
    // };
    this.views = [];
    
    this.crrFuncID = this.funcID;
    let formModel = this.view?.formModel;
    this.columnGrids = [];
      this.cacheSv
        .gridViewSetup(formModel?.formName, formModel?.gridViewName)
        .subscribe((gv) => {
          this.columnGrids = [
            {
              field: 'customerName',
              headerText: gv
                ? gv['CustomerName']?.headerText || 'Tên khách hàng'
                : 'Tên khách hàng',
              width: 250,
              template: this.itemCustomerName,
            },
            {
              field: 'address',
              headerText: gv
                ? gv['Address']?.headerText || 'Địa chỉ'
                : 'Địa chỉ',
              template: this.itemAddress,
              width: 250,
            },
            {
              field: 'contact',
              headerText: gv
                ? gv['Contact']?.headerText || 'Liên hệ chính'
                : 'Liên hệ chính',
              template: this.itemContact,
              width: 250,
            },
            {
              field: 'priority',
              headerText: gv
                ? gv['Piority']?.headerText || 'Độ ưu tiên'
                : 'Độ ưu tiên',
              template: this.itemPriority,
              width: 100,
            },
            {
              field: 'createdBy',
              headerText: gv
                ? gv['CreatedBy']?.headerText || 'Người tạo'
                : 'Người tạo',
              template: this.itemCreatedBy,
              width: 100,
            },
            {
              field: 'createdOn',
              headerText: gv
                ? gv['CreatedOn']?.headerText || 'Ngày tạo'
                : 'Ngày tạo',
              template: this.itemCreatedOn,
              width: 180,
            },
            {
              width: 30,
              template: this.itemMoreFunc,
            },
          ];
          this.views.push({
            sameData: true,
            active: true,
            type: ViewType.grid,
            model: {
              resources: this.columnGrids,
              hideMoreFunc: true,
            },
          });
        
          this.detectorRef.detectChanges();
        });
      
        

    this.detectorRef.detectChanges();
    
  }
  // async ngAfterViewInit(){
  //   let table = await document.getElementsByClassName('e-gridcontent')[0];
  //   console.log(table);
  //   // let firstTable = table[0];
  //   // console.log(firstTable);
  // }
  ngAfterViewInit(): void {
    let a = this.view.dataService.data;
    console.log(a);
  }

}
