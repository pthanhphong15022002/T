import { Component, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-popup-ser-product',
  templateUrl: './popup-ser-product.component.html',
  styleUrls: ['./popup-ser-product.component.css'],
})
export class PopupSerProductComponent {
  dialog: DialogRef;
  data: any;
  title = '';
  isChange: boolean = false;
  constructor(
    private api: ApiHttpService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
    this.title = dt?.data?.title;
  }

  //#region save
  onSave(){
    if(this.isChange){
      this.api.execSv<any>('WR','WR','WorkOrdersBusiness','UpdateProductWorkOrderAsync',[this.data]).subscribe((res) => {
        if(res){
          this.dialog.close(res);
          this.notiService.notifyCode('SYS007');
        }
      })
    }
  }
  //#endregion
  valueChange(e) {
    if (e && e?.data) {
      this.isChange = true;
      if (e?.field == 'productID') {
        this.data.productType = e?.component?.itemsSelected[0]?.ProductType;
        this.data.productBrand = e?.component?.itemsSelected[0]?.ProductBrand;
        this.data.productModel = e?.component?.itemsSelected[0]?.ProductModel;
      }
    }
  }
}
