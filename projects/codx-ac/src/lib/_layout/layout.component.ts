import {
  Component,
  Inject,
  Injector,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { DialogRef, LayoutBaseComponent } from 'codx-core';
import { environment } from 'src/environments/environment';
import { RoundService } from '../round.service';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
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
    private router: ActivatedRoute
  ) {
    super(inject);
    this.module = 'AC';
    this.round.initCache();
  }
  onInit(): void {}

  onAfterViewInit(): void {}
}
