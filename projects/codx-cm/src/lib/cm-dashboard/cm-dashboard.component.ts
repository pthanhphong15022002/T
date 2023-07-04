import {
  AfterViewInit,
  Component,
  Injector,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ApiHttpService, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-cm-dashboard',
  templateUrl: './cm-dashboard.component.html',
  styleUrls: ['./cm-dashboard.component.css'],
})
export class CmDashboardComponent extends UIComponent implements AfterViewInit {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChildren('templateDetail') tempviews: QueryList<any>;
  funcID = 'DPT01';
  views: Array<ViewModel> = [];
  button = {
    id: 'btnAdd',
  };

  constructor(inject: Injector) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
  }
  override onInit(): void {}

  ngAfterViewInit() {
    this.views = [
      {
        type: ViewType.content,
        active: true,
        sameData: false,
        reportType: 'D',
        reportView: true,
        showFilter: true,

        model: {
          panelRightRef: this.template,
        },
      },
    ];
  }

  filterChange(e) {}

  onActions(e) {}
}
