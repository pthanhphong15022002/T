import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { map, tap } from 'rxjs/operators';
import { CodxAcService } from '../../codx-ac.service';
import { PopupAddFixedAssetComponent } from './popup-add-fixed-asset/popup-add-fixed-asset.component';

@Component({
  selector: 'lib-fixed-assets',
  templateUrl: './fixed-assets.component.html',
  styleUrls: ['./fixed-assets.component.css'],
})
export class FixedAssetsComponent extends UIComponent {
  //#region Constructor
  @ViewChild('moreTemplate') moreTemplate?: TemplateRef<any>;
  @ViewChild('rowTemplate') rowTemplate: TemplateRef<any>;
  @ViewChild('header1', { static: true }) header1: TemplateRef<any>;
  @ViewChild('header2', { static: true }) header2: TemplateRef<any>;
  @ViewChild('header3', { static: true }) header3: TemplateRef<any>;

  views: Array<ViewModel> = [];
  btnAdd: ButtonModel = { id: 'btnAdd' };
  functionName: string;

  constructor(injector: Injector, private acService: CodxAcService) {
    super(injector);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .functionList('ACT0811')
      .pipe(
        tap((t) => console.log(t)),
        map((data) => this.acService.toCamelCase(data.defaultName))
      )
      .subscribe((res) => (this.functionName = res));
  }

  ngAfterViewInit(): void {
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
              width: '40%',
              headerTemplate: this.header1,
              field: 'header1',
            },
            {
              width: '40%',
              headerTemplate: this.header2,
              field: 'header2',
            },
            {
              width: '18%',
              headerTemplate: this.header3,
              field: 'header3',
            },
            { width: '2%', field: 'threeDot', headerText: '' },
          ],
          template: this.rowTemplate,
        },
      },
    ];
  }
  //#endregion

  //#region Event
  onClickAdd(e) {
    console.log({ e });

    this.view.dataService.addNew().subscribe((newItem) => {
      // debug
      console.log({ newItem });

      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;
      this.callfc.openSide(
        PopupAddFixedAssetComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  onClickMoreFuncs(e, data) {
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
  delete(data): void {
    this.view.dataService
      .delete([data], true)
      .subscribe((res) => console.log(res));
  }

  edit(e, data): void {
    const copiedData = { ...data };
    this.view.dataService.dataSelected = copiedData;
    this.view.dataService.edit(copiedData).subscribe(() => {
      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;

      this.callfc.openSide(
        PopupAddFixedAssetComponent,
        {
          formType: 'edit',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }

  copy(e, data): void {
    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe(() => {
      const options = new SidebarModel();
      options.Width = '800px';
      options.DataService = this.view.dataService;
      options.FormModel = this.view.formModel;

      this.callfc.openSide(
        PopupAddFixedAssetComponent,
        {
          formType: 'add',
          formTitle: `${e.text} ${this.functionName}`,
        },
        options,
        this.view.funcID
      );
    });
  }
  //#endregion

  //#region Function
  //#endregion
}
