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
  DialogModel,
  DialogRef,
  FormModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddQuotationsComponent } from './popup-add-quotations/popup-add-quotations.component';

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

  ngOnChanges(changes: SimpleChanges): void {
    
  }
  onInit(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: false, //true, fasle để test
        model: {
          template: this.itemViewList,
        },
      },
    ];
  }
  changeDataMF(e, data) {}
  clickMF(e, data) {}

  changeItemDetail(e) {}

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
