import { Component, Injector } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'approval-car',
  templateUrl: 'approval-car.component.html',
  styleUrls: ['approval-car.component.scss'],
})
export class ApprovalCarComponent extends UIComponent {
  funcID: string;

  constructor(private injector: Injector) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {}
}
