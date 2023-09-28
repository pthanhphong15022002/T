import { ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModel, CallFuncService, DialogModel, DialogRef, FormModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';
import { PaymentOrderAddComponent } from './payment-order-add/payment-order-add.component';

@Component({
  selector: 'lib-payment-order',
  templateUrl: './payment-order.component.html',
  styleUrls: ['./payment-order.component.css']
})
export class PaymentOrderComponent extends UIComponent{
 
  //Constructor

  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail?: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  views: Array<ViewModel> = [];
  button: ButtonModel = {
    id: 'btnAdd'
  };
  headerText: any;
  columnsGrid = [];
  dialog: DialogRef;
  funcName: any;
  gridViewSetup: any;
  company: any;
  itemSelected: any;
  parent: any;
  dataDefault: any;
  fmAdvancedPaymentLines: FormModel = {
    entityName: 'AC_AdvancedPaymentLines',
    formName: 'AdvancedPaymentLines',
    gridViewName: 'grvAdvancedPaymentLines',
  }
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private routerActive: ActivatedRoute,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;

    this.cache
    .companySetting()
    .subscribe((res: any) => {
      if (res.length > 0) {
        this.company = res[0];
      }
    });

    this.routerActive.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe((params) => {
      if (params?.parent) {
        this.cache.functionList(params.parent)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res) this.parent = res;
        });
      }
    });
  }

  //End Constructor
  
  //Init
  
  onInit(): void {
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];
    
    this.cache.functionList(this.view?.funcID)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      this.funcName = res.defaultName;
    });

    this.view.setRootNode(this.parent?.customName);
  }

  ngOnDestroy() {
    this.view.setRootNode('');
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //End Init

  //Event

  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add(e);
        break;
    }
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

  //End Event
  //Function

  add(e) {
    this.headerText = this.funcName;
    this.view.dataService
      .addNew((o) => this.setDefault(this.dataDefault))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          var obj = {
            formType: 'add',
            headerText: this.headerText,
            advancedPayment: {...res},
            company: this.company,
          };
          let opt = new DialogModel();
          opt.FormModel = this.view.formModel;
          opt.DataService = this.view.dataService;
          var dialog = this.callfc.openForm(
            PaymentOrderAddComponent,
            '',
            700,
            850,
            '',
            obj,
            '',
            opt
          );
        }
      });
  }

  edit(e, data) {
    this.headerText = this.funcName;
    this.view.dataService
    .edit(data)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
      {
        var obj = {
          formType: 'edit',
          headerText: this.headerText,
          advancedPayment: {...data},
          company: this.company,
        };
        let opt = new DialogModel();
        opt.FormModel = this.view.formModel;
        opt.DataService = this.view.dataService;
        var dialog = this.callfc.openForm(
          PaymentOrderAddComponent,
          '',
          700,
          850,
          '',
          obj,
          '',
          opt
        );
      }
    });
  }
  copy(e, dataCopy) {
    this.headerText = this.funcName;
    this.view.dataService
    .copy((o) => this.setDefault(dataCopy,'copy'))
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res != null)
      {
        let datas = {...res};
        this.view.dataService.saveAs(datas).pipe(takeUntil(this.destroy$)).subscribe((res)=>{
          if(res)
          {
            var obj = {
              formType: 'copy',
              headerText: this.headerText,
              advancedPayment: {...datas},
              company: this.company,
            };
            let opt = new DialogModel();
            opt.FormModel = this.view.formModel;
            opt.DataService = this.view.dataService;
            var dialog = this.callfc.openForm(
              PaymentOrderAddComponent,
              '',
              700,
              850,
              '',
              obj,
              '',
              opt
            );
            this.view.dataService.add(datas).pipe(takeUntil(this.destroy$)).subscribe();
          }
        });
      }
    });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true).subscribe((res: any) => {
    });
  }

  hideMoreFunction(e: any)
  {
    var bm = e.filter(
      (x: { functionID: string }) =>
        x.functionID == 'SYS003' ||
        x.functionID == 'SYS004'
    );
    bm.forEach((morefunction) => {
      morefunction.disabled = true;
    });
  }

  setDefault(data:any,action:any = '') {
    return this.api.exec('AC', 'AdvancedPaymentBusiness', 'SetDefaultAsync', [
      data,
      action
    ]);
  }

  changeItemDetail(event) {
    if (event?.data) {
      this.itemSelected = event?.data;
      this.detectorRef.detectChanges();
    }
  }
  //End Function
}