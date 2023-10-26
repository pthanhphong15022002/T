import { Component, Injector } from '@angular/core';
import { LayoutBaseComponent, UIComponent } from 'codx-core';
import { RoundService } from '../round.service';

@Component({
  selector: 'lib-laylout-journal',
  templateUrl: './laylout-journal.component.html',
  styleUrls: ['./laylout-journal.component.css'],
})
export class LayloutJournalComponent extends LayoutBaseComponent {
  constructor(inject: Injector) {
    super(inject);
    this.module = 'AC';
    this.layoutModel.toolbarDisplay = false;
  }

  onInit(): void {}

  onAfterViewInit(): void {}
}
