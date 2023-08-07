import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';

import { CodxAcService } from '../codx-ac.service';
import { RoundService } from '../round.service';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(
    inject: Injector,
    private callfc: CallFuncService,
    private codxAC: CodxAcService,
    private round: RoundService
  ) {
    super(inject);

    this.module = 'AC';
    this.round.initCache();
  }

  onInit(): void {}
  onAfterViewInit(): void {}

  childMenuClick(e) {
    if (e && e?.recID) {
      this.codxAC.childMenuClick.next(e.recID);
    }
  }
}
