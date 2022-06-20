import { Component, OnInit, Injector } from '@angular/core';
import {
  LayoutBaseComponent
} from 'codx-core';
import { Observable } from 'rxjs';
@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends LayoutBaseComponent {
  module: string;

  public override funcs$: Observable<any>;

  constructor(inject: Injector) {
    super(inject);
    this.codxService.init('TM');
    this.funcs$ = this.codxService.getFuncs('TM');
  }

  onInit(): void {
  }

  onAfterViewInit(): void {

  }

}
