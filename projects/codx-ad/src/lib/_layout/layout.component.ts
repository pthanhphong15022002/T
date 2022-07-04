import { Component, Injector, OnInit } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {
  
  module = 'AD';
  constructor(inject: Injector,) {
    super(inject);
  }

  onInit(): void {
  }
  onAfterViewInit(): void {
  }
}
