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
  lstContact = [];
  type = '';
  lead: CM_Leads = new CM_Leads();
  lstContactLead = [];
  constructor(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.type = dt?.data?.type;
    this.lstContact = dt?.data?.lstContact;
    this.lead = dt?.data?.lead;
  }
  ngOnInit(): void {
    if(this.lstContact != null){
      this.lstContact.forEach((item) => (item.isDefault = false))
    }
  }


  onSave() {
    this.dialog.close(this.lstContactLead);
  }

  objectConvert(e) {
    if (e?.type == 'selectAll') {
      if (e.e == true) {
        this.lstContactLead = this.lstContact;
      } else {
        this.lstContactLead = [];
      }
    } else {
      if (e.e == true) {
        this.lstContactLead.push(Object.assign({}, e?.data));
      } else {
        var index = this.lstContactLead.findIndex((x) => x.recID == e?.data?.recID);
        if (index != -1) {
          this.lstContactLead.splice(index, 1);
        }
      }
    }
  }
}
