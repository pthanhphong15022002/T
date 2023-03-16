import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'codx-crmcustomer',
  templateUrl: './crmcustomer.component.html',
  styleUrls: ['./crmcustomer.component.css'],
})
export class CrmCustomerComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
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

  dataObj?: any;
  columnGrids = [];
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  showButtonAdd = false;
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
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

  }

  ngAfterViewInit(): void {
    this.crrFuncID = this.funcID;
    this.afterLoad(this.crrFuncID);
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  changeView(e){
    if (this.crrFuncID != this.funcID) {
      this.afterLoad(this.crrFuncID);
      this.crrFuncID = this.funcID;
    }
    this.detectorRef.detectChanges();

  }

  afterLoad(crrFuncID){
    if (crrFuncID == 'CM0101') {
      this.cacheSv
        .gridViewSetup('DPProcesses', 'grvDPProcesses')
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
          ];
          this.views.push({
            sameData: true,
            type: ViewType.grid,
            active: false,
            model: {
              resources: this.columnGrids,
            },
          });
        });
    }else if(this.crrFuncID == 'CM0102'){
      this.cacheSv
      .gridViewSetup('DPProcesses', 'grvDPProcesses')
      .subscribe((gv) => {
        this.columnGrids = [
          {
            field: 'customerName',
            headerText: gv
              ? gv['CustomerName']?.headerText || 'Họ tên'
              : 'Họ tên',
            width: 250,
            template: this.itemCustomerName,
          },
          {
            field: 'phone',
            headerText: gv
              ? gv['Phone']?.headerText || 'Điện thoại'
              : 'Điện thoại',
            template: this.itemPhone,
            width: 250,
          },
          {
            field: 'email',
            headerText: gv
              ? gv['Email']?.headerText || 'Email'
              : 'Email',
            template: this.itemEmail,
            width: 250,
          },
          {
            field: 'address',
            headerText: gv ? gv['Address']?.headerText || 'Địa chỉ' : 'Địa chỉ',
            template: this.itemAddress,
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
        ];
        this.views.push({
          sameData: true,
          type: ViewType.grid,
          active: false,
          model: {
            resources: this.columnGrids,
          },
        });
      });
    }
  }

  onInit(): void {
  }



  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  //#region Search
  searchChanged(e) {}
  //#endregion

  //#region CRUD
  add() {}
  //#endregion

  //#region event
  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.detectorRef.detectChanges();
  }
  //#endregion
}
