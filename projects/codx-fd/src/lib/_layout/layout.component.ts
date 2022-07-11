import { Component, OnInit, Injector } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';
import { Observable } from 'rxjs';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'FD';
  constructor(inject: Injector) {
    super(inject);
  }

  onInit(): void {
  }

  onAfterViewInit(): void { }
}
