import { Component, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { WR_WorkOrders } from '../../../_models-wr/wr-model.model';

@Component({
  selector: 'lib-popup-add-servicetag',
  templateUrl: './popup-add-servicetag.component.html',
  styleUrls: ['./popup-add-servicetag.component.css'],
})
export class PopupAddServicetagComponent {
  data: WR_WorkOrders;
  dialog: DialogRef;
  title = '';
  constructor(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.title = dt?.data?.title;
    this.data = JSON.parse(JSON.stringify(dt?.data?.data));
  }

  //#region onSave
  onSave() {
    if(this.data?.serviceTag == null || this.data?.serviceTag?.trim() == ''){
      return;
    }
    this.data.seriNo = this.data.serviceTag;
    this.dialog.close(this.data);
  }
  //#endregion

  valueChange(e) {
    if(this.data[e?.field] != e?.data){
      this.data[e?.field] = e?.data;
    }
  }

  valueChangeDate(e){
    if(e?.data){
      this.data.warrantyExpired = e?.data?.fromDate;
      if(this.data.warrantyExpired > new Date()){
        this.data.oow = true;
      }else{
        this.data.oow = false;
      }
    }
  }
}
