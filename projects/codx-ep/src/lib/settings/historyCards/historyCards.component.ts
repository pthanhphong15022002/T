import { AfterViewInit, Component, inject, Injector } from '@angular/core';
import { UIComponent } from 'codx-core';

@Component({
  selector: 'setting-historyCards',
  templateUrl: 'historyCards.component.html',
  styleUrls: ['historyCards.component.scss'],
})
export class HistoryCardsComponent
  extends UIComponent
  implements AfterViewInit
{
  constructor(private injector: Injector) {
    super(injector);
  }
  onInit(): void {}

  ngAfterViewInit(): void {}
}
