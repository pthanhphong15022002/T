import { Component, Input, OnInit } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-list-deals',
  templateUrl: './codx-list-deals.component.html',
  styleUrls: ['./codx-list-deals.component.css'],
})
export class CodxListDealsComponent implements OnInit {
  @Input() customerID: any;
  lstDeals = [];
  formModel: FormModel;
  lstStep = [];
  loaded: boolean;
  constructor(private cmSv: CodxCmService) {}

  async ngOnInit() {
    this.getListDealsByCustomerID(this.customerID);
    this.formModel = await this.cmSv.getFormModel('CM0201');
  }

  getListDealsByCustomerID(customerID) {
    this.loaded = false;
    this.cmSv.getListDealsByCustomerID(customerID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstDeals = res;
        var lstRef = this.lstDeals.map((x) => x.refID);
        var lstSteps = this.lstDeals.map((x) => x.stepID);
        if (lstRef != null && lstRef.length > 0)
          this.getStepsByListID(lstSteps, lstRef);
      }
      this.loaded = true;
    });
  }

  getStepsByListID(lstStepID, lstIns) {
    this.cmSv.getStepsByListID(lstStepID, lstIns).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstStep = res;
      }
    });
  }

  getStep(stepID) {
    if (this.lstStep != null && this.lstStep.length > 0) {
      var step = this.lstStep.find((x) => x.stepID == stepID);
      return step;
    } else {
      return null;
    }
  }
}
