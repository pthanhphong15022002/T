import { Component, Injector, OnInit } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutTenantComponent extends LayoutBaseComponent {
  module = '';
  override aside = false;
  //override asideFixed = true;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = false;
  constructor(inject: Injector) {
    super(inject);
  }

  onInit(): void {}

  onAfterViewInit(): void {}
}
