import { AfterViewInit, Component, Injector } from '@angular/core';
import { ButtonModel, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-okr-tasks',
  templateUrl: './okr-tasks.component.html',
  styleUrls: ['./okr-tasks.component.scss'],
})
export class OKRTasksComponent extends UIComponent implements AfterViewInit {
  button?: ButtonModel;
  views: Array<ViewModel> | any = [];
  constructor(inject: Injector) {
    super(inject);
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.kanban,
        active: true,
        sameData: false,
        model: {},
      },
      {
        id: '2',
        type: ViewType.schedule,
        active: true,
        sameData: false,
        request: '',
        request2: '',
        model: {},
      },
    ];
    this.button = {
      id: 'btnAdd',
    };
  }

  onInit(): void {}

  add(event) {}
}
