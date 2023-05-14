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
  NotificationsService,
  RequestOption,
  UIComponent,
  Util,
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
  @Input() refType: string = 'CM_Deals';
  @Input() refID: string;
  @Input() salespersonID: string;
  @Input() consultantID: string;
  @Input() disableRefID = true;

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
    entityName: 'CM_Quotations',
    formName: 'CMQuotations',
    gridViewName: 'grvCMQuotations',
    funcID: 'CM0202',
  };
  customerIDCrr = '';
  requestData = new DataRequest();
  listQuotations = [];
  predicates = 'RefType==@0 && RefID==@1';
  dataValues = '';
  quotation: any;

  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private notiServer: NotificationsService,
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
    this.dataValues = this.refType + ';' + this.refID;
    if (changes['customerID']) {
      if (changes['customerID'].currentValue === this.customerIDCrr) return;
      this.customerIDCrr = changes['customerID'].currentValue;
      this.getQuotations();
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

  getQuotations() {
    this.requestData.predicates = 'RefType==@0 && RefID==@1';
    this.requestData.dataValues = this.refType + ';' + this.refID;
    this.requestData.entityName = this.entityName;
    this.requestData.funcID = this.funcID;
    this.requestData.pageLoading = false;
 
    this.fetch().subscribe((res) => {
      this.listQuotations = res;
    });
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
    this.getDefault().subscribe((res) => {
      if (res) {
        let data = res.data;
        data['_uuid'] = data['quotationsID'] ?? Util.uid();
        data['idField'] = 'quotationsID';
        this.quotation = data;
        if (!this.quotation.quotationsID) {
          this.api
            .execSv<any>(
              'SYS',
              'AD',
              'AutoNumbersBusiness',
              'GenAutoNumberAsync',
              [this.formModel.funcID, this.formModel.entityName, 'QuotationsID']
            )
            .subscribe((id) => {
              this.quotation.quotationID = id;
              this.openPopup(this.quotation, 'add');
            });
        } else this.openPopup(this.quotation, 'add');
      }
    });
  }

  openPopup(res, action) {
    res.versionNo = res.versionNo ?? 'V1.0';
    res.status = res.status ?? '0';
    res.customerID = res.customerID ?? this.customerID;
    res.refType = res.refType ?? this.refType;
    res.refID = res.refID ?? this.refID;
    res.salespersonID = res.salespersonID ?? this.salespersonID;
    res.consultantID = res.consultantID ?? this.consultantID;
    res.totalAmt = res.totalAmt ?? 0;

    var obj = {
      data: res,
      disableRefID: this.disableRefID,
      action: action,
      headerText: 'sdasdsadasdasd',
    };
    let option = new DialogModel();
    option.IsFull = true;
    // option.DataService = this.view.dataService;
    option.FormModel = this.formModel;
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
    dialog.closed.subscribe((e) => {
      if (e?.event) {
        this.listQuotations.push(e.event);
      }
    });
  }

  edit(e, data) {
    let quotation = JSON.parse(JSON.stringify(data));

    var obj = {
      data: quotation,
      action: 'edit',
      headerText: e.text,
    };
    let option = new DialogModel();
    option.IsFull = true;

    option.FormModel = this.formModel;
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
    dialog.closed.subscribe((e) => {
      if (e?.event) {
        let dataUp = e?.event;
        let idxUp = this.listQuotations.findIndex(
          (x) => x.recID == dataUp?.recID
        );
        if (idxUp != -1) this.listQuotations[idxUp] = dataUp;
      }
    });
  }

  copy(e, data) {
    //gọi alow copy
    this.getDefault().subscribe((res) => {
      let data = res.data;
      data['_uuid'] = data['quotationsID'] ?? Util.uid();
      data['idField'] = 'quotationsID';
      Object.values(map(this.grvSetup)).forEach((v) => {
        if (v.allowCopy) {
          let field = Util.camelize(v.fieldName);
          data[field] = data[field];
        }
      });
      this.quotation = data;
      if (!this.quotation.quotationsID) {
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
            this.openPopup(this.quotation, 'copy');
          });
      } else this.openPopup(this.quotation, 'copy');
    });
  }

  delete(data) {
    this.notiServer.alertCode('SYS030').subscribe((res) => {
      if (res.event.status === 'Y') {
        this.api
          .exec<any>(
            'CM',
            'QuotationsBusiness',
            'DeleteQuotationsByRecIDAsync',
            data.recID
          )
          .subscribe((res) => {
            if (res) {
              let idxDeleted = this.listQuotations.findIndex(
                (x) => x.recID == data.recID
              );
              if (idxDeleted != -1) this.listQuotations.splice(idxDeleted, 1);
              this.notiServer.notifyCode('SYS008');
            } else {
              this.notiServer.notifyCode('SYS022');
            }
          });
      }
    });
  }

  getIndex(recID) {
    return (
      this.view.dataService.data.findIndex((obj) => obj.recID == recID) + 1
    );
  }

  getDefault() {
    return this.api.execSv<any>(
      'CM',
      'Core',
      'DataBusiness',
      'GetDefaultAsync',
      [this.formModel.funcID, this.formModel.entityName, 'quotationsID']
    );
    // .subscribe((response: any) => {
    //   if (response) {
    //     var data = response.data;
    //     data['_uuid'] = data['quotationsID'] ?? Util.uid();
    //     data['idField'] = 'quotationsID';
    //     this.quotation = data;
    //   }
    //   return this.quotation
    // });
  }
}
