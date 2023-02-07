import { ChangeDetectorRef, Component, Injector, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, CallFuncService, DialogRef, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-cash-payments',
  templateUrl: './cash-payments.component.html',
  styleUrls: ['./cash-payments.component.css']
})
export class CashPaymentsComponent extends UIComponent {
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  dialog!: DialogRef;
  button?: ButtonModel;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef
  ) { 
    super(inject);
    this.dialog = dialog;
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
  }
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        //this.add();
        break;
    }
  }
  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        //this.delete(data);
        break;
      case 'SYS03':
        //this.edit(data);
        break;
    }
    
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
    ];
  }

}
