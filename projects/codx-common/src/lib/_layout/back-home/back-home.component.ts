import { addClass } from '@syncfusion/ej2-base';
import { Component, HostBinding } from '@angular/core';
import { CodxService } from 'codx-core';

@Component({
  selector: 'lib-back-home',
  templateUrl: './back-home.component.html',
  styleUrls: ['./back-home.component.css'],
})
export class BackHomeComponent {
  @HostBinding('class') get class() {
    return 'align-items-center d-flex ms-1 ms-lg-3';
  }
  constructor(public codxService: CodxService) {}
}
