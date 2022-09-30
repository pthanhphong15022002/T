import { Component, OnInit, Injector } from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-add-gifts',
  templateUrl: './add-gifts.component.html',
  styleUrls: ['./add-gifts.component.scss'],
})
export class AddGiftsComponent extends UIComponent implements OnInit {
  formModel: any;
  dialog!: DialogRef;
  dataUpdate: any;
  formType: any;
  header: 'Thêm quà tặng';

  constructor(
    private injector: Injector,
    private dt: DialogRef,
    private data: DialogData
  ) {
    super(injector);
    this.dialog = dt;
    this.dataUpdate = JSON.parse(
      JSON.stringify(this.dialog.dataService.dataSelected)
    );
    // if (!this.dialog.dataService.formModel.entityName)
    //   this.dialog.dataService.formModel.entityName =
    //     this.dialog.dataService.formModel.entityPer;
    this.formModel = this.dialog.dataService.formModel;
    debugger;
  }

  onInit(): void {}

  onSave() {}

  changeHand(e) {}

  onChangeOnHandOfGift() {}
}
