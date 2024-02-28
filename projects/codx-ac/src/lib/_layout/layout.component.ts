import {
  Component,
  Injector,
  ViewEncapsulation,
} from '@angular/core';
import {
  DialogRef,
  LayoutBaseComponent,
} from 'codx-core';

import { RoundService } from '../round.service';
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
  ) {
    super(inject);
    this.module = 'AC';
    this.round.initCache();
  }

  onInit(): void {
    
  }

  onAfterViewInit(): void {
  }
}
