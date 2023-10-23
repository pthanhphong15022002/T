import { ViewChild, ViewEncapsulation } from '@angular/core';
import { Component, Injector } from '@angular/core';
import {
  AsideComponent,
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { CallFuncConfig } from 'codx-core/lib/services/callFunc/call-func.config';

import { CodxOdService } from '../codx-od.service';
import { Router } from '@angular/router';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef;

  constructor(
    inject: Injector,
    private hideToolbar: CodxOdService,
    private callfc: CallFuncService,
    private router: Router,
  ) {
    super(inject);
    //this.module = 'OD';
    this.getModule();
  }

  onInit() {}

  getModule()
  {
    this.module = this.router?.url.split("/")[2].toUpperCase();
  }
  
  onAfterViewInit() {
    this.hideToolbar.SetLayout.subscribe((res) => {
      if (res != null) this.setToolbar(res);
    });
  }

  
}
