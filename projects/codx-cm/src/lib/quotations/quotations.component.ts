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
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddQuotationsComponent } from './popup-add-quotations/popup-add-quotations.component';
import { Observable, finalize, map } from 'rxjs';

@Component({
  selector: 'lib-quotations',
  templateUrl: './quotations.component.html',
  styleUrls: ['./quotations.component.css'],
})
export class QuotationsComponent extends UIComponent {
  @Input() funcID: string;
  @Input() customerID: string;
  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  readonly service = 'CM';
  readonly assemblyName = 'ERM.Business.CM';
  readonly entityName = 'CM_Quotations';
  readonly className = 'QuotationsBusiness';
  readonly methodLoadData = 'GetListQuotationsAsync';
  requestTemp = new DataRequest();
  //test
  formModel: FormModel;

  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  grvSetup: any;
  vllStatus = '';
  listDatas = [];

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

  ngOnChanges(changes: SimpleChanges): void {}
  onInit(): void {}

  ngAfterViewInit() {
    this.loadDatas();
    // this.views = [
    //   {
    //     type: ViewType.list,
    //     active: true,
    //     sameData: true, //true, fasle để test
    //     model: {
    //       template: this.itemViewList,
    //     },
    //   },
    // ];
  }
  loadDatas() {
    // this.requestTemp.idField='recID'
    this.requestTemp.entityName = 'CM_Quotations';
    this.requestTemp.formName = 'CMQuotations';
    this.requestTemp.gridViewName = 'grvCMQuotations';
    this.requestTemp.page = 0;
    this.requestTemp.pageSize = 20;
    this.requestTemp.funcID = 'CM0202';
    this.requestTemp.predicate = 'CustomerID==@0';
    this.requestTemp.dataValues = this.customerID;
    this.fetch().subscribe((items) => {
      this.listDatas = items;
    });
  }
  fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.methodLoadData,
        this.requestTemp
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
  delete(dt) {}
  edit(e, data) {}
  copy(e, data) {}

  add() {
    this.view.dataService.addNew().subscribe((res) => {
      res.status = '1';
      res.customerID = this.customerID;
      debugger;
      var obj = {
        data: res,
        action: 'add',
        headerText: 'sdasdsadasdasd',
      };
      let option = new DialogModel();
      option.IsFull = true;
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      var dialog = this.callfc.openForm(
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
    //   });
    // });
  }
  getIndex(recID) {
    return this.view.dataService.data.findIndex((obj) => obj.recID == recID);
  }
}
