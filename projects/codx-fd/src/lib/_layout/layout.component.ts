import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent extends LayoutBaseComponent {
  
  dialog!: DialogRef;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  constructor(inject: Injector,
    private callfc: CallFuncService,
    ) {
    super(inject);
    this.module = 'FD';
  }

  onInit(): void {
  }

  onAfterViewInit(): void { }

  
}
