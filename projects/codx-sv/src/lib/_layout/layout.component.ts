import { Component, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'SV';
  dialog!: DialogRef;
  override aside = false;
  override asideFixed = false;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  constructor(inject: Injector) {
    super(inject);
  }

  onInit(): void {}

  onAfterViewInit(): void {}
}
