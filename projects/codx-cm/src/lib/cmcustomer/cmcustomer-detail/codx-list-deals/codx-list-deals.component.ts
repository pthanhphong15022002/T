import { Component, Input, OnInit } from '@angular/core';
import { CodxCmService } from '../../../codx-cm.service';
import { ApiHttpService, DataRequest, FormModel } from 'codx-core';
import { Observable, finalize, map, pipe } from 'rxjs';

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
  request = new DataRequest();
  predicates = 'CustomerID=@0';
  dataValues = '';
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  className = 'DealsBusiness';
  method = 'GetListDealsByCustomerIDAsync';
  constructor(private cmSv: CodxCmService, private api: ApiHttpService) {}

  async ngOnInit() {
    this.getListContacts();
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

  getListContacts() {
    this.loaded = false;
    this.request.predicates = 'CustomerID=@0';
    this.request.dataValues = this.customerID;
    this.request.entityName = 'CM_Deals';
    this.request.funcID = 'CM0201';
    this.className = 'DealsBusiness';
    this.fetch().subscribe((item) => {
      this.lstDeals = item;
      var lstRef = this.lstDeals.map((x) => x.refID);
      var lstSteps = this.lstDeals.map((x) => x.stepID);
      if (lstRef != null && lstRef.length > 0)
        this.getStepsByListID(lstSteps, lstRef);

      this.loaded = true;
    });
  }
  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.service,
        this.assemblyName,
        this.className,
        this.method,
        this.request
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response[0];
        })
      );
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
