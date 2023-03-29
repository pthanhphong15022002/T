import { DataRequest } from './../../../../../../src/shared/models/data.request';
import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, ApiHttpService } from 'codx-core';

@Component({
  selector: 'lib-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css'],
})
export class VoucherComponent implements OnInit {
  dialog!: DialogRef;
  setting: any;
  vouchers: Array<any> = [];
  gridModel: DataRequest = new DataRequest();
  constructor(
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    this.dialog = dialog;
    this.setting = dialogData.data;
  }

  ngOnInit(): void {
    this.api
      .exec<any>('AC', 'Core', 'DataBusiness', 'LoadDataCbxAsync')
      .subscribe();
  }
}
