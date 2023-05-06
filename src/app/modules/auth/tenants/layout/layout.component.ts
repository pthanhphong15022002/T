import { Component, Injector, OnInit } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutTenantComponent extends LayoutBaseComponent {
  constructor(inject: Injector) {
    super(inject);
    this.module = '';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarDisplay = false;
  }

  onInit(): void {}

  onAfterViewInit(): void {}
}
