import { Component, OnInit, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';
import { CodxCommonService } from '../../codx-common.service';
@Component({
  selector: 'lib-layoutNoAside',
  templateUrl: './_noAsideToolbarFluid.component.html',
  styleUrls: ['./_noAsideToolbarFluid.component.css'],
})
export class LayoutNoAsideToolbarFluidComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(
    inject: Injector,
    private codxCMService: CodxCommonService,
    private callfc: CallFuncService
  ) {
    super(inject);
    this.module = '';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarFixed = false;
  }

  onInit(): void {
    this.codxCMService.hideAside.subscribe((res) => {
      if (res != null) this.setAside(res);
    });
  }

  onAfterViewInit(): void {}
}
