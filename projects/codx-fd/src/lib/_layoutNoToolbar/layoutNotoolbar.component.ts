import { Component, Injector } from '@angular/core';
import { CallFuncService, DialogRef, LayoutBaseComponent } from 'codx-core';

@Component({
  selector: 'lib-layout-notoolbar',
  templateUrl: './layoutNotoolbar.component.html',
  styleUrls: ['./layoutNotoolbar.component.css'],
})
export class LayoutNotoolbar extends LayoutBaseComponent {
  dialog!: DialogRef;
  constructor(inject: Injector, private callfc: CallFuncService) {
    super(inject);
    this.module = 'FD';
  }

  onInit(): void {}

  onAfterViewInit(): void {}
}
