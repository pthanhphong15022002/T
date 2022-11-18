import {
  ViewModel,
  UIComponent,
  ViewType,
  ButtonModel,
  SidebarModel,
} from 'codx-core';
import {
  Component,
  OnInit,
  Injector,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { AddEditComponent } from './popups/add-edit/add-edit.component';

@Component({
  selector: 'lib-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
})
export class InvoicesComponent extends UIComponent {
  //#region Constructor
  views: Array<ViewModel> = [];
  buttons: ButtonModel = { id: 'btnAdd' };
  @ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;

  constructor(private injector: Injector) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
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
        let op = new SidebarModel();
        op.FormModel = this.view.formModel;
        op.DataService = this.view.dataService;
        op.Width = '800px';
        let p = this.callfc.openSide(
          AddEditComponent,
          'add',
          op,
          this.view.funcID
        );
      }
    });
  }
  //#endregion
}
