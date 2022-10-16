import { Component, OnInit, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-add-warehouse',
  templateUrl: './add-warehouse.component.html',
  styleUrls: ['./add-warehouse.component.scss'],
})
export class AddWarehouseComponent extends UIComponent implements OnInit {
  formModel: any;
  dialog: DialogRef;
  dataUpdate: any;
  header = 'Cập nhật kho';

  constructor(
    private injector: Injector,
    @Optional() dt: DialogData,
    @Optional() dialog: DialogRef
  ) {
    super(injector);
    this.dialog = dialog;
    this.dataUpdate = JSON.parse(JSON.stringify(dt.data?.data));
    this.formModel = this.dialog.formModel;
  }

  onInit(): void {}

  changeHand(e) {
    if (e) this.dataUpdate[e.field] = e.data;
  }

  onSave() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option))
      .subscribe((res) => {
        this.dialog.close(res.update[2]);
      });
  }

  beforeSave(option) {
    option.methodName = 'UpdateOnHandOfGiftsAsync';
    option.data = [this.dataUpdate.giftID, this.dataUpdate.onhand];
    return true;
  }
}
