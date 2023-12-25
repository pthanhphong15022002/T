import { Component, OnInit, Injector, ViewEncapsulation } from '@angular/core';
import {
  CallFuncService,
  DialogRef,
  LayoutBaseComponent,
} from 'codx-core';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation:ViewEncapsulation.None,
})
export class LayoutComponent extends LayoutBaseComponent {
  dialog: DialogRef;

  constructor(inject: Injector, private callfc: CallFuncService) {
    super(inject);
    this.module = 'TR';
  }

  onInit(): void {}

  onAfterViewInit(): void {}

  
}
