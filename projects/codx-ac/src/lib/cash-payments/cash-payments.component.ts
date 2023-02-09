import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, CallFuncService, DialogModel, DialogRef, RequestOption, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopAddCashComponent } from './pop-add-cash/pop-add-cash.component';

@Component({
  selector: 'lib-cash-payments',
  templateUrl: './cash-payments.component.html',
  styleUrls: ['./cash-payments.component.css']
})
export class CashPaymentsComponent extends UIComponent {
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  dialog!: DialogRef;
  button?: ButtonModel;
  headerText:any;
  moreFuncName:any;
  funcName:any;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) { 
    super(inject);
    this.dialog = dialog;
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(e,data);
        break;
    }
    
  }
  ngAfterViewInit(): void {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          template2: this.templateMore,
          frozenColumns: 1,
        },
      } 
    ];
  }
  add() {
    this.headerText = this.moreFuncName + ' ' + this.funcName;
    this.view.dataService.addNew().subscribe((res: any) => {
      var obj = {
        formType: 'add',
        headerText: this.headerText,
      };
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.dialog = this.callfunc.openForm(PopAddCashComponent,'', null,null,this.view.funcID,obj,'',option,);
    });
  }
  edit(e,data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.edit(this.view.dataService.dataSelected).subscribe((res: any) => {
      var obj = {
        formType: 'edit',
        headerText: e.text + ' ' + this.funcName,
      };
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.dialog = this.callfunc.openForm(PopAddCashComponent,'', null,null,this.view.funcID,obj,'',option,);
    });
  }
  delete(data){
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.delete([data], true, (option: RequestOption) =>
    this.beforeDelete(option,data)
  ).subscribe((res:any) => {
    if (res) {
      this.api.exec(
        'ERM.Business.AC',
        'CashPaymentsLinesBusiness',
        'DeleteAsync',
        [data.recID]
      ).subscribe((res:any)=>{
      })
    }
  });
  }
  beforeDelete(opt: RequestOption,data) {
    opt.methodName = 'DeleteAsync';
    opt.className = 'CashPaymentsBusiness';
    opt.assemblyName = 'AC';
    opt.service = 'AC';
    opt.data = data;
    return true;
  }
}
