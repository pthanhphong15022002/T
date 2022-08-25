import { Component, Injector } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'approval-room',
  templateUrl: 'approval-room.component.html',
  styleUrls: ['approval-room.component.scss'],
})
export class ApprovalRoomComponent extends UIComponent {
  funcID: string;

  constructor(private injector: Injector) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {}
}
