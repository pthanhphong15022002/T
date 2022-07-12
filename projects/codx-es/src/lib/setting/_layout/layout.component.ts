import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Injector } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  module = "ES";
  constructor(
    inject: Injector
  ) {
    super(inject);
  }
  
  onInit(): void {
  }
  onAfterViewInit(): void {
  }
}
