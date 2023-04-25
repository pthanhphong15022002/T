import {
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
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
  @Input() customerID: string = '';
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  readonly service = 'CM';
  readonly assemblyName = 'ERM.Business.CM';
  readonly entityName = 'CM_Quotations';
  readonly className = 'QuotationsBusiness';
  readonly methodLoadData = 'GetListQuotationsAsync';

  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      },
    ];
  }

  clickMF(e, data) {}

  changeItemDetail(e) {}
  
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      //this.cache.functionList('CM0202').subscribe((f) => {
      // this.cache.gridViewSetup(f.formName, f.gridViewName).subscribe((gr) => {
      //   let formModel = new FormModel();
      //   formModel.funcID = 'CM0202';
      //   formModel.formName = f.formName;
      //   formModel.gridViewName = f.gridViewName;

      var obj = {
        data : res,
        action: 'add',
        headerText: 'sdasdsadasdasd',
      };
      let option = new DialogModel();
      option.IsFull = true;
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
}
