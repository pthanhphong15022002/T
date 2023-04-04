import { CM_Address } from './../../models/tmpCrm.model';
import { Component, OnInit, Optional } from '@angular/core';
import { DialogRef, DialogData, CacheService } from 'codx-core';

@Component({
  selector: 'lib-popup-address',
  templateUrl: './popup-address.component.html',
  styleUrls: ['./popup-address.component.css'],
})
export class PopupAddressComponent implements OnInit {
  dialog: any;
  data = new CM_Address();
  gridViewSetup: any;
  title = '';
  constructor(
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;

    this.title = dt.data[0];
  }

  ngOnInit(): void {}

  onSave() {}

  valueChange(e) {}
}
