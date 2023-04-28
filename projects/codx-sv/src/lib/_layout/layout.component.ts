import { Component, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  header = false;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  constructor(inject: Injector) {
    super(inject);
    this.module = 'SV';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarDisplay = false;

  }

  onInit(): void { }

  onAfterViewInit(): void { }
}
