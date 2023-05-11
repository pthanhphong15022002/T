import {
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  RequestOption,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';

import { Observable, finalize, map } from 'rxjs';
import { PopupAddQuotationsComponent } from '../../quotations/popup-add-quotations/popup-add-quotations.component';
import { ListContractsComponent } from '../list-contracts/list-contracts.component';

@Component({
  selector: 'lib-views-contracts',
  templateUrl: './views-contracts.component.html',
  styleUrls: ['./views-contracts.component.scss']
})
export class ViewsContractsComponent extends UIComponent{
  @Input() funcID: string;
  @Input() customerID: string;
  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  //temGird
  @ViewChild('templateCreatedBy') templateCreatedBy: TemplateRef<any>;
  @ViewChild('templateStatus') templateStatus: TemplateRef<any>;
  @ViewChild('templateCustomer') templateCustomer: TemplateRef<any>;

  views: Array<ViewModel> = [];
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Contracts';
  className = 'ContractsBusiness';
  methodLoadData = 'GetListQuotationsAsync';

  //test
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  grvSetup: any;
  vllStatus = '';
  formModel: FormModel = {
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    funcID: 'CM0202',
  };
  customerIDCrr = '';
  requestData = new DataRequest();
  listQuotations = [];
  predicates = 'RefType==@0 && RefID==@1';
  dataValues = '';
  columnGrids: any;
  arrFieldIsVisible = [];
  itemSelected: any;
  button?: ButtonModel;
  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    // private listContracts: ListContractsComponent,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.cache
      .gridViewSetup('CMQuotations', 'grvCMQuotations')
      .subscribe((res) => {
        if (res) {
          this.grvSetup = res;
          this.vllStatus = res['Status'].referedValue;
          //lay grid view
          let arrField = Object.values(res).filter((x: any) => x.isVisible);
          if (Array.isArray(arrField)) {
            this.arrFieldIsVisible = arrField
              .sort((x: any, y: any) => x.columnOrder - y.columnOrder)
              .map((x: any) => x.fieldName);
            this.getColumsGrid(res);
          }
        }
      });
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }

  ngAfterViewInit() {
    // this.views = [
    //   {
    //     type: ViewType.listdetail,
    //     active: true,
    //     sameData: true,
    //     model: {
    //       template: this.itemTemplate,
    //       panelRightRef: this.templateDetail,
    //     },
    //   },
    //   {
    //     type: ViewType.grid,
    //     active: true,
    //     sameData: true,
    //     model: {
    //       template2: this.templateMore,
    //       frozenColumns: 1,
    //     },
    //   },
    // ];
  }

  getColumsGrid(grvSetup) {
    this.columnGrids = [];
    this.arrFieldIsVisible.forEach((key) => {
      let field = Util.camelize(key);
      let template: any;
      let colums: any;
      switch (key) {
        case 'Status':
          template = this.templateStatus;
          break;
        case 'CustomerID':
          template = this.templateCustomer;
          break;
        case 'CreatedBy':
          template = this.templateCreatedBy;
          break;
        default:
          break;
      }
      if (template) {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
          template: template,
          // textAlign: 'center',
        };  
      } else {
        colums = {
          field: field,
          headerText: grvSetup[key].headerText,
          width: grvSetup[key].width,
        };
      }

      this.columnGrids.push(colums);
    });

    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          resources: this.columnGrids,
          template2: this.templateMore,
          // frozenColumns: 1,
        },
      },
    ];
    this.detectorRef.detectChanges() ;
  }

  click(e) {
    switch (e.id) {
      case 'btnAdd':
        // this.listContracts.addContract();
        break;
    }
  }

  selectedChange(val: any) {
    this.itemSelected = val?.data;
    this.detectorRef.detectChanges();
  }

  // moreFunc
  eventChangeMF(e) {
    this.changeDataMF(e.e, e.data);
  }

  changeDataMF(e, data) {}

  clickMoreFunction(e) {
    this.clickMF(e.e, e.data);
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e, data);
        break;
      case 'SYS04':
        this.copy(e, data);
        break;
    }
  }

  add() {
    this.view.dataService.addNew().subscribe((res) => {
      if (!res.quotationsID) {
        this.api
          .execSv<any>(
            'SYS',
            'AD',
            'AutoNumbersBusiness',
            'GenAutoNumberAsync',
            [this.formModel.funcID, this.formModel.entityName, 'QuotationsID']
          )
          .subscribe((id) => {
            res.quotationID = id;
            this.openPopup(res);
          });
      } else this.openPopup(res);
    });
  }

  openPopup(res) {
    res.versionNo = 'V1.0';
    res.status = '1';

    var obj = {
      data: res,
      disableRefID: false,
      action: 'add',
      headerText: 'sdasdsadasdasd',
    };
    let option = new DialogModel();
    option.IsFull = true;
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    let dialog = this.callfc.openForm(
      PopupAddQuotationsComponent,
      '',
      null,
      null,
      '',
      obj,
      '',
      option
    );
  }

  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(data).subscribe((res) => {
      var obj = {
        data: this.view.dataService.dataSelected,
        action: 'edit',
        headerText: e.text,
      };
      let option = new DialogModel();
      option.IsFull = true;
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      let dialog = this.callfc.openForm(
        PopupAddQuotationsComponent,
        '',
        null,
        null,
        '',
        obj,
        '',
        option
      );
    });
  }

  copy(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy(data).subscribe((res) => {
      var obj = {
        data: res,
        action: 'copy',
        headerText: e.text,
      };
      let option = new DialogModel();
      option.IsFull = true;
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      let dialog = this.callfc.openForm(
        PopupAddQuotationsComponent,
        '',
        null,
        null,
        '',
        obj,
        '',
        option
      );
    });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([data], true, (option: RequestOption) =>
        this.beforeDelete(option, data.recID)
      )
      .subscribe((res: any) => {
        if (res) {
        }
      });
  }
  beforeDelete(opt: RequestOption, data) {
    opt.methodName = 'DeleteQuotationsByRecIDAsync';
    opt.className = 'QuotationsBusiness';
    opt.assemblyName = 'CM';
    opt.service = 'CM';
    opt.data = data;
    return true;
  }

  getIndex(recID) {
    return (
      this.view.dataService.data.findIndex((obj) => obj.recID == recID) + 1
    );
  }
}
