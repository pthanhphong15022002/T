import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Injector } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'lib-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends LayoutBaseComponent {
  constructor(
    inject: Injector
  ) {
    super(inject);
    this.module = 'ES';
  }
  
  onInit(): void {
  }
  onAfterViewInit(): void {
  }
}
