import { ViewEncapsulation } from '@angular/core';
import { Component, Injector } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent, SidebarModel
} from 'codx-core';
import { CallFuncConfig } from 'codx-core/lib/services/callFunc/call-func.config';


@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog!: DialogRef
  constructor(inject: Injector,
    //private hideToolbar: CodxOdService,
    private callfc: CallFuncService,
  ) {
    super(inject);
    this.module = 'OM';
    this.layoutModel.toolbarFixed = false;
  }

  onInit() { }

  onAfterViewInit() {
    // this.hideToolbar.SetLayout.subscribe(res => {
    //   if (res != null)
    //     this.setToolbar(res);
        
    // })
  }

  
}
