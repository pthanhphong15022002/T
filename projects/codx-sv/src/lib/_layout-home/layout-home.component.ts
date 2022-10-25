import { Component, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout-home.component.html',
  styleUrls: ['./layout-home.component.css'],
})
export class LayoutHomeComponent extends LayoutBaseComponent {
  module = 'SV';
  dialog!: DialogRef;
  override aside = false;
  override asideFixed = false;
  override toolbar = false;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  constructor(inject: Injector) {
    super(inject);
  }

  onInit(): void {}

  onAfterViewInit(): void {}

  onSearch(e) {
    
  }
}
