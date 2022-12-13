import {
  ViewModel,
  UIComponent,
  ViewType,
  ButtonModel,
  DialogModel,
} from 'codx-core';
import { Component, Injector, ViewChild, TemplateRef } from '@angular/core';
import { AddEditComponent } from './popups/add-edit/add-edit.component';
import { futimesSync } from 'fs';

@Component({
  selector: 'lib-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
})
export class InvoicesComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  funcName = '';
  moreFuncName = '';
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;

  constructor(private injector: Injector) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {
    let g = {
      itemID: '0.3-SK5-30',
      itemName: 'SK5 ROLL-METAL SPRING "T"',
      itemGroupID: 'ACCESSORIES',
      itemType: '1',
      UMID: 'KG',
      VATControl: '1',
      Owner: 'ADMIN',
      CreatedBy: 'ADMIN',
    };

    // this.api.exec<any>('EI', 'GoodsBusiness', 'SaveAsync', g).subscribe();

    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
        console.log(this.moreFuncName);
      }
    });
  }

  ngAfterViewInit() {
    this.cache.functionList(this.view.funcID).subscribe((res) => {
      if (res) this.funcName = res.defaultName;
    });
    this.views = [
      {
        type: ViewType.list,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
      {
        type: ViewType.listdetail,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
      },
    ];
  }
  //#endregion

  //#region Event
  toolBarClick(e) {
    switch (e.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  //#endregion

  //#region Function
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      if (res) {
        let op = new DialogModel();
        op.FormModel = this.view.formModel;
        op.DataService = this.view.dataService;
        op.IsFull = true;
        let p = this.callfc.openForm(
          AddEditComponent,
          '',
          null,
          null,
          this.view.funcID,
          ['add', this.moreFuncName + ' ' + this.funcName],
          '',
          op
        );
      }
    });
  }

  //#endregion
}
