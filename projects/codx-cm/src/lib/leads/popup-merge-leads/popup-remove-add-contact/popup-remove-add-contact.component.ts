import { Component, Optional, OnInit } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CM_Leads } from '../../../models/cm_model';

@Component({
  selector: 'lib-popup-remove-add-contact',
  templateUrl: './popup-remove-add-contact.component.html',
  styleUrls: ['./popup-remove-add-contact.component.scss'],
})
export class PopupRemoveAddContactComponent implements OnInit {
  dialog: any;
  list = [];

  type = '';
  lead: CM_Leads = new CM_Leads();
  lstLead = [];
  category = '';
  constructor(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.type = dt?.data?.type;
    this.category = dt?.data?.category;
      this.list = JSON.parse(JSON.stringify(dt?.data?.list));

    this.lead = dt?.data?.lead;
  }
  ngOnInit(): void {
    if (this.list != null) {
      if (this.type == 'add')
        this.list.forEach((item) => (item.isDefault = false));
    }
  }

  onSave() {
    this.dialog.close(this.lstLead);
  }

  objectConvert(e) {
    if (e?.type == 'selectAll') {
      if (e.e == true) {
        this.lstLead = this.list;
      } else {
        this.lstLead = [];
      }
    } else {
      if (e.e == true) {
        this.lstLead.push(Object.assign({}, e?.data));
      } else {
        var index = this.lstLead.findIndex(
          (x) => x.recID == e?.data?.recID
        );
        if (index != -1) {
          this.lstLead.splice(index, 1);
        }
      }
    }
  }

  convertAddress(e){
    if (e?.type == 'selectAll') {
      if (e.e == true) {
        this.lstLead = this.list;
      } else {
        this.lstLead = [];
      }
    } else {
      if (e.e == true) {
        this.lstLead.push(Object.assign({}, e?.data));
      } else {
        var index = this.lstLead.findIndex(
          (x) => x.recID == e?.data?.recID
        );
        if (index != -1) {
          this.lstLead.splice(index, 1);
        }
      }
    }
  }
}
