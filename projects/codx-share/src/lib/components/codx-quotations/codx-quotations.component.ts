import { Component, Injector, Input, OnChanges, Optional, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CallFuncService, DialogModel, DialogRef, FormModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddQuotationsComponent } from 'projects/codx-cm/src/lib/quotations/popup-add-quotations/popup-add-quotations.component';

@Component({
  selector: 'codx-quotations',
  templateUrl: './codx-quotations.component.html',
  styleUrls: ['./codx-quotations.component.css']
})
export class CodxQuotationsComponent  extends UIComponent implements OnChanges {
  @Input() funcID: string;
  @Input() customerID: string;
  @Input() service = 'CM';
  @Input() assemblyName = 'ERM.Business.CM';
  @Input() entityName = 'CM_Quotations';
  @Input() className = 'QuotationsBusiness';
  @Input() methodLoadData = 'GetListQuotationsAsync';

  @ViewChild('itemViewList') itemViewList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  //test
  formModel : FormModel;
  moreDefaut = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  grvSetup :any ;
  vllStatus=''

  constructor(
    private inject: Injector,
    private callfunc: CallFuncService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.cache.gridViewSetup('CMQuotations','grvCMQuotations').subscribe(res=>{
      if(res) {
        this.grvSetup=res
        this.vllStatus = res['Status'].referedValue
      }
    })
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
      res.status ="1";
      res.customerID= this.customerID;
     
      var obj = {
        data : res,
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
  getIndex(recID){
    return this.view.dataService.data.findIndex(obj=>obj.recID==recID)
  }
}
