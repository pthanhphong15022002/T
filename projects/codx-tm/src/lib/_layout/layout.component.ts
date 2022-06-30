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
  constructor(inject: Injector) {
    super(inject);
  }
<<<<<<< HEAD
 
  onInit(): void {
    // this.funcs$.subscribe(res => {
    //   console.log(res);

    // })
  }

  onAfterViewInit(): void {
=======

  onInit() { }

  onAfterViewInit() {
>>>>>>> ab98fe20d5e918283b19bdd481fefe7a9330943f

  }
}
