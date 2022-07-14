import { Component, Injector } from '@angular/core';
import {
  LayoutBaseComponent
} from 'codx-core';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'ODT';
  // override aside = true;
  // override asideFixed = false;
  // override asideTheme: 'dark' | 'light' | 'transparent' ='transparent';
  // override toolbar = false;

  constructor(inject: Injector) {
    super(inject);
  }

  onInit() { }

  onAfterViewInit() {

  }
}
