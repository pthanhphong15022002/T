import { Component, OnInit, Optional } from '@angular/core';
import { DialogRef, DialogData, CacheService } from 'codx-core';

@Component({
  selector: 'lib-popup-address',
  templateUrl: './popup-address.component.html',
  styleUrls: ['./popup-address.component.css'],
})
export class PopupAddressComponent implements OnInit {
  dialog: any;
  data: any;
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
