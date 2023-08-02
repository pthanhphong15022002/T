import { CodxShareService } from '../../codx-share.service';
import { Component, OnInit, Injector } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
  SidebarModel,
} from 'codx-core';
import { Observable } from 'rxjs';
@Component({
  selector: 'lib-layoutNoAside',
  templateUrl: './_noAsideToolbarFluid.component.html',
  styleUrls: ['./_noAsideToolbarFluid.component.css'],
})
export class LayoutNoAsideToolbarFluidComponent extends LayoutBaseComponent {
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
    this.codxShareService.hideAside.subscribe((res) => {
      if (res != null) this.setAside(res);
    });
  }

  onAfterViewInit(): void { }

  
}
