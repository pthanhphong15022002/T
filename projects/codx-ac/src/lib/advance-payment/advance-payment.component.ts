import { ChangeDetectorRef, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModel, CallFuncService, DialogModel, DialogRef, UIComponent, ViewModel, ViewType } from 'codx-core';
import { ActivatedRoute } from '@angular/router';
import { AdvancePaymentAddComponent } from './advance-payment-add/advance-payment-add.component';

@Component({
  selector: 'lib-advance-payment',
  templateUrl: './advance-payment.component.html',
  styleUrls: ['./advance-payment.component.css']
})
export class AdvancePaymentComponent extends UIComponent{
 
  //Constructor

  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
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
  company: any
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
  }

  //End Constructor
  
  //Init
  
  onInit(): void {
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
        },
      },
    ];
    
    this.cache.functionList(this.view?.funcID)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      this.funcName = res.defaultName;
    });
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
      .addNew((o) => this.setDefault())
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if(res)
        {
          var obj = {
            formType: 'add',
            headerText: this.headerText,
            advancedPayment: res,
            company: this.company,
          };
          let opt = new DialogModel();
          opt.FormModel = this.view.formModel;
          opt.DataService = this.view.dataService;
          var dialog = this.callfc.openForm(
            AdvancePaymentAddComponent,
            '',
            800,
            850,
            '',
            obj,
            '',
            opt
          );
          dialog.closed
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res.event != null) {
            }
          });
        }
      });
  }

  edit(e, data) {
    this.view.dataService
    .edit(data)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
      {
        var obj = {
          formType: 'edit',
          headerText: this.headerText,
          advancedPayment: data,
          company: this.company,
        };
        let opt = new DialogModel();
        opt.FormModel = this.view.formModel;
        opt.DataService = this.view.dataService;
        var dialog = this.callfc.openForm(
          AdvancePaymentAddComponent,
          '',
          800,
          850,
          '',
          obj,
          '',
          opt
        );
        dialog.closed
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res.event != null) {
          }
        });
      }
    });
  }
  copy(e, data) {
    this.view.dataService
    .copy((o) => this.setDefault())
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(res)
      {
        data.recID = res.recID;
        data.voucherNo = res.voucherNo;
        data.status = res.status;
        data['_uuid'] = res['_uuid'];
        var obj = {
          formType: 'copy',
          headerText: this.headerText,
          advancedPayment: data,
          company: this.company,
        };
        let opt = new DialogModel();
        opt.FormModel = this.view.formModel;
        opt.DataService = this.view.dataService;
        var dialog = this.callfc.openForm(
          AdvancePaymentAddComponent,
          '',
          800,
          850,
          '',
          obj,
          '',
          opt
        );
        dialog.closed
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res.event != null) {
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

  setDefault() {
    return this.api.exec('AC', 'AdvancedPaymentBusiness', 'SetDefaultAsync');
  }
  //End Function
}