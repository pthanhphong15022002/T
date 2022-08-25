import { Component, Injector } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'approval-stationery',
  templateUrl: 'approval-stationery.component.html',
  styleUrls: ['approval-stationery.component.scss'],
})
export class ApprovalStationeryComponent extends UIComponent {
  funcID: string;

  constructor(private injector: Injector) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {}
}
