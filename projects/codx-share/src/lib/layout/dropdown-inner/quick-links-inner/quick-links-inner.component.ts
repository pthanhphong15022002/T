import { Component, HostBinding } from '@angular/core';
import { CodxService } from 'codx-core';

@Component({
  selector: 'erm-quick-links-inner',
  templateUrl: './quick-links-inner.component.html',
})
export class QuickLinksInnerComponent {
  @HostBinding('class') class = 'd-flex align-items-center';
  // @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  constructor(public codxService: CodxService) { }
}
