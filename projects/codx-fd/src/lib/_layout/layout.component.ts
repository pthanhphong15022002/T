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
  menu: any;
  constructor(inject: Injector) {
    super(inject);
    this.codxService.init(this.module);
  }

  onInit(): void {
    this.codxService.modulesOb$.subscribe((res) => {
      this.menu = res;
    });
  }

  onAfterViewInit(): void { }
}
