import { Component, OnInit, Optional } from '@angular/core';
import { DialogRef, DialogData, CacheService, NotificationsService, DataRequest, ApiHttpService } from 'codx-core';
import { BS_AddressBook } from '../../models/cm_model';

@Component({
  selector: 'lib-popup-address',
  templateUrl: './popup-address.component.html',
  styleUrls: ['./popup-address.component.css'],
})
export class PopupAddressComponent implements OnInit {
  dialog: any;
  data = new BS_AddressBook;
  gridViewSetup: any;
  title = '';
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.title = dt?.data[0];
    this.gridViewSetup = dt?.data[1];
  }

  ngOnInit(): void {
  }

  onSave() {
    if(this.data.adressType == null || this.data.adressType.trim() == ''){
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['AdressType'].headerText + '"'
      );
      return;
    }
    this.dialog.close(this.data);
  }

  valueChange(e) {
    console.log(e);
  }
}
