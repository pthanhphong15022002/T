import { Component, Injector, Input, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CallFuncService, DialogModel, DialogRef, FormModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddQuotationsComponent } from 'projects/codx-cm/src/lib/quotations/popup-add-quotations/popup-add-quotations.component';

@Component({
  selector: 'codx-quotations',
  templateUrl: './codx-quotations.component.html',
  styleUrls: ['./codx-quotations.component.css']
})
export class CodxQuotationsComponent  extends UIComponent {
  @Input() funcID: string;
  @Input() customerID: string = '';
  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  readonly service = 'CM';
  readonly assemblyName = 'ERM.Business.CM';
  readonly entityName = 'CM_Quotations';
  readonly className = 'QuotationsBusiness';
  readonly methodLoadData = 'GetListQuotationsAsync';
  //test
  formModel : FormModel;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };

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
        type: ViewType.list,
        active: true,
        sameData: false, //true, fasle để test
        model: {
          template: this.itemViewList,
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
  changeDataMF(e,data){}
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
{

}
