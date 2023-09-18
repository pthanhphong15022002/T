import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { PopupAddItemComponent } from './popup-add-item/popup-add-item.component';
import { toCamelCase } from '../../utils';

@Component({
  selector: 'lib-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
})
export class ItemsComponent extends UIComponent {
  //#region Constructor
  @ViewChild('moreTemplate') moreTemplate?: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true }) itemTemplate: TemplateRef<any>;
  @ViewChild('header1Template', { static: true })
  header1Template: TemplateRef<any>;
  @ViewChild('header2Template', { static: true })
  header2Template: TemplateRef<any>;
  @ViewChild('header3Template', { static: true })
  header3Template: TemplateRef<any>;
  @ViewChild('column1Template', { static: true })
  column1Template: TemplateRef<any>;
  @ViewChild('column2Template', { static: true })
  column2Template: TemplateRef<any>;
  @ViewChild('column3Template', { static: true })
  column3Template: TemplateRef<any>;

  views: Array<ViewModel> = [];
  btnAdd: ButtonModel = { id: 'btnAdd' };
  functionName: string;

  constructor(inject: Injector, private acService: CodxAcService) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.acService
      .getDefaultNameFromMoreFunctions('Items', 'grvItems', 'ACS21300')
      .subscribe((res) => {
        this.functionName = toCamelCase(res);
      });
  }

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.moreTemplate,
          frozenColumns: 1,
        },
      },
      {
        type: ViewType.grid,
        text: 'Chi tiết',
        active: true,
        sameData: true,
        model: {
          resources: [
            {
              width: '33%',
              headerTemplate: this.header1Template,
              template: this.column1Template,
            },
            {
              width: '33%',
              headerTemplate: this.header2Template,
              template: this.column2Template,
            },
            {
              width: '33%',
              headerTemplate: this.header3Template,
              template: this.column3Template,
            },
          ],
          template2: this.moreTemplate,
        },
      },
    ];
  }
  //#endregion

  //#region Event
  onClickAdd(e) {
    console.log({ e });
    console.log(this.view);

    this.view.dataService.addNew().subscribe((newItem) => {
      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      this.callfc.openSide(
        PopupAddItemComponent,
        {
          formType: 'add',
          title: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  onClickMF(e, data) {
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

  //#endregion

  //#region Method
  edit(e, data): void {
    // debug
    console.log('edit', { data });

    const copiedData = { ...data };
    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe((selectedItem) => {
      console.log({ selectedItem });

      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      this.callfc.openSide(
        PopupAddItemComponent,
        {
          formType: 'edit',
          title: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(e, data): void {
    console.log('copy', { data });

    const { cwum, cwDeviation, cwConversion, umid, diM2, diM3, ...rest1 } =
      data;
    this.view.dataService.dataSelected = {
      ...rest1,
      cWUM: cwum,
      cWDeviation: cwDeviation,
      cWConversion: cwConversion,
      uMID: umid,
      dIM2: diM2,
      dIM3: diM3,
    };
    this.view.dataService.copy().subscribe((res) => {
      console.log({ selectedItem: res });

      const { cWUM, cWDeviation, cWConversion, uMID, dIM2, dIM3, ...rest2 } =
        res;
      this.view.dataService.dataSelected = {
        ...rest2,
        cwum: cWUM,
        cwDeviation: cWDeviation,
        cwConversion: cWConversion,
        umid: uMID,
        diM2: dIM2,
        diM3: dIM3,
      };

      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      this.callfc
        .openSide(
          PopupAddItemComponent,
          {
            formType: 'add',
            title: `${e.text} ${this.functionName}`,
          },
          options,
          this.view.funcID
        )
        .closed.subscribe((res) => console.log(res));
    });
  }

  delete(data): void {
    // debug
    console.log('delete', { data });

    this.view.dataService.delete([data], true).subscribe((res: any) => {
      console.log(res);
      if (res) {
        this.acService.deleteFile(data.itemID, this.view.formModel.entityName);
      }
    });
  }
  //#endregion

  //#region Function
  //#endregion
}
