import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { CallFuncService, DialogData, DialogModel, DialogRef, FormModel } from 'codx-core';
import { PopupAddServicetagComponent } from './popup-add-servicetag/popup-add-servicetag.component';
import { PopupAddCustomerWrComponent } from './popup-add-customerwr/popup-add-customerwr.component';
import { WR_WorkOrders } from '../../_models-wr/wr-model.model';

@Component({
  selector: 'lib-popup-add-warranty',
  templateUrl: './popup-add-warranty.component.html',
  styleUrls: ['./popup-add-warranty.component.css']
})
export class PopupAddWarrantyComponent {

  data: WR_WorkOrders;
  dialog: DialogRef;
  title = '';
  constructor(
    private detectorRef: ChangeDetectorRef,
    private callFc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ){
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(dialog.dataService?.dataSelected));
    this.title = dt?.data?.title;
  }


  //#region onSave
  onSave(){

  }
  //#endregion

  valueChange(e){

  }

  //#region popup add

  clickAddServiceTag(){
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 1010;
    dialogModel.FormModel = this.dialog?.formModel;
    let obj = {
      title: 'Thêm',
    };
    this.callFc
      .openForm(
        PopupAddServicetagComponent,
        '',
        600,
        700,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.detectorRef.detectChanges();
        }
      });
  }

  clickAddCustomer(){
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 1010;
    dialogModel.FormModel = this.dialog?.formModel;
    let obj = {
      title: 'Thêm',
      data: this.data
    };
    this.callFc
      .openForm(
        PopupAddCustomerWrComponent,
        '',
        600,
        800,
        '',
        obj,
        '',
        dialogModel
      )
      .closed.subscribe((e) => {
        if (e?.event && e?.event != null) {
          this.data = e?.event;
          this.detectorRef.detectChanges();
        }
      });
  }
  //#endregion
}
