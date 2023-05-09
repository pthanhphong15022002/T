import { Component, Input, OnInit } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import { FormModel } from 'codx-core';

@Component({
  selector: 'codx-list-deals',
  templateUrl: './codx-list-deals.component.html',
  styleUrls: ['./codx-list-deals.component.css'],
})
export class CodxListDealsComponent implements OnInit{
  @Input() customerID: any;
  lstDeals = [];
  formModel: FormModel
  constructor(
    private cmSv: CodxCmService,

  ) {}


  async ngOnInit() {
    this.getListDealsByCustomerID(this.customerID);
    this.formModel = await this.cmSv.getFormModel('CM0201');

  }

  getListDealsByCustomerID(customerID) {
    this.cmSv.getListDealsByCustomerID(customerID).subscribe((res) => {
      if (res && res.length > 0) {
        this.lstDeals = res;
      }
    });
  }

  getListStepByStepID(stepID){

  }
}
