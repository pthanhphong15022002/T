import { Component, Injector } from '@angular/core';
import { CallFuncService, LayoutBaseComponent } from 'codx-core';
import { CodxCommonService } from '../../codx-common.service';
@Component({
  selector: 'lib-layoutNoAside',
  templateUrl: './_noAside.component.html',
  styleUrls: ['./_noAside.component.css'],
})
export class LayoutNoAsideComponent extends LayoutBaseComponent {
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
