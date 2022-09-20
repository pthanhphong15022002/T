import { UIComponent } from 'codx-core';
import { extend } from '@syncfusion/ej2-base';
import { Component, Injector } from '@angular/core';

@Component({
  selector: 'popup-add-epCards',
  templateUrl: 'popup-add-epCards.component.html',
  styleUrls: ['popup-add-epCards.component.scss'],
})
export class PopupAddEpCardsComponent extends UIComponent {
  constructor(private injector: Injector) {
    super(injector);
  }

  onInit(): void {

    
  }
}
