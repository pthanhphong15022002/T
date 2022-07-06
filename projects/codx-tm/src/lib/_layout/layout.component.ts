import { Observable } from 'rxjs';
import { Component, ViewChild, ElementRef, Injector } from '@angular/core';
import {
  LayoutBaseComponent
} from 'codx-core';

@Component({
  selector: 'codx-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  module = 'TM';
  constructor(inject: Injector,) {
    super(inject);
  }

  onInit(): void {
    // this.funcs$.subscribe(res => {
    //   console.log(res);

    // })
  }

  onAfterViewInit(): void {

  }
}
