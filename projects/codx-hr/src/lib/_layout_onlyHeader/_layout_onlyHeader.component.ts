import { Component, Injector } from '@angular/core';
import { DialogRef, LayoutBaseComponent } from 'codx-core';
@Component({
  selector: 'hr-layoutOnlyHeader',
  templateUrl: './_layout_onlyHeader.component.html',
  styleUrls: ['./_layout_onlyHeader.component.css'],
})
export class HRLayoutOnlyHeaderComponent extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(inject: Injector) {
    super(inject);
    this.module = '';
    this.layoutModel.asideDisplay = false;
    this.layoutModel.toolbarDisplay = false;
    this.layoutModel.toolbarFixed = false;
  }

  onInit(): void {}

  onAfterViewInit(): void {}
}
