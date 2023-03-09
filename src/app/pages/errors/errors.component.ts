import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ToggleComponent,
  ScrollTopComponent,
  DrawerComponent,
  StickyComponent,
  MenuComponent,
  ScrollComponent,
  CodxService,
} from 'codx-core';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss'],
})
export class ErrorsComponent implements OnInit {
  @HostBinding('class') class = 'd-flex flex-column flex-root';
  constructor(private codxService: CodxService) {}

  ngOnInit(): void {}

  routeToHome() {
    this.codxService.navigate(null, '/');
    setTimeout(() => {
      ToggleComponent.bootstrap();
      ScrollTopComponent.bootstrap();
      DrawerComponent.bootstrap();
      StickyComponent.bootstrap();
      MenuComponent.bootstrap();
      ScrollComponent.bootstrap();
    }, 200);
  }
}
