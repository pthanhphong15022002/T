import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DialogModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupAddCashTransferComponent } from './popup-add-cash-transfer/popup-add-cash-transfer.component';

@Component({
  selector: 'lib-cash-transfers',
  templateUrl: './cash-transfers.component.html',
  styleUrls: ['./cash-transfers.component.css'],
})
export class CashTransfersComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('templateMore') templateMore?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  btnAdd = {
    id: 'btnAdd',
  };
  functionName: string;

  constructor(inject: Injector) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {}

  ngAfterViewInit(): void {
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

    this.cache.functionList(this.view.funcID).subscribe((res) => {
      this.functionName = res.defaultName;
      console.log(res);
    });
  }
  //#endregion

  //#region Event
  handleClickMoreFuncs(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
    }
  }
  //#endregion

  //#region Method
  handleClickAdd(e): void {
    this.view.dataService.addNew().subscribe((res) => {
      let options = new DialogModel();
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      options.IsFull = true;
      options.IsModal = true;

      this.callfc.openForm(
        PopupAddCashTransferComponent,
        'This param is not working',
        null,
        null,
        this.view.funcID,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
        },
        '',
        options
      );
    });
  }

  delete(data): void {}

  edit(data): void {}
  //#endregion

  //#region Function
  //#endregion
}
