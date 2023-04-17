import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { IAsset } from './interfaces/IAsset.interface';
import { CodxAcService } from '../../codx-ac.service';
import { PopupAddFixedAssetComponent } from './popup-add-fixed-asset/popup-add-fixed-asset.component';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'lib-fixed-assets',
  templateUrl: './fixed-assets.component.html',
  styleUrls: ['./fixed-assets.component.css'],
})
export class FixedAssetsComponent extends UIComponent {
  //#region Constructor
  @ViewChild('moreTemplate') moreTemplate?: TemplateRef<any>;
  @ViewChild('rowTemplate') rowTemplate: TemplateRef<any>;

  views: Array<ViewModel> = [];
  btnAdd: ButtonModel = { id: 'btnAdd' };
  functionName: string;

  constructor(private inject: Injector, private acService: CodxAcService) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .functionList('ACT0811')
      .pipe(
        tap((t) => console.log(t)),
        map(
          (data) =>
            data.defaultName.charAt(0).toLowerCase() + data.defaultName.slice(1)
        )
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
              headerText: 'Thông tin chung',
              field: 'header1',
            },
            {
              width: '40%',
              headerText: 'Thông tin khấu hao',
              field: 'header2',
            },
            {
              width: '18%',
              headerText: 'Tình trạng',
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
  handleClickAdd(e) {
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

  handleClickMoreFuncs(e, data) {
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

  delete(data): void {
    this.view.dataService
      .delete([data], true)
      .subscribe((res) => console.log(res));
  }

  edit(e, data): void {
    this.view.dataService.dataSelected = data;
    this.view.dataService.edit(data).subscribe(() => {
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

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
