import { CodxListContactsComponent } from './../../../cmcustomer/cmcustomer-detail/codx-list-contacts/codx-list-contacts.component';
import { Component, Optional, OnInit, ViewChild } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { CM_Leads } from '../../../models/cm_model';
import { CodxAddressCmComponent } from '../../../cmcustomer/cmcustomer-detail/codx-address-cm/codx-address-cm.component';

@Component({
  selector: 'lib-popup-remove-add-contact',
  templateUrl: './popup-remove-add-contact.component.html',
  styleUrls: ['./popup-remove-add-contact.component.scss'],
})
export class PopupRemoveAddContactComponent implements OnInit {
  @ViewChild('loadListContact') codxListContact: CodxListContactsComponent;
  @ViewChild('loadListAddress') loadListAddress: CodxAddressCmComponent;

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
        this.lstLead = JSON.parse(JSON.stringify(this.list));
      } else {
        this.lstLead = [];
      }
    } else {
      if (e.e == true) {
        if (e.data) {
          var tmp = JSON.parse(JSON.stringify(e.data));
          this.lstLead.push(Object.assign({}, tmp));
        }
      } else {
        var index = this.lstLead.findIndex((x) => x.recID == e?.data?.recID);
        var indexList = this.list.findIndex((x) => x.recID == e?.data?.recID);
        if (index != -1) {
          this.lstLead.splice(index, 1);
        }
        if (indexList != -1) {
          this.list[indexList].checked = false;
          this.codxListContact.loadListContact(this.list);
        }
      }
    }
  }

  convertAddress(e) {
    if (e?.type == 'selectAll') {
      if (e.e == true) {
        this.lstLead = JSON.parse(JSON.stringify(this.list));
      } else {
        this.lstLead = [];
      }
    } else {
      if (e.e == true) {
        if (e.data) {
          var tmp = JSON.parse(JSON.stringify(e.data));
          this.lstLead.push(Object.assign({}, tmp));
        }
      } else {
        var index = this.lstLead.findIndex((x) => x.recID == e?.data?.recID);
        var indexList = this.list.findIndex((x) => x.recID == e?.data?.recID);
        if (index != -1) {
          this.lstLead.splice(index, 1);
        }
        if (indexList != -1) {
          this.list[indexList].checked = false;
          this.loadListAddress.loadListAdress(this.list);
        }
      }
    }
  }
}
