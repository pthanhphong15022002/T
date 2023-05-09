import {
  Component,
  Injector,
  Input,
  OnChanges,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  RequestOption,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddQuotationsComponent } from 'projects/codx-cm/src/lib/quotations/popup-add-quotations/popup-add-quotations.component';
import { Observable, finalize, map } from 'rxjs';

@Component({
  selector: 'codx-quotations',
  templateUrl: './codx-quotations.component.html',
  styleUrls: ['./codx-quotations.component.css'],
})
export class CodxQuotationsComponent extends UIComponent implements OnChanges {
  @Input() funcID: string;
  @Input() customerID: string;
  @Input() refType: string ='CM_Deals';
  @Input() refID: string;
  @Input() salespersonID: string;
  @Input() consultantID: string;
  @Input() disableRefID = true ;

  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Quotations';
  className = 'QuotationsBusiness';
  methodLoadData = 'GetListQuotationsAsync';
  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
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
  customerIDCrr =''
  requestData = new DataRequest();
  listQuotations = [] ;
  predicates = 'RefType==@0 && RefID==@1';
  dataValues= '';

  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.cache
      .gridViewSetup('CMQuotations', 'grvCMQuotations')
      .subscribe((res) => {
        if (res) {
          this.grvSetup = res;
          this.vllStatus = res['Status'].referedValue;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataValues= this.refType+";"+this.refID;
    if (changes['customerID']) {
      if (changes['customerID'].currentValue === this.customerIDCrr) return;
      this.customerIDCrr = changes['customerID'].currentValue;
      //this.getQuotations();
    }
  }

  onInit(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true, 
        model: {
          template: this.itemViewList,
        },
      },
    ];
  }

  getQuotations(){
    this.requestData.predicates = 'RefType==@0 && RefID==@1';
    this.requestData.dataValues= this.refType+";"+this.refID;
    this.requestData.entityName = this.entityName;
    this.requestData.funcID = this.funcID;
    this.fetch().subscribe(res=>{
      this.listQuotations = res ;
     // this.view.dataService.data = this.listQuotations
    })
  }

  fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.methodLoadData,
        this.requestData
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response[0];
        })
      );
  }
 
  changeItemDetail(e) {}

  changeDataMF(e, data) {}

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
      if(!res.quotationsID){
        this.api.execSv<any>(
          'SYS',
          'AD',
          'AutoNumbersBusiness',
          'GenAutoNumberAsync',
          [this.formModel.funcID, this.formModel.entityName, "QuotationsID"]
        ).subscribe(id=>{
          res.quotationID = id ;
          debugger
          this.openPopup(res)
        })
      }else  this.openPopup(res)
    
    });
  }

  openPopup(res){
    res.versionNo ='V1.0'
    res.status = '1';
    res.customerID = this.customerID;
    res.refType = this.refType ;
    res.refID = this.refID ;
    res.salespersonID = this.salespersonID ;
    res.consultantID = this.consultantID ;
    var obj = {
      data: res,
      disableRefID : this.disableRefID ,
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
