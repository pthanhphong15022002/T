import { Component, Injector, OnInit } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'AD';
  override aside = true;
  override asideFixed = true;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = true;
  constructor(inject: Injector,) { 
    super(inject);
  }

  onInit(): void {
  }
  onAfterViewInit(): void {
  }
}
