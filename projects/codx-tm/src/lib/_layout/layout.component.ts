import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';
import { ActivatedRoute } from '@angular/router';
import { CodxTMService } from '../codx-tm.service';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  funcID: string = '';

  constructor(
    inject: Injector,
    private route: ActivatedRoute,
    private tmService: CodxTMService,
    private callfc: CallFuncService
  ) {
    super(inject);
    this.module = 'TM';
  }

  onInit(): void {}

  childMenuClick(e) {
    this.tmService.childMenuClick.next(e);
  }
  menuClick(e) {}
  onAfterViewInit(): void {}
}
