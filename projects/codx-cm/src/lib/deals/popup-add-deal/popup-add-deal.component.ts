import { Component, OnInit, Optional } from '@angular/core';
import { DialogRef, DialogData } from 'codx-core';
import { CM_Deals } from '../../models/cm_model';

@Component({
  selector: 'lib-popup-add-deal',
  templateUrl: './popup-add-deal.component.html',
  styleUrls: ['./popup-add-deal.component.scss'],
})
export class PopupAddDealComponent implements OnInit {
  // setting values in system
  dialog: DialogRef;
  //type any
  formModel: any;
  // type string
  titleAction: string = '';
  action: string = '';

  // Data struct Opportunity
  deal: CM_Deals;

  // const
  readonly actionAdd: string = 'add';
  readonly actionCopy: string = 'copy';
  readonly actionEdit: string = 'edit';

  constructor(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {
    this.dialog = dialog;
    this.formModel = dialog.formModel;
    this.titleAction = dt?.data?.titleAction;
  }

  ngOnInit(): void {}

  valueChange($event) {
    if ($event) {
    }
  }
  saveOpportunity() {

    this.onAdd();

  }
  cbxChange($event) {}

  onAdd() {
    this.dialog.dataService
      .save((option: any) => this.beforeSave(option), 0)
      .subscribe((res) => {
        if (res) {
          this.dialog.close([res.save]);
        } else this.dialog.close();
      });
  }

  beforeSave(op) {
    var data = this.deal;
    if (this.action == this.actionAdd || this.action == this.actionCopy) {
      op.method = 'AddDealAsync';
      op.className = 'DealsBusiness';
      op.data = data;
      return true;
    }
    return false;
  }
}
