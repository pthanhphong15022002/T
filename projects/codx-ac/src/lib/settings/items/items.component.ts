import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { map } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';
import { PopupAddItemComponent } from './popup-add-item/popup-add-item.component';

@Component({
  selector: 'lib-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css'],
})
export class ItemsComponent extends UIComponent {
  //#region Constructor
  @ViewChild('moreTemplate') moreTemplate?: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true }) itemTemplate: TemplateRef<any>;
  @ViewChild('header1', { static: true }) header1: TemplateRef<any>;
  @ViewChild('header2', { static: true }) header2: TemplateRef<any>;
  @ViewChild('header3', { static: true }) header3: TemplateRef<any>;

  views: Array<ViewModel> = [];
  btnAdd: ButtonModel = { id: 'btnAdd' };
  functionName: string;

  constructor(inject: Injector, private acService: CodxAcService) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .moreFunction('Items', 'grvItems')
      .pipe(
        map((data) => data.find((m) => m.functionID === 'ACS21300')),
        map(
          (data) =>
            data.defaultName.charAt(0).toLowerCase() + data.defaultName.slice(1)
        )
      )
      .subscribe((res) => (this.functionName = res));
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
              headerTemplate: this.header1,
              headerText: 'Mặt hàng',
              field: 'itemHeader',
            },
            {
              width: '33%',
              headerTemplate: this.header2,
              headerText: 'Mô hình tồn kho',
              field: 'inventoryHeader',
            },
            {
              width: '33%',
              headerTemplate: this.header3,
              headerText: 'Yếu tố tồn kho',
              field: 'dimHeader',
            },
            { width: '1%', field: 'statusHeader', headerText: '' },
          ],
          template: this.itemTemplate,
        },
      },
    ];
  }
  //#endregion

  //#region Event
  onClickAdd(e) {
    // debug
    console.log({ e });
    console.log(this.view);

    this.view.dataService.addNew().subscribe((newItem) => {
      // debug
      console.log({ newItem });

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

    this.view.dataService
      .delete([data], true, (req: RequestOption) => {
        req.methodName = 'DeleteItemAsync';
        req.className = 'ItemsBusiness';
        req.assemblyName = 'ERM.Business.IV';
        req.service = 'IV';
        req.data = [data];

        return true;
      })
      .subscribe((res: any) => {
        console.log(res);
        if (res) {
          this.acService.deleteFile(
            data.itemID,
            this.view.formModel.entityName
          );
        }
      });
  }
  //#endregion

  //#region Function
  //#endregion
}
