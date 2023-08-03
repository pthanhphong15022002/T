import { Component, Injector, OnInit } from '@angular/core';
import { CallFuncService, CodxService, DialogRef, LayoutBaseComponent, SidebarModel } from 'codx-core';

import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(
    inject: Injector,
    private codxShareService: CodxShareService,
    private callfc: CallFuncService
  ) {
    super(inject);
    this.module = '';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarFixed = false;
  }

  onInit(): void {
  }
  onAfterViewInit(): void { }
  

}
