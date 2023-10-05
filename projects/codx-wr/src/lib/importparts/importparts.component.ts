import { Component, Injector } from '@angular/core';
import { ButtonModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-importparts',
  templateUrl: './importparts.component.html',
  styleUrls: ['./importparts.component.css'],
})
export class ImportpartsComponent extends UIComponent {
  views: Array<ViewModel> = [];
  titleAction = '';
  // config api get data
  service = 'SYS';
  assemblyName = 'ERM.Business.Core';
  entityName = 'AD_IELogs';
  className = 'DataBusiness';
  method = 'LoadDataAsync';
  idField = 'recID';

  constructor(
    private inject: Injector,
    private codxShareService: CodxShareService
  ) {
    super(inject);
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {},
      },
    ];
  }

  selectedChange(e) {}

  click(evt: ButtonModel) {
    // this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
      default:
        let f = evt.data;
        let data = evt.model;
        if (!data) data = this.view.dataService.dataSelected;
        this.codxShareService.defaultMoreFunc(
          f,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
    }
  }

  add() {}
}
