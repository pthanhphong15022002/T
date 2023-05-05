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
  DialogModel,
  DialogRef,
  FormModel,
  RequestOption,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddQuotationsComponent } from 'projects/codx-cm/src/lib/quotations/popup-add-quotations/popup-add-quotations.component';

@Component({
  selector: 'codx-quotations',
  templateUrl: './codx-quotations.component.html',
  styleUrls: ['./codx-quotations.component.css'],
})
export class CodxQuotationsComponent extends UIComponent implements OnChanges {
  @Input() funcID: string;
  @Input() customerID: string;
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Quotations';
  className = 'QuotationsBusiness';
  methodLoadData = 'GetListQuotationsAsync';

  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
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
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true, //true, fasle để test
        model: {
          template: this.itemViewList,
          // template2: this.templateMore,
        },
      },
      // {
      //   type: ViewType.grid,
      //   active: true,
      //   sameData: true,
      //   model: {
      //     template2: this.templateMore,
      //     frozenColumns: 1,
      //   },
      // },
    ];
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
      //this.cache.functionList('CM0202').subscribe((f) => {
      // this.cache.gridViewSetup(f.formName, f.gridViewName).subscribe((gr) => {
      //   let formModel = new FormModel();
      //   formModel.funcID = 'CM0202';
      //   formModel.formName = f.formName;
      //   formModel.gridViewName = f.gridViewName;
      res.status = '1';
      res.customerID = this.customerID;

      var obj = {
        data: res,
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
    });
    //   });
    // });
  }
  edit(e, data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(data).subscribe((res) => {
      var obj = {
        data: this.view.dataService.dataSelected,
        action: 'edit',
        headerText:e.text,
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
    if(data){
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy(data).subscribe(res=>{
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
