import { Component, OnInit, Injector } from '@angular/core';
import { LayoutBaseComponent } from 'codx-core';
import { Observable } from 'rxjs';
@Component({
  selector: 'lib-layoutOnlyHeader',
  templateUrl: './layoutOnlyHeader.component.html',
  styleUrls: ['./layoutOnlyHeader.component.css'],
})
export class LayoutOnlyHeaderComponent extends LayoutBaseComponent {
  module = '';
  // override aside = false;
  //override asideFixed = true;
  // override asideTheme: 'dark' | 'light' | 'transparent' = 'transparent';
  override toolbar = true;
  constructor(inject: Injector) {
    super(inject);
  }

  onInit(): void {
  }

  onAfterViewInit(): void { }
}
