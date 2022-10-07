import { Component, Injector } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'popup-add-historyCards',
  templateUrl: 'popup-add-historyCards.component.html',
  styleUrls: ['popup-add-historyCards.component.scss'],
})
export class PopupAddEpCardsComponent extends UIComponent {
  constructor(private injector: Injector) {
    super(injector);
  }
  onInit(): void {
    this.initForm();
  }

  initForm() {}

  beforeSave(option: any) {}

  onSaveForm() {}
}
