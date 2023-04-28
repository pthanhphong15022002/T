import { Component, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout-home.component.html',
  styleUrls: ['./layout-home.component.css'],
})
export class LayoutHomeComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(inject: Injector) {
    super(inject);
    this.module = 'SV';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarDisplay = false;
  }

  onInit(): void {}

  onAfterViewInit(): void {}

  onSearch(e) {
    
  }
}
