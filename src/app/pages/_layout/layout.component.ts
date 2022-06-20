import { Component, OnInit, Injector } from '@angular/core';
import {
  LayoutBaseComponent
} from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {
  module: string;
  onInit(): void {
    throw new Error('Method not implemented.');
  }
  onAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  constructor(inject: Injector) {
    super(inject);
    this.codxService.init('WP');
  }

}
