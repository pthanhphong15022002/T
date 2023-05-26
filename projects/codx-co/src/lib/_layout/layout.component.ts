import { Component, Injector } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  constructor(inject: Injector) {
    super(inject);
    this.module = 'CO';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarDisplay = false;
  }
  onInit(): void {}

  onAfterViewInit(): void {}
}
