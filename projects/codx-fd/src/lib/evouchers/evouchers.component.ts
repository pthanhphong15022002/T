import {
  Component,
  Injector,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';

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
  constructor(
    private inject: Injector,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
  }
  onInit(): void {
    this.loadData();
  }

  loadData() {
    this.api
      .execSv<any>('FD', 'FD', 'VouchersBusiness', 'GotITProductList', [
        0,
        0,
        0,
        'asc',
        0,
        5,
        1,
      ])
      .subscribe((data) => {
        if (data) {
          console.log(data);
          this.columnsGrid = [
            {
              field: 'productId',
              headerText: 'Mã quà tặng',
              textAlign: 'center',
              width: 150,
            },
            {
              field: 'productNm',
              headerText: 'Tên quà tặng',
              textAlign: 'center',
            },
            {
              field: 'brandNm',
              headerText: 'Thương hiệu',
              textAlign: 'center',
            },
            {
              field: 'productImg',
              headerText: 'Hình ảnh',
              template: this.productImg,
              textAlign: 'center',
            },
          ];
          this.data = data.productList;

          // this.changeEvoucherSkeletonLoading = false;
          // if (this.eVoucherGotIt.length == 0) {
          //   this.emptyEvoucherData = true;
          // }
        }
      });
  }
}
