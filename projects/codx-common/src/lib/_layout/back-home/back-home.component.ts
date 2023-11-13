import { Component } from '@angular/core';
import { CodxService } from 'codx-core';

@Component({
  selector: 'lib-back-home',
  templateUrl: './back-home.component.html',
  styleUrls: ['./back-home.component.css']
})
export class BackHomeComponent {
  constructor(public codxService: CodxService) {}
}
