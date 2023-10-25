import {
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DataRequest, DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-evouchers',
  templateUrl: './evouchers.component.html',
  styleUrls: ['./evouchers.component.css'],
})
export class EVouchersComponent extends UIComponent {
  dialog?: any;
  @ViewChild('productImg', { static: true }) productImg: TemplateRef<any>;
  columnsGrid: any[] = [];

  data: any[] = [];

  request = new DataRequest();

  constructor(
    private inject: Injector,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
  }
  onInit(): void {
    this.setting();
    this.loadData();
  }

  setting()
  {
    this.request.page = 1;
    this.request.pageSize = 20;
  }
  loadData() {
    this.api
      .execSv<any>('FD', 'FD', 'VouchersBusiness', 'GotITProductList', [
        0,
        0,
        0,
        'asc',
        0,
        this.request.pageSize,
        this.request.page,
        true
      ])
      .subscribe((data) => {
        if (data) {
          this.data = data.productList;
        }
      });
  }
}
