import {
  ViewModel,
  UIComponent,
  ViewType,
  ButtonModel,
  DialogModel,
} from 'codx-core';
import { Component, Injector, ViewChild, TemplateRef } from '@angular/core';
import { AddEditComponent } from './popups/add-edit/add-edit.component';

@Component({
  selector: 'lib-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
})
export class InvoicesComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  buttons: ButtonModel = { id: 'btnAdd' };
  funcName = '';
  moreFuncName = '';

  constructor(private injector: Injector) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {
    // let g = {
    //   itemID: '0101010001',
    //   itemName: 'Bia Heineken 330ml',
    //   itemGroupID: '01-BIA',
    //   itemType: '1',
    //   UMID: 'LON',
    //   VATControl: '1',
    //   Owner: 'ADMIN',
    //   CreatedBy: 'ADMIN',
    // };

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
        model: {
          frozenColumns: 1,
          template2: this.templateMore,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddAsync';
    this.view.dataService.methodUpdate = 'EditAsync';
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

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
    }
    //this.edit(e, data);
  }

  activeMore(e) {
    e.forEach((x) => {
      if (
        x.functionID == 'SYS02' ||
        x.functionID == 'SYS03' ||
        x.functionID == 'SYS04'
      ) {
        x.disabled = false;
      }
    });
  }
  //#endregion

  //#region Method
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

        p.closed.subscribe((x) => {
          if (!x?.event) this.view.dataService.clear();
        });
      }
    });
  }

  edit(e, data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
      // this.view.dataService.dataSelected.userID = data._uuid;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
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
          ['edit', e.text + ' ' + this.funcName],
          '',
          op
        );
        p.closed.subscribe((x) => {
          if (!x?.event) this.view.dataService.clear();
        });
      });
  }

  delete(data) {
    debugger
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected])
      .subscribe();
  }
  //#endregion
}
