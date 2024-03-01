import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { DialogRef, LayoutBaseComponent } from 'codx-core';

import { RoundService } from '../round.service';
import { CodxAcService } from '../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss', '../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  funcID: any;
  constructor(
    inject: Injector,
    private round: RoundService,
    private router: ActivatedRoute,
    private acService: CodxAcService
  ) {
    super(inject);
    this.module = 'AC';
    this.round.initCache();
  }
  onInit(): void {}

  onAfterViewInit(): void {
    this.acService.toolbar.subscribe((res) => {
      let body = document.getElementsByTagName('lib-layout')[0];
      if (res) body.classList.remove('toolbar-enabled', 'toolbar-fixed');
      else body.classList.add('toolbar-enabled', 'toolbar-fixed');
    });
  }
}
