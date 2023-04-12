import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxAcService } from '../codx-ac.service';
import { IAsset } from './interfaces/IAsset.interface';

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

  constructor(private inject: Injector, private acService: CodxAcService) {
    super(inject);
  }
  //#endregion

  //#region Init
  onInit(): void {}

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
            { width: '1%', field: 'threeDot', headerText: '' },
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

    this.api
      .exec('ERM.Business.AM', 'AssetsBusiness', 'AddAsync', {
        assetID: '2332',
        status: '1',
        postedLayer: '1',
        owner: 'asdfdas',
        buid: 'sdaf',
      } as IAsset)
      .subscribe((res) => console.log(res));
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

  edit(e, data): void {}

  copy(e, data): void {}
  //#endregion

  //#region Method
  //#endregion

  //#region Function
  //#endregion
}
